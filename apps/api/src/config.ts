import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  weatherBaseUrl: process.env.WEATHER_BASE_URL || 'https://weather.com.cn',
  cacheTtl: {
    current: parseInt(process.env.CACHE_TTL_CURRENT || '300', 10),
    hourly: parseInt(process.env.CACHE_TTL_HOURLY || '1800', 10),
    daily: parseInt(process.env.CACHE_TTL_DAILY || '3600', 10),
    air: parseInt(process.env.CACHE_TTL_AIR || '900', 10),
    lifestyle: parseInt(process.env.CACHE_TTL_LIFESTYLE || '3600', 10),
    alerts: parseInt(process.env.CACHE_TTL_ALERTS || '300', 10),
    radar: parseInt(process.env.CACHE_TTL_RADAR || '600', 10),
  },
};
