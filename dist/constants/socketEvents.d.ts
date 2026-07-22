/**
 * Socket.io event name constants.
 * Always use these instead of raw strings.
 */
export declare const SOCKET_EVENTS: {
    readonly CONNECT: "connect";
    readonly DISCONNECT: "disconnect";
    readonly CHAT_JOIN: "chat:join";
    readonly CHAT_LEAVE: "chat:leave";
    readonly CHAT_MESSAGE: "chat:message";
    readonly CHAT_READ: "chat:read";
    readonly CHAT_TYPING: "chat:typing";
    readonly CHAT_STOP_TYPING: "chat:stopTyping";
    readonly MATCH_NEW: "match:new";
    readonly MATCH_ACCEPTED: "match:accepted";
    readonly MATCH_REJECTED: "match:rejected";
    readonly ERROR: "error";
};
export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
//# sourceMappingURL=socketEvents.d.ts.map