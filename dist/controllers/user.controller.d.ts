import { Request, Response } from 'express';
/**
 * GET /api/v1/users/me
 */
export declare const getMe: (req: Request, res: Response) => Promise<void>;
/**
 * PATCH /api/v1/users/me
 */
export declare const updateMe: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/users/me/push-token
 * Register or update the FCM token for the authenticated user's device.
 *
 * Body: { token: string; platform: 'ios' | 'android' }
 *
 * The mobile app calls this:
 *   - On every successful login (token can change between sessions).
 *   - When FCM rotates the token (`onTokenRefresh`).
 *
 * Sending an empty/null token clears the registration (e.g. on logout).
 */
export declare const registerPushToken: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/v1/users/me/push-status
 * Diagnostic: returns whether this user has a push token saved + server push state.
 * Safe to call from the app or via curl to debug push delivery.
 */
export declare const getPushStatus: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/v1/users/me/test-push
 * Sends a real push to yourself AND your partner via the same code path
 * used by the app (pushToUser). Use to verify the server → FCM → device
 * chain without needing a socket event.
 */
export declare const testPush: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map