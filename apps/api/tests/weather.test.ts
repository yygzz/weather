import request from 'supertest';
import { createApp } from '../src/app';
import { cache } from '../src/services/cache';

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
});
