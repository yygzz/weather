import { Router } from 'express';
import { cache } from '../services/cache';
import { fetchRadarTiles } from '../services/weatherScraper';
import { reverseGeocode } from '../services/geocodeService';

const router = Router();

router.get('/tiles', async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      res.status(400).json({ success: false, error: 'lat and lon are required' });
      return;
    }
    const cached = cache.get('radar', String(lat), String(lon));
    if (cached) {
      res.json({ success: true, data: cached, cachedAt: new Date().toISOString() });
      return;
    }
    const geo = await reverseGeocode(Number(lat), Number(lon));
    const data = await fetchRadarTiles(geo.cityCode);
    cache.set('radar', String(lat), String(lon), data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
