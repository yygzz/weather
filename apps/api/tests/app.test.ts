import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('GET /health', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/geocode/reverse', () => {
  it('should return geocode result with lat/lon for Beijing', async () => {
    const res = await request(app).get('/api/geocode/reverse?lat=39.9&lon=116.4');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.city).toBe('北京');
    expect(res.body.data.cityCode).toBe('101010100');
    expect(res.body.data.province).toBe('北京');
    expect(typeof res.body.data.lat).toBe('number');
    expect(typeof res.body.data.lon).toBe('number');
  });

  it('should return the nearest city for Shanghai coordinates', async () => {
    const res = await request(app).get('/api/geocode/reverse?lat=31.23&lon=121.47');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.city).toBe('上海');
    expect(res.body.data.cityCode).toBe('101020100');
  });

  it('should return 400 when lat/lon missing', async () => {
    const res = await request(app).get('/api/geocode/reverse');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when lat/lon are not numbers', async () => {
    const res = await request(app).get('/api/geocode/reverse?lat=foo&lon=bar');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/lat|lon|number/);
  });

  it('should return 400 when lat is out of range', async () => {
    const res = await request(app).get('/api/geocode/reverse?lat=91&lon=116.4');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/lat/);
  });

  it('should return 400 when lon is out of range', async () => {
    const res = await request(app).get('/api/geocode/reverse?lat=39.9&lon=181');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/lon/);
  });
});
