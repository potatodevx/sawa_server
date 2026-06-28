import { Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
import { prisma } from '../lib/prisma';
import { getCoupleCommunityColor } from '../utils/communityColors';
import {
  createPresignedUpload,
  createPresignedDownload,
  isStorageConfigured,
} from '../lib/storage';

export const getUnreadCounts = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { coupleId } = req.user;
  if (!coupleId) throw new AppError('Couple ID required', 400);

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ couple1Id: coupleId }, { couple2Id: coupleId }],
      status: 'accepted',
    },
    select: { id: true },
  });

  const counts: Record<string, { unreadCount: number; lastMessage: string | null; lastMessageTime: string | null }> = {};

  await Promise.all(
    matches.map(async (match) => {
      const [unreadCount, lastMsg] = await Promise.all([
        prisma.message.count({
          where: {
            matchId: match.id,
            chatType: 'private',
            senderId: { not: coupleId },
            NOT: { readBy: { has: coupleId } },
          },
        }),
        prisma.message.findFirst({
          where: { matchId: match.id, chatType: 'private' },
          orderBy: { createdAt: 'desc' },
          select: { content: true, createdAt: true, contentType: true },
        }),
      ]);

      counts[match.id] = {
        unreadCount,
        lastMessage:
          lastMsg
            ? lastMsg.contentType === 'text'
              ? lastMsg.content
              : lastMsg.contentType === 'audio'
              ? 'Voice message'
              : lastMsg.contentType === 'image'
              ? 'Photo'
              : lastMsg.content
            : null,
        lastMessageTime: lastMsg?.createdAt?.toISOString() ?? null,
      };
    }),
  );

  sendSuccess({ res, data: { counts } });
};

export const getGroupUnreadCounts = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { coupleId } = req.user;
  if (!coupleId) throw new AppError('Couple ID required', 400);

  // All communities this couple belongs to
  const memberships = await prisma.communityMember.findMany({
    where: { coupleId },
    select: { communityId: true },
  });

  const counts: Record<
    string,
    { unreadCount: number; lastMessage: string | null; lastMessageTime: string | null }
  > = {};

  await Promise.all(
    memberships.map(async ({ communityId }) => {
      const [unreadCount, lastMsg] = await Promise.all([
        prisma.message.count({
          where: {
            chatType: 'group',
            communityId,
            senderId: { not: coupleId },
            NOT: { readBy: { has: coupleId } },
          },
        }),
        prisma.message.findFirst({
          where: { chatType: 'group', communityId },
          orderBy: { createdAt: 'desc' },
          select: { content: true, createdAt: true, contentType: true, senderName: true },
        }),
      ]);

      let lastMessagePreview: string | null = null;
      if (lastMsg) {
        const firstName = (lastMsg.senderName || 'Someone').split(' ')[0];
        const text =
          lastMsg.contentType === 'text'
            ? lastMsg.content
            : lastMsg.contentType === 'audio'
            ? 'Voice message'
            : lastMsg.contentType === 'image'
            ? 'Photo'
            : lastMsg.content;
        lastMessagePreview = `${firstName}: ${text}`;
      }

      counts[communityId] = {
        unreadCount,
        lastMessage: lastMessagePreview,
        lastMessageTime: lastMsg?.createdAt?.toISOString() ?? null,
      };
    }),
  );

  sendSuccess({ res, data: { counts } });
};

export const getPrivateMessages = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { matchId } = req.params;

  const messages = await prisma.message.findMany({
    where: {
      chatType: 'private',
      matchId: matchId,
    },
    include: {
      sender: { select: { coupleId: true, profileName: true } },
      senderUser: { select: { role: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const finalMessages = messages.reverse().map((m: any) => {
    // Derive a human-readable first name. Priority order:
    // 1. Stored senderIndividualName on the message row (set at send time)
    // 2. User.name from the individual user record
    // 3. senderName stored on the message
    // 4. First partner name from couple profileName (e.g. "Kiran & Stella" → "Kiran")
    // 5. Last resort: fallback string
    const coupleFirstName = m.sender?.profileName
      ? m.sender.profileName.split(/\s*&\s*/)[m.senderUser?.role === 'partner' ? 1 : 0]?.trim()
      : undefined;
    const individualName =
      m.senderIndividualName || m.senderUser?.name || m.senderName || coupleFirstName || 'Me';
    return {
      _id: m.id,
      content: m.content,
      contentType: m.contentType,
      senderName: individualName,
      senderUserId: m.senderUserId,
      senderRole: m.senderUser?.role,
      senderCoupleId: m.sender?.coupleId,
      senderIndividualName: individualName,
      timestamp: m.createdAt,
      readBy: m.readBy || [],
      audioDuration: m.audioDuration,
      repliedToId: m.repliedToId,
      repliedToText: m.repliedToText,
      repliedToName: m.repliedToName,
      senderImage: undefined 
    };
  });

  sendSuccess({ res, data: { matchId, messages: finalMessages } });
};

export const sendPrivateMessage = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { matchId } = req.params;
  const { content, contentType } = req.body;

  const { userId, coupleId } = req.user!;
  if (!coupleId) throw new AppError('Couple ID required', 400);

  const senderUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true },
  });
  // Fallback: derive first name from couple profileName when user.name is not set yet
  const coupleProfile = senderUser?.name ? null : await prisma.couple.findUnique({
    where: { coupleId },
    select: { profileName: true },
  });
  const coupleFirstName = coupleProfile?.profileName
    ? coupleProfile.profileName.split(/\s*&\s*/)[senderUser?.role === 'partner' ? 1 : 0]?.trim()
    : undefined;
  const senderName =
    req.body.senderIndividualName ||
    senderUser?.name ||
    req.body.senderName ||
    coupleFirstName ||
    'Me';

  const message = await prisma.message.create({
    data: {
      chatType: 'private',
      matchId: matchId,
      senderId: coupleId,
      senderUserId: userId,
      senderName,
      senderIndividualName: senderName,
      content,
      contentType: (contentType || 'text') as any,
      audioDuration: req.body.audioDuration,
      repliedToId: req.body.repliedToId,
      repliedToText: req.body.repliedToText,
      repliedToName: req.body.repliedToName,
    }
  });

  sendSuccess({ res, data: { message: { ...message, _id: message.id } }, statusCode: 201 });
};

export const getGroupMessages = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { communityId } = req.params;

  const messages = await prisma.message.findMany({
    where: {
      chatType: 'group',
      communityId: communityId,
    },
    include: {
      sender: { select: { coupleId: true, profileName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const finalMessages = messages.reverse().map((m: any) => {
    return {
      _id: m.id,
      content: m.content,
      contentType: m.contentType,
      senderCoupleId: m.senderId,
      senderName: m.sender?.profileName || m.senderName || 'Matched Couple', 
      senderIndividualName: m.senderName || 'User', 
      accent: getCoupleCommunityColor(m.senderId),
      timestamp: m.createdAt,
      readBy: m.readBy || [],
      audioDuration: m.audioDuration,
      repliedToId: m.repliedToId,
      repliedToText: m.repliedToText,
      repliedToName: m.repliedToName,
    };
  });

  sendSuccess({ res, data: { communityId, messages: finalMessages } });
};

export const sendGroupMessage = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { communityId } = req.params;
  const { content, contentType } = req.body;

  const { userId, coupleId } = req.user!;
  if (!coupleId) throw new AppError('Couple ID required', 400);

  const senderUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  const senderName =
    req.body.senderIndividualName ||
    senderUser?.name ||
    req.body.senderName ||
    'User';

  const message = await prisma.message.create({
    data: {
      chatType: 'group',
      communityId: communityId,
      senderId: coupleId,
      senderUserId: userId,
      senderName,
      senderIndividualName: senderName,
      content,
      contentType: (contentType || 'text') as any,
      audioDuration: req.body.audioDuration,
      repliedToId: req.body.repliedToId,
      repliedToText: req.body.repliedToText,
      repliedToName: req.body.repliedToName,
    }
  });

  sendSuccess({ res, data: { message: { ...message, _id: message.id } }, statusCode: 201 });
};

export const editMessage = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { messageId } = req.params;
  const { content } = req.body;
  const { coupleId } = req.user;

  if (!content?.trim()) throw new AppError('Content is required', 400);

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new AppError('Message not found', 404);
  if (message.senderId !== coupleId) throw new AppError('Not authorized to edit this message', 403);
  if (message.contentType !== 'text') throw new AppError('Only text messages can be edited', 400);

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { content: content.trim() },
  });

  // Broadcast updated text to everyone in the chat room in real-time
  const io = (global as any).io;
  if (io) {
    const chatId = updated.matchId || updated.communityId;
    if (chatId) {
      io.to(`chat:${chatId}`).emit('chat:messageEdited', {
        messageId: updated.id,
        newContent: updated.content,
        chatId,
      });
    }
  }

  sendSuccess({ res, data: { message: { ...updated, _id: updated.id } } });
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { messageId } = req.params;
  const forEveryone = req.query.forEveryone === 'true';
  const { coupleId } = req.user;

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new AppError('Message not found', 404);

  if (forEveryone) {
    if (message.senderId !== coupleId) throw new AppError('Not authorized to delete this message for everyone', 403);

    const chatId = message.matchId || message.communityId;
    await prisma.message.delete({ where: { id: messageId } });

    // Broadcast deletion to everyone in the chat room in real-time
    const io = (global as any).io;
    if (io && chatId) {
      io.to(`chat:${chatId}`).emit('chat:messageDeleted', {
        messageId,
        chatId,
      });
    }
  }
  // "Delete for me" is handled client-side only — no DB change needed

  sendSuccess({ res, data: { messageId, forEveryone } });
};

/**
 * POST /api/v1/chats/:chatId/read
 * Marks all messages in a private or group chat as read for the current user.
 * Called by the client when opening any chat thread — more reliable than socket-only approach.
 */
export const markChatRead = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { coupleId } = req.user;
  if (!coupleId) throw new AppError('Couple ID required', 400);

  const { chatId } = req.params;
  if (!chatId) throw new AppError('Chat ID required', 400);

  // Mark all unread messages read in ONE statement using array_append, instead
  // of fetching every row and issuing an UPDATE per message (old N+1 pattern).
  // `array_append(... )` with the NOT(... = ANY) guard is idempotent.
  const markedCount = await prisma.$executeRaw`
    UPDATE "messages"
    SET "readBy" = array_append("readBy", ${coupleId})
    WHERE ("matchId" = ${chatId} OR "communityId" = ${chatId})
      AND "senderId" <> ${coupleId}
      AND NOT (${coupleId} = ANY("readBy"))
  `;

  // Notify the calling user's socket so BottomToggleBar refreshes its badge counts immediately.
  const io = (global as any).io;
  if (io) {
    io.to(`couple:${coupleId}`).emit('chat:markRead', { chatId, coupleId });
  }

  sendSuccess({ res, data: { chatId, read: true, markedCount } });
};

/**
 * POST /api/v1/chats/upload-url
 * Returns a short-lived presigned URL the client uploads chat media (voice
 * notes) directly to object storage with. The client then sends only the small
 * public URL through the socket, keeping large binary payloads out of the
 * socket pipeline and out of Postgres.
 */
export const createChatUploadUrl = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { coupleId } = req.user;
  if (!coupleId) throw new AppError('Couple ID required', 400);

  if (!isStorageConfigured()) {
    throw new AppError('Media storage is not configured', 503, 'STORAGE_UNAVAILABLE');
  }

  const schema = z.object({
    kind: z.enum(['voice', 'image']).default('voice'),
    contentType: z.string().min(3).max(100).optional(),
    ext: z.string().max(8).optional(),
  });
  const { kind, contentType, ext } = schema.parse(req.body ?? {});

  const resolvedContentType =
    contentType || (kind === 'voice' ? 'audio/aac' : 'image/jpeg');

  const { uploadUrl, publicUrl, key } = await createPresignedUpload({
    folder: kind,
    contentType: resolvedContentType,
    ext,
    coupleId,
  });

  // The bucket is private; the message stores this stable reference and playback
  // resolves a fresh presigned URL via GET /chats/media-url.
  const ref = `s3:${key}`;

  sendSuccess({
    res,
    data: { uploadUrl, publicUrl, key, ref, contentType: resolvedContentType },
  });
};

/**
 * GET /api/v1/chats/media-url?key=voice/...   (or ?ref=s3:voice/...)
 * Returns a short-lived presigned download URL for a stored media object.
 * Used by the client to play voice notes from the private bucket.
 */
export const getMediaUrl = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  if (!isStorageConfigured()) {
    throw new AppError('Media storage is not configured', 503, 'STORAGE_UNAVAILABLE');
  }

  const raw = String(req.query.key ?? req.query.ref ?? '');
  const key = raw.startsWith('s3:') ? raw.slice(3) : raw;

  // Only allow our own media prefixes — never sign arbitrary keys.
  if (!key || !/^(voice|image)\//.test(key)) {
    throw new AppError('Invalid media reference', 400, 'INVALID_KEY');
  }

  const url = await createPresignedDownload(key);
  sendSuccess({ res, data: { url } });
};
