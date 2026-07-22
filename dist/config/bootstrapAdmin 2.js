"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapAdmin = bootstrapAdmin;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
/**
 * Idempotent admin bootstrap. Runs once on server startup so the admin
 * dashboard login ALWAYS works after a deploy, without needing to manually
 * run a seed script against production.
 *
 * - Ensures an `admin-system` couple exists (satisfies the User.coupleId FK).
 * - Upserts a user with role='admin' using ADMIN_EMAIL / ADMIN_PASSWORD.
 * - The password is re-hashed and updated every boot so it always matches env.
 *
 * Safe to run concurrently (PM2 cluster) — upsert + caught P2002 handle races.
 */
async function bootstrapAdmin() {
    const email = env_1.env.ADMIN_EMAIL.trim().toLowerCase();
    const password = env_1.env.ADMIN_PASSWORD;
    try {
        await prisma_1.prisma.couple.upsert({
            where: { coupleId: 'admin-system' },
            update: {},
            create: {
                coupleId: 'admin-system',
                profileName: 'Admin System',
                isProfileComplete: true,
                isSubscribed: true,
            },
        });
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const existing = await prisma_1.prisma.user.findFirst({ where: { email } });
        if (existing) {
            await prisma_1.prisma.user.update({
                where: { id: existing.id },
                data: { password: hashed, role: 'admin', coupleId: existing.coupleId ?? 'admin-system' },
            });
            logger_1.logger.info(`🔐  Admin account ensured (updated): ${email}`);
        }
        else {
            await prisma_1.prisma.user.create({
                data: {
                    email,
                    password: hashed,
                    role: 'admin',
                    coupleId: 'admin-system',
                    name: 'System Admin',
                    isPhoneVerified: true,
                },
            });
            logger_1.logger.info(`🔐  Admin account ensured (created): ${email}`);
        }
    }
    catch (err) {
        // Unique-constraint race in cluster mode is fine — another worker won.
        if (err?.code === 'P2002') {
            logger_1.logger.warn('🔐  Admin bootstrap race (another worker created it) — ignoring.');
            return;
        }
        logger_1.logger.error('❌  Admin bootstrap failed:', err?.message || err);
    }
}
//# sourceMappingURL=bootstrapAdmin%202.js.map