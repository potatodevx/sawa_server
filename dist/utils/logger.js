"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const { combine, timestamp, printf, colorize, errors, json } = winston_1.default.format;
const devFormat = combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), printf(({ timestamp: ts, level, message, stack }) => {
    return stack
        ? `[${ts}] ${level}: ${message}\n${stack}`
        : `[${ts}] ${level}: ${message}`;
}));
const prodFormat = combine(timestamp(), errors({ stack: true }), json());
const transports = [];
if (env_1.env.NODE_ENV === 'development') {
    transports.push(new winston_1.default.transports.Console({ format: devFormat }));
}
else {
    transports.push(new winston_1.default.transports.Console({ format: prodFormat }));
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join('logs', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '14d',
        format: prodFormat,
    }));
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join('logs', 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        format: prodFormat,
    }));
}
exports.logger = winston_1.default.createLogger({
    level: env_1.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports,
});
//# sourceMappingURL=logger.js.map