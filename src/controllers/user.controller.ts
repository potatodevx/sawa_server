import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

/**
 * GET /api/v1/users/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const user = await prisma.user.findUnique({ 
    where: { id: req.user.userId },
    select: { id: true, name: true, phone: true, email: true, dob: true, role: true, coupleId: true }
  });
  if (!user) throw new AppError('User not found', 404);
  sendSuccess({ res, data: { user: { ...user, _id: user.id } } });
};

/**
 * PATCH /api/v1/users/me
 */
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  // TODO Phase 2: validate body, update User document
  sendSuccess({ res, message: 'User updated [stub]' });
};

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
export const registerPushToken = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Unauthorized', 401);

  const { token, platform } = req.body || {};
  if (token !== null && token !== undefined && typeof token !== 'string') {
    throw new AppError('token must be a string or null', 400, 'INVALID_TOKEN');
  }
  if (platform && platform !== 'ios' && platform !== 'android') {
    throw new AppError('platform must be "ios" or "android"', 400, 'INVALID_PLATFORM');
  }

  // If the same token is already registered to a different user (e.g. shared
  // device, account switch), clear it from the old user so we don't push to
  // them by mistake.
  if (token) {
    await prisma.user.updateMany({
      where: { pushToken: token, NOT: { id: req.user.userId } },
      data: { pushToken: null, pushPlatform: null },
    });
  }

  await prisma.user.update({
    where: { id: req.user.userId },
    data: {
      pushToken: token || null,
      pushPlatform: token ? platform || null : null,
    },
  });

  sendSuccess({ res, message: 'Push token registered' });
};
