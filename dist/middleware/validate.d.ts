import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
type ValidationTarget = 'body' | 'query' | 'params';
/**
 * Middleware factory for Zod schema validation.
 *
 * Usage:
 *   router.post('/path', validate(MySchema), myController);
 *   router.get('/path', validate(MyQuerySchema, 'query'), myController);
 */
export declare const validate: (schema: ZodSchema, target?: ValidationTarget) => (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.d.ts.map