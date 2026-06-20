import { Router } from 'express';
import { cache } from '../services/cache';
import { config } from '../config';
import { fetchLifestyleIndices } from '../services/weatherScraper';

const router = Router();

router.get('/:cityCode', async (req, res, next) => {
  try {
    const { cityCode } = req.params;
    if (!cityCode || !/^\d+$/.test(cityCode)) {
      res.status(400).json({ success: false, error: 'cityCode is required and must be numeric' });
      return;
    }
    const cacheKey = `lifestyle:${cityCode}`;
    const cached = cache.getByKey(cacheKey);
    if (cached) {
      res.json({ success: true, data: cached, cachedAt: new Date().toISOString() });
      return;
    }
    const data = await fetchLifestyleIndices(cityCode);
    cache.setByKey(cacheKey, data, config.cacheTtl.lifestyle);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
