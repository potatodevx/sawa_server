import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { cacheGet, cacheSet } from '../lib/cache';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

const router = Router();

const FEELING_TTL = 7 * 24 * 60 * 60; // 7 days

/**
 * POST /api/v1/us/my-feeling
 *
 * Saves the authenticated user's current mood to Redis so their partner
 * can fetch it after a fresh login (even if the socket was not connected).
 */
router.post('/my-feeling', authenticate, async (req: Request, res: Response): Promise<void> => {
  const coupleId = req.user?.coupleId;
  const myUserId = req.user?.userId;

  if (!coupleId || !myUserId) {
    res.status(400).json({ success: false, error: 'Missing couple context' });
    return;
  }

  const { feeling, note, at } = req.body as { feeling?: string; note?: string; at?: string };
  if (!feeling) {
    res.status(400).json({ success: false, error: 'feeling is required' });
    return;
  }

  try {
    // Resolve sender's display name from the couple profile
    const couple = await prisma.couple.findUnique({
      where: { coupleId },
      select: { profileName: true, partner1Id: true, partner2Id: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: myUserId },
      select: { name: true, role: true },
    });

    // Derive first name: prefer user.name, else first half of "Name & Partner"
    let senderName = user?.name?.trim() || '';
    if (!senderName && couple?.profileName) {
      const parts = couple.profileName.split(/\s*&\s*/);
      senderName = (user?.role === 'partner' ? parts[1] : parts[0])?.trim() || '';
    }
    if (!senderName) senderName = 'Your partner';

    const payload = {
      feeling,
      note: note ?? '',
      at: at ?? new Date().toISOString(),
      from: senderName,
    };

    await cacheSet(`us:feeling:${coupleId}:${myUserId}`, JSON.stringify(payload), FEELING_TTL);

    res.json({ success: true });
  } catch (err: any) {
    logger.warn(`[UsRoutes] my-feeling POST error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Failed to save feeling' });
  }
});

/**
 * GET /api/v1/us/partner-feeling
 *
 * Returns the last mood the partner shared (stored in Redis).
 * Falls back to null if nothing has been shared yet.
 */
router.get('/partner-feeling', authenticate, async (req: Request, res: Response): Promise<void> => {
  const coupleId = req.user?.coupleId;
  const myUserId = req.user?.userId;

  if (!coupleId || !myUserId) {
    res.json({ success: true, data: null });
    return;
  }

  try {
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

    if (!partnerId) {
      res.json({ success: true, data: null });
      return;
    }

    const raw = await cacheGet(`us:feeling:${coupleId}:${partnerId}`);
    if (!raw) {
      res.json({ success: true, data: null });
      return;
    }

    const feeling = JSON.parse(raw);
    res.json({ success: true, data: feeling });
  } catch (err: any) {
    logger.warn(`[UsRoutes] partner-feeling GET error: ${err.message}`);
    res.json({ success: true, data: null });
  }
});

export default router;
