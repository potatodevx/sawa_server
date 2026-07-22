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
export declare const emitRealtimeNotification: (recipientCoupleId: string | null | undefined, payload?: RealtimeNotificationPayload) => void;
export {};
//# sourceMappingURL=realtime.d.ts.map