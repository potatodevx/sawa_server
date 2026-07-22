export interface PushPayload {
    title: string;
    body: string;
    /** Arbitrary key/value pairs delivered with the push. Will be coerced to strings. */
    data?: Record<string, unknown>;
    /** A canonical "topic" string (e.g. "match", "community") for OS grouping. */
    collapseKey?: string;
}
/**
 * Send a push notification to every registered device of a couple.
 *
 * Looks up both partners' push tokens. Any token that returns
 * UNREGISTERED / INVALID_ARGUMENT from FCM is removed from the DB so we don't
 * keep retrying a stale install.
 */
export declare const pushToCouple: (coupleId: string, payload: PushPayload) => Promise<{
    sent: number;
    failed: number;
}>;
/**
 * Send a push notification to one specific user (not both partners).
 * Used for private partner-to-partner notifications like US Space nudges so
 * the sender does NOT receive their own notification.
 */
export declare const pushToUser: (userId: string, payload: PushPayload) => Promise<{
    sent: number;
    failed: number;
}>;
/**
 * Convenience: push to many couples in parallel. Returns aggregate counts.
 */
export declare const pushToCouples: (coupleIds: string[], payload: PushPayload) => Promise<{
    sent: number;
    failed: number;
}>;
export declare const isPushEnabled: () => boolean;
//# sourceMappingURL=push.service.d.ts.map