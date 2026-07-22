import { Request, Response } from 'express';
export declare const validateCreateCommunity: (req: Request, _res: Response, next: import("express").NextFunction) => void;
export declare const validateJoinCommunity: (req: Request, _res: Response, next: import("express").NextFunction) => void;
export declare const getAllCommunities: (req: Request, res: Response) => Promise<void>;
export declare const getMyCommunities: (req: Request, res: Response) => Promise<void>;
export declare const getCommunityDetail: (req: Request, res: Response) => Promise<void>;
export declare const createCommunity: (req: Request, res: Response) => Promise<void>;
export declare const joinCommunity: (req: Request, res: Response) => Promise<void>;
export declare const leaveCommunity: (req: Request, res: Response) => Promise<void>;
export declare const inviteToCommunity: (req: Request, res: Response) => Promise<void>;
export declare const updateCommunity: (req: Request, res: Response) => Promise<void>;
export declare const deleteCommunity: (req: Request, res: Response) => Promise<void>;
export declare const getInviteableCouples: (req: Request, res: Response) => Promise<void>;
export declare const processJoinRequest: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=community.controller.d.ts.map