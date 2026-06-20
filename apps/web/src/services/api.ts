/// <reference types="vite/client" />
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
  reverseGeocode: (coords: Coordinates) => get<GeocodeResult>('/geocode/reverse', { ...coords } as Record<string, unknown>),
  current: (coords: Coordinates) => get<CurrentWeather>('/weather/current', { ...coords } as Record<string, unknown>),
  hourly: (coords: Coordinates) => get<HourlyForecast[]>('/weather/hourly', { ...coords } as Record<string, unknown>),
  daily: (coords: Coordinates) => get<DailyForecast[]>('/weather/daily', { ...coords } as Record<string, unknown>),
  air: (coords: Coordinates) => get<AirQuality>('/weather/air', { ...coords } as Record<string, unknown>),
  lifestyle: (coords: Coordinates) => get<LifestyleIndex[]>('/weather/lifestyle', { ...coords } as Record<string, unknown>),
  alerts: (coords: Coordinates) => get<WeatherAlert[]>('/weather/alerts', { ...coords } as Record<string, unknown>),
  radar: (coords: Coordinates, type: 'radar' | 'satellite' = 'radar') =>
    get<RadarTileInfo>('/radar/tiles', { ...coords, type }),
};
