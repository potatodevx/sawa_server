"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const prisma_1 = require("../lib/prisma");
const logger_1 = require("../utils/logger");
const MAX_RETRIES = 10;
const BASE_DELAY_MS = 3000; // 3 s initial wait
const MAX_DELAY_MS = 30000; // cap at 30 s
/**
 * Connect to PostgreSQL via Prisma with exponential-backoff retries.
 * Retries up to MAX_RETRIES times before giving up and exiting.
 * This prevents the PM2 crash-loop when the DB container is still warming up.
 */
const connectDB = async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await prisma_1.prisma.$connect();
            logger_1.logger.info('✅  PostgreSQL connected via Prisma');
            return;
        }
        catch (error) {
            const isLast = attempt === MAX_RETRIES;
            const delay = Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS);
            if (isLast) {
                logger_1.logger.error(`❌  PostgreSQL connection failed after ${MAX_RETRIES} attempts. Exiting.`, error);
                process.exit(1);
            }
            logger_1.logger.warn(`⚠️  PostgreSQL connection attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${delay / 1000}s…`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map