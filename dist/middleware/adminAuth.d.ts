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
 * Middleware: Validates JWT Bearer token and checks if the user has an 'admin' role.
 */
export declare const adminAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=adminAuth.d.ts.map