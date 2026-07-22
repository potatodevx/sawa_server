"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
// Prisma re-export — preserves existing import patterns
// import { User } from '../models/User.model'  ← still works everywhere
const prisma_1 = require("../lib/prisma");
// Export the prisma delegate as a drop-in accessor
exports.User = prisma_1.prisma.user;
//# sourceMappingURL=User.model.js.map