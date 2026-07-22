"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = void 0;
/**
 * Socket.io event name constants.
 * Always use these instead of raw strings.
 */
exports.SOCKET_EVENTS = {
    // ─── Connection ─────────────────────────────────────────────────────────────
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    // ─── Chat ───────────────────────────────────────────────────────────────────
    CHAT_JOIN: 'chat:join',
    CHAT_LEAVE: 'chat:leave',
    CHAT_MESSAGE: 'chat:message',
    CHAT_READ: 'chat:read',
    CHAT_TYPING: 'chat:typing',
    CHAT_STOP_TYPING: 'chat:stopTyping',
    // ─── Match ──────────────────────────────────────────────────────────────────
    MATCH_NEW: 'match:new',
    MATCH_ACCEPTED: 'match:accepted',
    MATCH_REJECTED: 'match:rejected',
    // ─── Errors ─────────────────────────────────────────────────────────────────
    ERROR: 'error',
};
//# sourceMappingURL=socketEvents.js.map