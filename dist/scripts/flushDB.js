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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
/**
 * Load DATABASE_URL by directly reading and parsing candidate .env files.
 * Uses manual parsing so it works regardless of dotenv caching or module load order.
 */
function loadDatabaseUrlFromEnvFiles() {
    const candidates = [
        path_1.default.resolve(__dirname, '../../.env'), // server/src/scripts → server/.env
        path_1.default.resolve(__dirname, '../../../.env'), // fallback one level up
        path_1.default.resolve(process.cwd(), '.env'), // cwd (server/) → server/.env
        path_1.default.resolve(process.cwd(), 'server/.env'), // cwd (repo root) → server/.env
    ];
    for (const envPath of candidates) {
        if (!fs_1.default.existsSync(envPath))
            continue;
        try {
            const content = fs_1.default.readFileSync(envPath, 'utf8');
            const match = content.match(/^DATABASE_URL=(.+)$/m);
            if (match) {
                process.env.DATABASE_URL = match[1].trim().replace(/^["']|["']$/g, '');
                console.log('Loaded DATABASE_URL from:', envPath);
                return;
            }
        }
        catch {
            // try next candidate
        }
    }
    // Final fallback: try dotenv on the server/.env path
    dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env'), override: true });
}
loadDatabaseUrlFromEnvFiles();
/** All application tables (Prisma @@map names). Single TRUNCATE avoids partial clears. */
const TABLES = [
    'onboarding_answers',
    'messages',
    'notifications',
    'matches',
    'community_members',
    'community_admins',
    'community_join_requests',
    'reports',
    'otp_tokens',
    'users',
    'couples',
    'communities',
    'prompts',
];
async function flushDb() {
    if (!process.env.DATABASE_URL?.trim()) {
        console.error('DATABASE_URL is not set. Add it to server/.env (same folder as package.json) and run: npm run db:flush');
        process.exit(1);
    }
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
    console.log('Starting full database flush (all rows removed)...');
    try {
        const list = TABLES.map((t) => `"${t}"`).join(', ');
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE;`);
        console.log(`Truncated ${TABLES.length} tables in one transaction.`);
        console.log('Database flush complete.');
        await prisma.$disconnect();
        process.exit(0);
    }
    catch (err) {
        console.error('Database flush failed:', err);
        await prisma.$disconnect().catch(() => { });
        process.exit(1);
    }
}
flushDb();
//# sourceMappingURL=flushDB.js.map