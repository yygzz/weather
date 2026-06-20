/// <reference types="vite/client" />
import axios from 'axios';
import type {
  ApiResponse,
  AirQuality,
  CitySearchResult,
  Coordinates,
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  LifestyleIndex,
  RadarTileInfo,
  ReverseGeocodeResult,
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

export const getLifestyleIndices = (cityCode: string) =>
  get<LifestyleIndex[]>(`/weather/lifestyle/${encodeURIComponent(cityCode)}`);

export const weatherApi = {
  searchCity: (q: string) => get<CitySearchResult[]>('/geocode/search', { q } as Record<string, unknown>),
  reverseGeocode: (lat: number, lon: number) =>
    get<ReverseGeocodeResult>('/geocode/reverse', { lat, lon } as Record<string, unknown>),
  current: (coords: Coordinates) => get<CurrentWeather>('/weather/current', { ...coords } as Record<string, unknown>),
  hourly: (coords: Coordinates) => get<HourlyForecast[]>('/weather/hourly', { ...coords } as Record<string, unknown>),
  daily: (coords: Coordinates) => get<DailyForecast[]>('/weather/daily', { ...coords } as Record<string, unknown>),
  air: (coords: Coordinates) => get<AirQuality>('/weather/air', { ...coords } as Record<string, unknown>),
  lifestyle: getLifestyleIndices,
  alerts: (coords: Coordinates) => get<WeatherAlert[]>('/weather/alerts', { ...coords } as Record<string, unknown>),
  radar: (coords: Coordinates, type: 'radar' | 'satellite' = 'radar') =>
    get<RadarTileInfo>('/radar/tiles', { ...coords, type }),
};
