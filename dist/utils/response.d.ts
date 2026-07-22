import { Response } from 'express';
interface SuccessPayload<T = unknown> {
    res: Response;
    data?: T;
    message?: string;
    statusCode?: number;
}
interface ErrorPayload {
    res: Response;
    error: string;
    code?: string | number;
    statusCode?: number;
}
/**
 * Send a successful JSON response.
 *
 * Shape: { success: true, data, message }
 */
export declare const sendSuccess: <T = unknown>({ res, data, message, statusCode, }: SuccessPayload<T>) => void;
/**
 * Send an error JSON response.
 *
 * Shape: { success: false, error, code }
 */
export declare const sendError: ({ res, error, code, statusCode, }: ErrorPayload) => void;
export {};
//# sourceMappingURL=response.d.ts.map