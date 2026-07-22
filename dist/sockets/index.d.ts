import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
declare module 'socket.io' {
    interface Socket {
        userId?: string;
        coupleId?: string;
        userName?: string;
        userRole?: string;
    }
}
export declare const createSocketServer: (httpServer: HTTPServer) => SocketIOServer;
//# sourceMappingURL=index.d.ts.map