import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { getMe, updateMe, registerPushToken } from '../controllers/user.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(getMe));
router.patch('/me', asyncHandler(updateMe));
router.post('/me/push-token', asyncHandler(registerPushToken));

export default router;
