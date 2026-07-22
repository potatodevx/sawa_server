import { Request, Response } from 'express';
export declare const validateSendOtp: (req: Request, _res: Response, next: import("express").NextFunction) => void;
export declare const validateVerifyOtp: (req: Request, _res: Response, next: import("express").NextFunction) => void;
export declare const validateRefresh: (req: Request, _res: Response, next: import("express").NextFunction) => void;
export declare const validateLoginSendOtp: (req: Request, _res: Response, next: import("express").NextFunction) => void;
export declare const validateLoginVerifyOtp: (req: Request, _res: Response, next: import("express").NextFunction) => void;
/**
 * POST /api/v1/auth/send-otp
 * Body: { yourPhone, partnerPhone }
 *
 * Creates/finds a shared coupleId for both phones.
 * Sends real OTPs via Twilio to both numbers.
 */
export declare const sendOtp: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/auth/verify-otp
 * Body: { yourPhone, yourOtp, partnerPhone, partnerOtp }
 *
 * Verifies both OTPs via Twilio. Returns JWT token pair for the primary user.
 */
export declare const verifyOtp: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/auth/refresh
 * Body: { refreshToken }
 */
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/auth/login-send-otp
 * Body: { phone }
 */
export declare const loginSendOtp: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/auth/login-verify-otp
 * Body: { phone, otp }
 */
export declare const loginVerifyOtp: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/auth/logout
 * Protected. Revokes refresh token.
 */
export declare const logout: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/auth/resend-otp
 * Body: { phone }
 *
 * Resends OTP for ONE phone only, reusing the existing coupleId.
 * Partner's OTP is NOT affected — safe to call independently per number.
 */
export declare const resendOtp: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/auth/invite-partner
 * Body: { partnerPhone }
 */
export declare const invitePartner: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map