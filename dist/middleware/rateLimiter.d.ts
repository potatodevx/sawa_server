/**
 * Auth route rate limiter.
 * Default: 10 requests per 15 minutes per IP.
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * General API rate limiter (more lenient).
 * 200 requests per 15 minutes per IP.
 */
export declare const apiRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map