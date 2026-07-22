"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const errorHandler = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code ?? err.statusCode,
        });
        return;
    }
    // Unhandled / unexpected errors
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: env_1.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        code: 500,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map