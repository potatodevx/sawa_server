/**
 * Thin Redis cache wrapper used for hot read paths (couple profile, discovery
 * feed, notification counts). Falls back gracefully to a plain in-process Map
 * when REDIS_URL is not configured, so nothing breaks in local dev without Redis.
 *
 * Design rules:
 *  • All TTLs are short (5-60 s) — we never sacrifice correctness for speed.
 *  • Every write path that mutates a cached value must call invalidate().
 *  • The cache is optional: if get() errors it returns null; set()/invalidate()
 *    swallow errors and log a warning.
 */
export declare function cacheGet(key: string): Promise<string | null>;
export declare function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void>;
export declare function cacheInvalidate(key: string): Promise<void>;
/**
 * Best-effort Redis liveness probe for the /health endpoint.
 * Returns 'ok' when a PING succeeds, 'down' when Redis is configured but
 * unreachable, and 'disabled' when no REDIS_URL is set (local dev).
 */
export declare function cachePing(): Promise<'ok' | 'down' | 'disabled'>;
export declare function cacheInvalidatePattern(pattern: string): Promise<void>;
export declare const CACHE_KEYS: {
    coupleProfile: (coupleId: string) => string;
    notifUnreadCount: (coupleId: string) => string;
};
export declare function getCachedCoupleProfile(coupleId: string): Promise<any | null>;
export declare function setCachedCoupleProfile(coupleId: string, data: any): Promise<void>;
export declare function invalidateCoupleProfile(coupleId: string): Promise<void>;
export declare function getCachedNotifUnreadCount(coupleId: string): Promise<number | null>;
export declare function setCachedNotifUnreadCount(coupleId: string, count: number): Promise<void>;
export declare function invalidateNotifUnreadCount(coupleId: string): Promise<void>;
//# sourceMappingURL=cache.d.ts.map