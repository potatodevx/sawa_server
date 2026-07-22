import { Server as SocketIOServer, Socket } from 'socket.io';
/**
 * Register match notification socket handlers.
 * Phase 3: emit MATCH_NEW and MATCH_ACCEPTED to specific couple rooms.
 */
export declare const registerMatchHandlers: (_io: SocketIOServer, socket: Socket) => void;
/**
 * Helper: emit a new match event to a specific couple.
 * Call this from the match service when a match is created.
 */
export declare const emitNewMatch: (io: SocketIOServer, coupleId: string, matchData: unknown) => void;
/**
 * Helper: emit match accepted event to both couples.
 */
export declare const emitMatchAccepted: (io: SocketIOServer, couple1Id: string, couple2Id: string, matchData: unknown) => void;
//# sourceMappingURL=match.socket.d.ts.map