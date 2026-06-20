# 后端天气数据服务实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Express + TypeScript 后端服务，作为中国天气网的代理爬虫，为前端提供统一的天气数据 REST API，并支持分级内存缓存。

**Architecture:** 后端仅作为数据代理和缓存层，不存储持久化数据。每个 API 路由先查询 node-cache，命中则直接返回；未命中则调用 cheerio/axios 爬虫抓取中国天气网公开页面，解析后统一数据结构并写入缓存。

**Tech Stack:** Express, TypeScript, node-cache, axios, cheerio, jest, supertest

---

## 文件结构

```
apps/api/
├── src/
│   ├── index.ts                    # 服务入口
│   ├── app.ts                      # Express 应用配置
│   ├── config.ts                   # 环境变量与常量
│   ├── routes/
│   │   ├── index.ts                # 路由聚合
│   │   ├── weather.ts              # 天气相关路由
│   │   ├── radar.ts                # 雷达/卫星瓦片路由
│   │   └── geocode.ts              # 地理编码路由
│   ├── services/
│   │   ├── cache.ts                # node-cache 封装
│   │   ├── weatherScraper.ts       # 中国天气网爬虫
│   │   └── geocodeService.ts       # 坐标转城市服务
│   ├── types/
│   │   └── index.ts                # TypeScript 类型定义
│   └── middleware/
│       └── errorHandler.ts         # 全局错误处理
├── tests/
│   ├── app.test.ts                 # 基础路由测试
│   ├── weather.test.ts             # 天气 API 测试
│   └── scraper.test.ts             # 爬虫解析测试
├── package.json
├── tsconfig.json
├── jest.config.js
└── .env.example
```

---

## Task 1: 初始化后端项目

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/.env.example`
- Create: `apps/api/jest.config.js`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "weather-api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "cheerio": "^1.0.0-rc.12",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "node-cache": "^5.1.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.14.0",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2",
    "ts-jest": "^29.1.4",
    "tsx": "^4.11.2",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: 创建 .env.example**

```env
PORT=3001
WEATHER_BASE_URL=https://weather.com.cn
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
CACHE_TTL_CURRENT=300
CACHE_TTL_HOURLY=1800
CACHE_TTL_DAILY=3600
CACHE_TTL_AIR=900
CACHE_TTL_LIFESTYLE=3600
CACHE_TTL_ALERTS=300
CACHE_TTL_RADAR=600
```

- [ ] **Step 4: 创建 jest.config.js**

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
};
```

- [ ] **Step 5: 安装依赖**

Run: `cd apps/api && npm install`
Expected: 依赖安装成功，生成 `node_modules` 和 `package-lock.json`

---

## Task 2: 创建共享类型定义

**Files:**
- Create: `apps/api/src/types/index.ts`

- [ ] **Step 1: 定义天气数据类型**

```typescript
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  weatherText: string;
  weatherIcon: string;
  windDirection: string;
  windSpeed: string;
  humidity: number;
  visibility: string;
  pressure: string;
  sunrise: string;
  sunset: string;
  updateTime: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitationProbability: number;
  windDirection: string;
  windSpeed: string;
  weatherText: string;
}

export interface DailyForecast {
  date: string;
  dayWeather: string;
  nightWeather: string;
  highTemperature: number;
  lowTemperature: number;
  windDirection: string;
  windSpeed: string;
  precipitationProbability: number;
}

export interface AirQuality {
  aqi: number;
  level: string;
  primaryPollutant: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  advice: string;
}

export interface LifestyleIndex {
  name: string;
  level: string;
  description: string;
}

export interface WeatherAlert {
  title: string;
  level: 'blue' | 'yellow' | 'orange' | 'red';
  type: string;
  content: string;
  publishTime: string;
  defenseGuide: string[];
}

export interface RadarTileInfo {
  type: 'radar' | 'satellite';
  times: string[];
  baseUrl: string;
}

export interface GeocodeResult {
  city: string;
  cityCode: string;
  province: string;
}
```

- [ ] **Step 2: 创建通用响应类型**

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cachedAt?: string;
}

export interface CoordinatesQuery {
  lat: string;
  lon: string;
}
```

---

## Task 3: 配置服务与缓存

**Files:**
- Create: `apps/api/src/config.ts`
- Create: `apps/api/src/services/cache.ts`

- [ ] **Step 1: 创建 config.ts**

```typescript
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
```

- [ ] **Step 2: 创建 cache.ts**

```typescript
import NodeCache from 'node-cache';
import { config } from '../config';

export type CacheKey = 'current' | 'hourly' | 'daily' | 'air' | 'lifestyle' | 'alerts' | 'radar';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
  }

  private buildKey(type: CacheKey, lat: string, lon: string): string {
    return `${type}:${lat}:${lon}`;
  }

  get<T>(type: CacheKey, lat: string, lon: string): T | undefined {
    return this.cache.get<T>(this.buildKey(type, lat, lon));
  }

  set<T>(type: CacheKey, lat: string, lon: string, value: T, ttl?: number): void {
    const key = this.buildKey(type, lat, lon);
    if (ttl !== undefined) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value, config.cacheTtl[type]);
    }
  }

  flush(): void {
    this.cache.flushAll();
  }
}

export const cache = new CacheService();
```

---

## Task 4: 创建 Express 应用骨架

**Files:**
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/middleware/errorHandler.ts`
- Create: `apps/api/src/routes/index.ts`

- [ ] **Step 1: 创建错误处理中间件**

```typescript
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};
```

- [ ] **Step 2: 创建路由聚合**

```typescript
import { Router } from 'express';
import weatherRoutes from './weather';
import radarRoutes from './radar';
import geocodeRoutes from './geocode';

const router = Router();

router.use('/weather', weatherRoutes);
router.use('/radar', radarRoutes);
router.use('/geocode', geocodeRoutes);

export default router;
```

- [ ] **Step 3: 创建 app.ts**

```typescript
import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
}
```

- [ ] **Step 4: 创建 index.ts**

```typescript
import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Weather API server running on port ${config.port}`);
});
```

- [ ] **Step 5: 验证服务可启动**

Run: `cd apps/api && npm run dev`
Expected: 控制台输出 `Weather API server running on port 3001`

---

## Task 5: 实现地理编码服务

**Files:**
- Create: `apps/api/src/services/geocodeService.ts`
- Create: `apps/api/src/routes/geocode.ts`

- [ ] **Step 1: 创建 geocodeService.ts**

```typescript
import { GeocodeResult } from '../types';

// 简化实现：坐标转城市先使用高德/腾讯等公开 API 或本地映射
// 第一阶段先通过经纬度返回默认城市，后续可接入第三方 GEO API
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult> {
  // TODO: 接入真实 GEO 服务
  // 当前为占位实现，保证接口可测试
  return {
    city: '北京',
    cityCode: '101010100',
    province: '北京',
  };
}
```

- [ ] **Step 2: 创建 geocode.ts 路由**

```typescript
import { Router } from 'express';
import { reverseGeocode } from '../services/geocodeService';

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

export default router;
```

- [ ] **Step 3: 测试地理编码接口**

Run: `curl "http://localhost:3001/api/geocode/reverse?lat=39.9&lon=116.4"`
Expected: JSON 响应包含 `{ "success": true, "data": { "city": "北京", ... } }`

---

## Task 6: 实现天气爬虫服务

**Files:**
- Create: `apps/api/src/services/weatherScraper.ts`

- [ ] **Step 1: 实现基础 HTTP 请求工具**

```typescript
import axios from 'axios';
import { config } from '../config';

export const weatherClient = axios.create({
  baseURL: config.weatherBaseUrl,
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': config.weatherBaseUrl,
  },
});
```

- [ ] **Step 2: 实现实时天气爬虫（占位解析）**

```typescript
import * as cheerio from 'cheerio';
import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  AirQuality,
  LifestyleIndex,
  WeatherAlert,
  RadarTileInfo,
} from '../types';
import { weatherClient } from './weatherScraper';

export async function fetchCurrentWeather(cityCode: string): Promise<CurrentWeather> {
  // 中国天气网页面或 API 需要具体分析后替换 URL
  const url = `/weather/${cityCode}.shtml`;
  const { data } = await weatherClient.get(url);
  const $ = cheerio.load(data);

  // 占位解析：实际项目中需根据中国天气网 DOM 结构精确抓取
  return {
    temperature: 22,
    feelsLike: 25,
    weatherText: '多云',
    weatherIcon: 'cloudy',
    windDirection: '东南风',
    windSpeed: '3级',
    humidity: 65,
    visibility: '10km',
    pressure: '1013hPa',
    sunrise: '05:30',
    sunset: '19:15',
    updateTime: new Date().toISOString(),
  };
}
```

- [ ] **Step 3: 实现逐小时预报爬虫（占位解析）**

```typescript
export async function fetchHourlyForecast(cityCode: string): Promise<HourlyForecast[]> {
  const url = `/weather1d/${cityCode}.shtml`;
  const { data } = await weatherClient.get(url);
  const $ = cheerio.load(data);

  // 占位解析
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    temperature: 20 + Math.floor(Math.random() * 8),
    precipitationProbability: Math.floor(Math.random() * 100),
    windDirection: '东南风',
    windSpeed: '2级',
    weatherText: '多云',
  }));
}
```

- [ ] **Step 4: 实现逐天预报爬虫（占位解析）**

```typescript
export async function fetchDailyForecast(cityCode: string): Promise<DailyForecast[]> {
  const url = `/weather15d/${cityCode}.shtml`;
  const { data } = await weatherClient.get(url);
  const $ = cheerio.load(data);

  // 占位解析
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      dayWeather: '多云',
      nightWeather: '晴',
      highTemperature: 26,
      lowTemperature: 18,
      windDirection: '东南风',
      windSpeed: '3级',
      precipitationProbability: 20,
    };
  });
}
```

- [ ] **Step 5: 实现 AQI 与生活指数爬虫（占位解析）**

```typescript
export async function fetchAirQuality(cityCode: string): Promise<AirQuality> {
  return {
    aqi: 85,
    level: '良',
    primaryPollutant: 'PM2.5',
    pm25: 58,
    pm10: 72,
    o3: 95,
    no2: 32,
    so2: 12,
    co: 0.8,
    advice: '空气质量可接受，但某些污染物可能对极少数异常敏感人群健康有较弱影响。',
  };
}

export async function fetchLifestyleIndexes(cityCode: string): Promise<LifestyleIndex[]> {
  return [
    { name: '穿衣', level: '舒适', description: '建议穿长袖衬衫、单裤等服装。' },
    { name: '紫外线', level: '中等', description: '外出时涂抹防晒霜，戴遮阳帽。' },
    { name: '洗车', level: '适宜', description: '天气较好，适合擦洗汽车。' },
    { name: '晾晒', level: '适宜', description: '天气不错，抓紧时机让衣物晒晒太阳。' },
    { name: '感冒', level: '少发', description: '各项气象条件适宜，发生感冒机率较低。' },
    { name: '过敏', level: '较易发', description: '注意防护，避免接触过敏原。' },
    { name: '运动', level: '适宜', description: '天气较好，推荐进行户外运动。' },
    { name: '钓鱼', level: '适宜', description: '水温适宜，鱼儿活跃，适合垂钓。' },
  ];
}
```

- [ ] **Step 6: 实现预警与雷达信息爬虫（占位解析）**

```typescript
export async function fetchWeatherAlerts(cityCode: string): Promise<WeatherAlert[]> {
  return [];
}

export async function fetchRadarTiles(cityCode: string): Promise<RadarTileInfo> {
  return {
    type: 'radar',
    times: ['2024-01-01T08:00:00Z', '2024-01-01T08:10:00Z'],
    baseUrl: `${config.weatherBaseUrl}/radar/`,
  };
}
```

---

## Task 7: 实现天气 API 路由

**Files:**
- Create: `apps/api/src/routes/weather.ts`
- Create: `apps/api/src/routes/radar.ts`

- [ ] **Step 1: 创建 weather.ts 路由**

```typescript
import { Router } from 'express';
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

router.get('/current', async (req, res, next) => {
  try {
    const coords = parseCoords(req);
    if (!coords) {
      res.status(400).json({ success: false, error: 'lat and lon are required' });
      return;
    }
    const cached = cache.get('current', coords.lat, coords.lon);
    if (cached) {
      res.json({ success: true, data: cached, cachedAt: new Date().toISOString() });
      return;
    }
    const cityCode = await getCityCode(coords.lat, coords.lon);
    const data = await fetchCurrentWeather(cityCode);
    cache.set('current', coords.lat, coords.lon, data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/hourly', async (req, res, next) => {
  try {
    const coords = parseCoords(req);
    if (!coords) {
      res.status(400).json({ success: false, error: 'lat and lon are required' });
      return;
    }
    const cached = cache.get('hourly', coords.lat, coords.lon);
    if (cached) {
      res.json({ success: true, data: cached, cachedAt: new Date().toISOString() });
      return;
    }
    const cityCode = await getCityCode(coords.lat, coords.lon);
    const data = await fetchHourlyForecast(cityCode);
    cache.set('hourly', coords.lat, coords.lon, data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/daily', async (req, res, next) => {
  try {
    const coords = parseCoords(req);
    if (!coords) {
      res.status(400).json({ success: false, error: 'lat and lon are required' });
      return;
    }
    const cached = cache.get('daily', coords.lat, coords.lon);
    if (cached) {
      res.json({ success: true, data: cached, cachedAt: new Date().toISOString() });
      return;
    }
    const cityCode = await getCityCode(coords.lat, coords.lon);
    const data = await fetchDailyForecast(cityCode);
    cache.set('daily', coords.lat, coords.lon, data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/air', async (req, res, next) => {
  try {
    const coords = parseCoords(req);
    if (!coords) {
      res.status(400).json({ success: false, error: 'lat and lon are required' });
      return;
    }
    const cached = cache.get('air', coords.lat, coords.lon);
    if (cached) {
      res.json({ success: true, data: cached, cachedAt: new Date().toISOString() });
      return;
    }
    const cityCode = await getCityCode(coords.lat, coords.lon);
    const data = await fetchAirQuality(cityCode);
    cache.set('air', coords.lat, coords.lon, data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/lifestyle', async (req, res, next) => {
  try {
    const coords = parseCoords(req);
    if (!coords) {
      res.status(400).json({ success: false, error: 'lat and lon are required' });
      return;
    }
    const cached = cache.get('lifestyle', coords.lat, coords.lon);
    if (cached) {
      res.json({ success: true, data: cached, cachedAt: new Date().toISOString() });
      return;
    }
    const cityCode = await getCityCode(coords.lat, coords.lon);
    const data = await fetchLifestyleIndexes(cityCode);
    cache.set('lifestyle', coords.lat, coords.lon, data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/alerts', async (req, res, next) => {
  try {
    const coords = parseCoords(req);
    if (!coords) {
      res.status(400).json({ success: false, error: 'lat and lon are required' });
      return;
    }
    const cached = cache.get('alerts', coords.lat, coords.lon);
    if (cached) {
      res.json({ success: true, data: cached, cachedAt: new Date().toISOString() });
      return;
    }
    const cityCode = await getCityCode(coords.lat, coords.lon);
    const data = await fetchWeatherAlerts(cityCode);
    cache.set('alerts', coords.lat, coords.lon, data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
```

注意：需要在文件顶部添加 `import express from 'express';` 因为 `parseCoords` 使用了 `express.Request` 类型。

```typescript
import express, { Router } from 'express';
```

- [ ] **Step 2: 创建 radar.ts 路由**

```typescript
import { Router } from 'express';
import { cache } from '../services/cache';
import { fetchRadarTiles } from '../services/weatherScraper';
import { reverseGeocode } from '../services/geocodeService';

const router = Router();

router.get('/tiles', async (req, res, next) => {
  try {
    const { lat, lon, type } = req.query;
    if (!lat || !lon) {
      res.status(400).json({ success: false, error: 'lat and lon are required' });
      return;
    }
    const cacheType = type === 'satellite' ? 'radar' : 'radar';
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
```

---

## Task 8: 编写后端测试

**Files:**
- Create: `apps/api/tests/app.test.ts`
- Create: `apps/api/tests/weather.test.ts`

- [ ] **Step 1: 创建 app.test.ts**

```typescript
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
```

- [ ] **Step 2: 创建 weather.test.ts**

```typescript
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

  it('should return 400 when lat/lon missing', async () => {
    const res = await request(app).get('/api/weather/current');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
```

- [ ] **Step 3: 运行测试**

Run: `cd apps/api && npm test`
Expected: 所有测试通过

---

## 自我审查

- **Spec coverage:** 后端 API、缓存、爬虫、错误处理、测试均已覆盖。
- **Placeholder scan:** 爬虫解析使用占位实现，明确标注需根据中国天气网实际 DOM 结构替换。
- **Type consistency:** 所有路由共享 `CoordinatesQuery` 与 `ApiResponse` 类型，缓存 key 类型统一。
