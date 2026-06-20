import axios from 'axios';
import { config } from '../config';

export const qweatherClient = axios.create({
  baseURL: 'https://devapi.qweather.com/v7',
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
});

export interface QWeatherAirQualityNow {
  aqi?: string;
  level?: string;
  category?: string;
  primary?: string;
  pm10?: string;
  pm2p5?: string;
  no2?: string;
  so2?: string;
  co?: string;
  o3?: string;
}

export interface QWeatherAirQualityResponse {
  code: string;
  updateTime?: string;
  now?: QWeatherAirQualityNow;
}

export interface QWeatherIndexItem {
  date?: string;
  type?: string;
  name?: string;
  level?: string;
  category?: string;
  text?: string;
}

export interface QWeatherIndicesResponse {
  code: string;
  updateTime?: string;
  daily?: QWeatherIndexItem[];
}

export interface QWeatherWarningItem {
  id?: string;
  title?: string;
  level?: string;
  type?: string;
  typeName?: string;
  content?: string;
  text?: string;
  pubTime?: string;
  status?: string;
}

export interface QWeatherWarningsResponse {
  code: string;
  updateTime?: string;
  warning?: QWeatherWarningItem[];
}

async function qweatherRequest<T extends { code: string }>(
  path: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  const key = config.qweatherKey;
  if (!key) {
    return null;
  }

  try {
    const { data } = await qweatherClient.get<T>(path, {
      params: { ...params, key },
    });
    if (!data || data.code !== '200') {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function fetchQWeatherAirQuality(
  location: string
): Promise<QWeatherAirQualityResponse | null> {
  return qweatherRequest<QWeatherAirQualityResponse>('/air/now', { location });
}

export async function fetchQWeatherLifestyleIndices(
  location: string,
  types: string | string[]
): Promise<QWeatherIndicesResponse | null> {
  const typeParam = Array.isArray(types) ? types.join(',') : types;
  return qweatherRequest<QWeatherIndicesResponse>('/indices/1d', {
    location,
    type: typeParam,
  });
}

export async function fetchQWeatherWarnings(
  location: string
): Promise<QWeatherWarningsResponse | null> {
  return qweatherRequest<QWeatherWarningsResponse>('/warning/now', { location });
}
