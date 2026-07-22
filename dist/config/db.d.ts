/**
 * Connect to PostgreSQL via Prisma with exponential-backoff retries.
 * Retries up to MAX_RETRIES times before giving up and exiting.
 * This prevents the PM2 crash-loop when the DB container is still warming up.
 */
export declare const connectDB: () => Promise<void>;
//# sourceMappingURL=db.d.ts.map