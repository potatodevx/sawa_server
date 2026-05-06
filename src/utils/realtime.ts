import { pushToCouple } from '../services/push.service';

type RealtimeNotificationPayload = {
  notificationId?: string;
  type?: string;
  title?: string;
  message?: string;
  data?: unknown;
};

/**
 * Emit a notification to a couple in real-time.
 *
 *  1. Socket.IO emit on `couple:{id}` room   — instantly visible if the app
 *     is open (in-app banner / NotificationsScreen).
 *  2. FCM push                               — delivers to OS lock-screen /
 *     notification tray when the app is closed/backgrounded. Silently no-ops
 *     if Firebase is not configured (see push.service.ts).
 *
 * This is fire-and-forget — push errors are logged inside push.service and do
 * not affect the realtime emit.
 */
export const emitRealtimeNotification = (
  recipientCoupleId: string | null | undefined,
  payload: RealtimeNotificationPayload = {},
): void => {
  if (!recipientCoupleId) return;

  const io = (global as any).io;
  if (io) {
    io.to(`couple:${recipientCoupleId}`).emit('notification:new', payload);
  }

  // Fire-and-forget push delivery. Skips automatically when push is disabled
  // or the couple has no registered devices.
  if (payload.title || payload.message) {
    pushToCouple(recipientCoupleId, {
      title: payload.title || 'SAWA',
      body: payload.message || '',
      data: {
        type: payload.type,
        notificationId: payload.notificationId,
        ...(payload.data && typeof payload.data === 'object' ? (payload.data as Record<string, unknown>) : {}),
      },
      collapseKey: payload.type,
    }).catch(() => {
      // Already logged inside push service.
    });
  }
};
