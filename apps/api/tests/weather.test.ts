import request from 'supertest';
import { createApp } from '../src/app';
import { cache } from '../src/services/cache';
import * as weatherScraper from '../src/services/weatherScraper';
import type { CurrentWeather } from '../src/types';

const app = createApp();

describe('Weather API', () => {
  beforeEach(() => {
    cache.flush();
  });

  it('GET /api/weather/current should return current weather', async () => {
    const res = await request(app).get('/api/weather/current?lat=39.9&lon=116.4');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('temperature');
  });

  it('GET /api/weather/hourly should return hourly forecast', async () => {
    const res = await request(app).get('/api/weather/hourly?lat=39.9&lon=116.4');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/weather/daily should return daily forecast', async () => {
    const res = await request(app).get('/api/weather/daily?lat=39.9&lon=116.4');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 400 when lat/lon missing', async () => {
    const res = await request(app).get('/api/weather/current');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/weather/current/:cityCode should return current weather and use cache', async () => {
    const mockWeather: CurrentWeather = {
      temperature: 25,
      feelsLike: 27,
      weatherText: '晴',
      weatherIcon: 'sunny',
      windDirection: '南风',
      windSpeed: '2级',
      humidity: 45,
      visibility: '10km',
      pressure: '1010hPa',
      sunrise: '05:30',
      sunset: '19:15',
      updateTime: new Date().toISOString(),
      source: '中国天气网',
    };
    const spy = jest.spyOn(weatherScraper, 'fetchCurrentWeather').mockResolvedValue(mockWeather);

    const res = await request(app).get('/api/weather/current/101010100');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockWeather);
    expect(spy).toHaveBeenCalledWith('101010100');

    const res2 = await request(app).get('/api/weather/current/101010100');
    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
    expect(res2.body.cachedAt).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });
});
