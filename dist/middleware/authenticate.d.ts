import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                coupleMongoId?: string;
                coupleId?: string;
                userName?: string;
                role?: string;
            };
        }
    }
}
/**
 * Middleware: Validates JWT Bearer token, blocks banned couples, and
 * touches the user's lastActiveAt for the admin "Inactive" status logic.
 */
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Invalidate the cached ban status for a couple.
 * Call this after admin ban/unban so the next API call sees the change immediately.
 */
export declare const invalidateBanCache: (coupleId: string) => void;
//# sourceMappingURL=authenticate.d.ts.map