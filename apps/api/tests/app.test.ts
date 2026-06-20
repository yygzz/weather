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
  it('should return geocode result', async () => {
    const res = await request(app).get('/api/geocode/reverse?lat=39.9&lon=116.4');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.city).toBe('北京');
  });

  it('should return 400 when lat/lon missing', async () => {
    const res = await request(app).get('/api/geocode/reverse');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
