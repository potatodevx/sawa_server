"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
async function createAdmin() {
    try {
        const email = 'sawa@gmail.com';
        const password = 'admin';
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const exists = await prisma_1.prisma.user.findFirst({ where: { email } });
        if (exists) {
            await prisma_1.prisma.user.update({
                where: { id: exists.id },
                data: {
                    password: hashedPassword,
                    role: 'admin',
                }
            });
            console.log(`✅ Updated existing account: ${email}`);
        }
        else {
            await prisma_1.prisma.user.create({
                data: {
                    name: 'Sawa Admin',
                    email,
                    password: hashedPassword,
                    role: 'admin',
                    isPhoneVerified: true
                }
            });
            console.log(`🚀 Created new admin account: ${email}`);
        }
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
createAdmin();
//# sourceMappingURL=createRequestedAdmin.js.map