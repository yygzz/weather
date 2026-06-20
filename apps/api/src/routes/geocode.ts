import { Router } from 'express';
import { reverseGeocode, searchCity } from '../services/geocodeService';

const router = Router();

router.get('/reverse', async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      res.status(400).json({ success: false, error: 'lat and lon are required' });
      return;
    }
    const result = await reverseGeocode(Number(lat), Number(lon));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, error: 'q is required' });
      return;
    }
    const result = await searchCity(q);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
