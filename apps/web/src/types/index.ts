export interface Coordinates {
  lat: number;
  lon: number;
}

export interface GeocodeResult {
  city: string;
  cityCode: string;
  province: string;
}

export type ReverseGeocodeResult = GeocodeResult;

export interface CitySearchResult {
  city: string;
  cityCode: string;
  province: string;
  lat: number;
  lon: number;
}

export interface SavedCity {
  city: string;
  cityCode: string;
  province: string;
  lat: number;
  lon: number;
}

export interface WeatherAlertRule {
  id: string;
  cityCode: string;
  metric: 'temperature' | 'rainProbability' | 'windLevel';
  operator: '>' | '<' | '>=' | '<=' | '==';
  threshold: number;
  enabled: boolean;
  lastTriggeredAt?: number;
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
  source: string;
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
  icon?: string;
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
