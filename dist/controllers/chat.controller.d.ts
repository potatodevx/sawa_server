import { Request, Response } from 'express';
export declare const getUnreadCounts: (req: Request, res: Response) => Promise<void>;
export declare const getGroupUnreadCounts: (req: Request, res: Response) => Promise<void>;
export declare const getPrivateMessages: (req: Request, res: Response) => Promise<void>;
export declare const sendPrivateMessage: (req: Request, res: Response) => Promise<void>;
export declare const getGroupMessages: (req: Request, res: Response) => Promise<void>;
export declare const sendGroupMessage: (req: Request, res: Response) => Promise<void>;
export declare const editMessage: (req: Request, res: Response) => Promise<void>;
export declare const deleteMessage: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/chats/:chatId/read
 * Marks all messages in a private or group chat as read for the current user.
 * Called by the client when opening any chat thread — more reliable than socket-only approach.
 */
export declare const markChatRead: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/chats/upload-url
 * Returns a short-lived presigned URL the client uploads chat media (voice
 * notes) directly to object storage with. The client then sends only the small
 * public URL through the socket, keeping large binary payloads out of the
 * socket pipeline and out of Postgres.
 */
export declare const createChatUploadUrl: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/v1/chats/media-url?key=voice/...   (or ?ref=s3:voice/...)
 * Returns a short-lived presigned download URL for a stored media object.
 * Used by the client to play voice notes from the private bucket.
 */
export declare const getMediaUrl: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map