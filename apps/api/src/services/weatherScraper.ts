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

function mapWeatherIcon(code?: string): string {
  if (!code) return 'cloudy';
  const c = code.toLowerCase();
  if (c.includes('00')) return 'sunny';
  if (c.includes('01') || c.includes('02')) return 'cloudy';
  if (c.includes('雨') || ['07', '08', '09', '10', '11', '12', '13', '19', '21', '22'].some((x) => c.includes(x))) return 'rainy';
  if (c.includes('雪') || ['14', '15', '16', '17', '18', '20'].some((x) => c.includes(x))) return 'snowy';
  if (c.startsWith('n')) return 'night';
  return 'cloudy';
}

function parseUpdateTime(raw: string): string {
  if (!raw || raw.length < 12) return new Date().toISOString();
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const hh = raw.slice(8, 10);
  const mm = raw.slice(10, 12);
  return new Date(`${y}-${m}-${d}T${hh}:${mm}:00+08:00`).toISOString();
}

export async function fetchCurrentWeather(cityCode: string): Promise<CurrentWeather> {
  try {
    const url = `https://weather.com.cn/weather1d/${cityCode}.shtml`;
    const { data: html } = await weatherClient.get<string>(url);

    const observeMatch = html.match(/var observe24h_data\s*=\s*(\{[\s\S]*?\}\});/);
    const hourMatch = html.match(/var hour3data\s*=\s*(\{[\s\S]*?\})\s*;?/);
    const sunMatch = html.match(/<span>日出\s*(\d{2}:\d{2})<\/span>[\s\S]*?<span>日落\s*(\d{2}:\d{2})<\/span>/);

    let latest: Record<string, string> | null = null;
    let updateTime = new Date().toISOString();
    if (observeMatch) {
      const observe = JSON.parse(observeMatch[1]);
      const arr = observe?.od?.od2;
      if (Array.isArray(arr) && arr.length > 0) {
        latest = arr[0];
        updateTime = parseUpdateTime(observe.od.od0);
      }
    }

    const hour3 = hourMatch ? JSON.parse(hourMatch[1]) : null;
    const currentHourText: string = hour3?.['1d']?.[0] ?? '';
    const parts = currentHourText.split(',');
    const weatherText = parts[2] || '多云';
    const weatherIcon = mapWeatherIcon(parts[1]);

    const temperature = latest ? parseFloat(latest.od22) : 22;
    const humidity = latest ? parseInt(latest.od27, 10) : 50;

    return {
      temperature: isNaN(temperature) ? 22 : temperature,
      feelsLike: isNaN(temperature) ? 25 : temperature,
      weatherText,
      weatherIcon,
      windDirection: latest?.od24 || '北风',
      windSpeed: latest?.od25 ? `${latest.od25}级` : '2级',
      humidity: isNaN(humidity) ? 50 : humidity,
      visibility: '10km',
      pressure: '1013hPa',
      sunrise: sunMatch ? sunMatch[1] : '06:00',
      sunset: sunMatch ? sunMatch[2] : '18:00',
      updateTime,
      source: '中国天气网',
    };
  } catch (err) {
    // 爬取失败时使用占位数据，避免页面空白
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
      source: '中国天气网（模拟 fallback）',
    };
  }
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

export async function fetchLifestyleIndices(
  cityCode: string,
  injectedCurrent?: CurrentWeather
): Promise<LifestyleIndex[]> {
  let current: CurrentWeather;
  if (injectedCurrent) {
    current = injectedCurrent;
  } else {
    try {
      current = await fetchCurrentWeather(cityCode);
    } catch {
      current = {
        temperature: 22,
        feelsLike: 25,
        weatherText: '多云',
        weatherIcon: 'cloudy',
        windDirection: '东南风',
        windSpeed: '2级',
        humidity: 65,
        visibility: '10km',
        pressure: '1013hPa',
        sunrise: '05:30',
        sunset: '19:15',
        updateTime: new Date().toISOString(),
        source: '中国天气网（模拟 fallback）',
      };
    }
  }

  const { temperature, weatherText, weatherIcon, humidity, windSpeed } = current;
  const rainy = /雨|雪|阴/.test(weatherText) || weatherIcon === 'rainy' || weatherIcon === 'snowy' || weatherIcon === 'cloudy';
  const sunny = weatherIcon === 'sunny' || /晴/.test(weatherText);
  const windy = parseInt(windSpeed, 10) >= 5;

  // 基于当前天气生成合理的指数，后续可替换为真实数据源解析
  return [
    {
      name: '穿衣',
      level: temperature <= 5 ? '寒冷' : temperature <= 15 ? '较冷' : temperature <= 24 ? '舒适' : temperature <= 30 ? '较热' : '炎热',
      description:
        temperature <= 5
          ? '建议穿棉衣、羽绒服等冬季服装。'
          : temperature <= 15
            ? '建议穿风衣、夹克、薄毛衣等保暖服装。'
            : temperature <= 24
              ? '建议穿长袖衬衫、单裤等舒适服装。'
              : temperature <= 30
                ? '建议穿短袖、短裤等清凉服装。'
                : '建议穿透气、散热的夏季服装，注意防暑。',
    },
    {
      name: '紫外线',
      level: sunny && !rainy ? (temperature >= 30 ? '强' : '中等') : '弱',
      description: sunny && !rainy ? '外出时涂抹防晒霜，戴遮阳帽或太阳镜。' : '紫外线较弱，一般不需要特别防护。',
    },
    {
      name: '洗车',
      level: rainy ? '不宜' : '适宜',
      description: rainy ? '未来可能有降水，不宜洗车。' : '天气较好，适合擦洗汽车。',
    },
    {
      name: '晾晒',
      level: rainy || humidity >= 85 ? '不宜' : '适宜',
      description: rainy || humidity >= 85 ? '天气潮湿或有降水，不适宜晾晒。' : '天气不错，抓紧时机让衣物晒晒太阳。',
    },
    {
      name: '感冒',
      level: temperature <= 10 || temperature >= 32 || humidity >= 85 ? '易发' : '少发',
      description:
        temperature <= 10 || temperature >= 32 || humidity >= 85
          ? '天气条件容易诱发感冒，请注意增减衣物。'
          : '各项气象条件适宜，发生感冒机率较低。',
    },
    {
      name: '过敏',
      level: windy || humidity <= 35 ? '较易发' : '不易发',
      description: windy || humidity <= 35 ? '空气干燥或风大，注意防护，避免接触过敏原。' : '气象条件不易诱发过敏。',
    },
    {
      name: '运动',
      level: rainy || windy || temperature >= 35 || temperature <= -5 ? '较不宜' : '适宜',
      description:
        rainy || windy || temperature >= 35 || temperature <= -5
          ? '天气条件较差，建议选择室内运动。'
          : '天气较好，推荐进行户外运动。',
    },
    {
      name: '化妆',
      level: rainy || humidity >= 80 ? '去油' : '保湿',
      description:
        rainy || humidity >= 80
          ? '空气湿度大，建议使用控油化妆品。'
          : '天气较干燥，建议使用保湿型化妆品，涂抹润唇膏。',
    },
    {
      name: '钓鱼',
      level: rainy || windy || temperature <= 5 || temperature >= 35 ? '较不宜' : '适宜',
      description:
        rainy || windy || temperature <= 5 || temperature >= 35
          ? '天气条件不利于垂钓，建议改日。'
          : '水温适宜，鱼儿活跃，适合垂钓。',
    },
  ];
}

/**
 * @deprecated 请使用 fetchLifestyleIndices，保留此别名以保持向后兼容。
 */
export async function fetchLifestyleIndexes(cityCode: string): Promise<LifestyleIndex[]> {
  return fetchLifestyleIndices(cityCode);
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
