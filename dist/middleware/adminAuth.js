"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
/**
 * Middleware: Validates JWT Bearer token and checks if the user has an 'admin' role.
 */
const adminAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError_1.AppError('Authorization header missing', 401, 'UNAUTHORIZED'));
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return next(new AppError_1.AppError('Token missing', 401, 'UNAUTHORIZED'));
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // For admin actions, we MUST verify the role from the database to ensure security.
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user || user.role !== 'admin') {
            return next(new AppError_1.AppError('Access denied. Admins only.', 403, 'FORBIDDEN'));
        }
        req.user = {
            userId: payload.userId,
            coupleId: user.coupleId || undefined,
            role: user.role
        };
        next();
    }
    catch (err) {
        console.error(`[Admin Auth Error] ${err.message}`);
        next(new AppError_1.AppError('Administrative authentication failed', 401, 'UNAUTHORIZED'));
    }
};
exports.adminAuth = adminAuth;
//# sourceMappingURL=adminAuth.js.map