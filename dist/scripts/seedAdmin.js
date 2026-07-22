"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function seedAdmin() {
    try {
        console.log('🛰️ Connecting to database...');
        const email = 'admin@gmail.com';
        const password = 'adminsawa';
        // Check if admin already exists
        const existingAdmin = await prisma_1.prisma.user.findFirst({ where: { email, role: 'admin' } });
        if (existingAdmin) {
            console.log('ℹ️ Admin account already exists. Updating password...');
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            await prisma_1.prisma.user.update({
                where: { id: existingAdmin.id },
                data: { password: hashedPassword }
            });
            console.log('✨ Admin password updated successfully!');
        }
        else {
            console.log('🚀 Creating new admin account...');
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Ensure admin-system couple exists
            await prisma_1.prisma.couple.upsert({
                where: { coupleId: 'admin-system' },
                update: {},
                create: {
                    coupleId: 'admin-system',
                    profileName: 'Admin System',
                    isProfileComplete: true,
                    isSubscribed: true
                }
            });
            await prisma_1.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'admin',
                    coupleId: 'admin-system',
                    name: 'System Admin',
                    isPhoneVerified: true
                }
            });
            console.log('✨ Admin account created successfully!');
        }
        // Seed default prompts
        const { DEFAULT_CHAT_PROMPTS } = await Promise.resolve().then(() => __importStar(require('../constants/chatPrompts')));
        for (const text of DEFAULT_CHAT_PROMPTS) {
            const exists = await prisma_1.prisma.prompt.findFirst({ where: { text } });
            if (!exists) {
                await prisma_1.prisma.prompt.create({
                    data: { text, category: 'chat_shortcut', isActive: true }
                });
                console.log(`📝 Seeded prompt: ${text}`);
            }
        }
        console.log('✅ Seeding complete!');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map