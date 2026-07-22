"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
const chatPrompts_1 = require("../constants/chatPrompts");
dotenv_1.default.config();
async function seedPrompts() {
    try {
        for (const text of chatPrompts_1.DEFAULT_CHAT_PROMPTS) {
            const exists = await prisma_1.prisma.prompt.findFirst({ where: { text } });
            if (!exists) {
                await prisma_1.prisma.prompt.create({
                    data: { text, category: 'chat_shortcut', isActive: true }
                });
                console.log(`✅ Seeded prompt: ${text}`);
            }
        }
        console.log('🚀 Default prompts restored!');
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seedPrompts();
//# sourceMappingURL=seedPrompts.js.map