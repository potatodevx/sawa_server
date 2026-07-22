/**
 * Custom application error class.
 *
 * Usage:
 *   throw new AppError('Resource not found', 404, 'NOT_FOUND');
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly code?: string;
    constructor(message: string, statusCode?: number, code?: string, isOperational?: boolean);
}
//# sourceMappingURL=AppError.d.ts.map