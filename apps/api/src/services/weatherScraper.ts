import axios from 'axios';
import { config } from '../config';
import type {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  AirQuality,
  LifestyleIndex,
  WeatherAlert,
  RadarTileInfo,
} from '../types';

export const weatherClient = axios.create({
  baseURL: config.weatherBaseUrl,
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': config.weatherBaseUrl,
  },
});

export async function fetchCurrentWeather(_cityCode: string): Promise<CurrentWeather> {
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
    source: '中国天气网（演示数据）',
  };
}

export async function fetchHourlyForecast(_cityCode: string): Promise<HourlyForecast[]> {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    temperature: 20 + Math.floor(Math.random() * 8),
    precipitationProbability: Math.floor(Math.random() * 100),
    windDirection: '东南风',
    windSpeed: '2级',
    weatherText: '多云',
  }));
}

export async function fetchDailyForecast(_cityCode: string): Promise<DailyForecast[]> {
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

export async function fetchAirQuality(_cityCode: string): Promise<AirQuality> {
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

export async function fetchLifestyleIndexes(_cityCode: string): Promise<LifestyleIndex[]> {
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

export async function fetchWeatherAlerts(_cityCode: string): Promise<WeatherAlert[]> {
  return [];
}

export async function fetchRadarTiles(_cityCode: string): Promise<RadarTileInfo> {
  return {
    type: 'radar',
    times: ['2024-01-01T08:00:00Z', '2024-01-01T08:10:00Z'],
    baseUrl: `${config.weatherBaseUrl}/radar/`,
  };
}
