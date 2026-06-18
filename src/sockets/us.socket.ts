import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { pushToUser } from '../services/push.service';

/**
 * US Space Socket Handlers
 * ─────────────────────────────────────────────────────────────────────────
 * Handles real-time events between the two individual users of a couple:
 *   • us:nudge   — one partner sends a nudge (love, water reminder, etc.)
 *   • us:love    — quick love tap
 *   • us:feeling — partner shares how they feel
 *
 * PRIVACY RULE: These events are strictly private between the two partners.
 *   - The server relays each event to the couple room EXCLUDING the sender's
 *     socket so the sender never receives their own event.
 *   - Push notifications are sent ONLY to the partner (by userId), never to
 *     the sender, so the sender's notification tray stays clean.
 *   - Community/match notifications remain unchanged and go to both partners
 *     as before.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Look up the partner's User.id given the sender's userId + coupleId. */
async function findPartnerId(
  senderUserId: string,
  coupleId: string,
): Promise<string | null> {
  try {
    const couple = await prisma.couple.findUnique({
      where: { coupleId },
      select: { partner1Id: true, partner2Id: true },
    });
    if (!couple) return null;
    if (couple.partner1Id === senderUserId) return couple.partner2Id;
    if (couple.partner2Id === senderUserId) return couple.partner1Id;
    return null;
  } catch (err: any) {
    logger.warn(`[UsSocket] findPartnerId failed: ${err.message}`);
    return null;
  }
}

export const registerUsHandlers = (io: SocketIOServer, socket: Socket): void => {
  const { userId, coupleId, userName } = socket;

  // ── us:nudge ──────────────────────────────────────────────────────────
  socket.on(
    'us:nudge',
    async (payload: { kind: string; message: string; at: string }) => {
      if (!userId || !coupleId) return;

      logger.info(`[UsSocket] nudge from ${userId} (${userName}) in couple ${coupleId}`);

      // 1. Real-time relay — partner's socket only (exclude sender).
      io.to(`couple:${coupleId}`).except(socket.id).emit('us:nudge', {
        kind: payload.kind,
        message: payload.message,
        at: payload.at,
        from: userName || 'Your partner',
      });

      // 2. Push notification — only to the partner device, not the sender.
      const partnerId = await findPartnerId(userId, coupleId);
      if (partnerId) {
        pushToUser(partnerId, {
          title: `${userName || 'Your partner'} sent you a nudge 💛`,
          body: payload.message,
          data: {
            type: 'us_nudge',
            kind: payload.kind,
            navigate: 'UsSpace',
          },
          collapseKey: 'us_nudge',
        }).catch(() => null);
      }
    },
  );

  // ── us:love ───────────────────────────────────────────────────────────
  socket.on('us:love', async (payload: { from: string; at: string }) => {
    if (!userId || !coupleId) return;

    logger.info(`[UsSocket] love from ${userId} (${userName}) in couple ${coupleId}`);

    io.to(`couple:${coupleId}`).except(socket.id).emit('us:love', {
      from: payload.from || userName || 'Your partner',
      at: payload.at,
    });

    const partnerId = await findPartnerId(userId, coupleId);
    if (partnerId) {
      pushToUser(partnerId, {
        title: `${payload.from || userName || 'Your partner'} sent you love ❤️`,
        body: 'Open the US space to see it',
        data: { type: 'us_love', navigate: 'UsSpace' },
        collapseKey: 'us_love',
      }).catch(() => null);
    }
  });

  // ── us:feeling ────────────────────────────────────────────────────────
  socket.on(
    'us:feeling',
    async (payload: { feeling: string; note: string; at: string }) => {
      if (!userId || !coupleId) return;

      logger.info(`[UsSocket] feeling from ${userId} (${userName}) in couple ${coupleId}`);

      io.to(`couple:${coupleId}`).except(socket.id).emit('us:feeling', {
        feeling: payload.feeling,
        note: payload.note,
        at: payload.at,
        from: userName || 'Your partner',
      });

      const partnerId = await findPartnerId(userId, coupleId);
      if (partnerId) {
        const feelingLabel = payload.feeling || 'something';
        pushToUser(partnerId, {
          title: `${userName || 'Your partner'} shared how they feel`,
          body: payload.note?.trim()
            ? `"${payload.note.trim()}"`
            : `They're feeling ${feelingLabel} right now`,
          data: { type: 'us_feeling', feeling: payload.feeling, navigate: 'UsSpace' },
          collapseKey: 'us_feeling',
        }).catch(() => null);
      }
    },
  );
};
