"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
// Cap connections per PM2 worker so a multi-process cluster (pm2 -i max)
// doesn't exhaust the Postgres pool. With 4 workers × 5 = 20 connections total.
function buildDatabaseUrl() {
    const url = process.env.DATABASE_URL || '';
    if (!url)
        return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}connection_limit=5&pool_timeout=2`;
}
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        datasources: { db: { url: buildDatabaseUrl() } },
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
//# sourceMappingURL=prisma.js.map