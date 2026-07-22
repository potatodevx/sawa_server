import { Request, Response, NextFunction, RequestHandler } from 'express';
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
/**
 * Wraps an async controller function and forwards any thrown errors
 * to the Express global error handler via `next(error)`.
 *
 * Usage:
 *   router.get('/path', asyncHandler(myController));
 */
export declare const asyncHandler: (fn: AsyncRequestHandler) => RequestHandler;
export {};
//# sourceMappingURL=asyncHandler.d.ts.map