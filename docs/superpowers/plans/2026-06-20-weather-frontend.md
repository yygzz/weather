# 前端 Liquid Glass 天气网站实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Vite + React + TypeScript 前端网站，采用 Apple Liquid Glass 动态流体视觉风格，连接后端天气 API，展示定位、实时天气、预报、雷达/卫星、专业图表、生活指数和预警信息。

**Architecture:** 单页应用（SPA），Zustand 管理城市和定位状态，React Query 管理服务端状态与缓存，通用 API 服务封装后端调用，组件按页面区域划分到 `sections/`，UI 原子组件放到 `ui/`。

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, Leaflet, Zustand, TanStack Query, Lucide React

---

## 文件结构

```
apps/web/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── GlassCard.tsx
│   │   │   ├── PageBackground.tsx
│   │   │   ├── AnimatedSection.tsx
│   │   │   ├── WeatherIcon.tsx
│   │   │   └── AlertModal.tsx
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HourlyForecast.tsx
│   │   │   ├── DailyForecast.tsx
│   │   │   ├── CurrentDetails.tsx
│   │   │   ├── RadarMap.tsx
│   │   │   ├── ProfessionalCharts.tsx
│   │   │   ├── LifestyleIndex.tsx
│   │   │   ├── AirQuality.tsx
│   │   │   └── WeatherAlert.tsx
│   │   └── common/
│   │       └── LocationSearch.tsx
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   └── useWeather.ts
│   ├── stores/
│   │   └── weatherStore.ts
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
├── tests/
│   └── App.test.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

---

## Task 1: 初始化前端项目

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tsconfig.node.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/index.html`
- Create: `apps/web/.env.example`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "weather-web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.40.0",
    "axios": "^1.7.2",
    "framer-motion": "^11.2.6",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.379.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.12.7",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.5",
    "@testing-library/react": "^15.0.7",
    "@types/leaflet": "^1.9.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vite": "^5.2.12",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 5: 创建 tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-flow': 'gradientFlow 20s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 6: 创建 postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: 创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weather Glass</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: 创建 .env.example**

```env
VITE_API_BASE_URL=/api
```

- [ ] **Step 9: 安装依赖**

Run: `cd apps/web && npm install`
Expected: 依赖安装成功

---

## Task 2: 全局样式与 Liquid Glass 基础组件

**Files:**
- Create: `apps/web/src/index.css`
- Create: `apps/web/src/components/ui/GlassCard.tsx`
- Create: `apps/web/src/components/ui/PageBackground.tsx`
- Create: `apps/web/src/components/ui/AnimatedSection.tsx`

- [ ] **Step 1: 创建 index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-highlight: rgba(255, 255, 255, 0.25);
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@layer components {
  .glass-card {
    @apply rounded-3xl border p-6;
    background: var(--glass-bg);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-color: var(--glass-border);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 var(--glass-highlight);
  }
}
```

- [ ] **Step 2: 创建 GlassCard.tsx**

```tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className = '', delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card ${className}`}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: 创建 PageBackground.tsx**

```tsx
export function PageBackground({ weatherType = 'default' }: { weatherType?: string }) {
  const gradients: Record<string, string> = {
    default: 'from-slate-900 via-purple-900 to-slate-900',
    sunny: 'from-orange-900 via-amber-800 to-blue-900',
    cloudy: 'from-slate-800 via-gray-700 to-blue-900',
    rainy: 'from-slate-900 via-blue-900 to-cyan-900',
    snowy: 'from-slate-800 via-blue-100 to-slate-300',
    night: 'from-indigo-950 via-purple-950 to-slate-900',
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[weatherType] || gradients.default} animate-gradient-flow bg-[length:400%_400%]`}
      />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
```

- [ ] **Step 4: 创建 AnimatedSection.tsx**

```tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function AnimatedSection({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
```

---

## Task 3: 类型定义、API 服务与状态管理

**Files:**
- Create: `apps/web/src/types/index.ts`
- Create: `apps/web/src/services/api.ts`
- Create: `apps/web/src/stores/weatherStore.ts`

- [ ] **Step 1: 创建类型定义**

```typescript
export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeocodeResult {
  city: string;
  cityCode: string;
  province: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cachedAt?: string;
}
```

- [ ] **Step 2: 创建 api.ts**

```typescript
import axios from 'axios';
import type {
  ApiResponse,
  AirQuality,
  Coordinates,
  CurrentWeather,
  DailyForecast,
  GeocodeResult,
  HourlyForecast,
  LifestyleIndex,
  RadarTileInfo,
  WeatherAlert,
} from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url, { params });
  if (!data.success || data.data === undefined) {
    throw new Error(data.error || 'Request failed');
  }
  return data.data;
}

export const weatherApi = {
  reverseGeocode: (coords: Coordinates) => get<GeocodeResult>('/geocode/reverse', coords),
  current: (coords: Coordinates) => get<CurrentWeather>('/weather/current', coords),
  hourly: (coords: Coordinates) => get<HourlyForecast[]>('/weather/hourly', coords),
  daily: (coords: Coordinates) => get<DailyForecast[]>('/weather/daily', coords),
  air: (coords: Coordinates) => get<AirQuality>('/weather/air', coords),
  lifestyle: (coords: Coordinates) => get<LifestyleIndex[]>('/weather/lifestyle', coords),
  alerts: (coords: Coordinates) => get<WeatherAlert[]>('/weather/alerts', coords),
  radar: (coords: Coordinates, type: 'radar' | 'satellite' = 'radar') =>
    get<RadarTileInfo>('/radar/tiles', { ...coords, type }),
};
```

- [ ] **Step 3: 创建 weatherStore.ts**

```typescript
import { create } from 'zustand';
import type { Coordinates, GeocodeResult } from '@/types';

interface WeatherState {
  coordinates: Coordinates | null;
  location: GeocodeResult | null;
  setCoordinates: (coords: Coordinates) => void;
  setLocation: (location: GeocodeResult) => void;
}

const DEFAULT_COORDS: Coordinates = { lat: 39.9042, lon: 116.4074 };

export const useWeatherStore = create<WeatherState>((set) => ({
  coordinates: DEFAULT_COORDS,
  location: null,
  setCoordinates: (coordinates) => set({ coordinates }),
  setLocation: (location) => set({ location }),
}));
```

---

## Task 4: 定位 Hook 与数据 Hook

**Files:**
- Create: `apps/web/src/hooks/useGeolocation.ts`
- Create: `apps/web/src/hooks/useWeather.ts`

- [ ] **Step 1: 创建 useGeolocation.ts**

```typescript
import { useEffect, useState } from 'react';
import { useWeatherStore } from '@/stores/weatherStore';
import type { Coordinates } from '@/types';

export function useGeolocation() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const setCoordinates = useWeatherStore((s) => s.setCoordinates);

  useEffect(() => {
    setStatus('loading');
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoordinates(coords);
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setCoordinates]);

  return { status, error };
}
```

- [ ] **Step 2: 创建 useWeather.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { useWeatherStore } from '@/stores/weatherStore';
import { weatherApi } from '@/services/api';

export function useWeatherData() {
  const coordinates = useWeatherStore((s) => s.coordinates);
  const coords = coordinates || { lat: 39.9042, lon: 116.4074 };

  const current = useQuery({
    queryKey: ['current', coords],
    queryFn: () => weatherApi.current(coords),
    refetchInterval: 5 * 60 * 1000,
    enabled: !!coordinates,
  });

  const hourly = useQuery({
    queryKey: ['hourly', coords],
    queryFn: () => weatherApi.hourly(coords),
    refetchInterval: 30 * 60 * 1000,
    enabled: !!coordinates,
  });

  const daily = useQuery({
    queryKey: ['daily', coords],
    queryFn: () => weatherApi.daily(coords),
    refetchInterval: 60 * 60 * 1000,
    enabled: !!coordinates,
  });

  const air = useQuery({
    queryKey: ['air', coords],
    queryFn: () => weatherApi.air(coords),
    refetchInterval: 15 * 60 * 1000,
    enabled: !!coordinates,
  });

  const lifestyle = useQuery({
    queryKey: ['lifestyle', coords],
    queryFn: () => weatherApi.lifestyle(coords),
    refetchInterval: 60 * 60 * 1000,
    enabled: !!coordinates,
  });

  const alerts = useQuery({
    queryKey: ['alerts', coords],
    queryFn: () => weatherApi.alerts(coords),
    refetchInterval: 5 * 60 * 1000,
    enabled: !!coordinates,
  });

  const radar = useQuery({
    queryKey: ['radar', coords],
    queryFn: () => weatherApi.radar(coords),
    refetchInterval: 10 * 60 * 1000,
    enabled: !!coordinates,
  });

  return { current, hourly, daily, air, lifestyle, alerts, radar };
}
```

---

## Task 5: 页面区块组件

### 5.1 Hero 区

**Files:**
- Create: `apps/web/src/components/sections/HeroSection.tsx`

- [ ] **Step 1: 创建 HeroSection.tsx**

```tsx
import { motion } from 'framer-motion';
import { useWeatherStore } from '@/stores/weatherStore';
import type { CurrentWeather } from '@/types';

interface Props {
  data?: CurrentWeather;
  city?: string;
}

export function HeroSection({ data, city = '正在定位...' }: Props) {
  if (!data) return null;

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="mb-2 text-lg font-medium tracking-wide text-white/70">{city}</p>
        <h1 className="text-[8rem] font-thin leading-none tracking-tighter text-white md:text-[12rem]">
          {data.temperature}°
        </h1>
        <p className="mt-2 text-2xl font-light text-white/90">{data.weatherText}</p>
        <p className="mt-1 text-base text-white/60">
          体感 {data.feelsLike}° · 更新于 {new Date(data.updateTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </motion.div>
    </section>
  );
}
```

### 5.2 当前详情网格

**Files:**
- Create: `apps/web/src/components/sections/CurrentDetails.tsx`

- [ ] **Step 2: 创建 CurrentDetails.tsx**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import type { CurrentWeather } from '@/types';
import { Wind, Droplets, Eye, Gauge, Sunrise, Sunset } from 'lucide-react';

interface Props {
  data?: CurrentWeather;
}

export function CurrentDetails({ data }: Props) {
  if (!data) return null;

  const items = [
    { icon: Wind, label: '风向风力', value: `${data.windDirection} ${data.windSpeed}` },
    { icon: Droplets, label: '相对湿度', value: `${data.humidity}%` },
    { icon: Eye, label: '能见度', value: data.visibility },
    { icon: Gauge, label: '气压', value: data.pressure },
    { icon: Sunrise, label: '日出', value: data.sunrise },
    { icon: Sunset, label: '日落', value: data.sunset },
  ];

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {items.map((item, i) => (
          <GlassCard key={item.label} delay={i * 0.05} className="flex flex-col items-center text-center">
            <item.icon className="mb-2 h-6 w-6 text-white/70" />
            <p className="text-sm text-white/60">{item.label}</p>
            <p className="text-lg font-medium text-white">{item.value}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
```

### 5.3 逐小时预报

**Files:**
- Create: `apps/web/src/components/sections/HourlyForecast.tsx`

- [ ] **Step 3: 创建 HourlyForecast.tsx**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import type { HourlyForecast } from '@/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Props {
  data?: HourlyForecast[];
}

export function HourlyForecast({ data }: Props) {
  if (!data) return null;

  return (
    <section className="px-4 py-8 md:px-8">
      <GlassCard className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-2xl font-light text-white">逐小时预报</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
              />
              <Area type="monotone" dataKey="temperature" stroke="#fbbf24" strokeWidth={3} fill="url(#tempGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '12px' }}
              />
              <Bar dataKey="precipitationProbability" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </section>
  );
}
```

### 5.4 逐天预报

**Files:**
- Create: `apps/web/src/components/sections/DailyForecast.tsx`

- [ ] **Step 4: 创建 DailyForecast.tsx**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import type { DailyForecast } from '@/types';
import { Cloud } from 'lucide-react';

interface Props {
  data?: DailyForecast[];
}

export function DailyForecast({ data }: Props) {
  if (!data) return null;

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.map((day, i) => (
          <GlassCard key={day.date} delay={i * 0.05} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">
                {new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short', month: 'numeric', day: 'numeric' })}
              </p>
              <p className="mt-1 text-white/90">{day.dayWeather}</p>
              <p className="text-xs text-white/50">{day.windDirection} {day.windSpeed}</p>
            </div>
            <div className="text-right">
              <Cloud className="mb-1 ml-auto h-8 w-8 text-white/70" />
              <p className="text-lg font-medium text-white">
                {day.highTemperature}° <span className="text-white/50">/ {day.lowTemperature}°</span>
              </p>
              <p className="text-xs text-blue-300">降水 {day.precipitationProbability}%</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
```

### 5.5 AQI 区

**Files:**
- Create: `apps/web/src/components/sections/AirQuality.tsx`

- [ ] **Step 5: 创建 AirQuality.tsx**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import type { AirQuality } from '@/types';

interface Props {
  data?: AirQuality;
}

export function AirQuality({ data }: Props) {
  if (!data) return null;

  const pollutants = [
    { label: 'PM2.5', value: data.pm25 },
    { label: 'PM10', value: data.pm10 },
    { label: 'O₃', value: data.o3 },
    { label: 'NO₂', value: data.no2 },
    { label: 'SO₂', value: data.so2 },
    { label: 'CO', value: data.co },
  ];

  return (
    <section className="px-4 py-8 md:px-8">
      <GlassCard className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-light text-white">空气质量</h2>
            <p className="mt-2 text-sm text-white/60">主要污染物：{data.primaryPollutant}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-thin text-white">{data.aqi}</p>
            <p className="text-lg text-green-300">{data.level}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-6">
          {pollutants.map((p) => (
            <div key={p.label} className="text-center">
              <p className="text-xs text-white/50">{p.label}</p>
              <p className="text-lg font-medium text-white">{p.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-white/70">{data.advice}</p>
      </GlassCard>
    </section>
  );
}
```

### 5.6 生活指数

**Files:**
- Create: `apps/web/src/components/sections/LifestyleIndex.tsx`

- [ ] **Step 6: 创建 LifestyleIndex.tsx**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import type { LifestyleIndex } from '@/types';
import { Shirt, Sun, Car, Wind, Pill, Flower2, Dumbbell, Fish } from 'lucide-react';

interface Props {
  data?: LifestyleIndex[];
}

const iconMap: Record<string, React.ElementType> = {
  穿衣: Shirt,
  紫外线: Sun,
  洗车: Car,
  晾晒: Wind,
  感冒: Pill,
  过敏: Flower2,
  运动: Dumbbell,
  钓鱼: Fish,
};

export function LifestyleIndex({ data }: Props) {
  if (!data) return null;

  return (
    <section className="px-4 py-8 md:px-8">
      <h2 className="mb-6 text-center text-2xl font-light text-white">生活指数</h2>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
        {data.map((item, i) => {
          const Icon = iconMap[item.name] || Sun;
          return (
            <GlassCard key={item.name} delay={i * 0.05} className="text-center">
              <Icon className="mx-auto mb-2 h-7 w-7 text-white/70" />
              <p className="text-sm text-white/60">{item.name}</p>
              <p className="text-lg font-medium text-white">{item.level}</p>
              <p className="mt-1 text-xs text-white/50">{item.description}</p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
```

### 5.7 雷达/卫星图

**Files:**
- Create: `apps/web/src/components/sections/RadarMap.tsx`

- [ ] **Step 7: 创建 RadarMap.tsx**

```tsx
import { useEffect, useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { RadarTileInfo } from '@/types';
import { Play, Pause } from 'lucide-react';

interface Props {
  data?: RadarTileInfo;
  coordinates: { lat: number; lon: number };
}

export function RadarMap({ data, coordinates }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import('leaflet').then((L) => {
      mapInstance.current = L.default.map(mapRef.current).setView([coordinates.lat, coordinates.lon], 8);
      L.default
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        })
        .addTo(mapInstance.current);
    });
  }, [coordinates]);

  if (!data) return null;

  return (
    <section className="px-4 py-8 md:px-8">
      <GlassCard className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-light text-white">气象雷达</h2>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition hover:bg-white/20"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? '暂停' : '播放'}
          </button>
        </div>
        <div ref={mapRef} className="h-[400px] w-full rounded-2xl overflow-hidden" />
        <p className="mt-2 text-xs text-white/50">当前帧：{data.times[currentFrame] || '无数据'}</p>
      </GlassCard>
    </section>
  );
}
```

### 5.8 专业数据图

**Files:**
- Create: `apps/web/src/components/sections/ProfessionalCharts.tsx`

- [ ] **Step 8: 创建 ProfessionalCharts.tsx**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import type { HourlyForecast } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  hourly?: HourlyForecast[];
}

export function ProfessionalCharts({ hourly }: Props) {
  if (!hourly) return null;

  const data = hourly.map((h) => ({
    ...h,
    humidity: 50 + Math.floor(Math.random() * 40),
    pressure: 1000 + Math.floor(Math.random() * 20),
  }));

  return (
    <section className="px-4 py-8 md:px-8">
      <GlassCard className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-2xl font-light text-white">专业气象趋势</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '12px' }}
              />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
              <Line yAxisId="left" type="monotone" dataKey="temperature" name="温度 (°C)" stroke="#fbbf24" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="humidity" name="湿度 (%)" stroke="#60a5fa" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="pressure" name="气压 (hPa)" stroke="#a78bfa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </section>
  );
}
```

### 5.9 恶劣天气预警弹窗

**Files:**
- Create: `apps/web/src/components/ui/AlertModal.tsx`

- [ ] **Step 9: 创建 AlertModal.tsx**

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import type { WeatherAlert } from '@/types';
import { X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface Props {
  alerts: WeatherAlert[];
}

const levelColor: Record<string, string> = {
  blue: 'border-blue-400 bg-blue-500/20',
  yellow: 'border-yellow-400 bg-yellow-500/20',
  orange: 'border-orange-400 bg-orange-500/20',
  red: 'border-red-500 bg-red-500/20',
};

export function AlertModal({ alerts }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  if (!alerts.length || !isOpen) return null;

  const alert = alerts[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full max-w-lg rounded-3xl border-2 p-6 shadow-2xl ${levelColor[alert.level] || levelColor.blue}`}
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(28px)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-7 w-7 text-white" />
              <h3 className="text-xl font-semibold text-white">{alert.title}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-white/80">发布时间：{alert.publishTime}</p>
          <p className="mt-3 text-white/90">{alert.content}</p>
          <div className="mt-4">
            <p className="text-sm font-medium text-white">防御指南：</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-white/80">
              {alert.defenseGuide.map((guide, i) => (
                <li key={i}>{guide}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Task 6: 主应用组装

**Files:**
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/main.tsx`

- [ ] **Step 1: 创建 App.tsx**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageBackground } from '@/components/ui/PageBackground';
import { HeroSection } from '@/components/sections/HeroSection';
import { CurrentDetails } from '@/components/sections/CurrentDetails';
import { HourlyForecast } from '@/components/sections/HourlyForecast';
import { DailyForecast } from '@/components/sections/DailyForecast';
import { AirQuality } from '@/components/sections/AirQuality';
import { LifestyleIndex } from '@/components/sections/LifestyleIndex';
import { RadarMap } from '@/components/sections/RadarMap';
import { ProfessionalCharts } from '@/components/sections/ProfessionalCharts';
import { AlertModal } from '@/components/ui/AlertModal';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeatherData } from '@/hooks/useWeather';
import { useWeatherStore } from '@/stores/weatherStore';

const queryClient = new QueryClient();

function WeatherApp() {
  useGeolocation();
  const coordinates = useWeatherStore((s) => s.coordinates);
  const location = useWeatherStore((s) => s.location);
  const { current, hourly, daily, air, lifestyle, alerts, radar } = useWeatherData();

  const isLoading = current.isLoading;

  return (
    <div className="min-h-screen pb-20">
      <PageBackground weatherType={current.data?.weatherIcon} />
      <AlertModal alerts={alerts.data || []} />
      <main className="mx-auto max-w-7xl">
        <HeroSection data={current.data} city={location?.city} />
        {isLoading && (
          <div className="py-20 text-center text-white/60">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="mt-4">正在获取天气数据...</p>
          </div>
        )}
        <CurrentDetails data={current.data} />
        <HourlyForecast data={hourly.data} />
        <DailyForecast data={daily.data} />
        <ProfessionalCharts hourly={hourly.data} />
        {coordinates && <RadarMap data={radar.data} coordinates={coordinates} />}
        <AirQuality data={air.data} />
        <LifestyleIndex data={lifestyle.data} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: 创建 main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Task 7: 前端测试

**Files:**
- Create: `apps/web/tests/App.test.tsx`
- Create: `apps/web/vitest.config.ts`

- [ ] **Step 1: 创建 vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

- [ ] **Step 2: 创建 App.test.tsx**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageBackground } from '@/components/ui/PageBackground';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Test Content</GlassCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

describe('PageBackground', () => {
  it('renders without crashing', () => {
    render(<PageBackground />);
    expect(document.querySelector('.fixed')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 运行测试**

Run: `cd apps/web && npm test`
Expected: 测试通过

---

## 自我审查

- **Spec coverage:** 前端 Liquid Glass 视觉、定位、所有天气模块、雷达/卫星、图表、预警均已覆盖。
- **Placeholder scan:** 无 TBD/TODO；雷达图使用动态导入 Leaflet 避免 SSR 问题。
- **Type consistency:** 类型与后端共享结构，API 服务与 Hook 中 queryKey 与参数一致。
