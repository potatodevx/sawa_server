"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const prisma_1 = require("../lib/prisma");
const AppError_1 = require("../utils/AppError");
/**
 * Normalises any phone format to a bare 10-digit string for consistent DB storage.
 * Examples:
 *   +919876543210 → 9876543210
 *   919876543210  → 9876543210
 *   9876543210    → 9876543210
 */
function normalizePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91'))
        return digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0'))
        return digits.slice(1);
    return digits;
}
class UserRepository {
    async findByPhone(phone) {
        const normalized = normalizePhone(phone);
        // Single query covering all three legacy storage formats.
        return prisma_1.prisma.user.findFirst({
            where: {
                OR: [
                    { phone: normalized },
                    { phone: `91${normalized}` },
                    { phone: `+91${normalized}` },
                ],
            },
        });
    }
    async findById(id) {
        return prisma_1.prisma.user.findUnique({ where: { id } });
    }
    async findByEntityId(coupleId) {
        return prisma_1.prisma.user.findMany({ where: { coupleId } });
    }
    async upsertByPhone(phone, coupleId, role) {
        const normalized = normalizePhone(phone);
        return prisma_1.prisma.user.upsert({
            where: { phone: normalized },
            update: {},
            create: { phone: normalized, coupleId, role, isPhoneVerified: false },
        });
    }
    async markVerified(phone) {
        const normalized = normalizePhone(phone);
        const user = await prisma_1.prisma.user.update({
            where: { phone: normalized },
            data: { isPhoneVerified: true },
        });
        if (!user)
            throw new AppError_1.AppError(`User not found for phone: ${phone}`, 404, 'USER_NOT_FOUND');
        return user;
    }
    async saveRefreshTokenHash(userId, hash) {
        await prisma_1.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: hash } });
    }
    async clearRefreshToken(userId) {
        await prisma_1.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    }
    async findByIdWithRefreshToken(userId) {
        return prisma_1.prisma.user.findUnique({ where: { id: userId } });
    }
    async update(id, data) {
        const user = await prisma_1.prisma.user.update({ where: { id }, data });
        if (!user)
            throw new AppError_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        return user;
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=user.repository.js.map