import { Request, Response } from 'express';
export declare const validateMatchAction: (req: Request, _res: Response, next: import("express").NextFunction) => void;
/**
 * GET /api/v1/matches/discovery
 * Fetches the discovery feed of un-interacted couples for the requesting couple.
 */
export declare const getDiscoveryFeed: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/matches/say-hello
 * Send a hello/like to a couple.
 */
export declare const sayHello: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/matches/skip
 * Skip/pass on a couple so they don't appear in the feed again.
 */
export declare const skipCouple: (req: Request, res: Response) => Promise<void>;
export declare const getMatches: (req: Request, res: Response) => Promise<void>;
export declare const refreshDiscovery: (req: Request, res: Response) => Promise<void>;
export declare const getIncomingRequests: (req: Request, res: Response) => Promise<void>;
export declare const acceptMatch: (req: Request, res: Response) => Promise<void>;
export declare const rejectMatch: (req: Request, res: Response) => Promise<void>;
export declare const blockCouple: (req: Request, res: Response) => Promise<void>;
export declare const unfriendCouple: (req: Request, res: Response) => Promise<void>;
export declare const getInsights: (_req: Request, _res: Response) => Promise<void>;
//# sourceMappingURL=match.controller.d.ts.map