import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { cacheGet, cacheSet, cacheInvalidate } from '../lib/cache';
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

const PLANNED_DATES_TTL = 365 * 24 * 60 * 60; // 1 year

/**
 * POST /api/v1/us/planned-dates
 * Add or update a planned date entry for the couple.
 * Body: { activity, date, rawDate, from?, time?, note? }
 */
router.post('/planned-dates', authenticate, async (req: Request, res: Response): Promise<void> => {
  const coupleId = req.user?.coupleId;
  if (!coupleId) { res.status(400).json({ success: false, error: 'Missing couple context' }); return; }

  const { activity, date, rawDate, from, time, note } = req.body as Record<string, string>;
  if (!activity || !rawDate) { res.status(400).json({ success: false, error: 'activity and rawDate are required' }); return; }

  try {
    const key = `us:planned_dates:${coupleId}`;
    const raw = await cacheGet(key);
    const prev: any[] = raw ? JSON.parse(raw) : [];
    const entry = { activity, date: date ?? rawDate, rawDate, from: from || 'Your partner', time, note };
    const updated = [...prev.filter((p: any) => p.rawDate !== rawDate), entry];
    await cacheSet(key, JSON.stringify(updated), PLANNED_DATES_TTL);
    res.json({ success: true });
  } catch (err: any) {
    logger.warn(`[UsRoutes] planned-dates POST error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Failed to save planned date' });
  }
});

/**
 * GET /api/v1/us/planned-dates
 * Returns all planned dates for the couple.
 */
router.get('/planned-dates', authenticate, async (req: Request, res: Response): Promise<void> => {
  const coupleId = req.user?.coupleId;
  if (!coupleId) { res.json({ success: true, data: [] }); return; }

  try {
    const key = `us:planned_dates:${coupleId}`;
    const raw = await cacheGet(key);
    const dates = raw ? JSON.parse(raw) : [];
    res.json({ success: true, data: dates });
  } catch (err: any) {
    logger.warn(`[UsRoutes] planned-dates GET error: ${err.message}`);
    res.json({ success: true, data: [] });
  }
});

/**
 * DELETE /api/v1/us/planned-dates/:rawDate
 * Remove a planned date by rawDate (YYYY-MM-DD).
 */
router.delete('/planned-dates/:rawDate', authenticate, async (req: Request, res: Response): Promise<void> => {
  const coupleId = req.user?.coupleId;
  const { rawDate } = req.params;
  if (!coupleId || !rawDate) { res.status(400).json({ success: false }); return; }

  try {
    const key = `us:planned_dates:${coupleId}`;
    const raw = await cacheGet(key);
    const prev: any[] = raw ? JSON.parse(raw) : [];
    const updated = prev.filter((p: any) => p.rawDate !== rawDate);
    await cacheSet(key, JSON.stringify(updated), PLANNED_DATES_TTL);
    res.json({ success: true });
  } catch (err: any) {
    logger.warn(`[UsRoutes] planned-dates DELETE error: ${err.message}`);
    res.status(500).json({ success: false });
  }
});

/**
 * DELETE /api/v1/us/my-feeling
 * Clears the authenticated user's feeling from Redis (for testing/reset).
 */
router.delete('/my-feeling', authenticate, async (req: Request, res: Response): Promise<void> => {
  const coupleId = req.user?.coupleId;
  const myUserId = req.user?.userId;
  if (!coupleId || !myUserId) { res.status(400).json({ success: false, error: 'Missing couple context' }); return; }
  try {
    await cacheInvalidate(`us:feeling:${coupleId}:${myUserId}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/us/admin-clear-feeling
 * Admin-only: clears any user's feeling by coupleId + userId.
 * Requires ?secret=SAWA_ADMIN_2026
 */
router.post('/admin-clear-feeling', async (req: Request, res: Response): Promise<void> => {
  if (req.query.secret !== 'SAWA_ADMIN_2026') { res.status(403).json({ success: false }); return; }
  const { coupleId, userId } = req.body as { coupleId?: string; userId?: string };
  if (!coupleId || !userId) { res.status(400).json({ success: false, error: 'coupleId and userId required' }); return; }
  try {
    await cacheInvalidate(`us:feeling:${coupleId}:${userId}`);
    res.json({ success: true, deleted: `us:feeling:${coupleId}:${userId}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
