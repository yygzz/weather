import { Router } from 'express';
import { reverseGeocode, searchCity } from '../services/geocodeService';

const router = Router();

function parseCoordinate(value: unknown, name: string): { value: number; error?: string } {
  if (typeof value !== 'string' || value.trim() === '') {
    return { value: NaN, error: `${name} is required and must be a number` };
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return { value: NaN, error: `${name} must be a valid number` };
  }
  return { value: num };
}

router.get('/reverse', async (req, res, next) => {
  try {
    const latResult = parseCoordinate(req.query.lat, 'lat');
    const lonResult = parseCoordinate(req.query.lon, 'lon');
    const error = latResult.error ?? lonResult.error;
    if (error) {
      res.status(400).json({ success: false, error });
      return;
    }
    if (latResult.value < -90 || latResult.value > 90) {
      res.status(400).json({ success: false, error: 'lat must be between -90 and 90' });
      return;
    }
    if (lonResult.value < -180 || lonResult.value > 180) {
      res.status(400).json({ success: false, error: 'lon must be between -180 and 180' });
      return;
    }
    const result = await reverseGeocode(latResult.value, lonResult.value);
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
