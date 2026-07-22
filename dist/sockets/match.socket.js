"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitMatchAccepted = exports.emitNewMatch = exports.registerMatchHandlers = void 0;
const logger_1 = require("../utils/logger");
/**
 * Register match notification socket handlers.
 * Phase 3: emit MATCH_NEW and MATCH_ACCEPTED to specific couple rooms.
 */
const registerMatchHandlers = (_io, socket) => {
    // Each couple joins their own room for targeted notifications
    if (socket.coupleId) {
        socket.join(`couple:${socket.coupleId}`);
        logger_1.logger.debug(`Socket ${socket.id} joined couple room: couple:${socket.coupleId}`);
    }
    // TODO Phase 3: emit match:new from matchService when a new suggestion is created
    // TODO Phase 3: emit match:accepted when a match is mutually accepted
};
exports.registerMatchHandlers = registerMatchHandlers;
/**
 * Helper: emit a new match event to a specific couple.
 * Call this from the match service when a match is created.
 */
const emitNewMatch = (io, coupleId, matchData) => {
    io.to(`couple:${coupleId}`).emit('match:new', matchData);
};
exports.emitNewMatch = emitNewMatch;
/**
 * Helper: emit match accepted event to both couples.
 */
const emitMatchAccepted = (io, couple1Id, couple2Id, matchData) => {
    io.to(`couple:${couple1Id}`).emit('match:accepted', matchData);
    io.to(`couple:${couple2Id}`).emit('match:accepted', matchData);
};
exports.emitMatchAccepted = emitMatchAccepted;
//# sourceMappingURL=match.socket.js.map