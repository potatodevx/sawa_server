"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
/**
 * Send a successful JSON response.
 *
 * Shape: { success: true, data, message }
 */
const sendSuccess = ({ res, data = {}, message = 'OK', statusCode = 200, }) => {
    res.status(statusCode).json({ success: true, data, message });
};
exports.sendSuccess = sendSuccess;
/**
 * Send an error JSON response.
 *
 * Shape: { success: false, error, code }
 */
const sendError = ({ res, error, code, statusCode = 500, }) => {
    res.status(statusCode).json({ success: false, error, code });
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map