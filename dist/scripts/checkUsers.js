"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function checkUsers() {
    try {
        const users = await prisma_1.prisma.user.findMany({});
        console.log('👥 Current Users in DB:');
        users.forEach((u) => {
            console.log(`- ID: ${u.id}, Email: ${u.email}, Phone: ${u.phone}, Role: ${u.role}`);
        });
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkUsers();
//# sourceMappingURL=checkUsers.js.map