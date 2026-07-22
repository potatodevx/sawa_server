"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
async function finalizeAdmin() {
    try {
        // 1. Delete ALL existing users to be absolutely sure
        await prisma_1.prisma.user.deleteMany({});
        console.log('🗑️ Cleared all users.');
        // 2. Ensure ADMIN_COUPLE exists
        await prisma_1.prisma.couple.upsert({
            where: { coupleId: 'ADMIN_COUPLE' },
            update: {},
            create: {
                coupleId: 'ADMIN_COUPLE',
                profileName: 'Admin Entity',
                isProfileComplete: true,
                isSubscribed: true
            }
        });
        // 3. Create the requested admin
        const email = 'sawa@gmail.com';
        const password = 'admin';
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await prisma_1.prisma.user.create({
            data: {
                name: 'Sawa Admin',
                email,
                phone: 'ADMIN_SAWA_TEMP',
                password: hashedPassword,
                role: 'admin',
                coupleId: 'ADMIN_COUPLE',
                isPhoneVerified: true
            }
        });
        console.log(`🚀 Final Admin Account Created: ${email} / ${password}`);
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
finalizeAdmin();
//# sourceMappingURL=finalizeAdmin.js.map