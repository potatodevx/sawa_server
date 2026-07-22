"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateBanCache = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
const prisma_1 = require("../lib/prisma");
/**
 * In-memory cache to throttle expensive ban/activity DB work.
 *  - lastActiveAt is rewritten at most once every ACTIVITY_THROTTLE_MS per user
 *    (60s) so we don't hammer the DB on chatty endpoints.
 *  - Ban status is cached per coupleId for BAN_CACHE_MS (15s) so a single
 *    socket-spamming client doesn't re-query every request, but a freshly
 *    banned couple loses access within seconds.
 */
const ACTIVITY_THROTTLE_MS = 60000;
const BAN_CACHE_MS = 15000;
const lastActivityWriteAt = new Map();
const banStatusCache = new Map();
/**
 * Middleware: Validates JWT Bearer token, blocks banned couples, and
 * touches the user's lastActiveAt for the admin "Inactive" status logic.
 */
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError_1.AppError('Authorization header missing', 401, 'UNAUTHORIZED'));
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return next(new AppError_1.AppError('Token missing', 401, 'UNAUTHORIZED'));
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            userId: payload.userId,
            coupleId: payload.coupleId,
            coupleMongoId: payload.coupleMongoId,
        };
        // ─── Ban + existence check (cached) ───────────────────────────────────
        if (payload.coupleId) {
            const cached = banStatusCache.get(payload.coupleId);
            const now = Date.now();
            let bannedAt;
            let coupleFound;
            if (cached && now - cached.checkedAt < BAN_CACHE_MS) {
                bannedAt = cached.bannedAt;
                // coupleFound is stored alongside bannedAt; old cache entries without
                // this flag are treated as "found" to avoid spurious logouts on redeploy.
                coupleFound = cached.coupleFound !== false;
            }
            else {
                const couple = await prisma_1.prisma.couple.findUnique({
                    where: { coupleId: payload.coupleId },
                    select: { bannedAt: true },
                });
                coupleFound = couple !== null;
                bannedAt = couple?.bannedAt ?? null;
                banStatusCache.set(payload.coupleId, {
                    bannedAt,
                    checkedAt: now,
                    ...(({ coupleFound }) => ({ coupleFound }))({ coupleFound }),
                });
            }
            // Couple was deleted — revoke the session so the mobile app logs out
            if (!coupleFound) {
                banStatusCache.delete(payload.coupleId);
                return next(new AppError_1.AppError('Account no longer exists.', 401, 'ACCOUNT_DELETED'));
            }
            if (bannedAt) {
                return next(new AppError_1.AppError('This account has been suspended. Please contact support.', 403, 'ACCOUNT_BANNED'));
            }
        }
        // ─── Activity tracking (throttled write) ───────────────────────────────
        const lastWrite = lastActivityWriteAt.get(payload.userId) ?? 0;
        if (Date.now() - lastWrite > ACTIVITY_THROTTLE_MS) {
            lastActivityWriteAt.set(payload.userId, Date.now());
            // Fire-and-forget — don't block the request on this.
            prisma_1.prisma.user
                .update({
                where: { id: payload.userId },
                data: { lastActiveAt: new Date() },
            })
                .catch((err) => {
                console.warn(`[Auth] Failed to update lastActiveAt for ${payload.userId}: ${err.message}`);
            });
        }
        next();
    }
    catch (err) {
        console.error(`[Auth Error] Failed to authenticate: ${err.message}`);
        if (err instanceof AppError_1.AppError) {
            return next(err);
        }
        next(new AppError_1.AppError(err.message || 'Authentication failed', 401, 'UNAUTHORIZED'));
    }
};
exports.authenticate = authenticate;
/**
 * Invalidate the cached ban status for a couple.
 * Call this after admin ban/unban so the next API call sees the change immediately.
 */
const invalidateBanCache = (coupleId) => {
    banStatusCache.delete(coupleId);
};
exports.invalidateBanCache = invalidateBanCache;
//# sourceMappingURL=authenticate.js.map