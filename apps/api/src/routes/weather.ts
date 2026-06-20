import express, { Router } from 'express';
import { cache } from '../services/cache';
import {
  fetchCurrentWeather,
  fetchHourlyForecast,
  fetchDailyForecast,
  fetchAirQuality,
  fetchLifestyleIndexes,
  fetchWeatherAlerts,
} from '../services/weatherScraper';
import { reverseGeocode } from '../services/geocodeService';

const router = Router();

function parseCoords(req: express.Request): { lat: string; lon: string } | null {
  const { lat, lon } = req.query;
  if (!lat || !lon) return null;
  return { lat: String(lat), lon: String(lon) };
}

async function getCityCode(lat: string, lon: string): Promise<string> {
  const cached = cache.get<{ cityCode: string }>('geocode', lat, lon);
  if (cached) return cached.cityCode;
  const geo = await reverseGeocode(Number(lat), Number(lon));
  cache.set('geocode', lat, lon, { cityCode: geo.cityCode }, 86400);
  return geo.cityCode;
}

function handleWeatherRoute(
  fetcher: (cityCode: string) => Promise<unknown>,
  cacheKey: 'current' | 'hourly' | 'daily' | 'air' | 'lifestyle' | 'alerts'
) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const coords = parseCoords(req);
      if (!coords) {
        res.status(400).json({ success: false, error: 'lat and lon are required' });
        return;
      }
      const cached = cache.get(cacheKey, coords.lat, coords.lon);
      if (cached) {
        res.json({ success: true, data: cached, cachedAt: new Date().toISOString() });
        return;
      }
      const cityCode = await getCityCode(coords.lat, coords.lon);
      const data = await fetcher(cityCode);
      cache.set(cacheKey, coords.lat, coords.lon, data);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}

router.get('/current', handleWeatherRoute(fetchCurrentWeather, 'current'));
router.get('/hourly', handleWeatherRoute(fetchHourlyForecast, 'hourly'));
router.get('/daily', handleWeatherRoute(fetchDailyForecast, 'daily'));
router.get('/air', handleWeatherRoute(fetchAirQuality, 'air'));
router.get('/lifestyle', handleWeatherRoute(fetchLifestyleIndexes, 'lifestyle'));
router.get('/alerts', handleWeatherRoute(fetchWeatherAlerts, 'alerts'));

export default router;
