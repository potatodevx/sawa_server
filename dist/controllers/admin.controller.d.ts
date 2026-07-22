import { Request, Response } from 'express';
export declare class AdminController {
    adminLogin(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Lazily serve a couple photo / community cover image. Authenticated via a
     * `?token=` query param (an <img> tag cannot send an Authorization header).
     * Keeps the big /admin/data payload free of multi-MB base64 blobs.
     */
    getMedia(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    getDashboardData(req: Request, res: Response): Promise<void>;
    deleteCouple(req: Request, res: Response): Promise<void>;
    addCommunity(req: Request, res: Response): Promise<void>;
    editCommunity(req: Request, res: Response): Promise<void>;
    banCouple(req: Request, res: Response): Promise<void>;
    unbanCouple(req: Request, res: Response): Promise<void>;
    processJoinRequestAsAdmin(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addPrompt(req: Request, res: Response): Promise<void>;
    togglePrompt(req: Request, res: Response): Promise<void>;
    editPrompt(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    reorderPrompts(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCommunity(req: Request, res: Response): Promise<void>;
    deletePrompt(req: Request, res: Response): Promise<void>;
    sendNotification(req: Request, res: Response): Promise<void>;
    flushDatabase(req: Request, res: Response): Promise<void>;
    getBlocks(req: Request, res: Response): Promise<void>;
    adminUnblock(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    resolveReport(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=admin.controller.d.ts.map