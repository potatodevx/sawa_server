import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { cacheGet } from '../lib/cache';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/v1/us/partner-feeling
 *
 * Returns the last mood the partner shared (stored in Redis on us:feeling socket
 * event). Falls back to null if nothing has been shared yet.
 */
router.get('/partner-feeling', authenticate, async (req: Request, res: Response): Promise<void> => {
  const coupleId = req.user?.coupleId;
  const myUserId = req.user?.userId;

  if (!coupleId || !myUserId) {
    res.json({ success: true, data: null });
    return;
  }

  try {
    // Find the partner's userId
    const couple = await prisma.couple.findUnique({
      where: { coupleId },
      select: { partner1Id: true, partner2Id: true },
    });

    if (!couple) {
      res.json({ success: true, data: null });
      return;
    }

    const partnerId =
      couple.partner1Id === myUserId ? couple.partner2Id : couple.partner1Id;

    const raw = await cacheGet(`us:feeling:${coupleId}:${partnerId}`);
    if (!raw) {
      res.json({ success: true, data: null });
      return;
    }

    const feeling = JSON.parse(raw);
    res.json({ success: true, data: feeling });
  } catch (err: any) {
    logger.warn(`[UsRoutes] partner-feeling error: ${err.message}`);
    res.json({ success: true, data: null });
  }
});

export default router;
