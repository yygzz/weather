import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config';
import {
  fetchQWeatherAirQuality,
  fetchQWeatherLifestyleIndices,
  fetchQWeatherWarnings,
  type QWeatherIndexItem,
  type QWeatherWarningItem,
} from './qweatherService';
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

function beijingNow(): Date {
  const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
  return new Date(str);
}

export const fallbackCurrent: CurrentWeather = {
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
    return fallbackCurrent;
  }
}

export function parseHourlyForecast(html: string): HourlyForecast[] | null {
  const match = html.match(/var hour3data\s*=\s*(\{[\s\S]*?\})\s*;?/);
  if (!match) return null;
  const hour3 = JSON.parse(match[1]);
  const raw: string[] = hour3?.['1d'];
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const result: HourlyForecast[] = [];
  raw.forEach((item, idx) => {
    const parts = item.split(',');
    if (parts.length < 6) return;
    const timeLabel = parts[0];
    const weatherText = parts[2] || '多云';
    const temp = parseInt(parts[3].replace(/[^\d-]/g, ''), 10);
    const windDirection = parts[4] || '北风';
    const windSpeed = parts[5] || '<3级';
    const pop = parseInt(parts[6], 10) || 0;

    const labelMatch = timeLabel.match(/(\d+)日(\d+)时/);
    if (!labelMatch || isNaN(temp)) return;
    const startHour = parseInt(labelMatch[2], 10);

    let nextTemp = temp;
    const nextItem = raw[idx + 1];
    if (nextItem) {
      const np = nextItem.split(',');
      nextTemp = parseInt(np[3]?.replace(/[^\d-]/g, ''), 10) || temp;
    }

    for (let offset = 0; offset < 3; offset++) {
      const h = (startHour + offset) % 24;
      const t = Math.round(temp + (nextTemp - temp) * (offset / 3));
      result.push({
        time: `${String(h).padStart(2, '0')}:00`,
        temperature: isNaN(t) ? temp : t,
        precipitationProbability: pop,
        windDirection,
        windSpeed,
        weatherText,
      });
    }
  });

  return result.length > 0 ? result.slice(0, 24) : null;
}

function buildHourlyFallback(baseTemp: number): HourlyForecast[] {
  const now = beijingNow();
  const currentHour = now.getHours();
  return Array.from({ length: 24 }, (_, i) => {
    const h = (currentHour + i) % 24;
    const variation = i <= 12 ? Math.floor(i / 3) : -Math.floor((24 - i) / 3);
    return {
      time: `${String(h).padStart(2, '0')}:00`,
      temperature: Math.round(baseTemp + variation),
      precipitationProbability: 0,
      windDirection: '东南风',
      windSpeed: '2级',
      weatherText: '多云',
    };
  });
}

export async function fetchHourlyForecast(cityCode: string): Promise<HourlyForecast[]> {
  let baseTemp = fallbackCurrent.temperature;
  try {
    baseTemp = (await fetchCurrentWeather(cityCode)).temperature;
  } catch {
    // keep fallback temperature
  }

  try {
    const { data: html } = await weatherClient.get<string>(`/weather1d/${cityCode}.shtml`);
    const parsed = parseHourlyForecast(html);
    if (parsed && parsed.length > 0) return parsed;
    throw new Error('hourly parse empty');
  } catch (err) {
    return buildHourlyFallback(baseTemp).map((item) => ({ ...item, source: 'fallback' }));
  }
}

export function parseDailyForecast(html: string): DailyForecast[] | null {
  const $ = cheerio.load(html);
  const items = $('#7d ul.t li');
  if (items.length === 0) return null;

  const today = beijingNow();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const forecasts: DailyForecast[] = [];
  items.each((_, el) => {
    const $li = $(el);
    const h1 = $li.find('h1').text().trim();
    const dayMatch = h1.match(/(\d+)日/);
    if (!dayMatch) return;

    const labelDay = parseInt(dayMatch[1], 10);
    let offset = labelDay - currentDay;
    if (offset < 0) offset += daysInMonth;

    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateStr = date.toISOString().split('T')[0];

    const weaTitle = $li.find('p.wea').attr('title')?.trim() || $li.find('p.wea').text().trim() || '多云';
    const [dayWeather, nightWeather] = weaTitle.includes('转')
      ? weaTitle.split('转')
      : [weaTitle, weaTitle];

    const highText = $li.find('p.tem span').text().trim();
    const lowText = $li.find('p.tem i').text().trim();
    const high = highText ? parseInt(highText.replace(/[^\d-]/g, ''), 10) : NaN;
    const low = lowText ? parseInt(lowText.replace(/[^\d-]/g, ''), 10) : NaN;

    const windDir =
      $li.find('p.win em span:first').attr('title')?.trim() ||
      $li.find('p.win em span:first').text().trim() ||
      '东南风';
    const windSpeed = $li.find('p.win i').text().trim() || '2级';

    const rainy = /雨|雪/.test(weaTitle);
    const pop = rainy ? 80 : 20;

    forecasts.push({
      date: dateStr,
      dayWeather: dayWeather.trim() || '多云',
      nightWeather: nightWeather.trim() || '多云',
      highTemperature: isNaN(high) ? (isNaN(low) ? 25 : low) : high,
      lowTemperature: isNaN(low) ? (isNaN(high) ? 18 : high) : low,
      windDirection: windDir,
      windSpeed,
      precipitationProbability: pop,
    });
  });

  return forecasts.length > 0 ? forecasts : null;
}

function buildDailyFallback(): DailyForecast[] {
  const today = beijingNow();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
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

export async function fetchDailyForecast(cityCode: string): Promise<DailyForecast[]> {
  try {
    const { data: html } = await weatherClient.get<string>(`/weather/${cityCode}.shtml`);
    const parsed = parseDailyForecast(html);
    if (parsed && parsed.length > 0) return parsed;
    throw new Error('daily parse empty');
  } catch (err) {
    return buildDailyFallback().map((item) => ({ ...item, source: 'fallback' }));
  }
}

function computeIAQI(value: number, breakpoints: number[]): number {
  const levels = [0, 50, 100, 150, 200, 300, 500];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const low = breakpoints[i];
    const high = breakpoints[i + 1];
    if (value >= low && value < high) {
      return Math.round(
        ((levels[i + 1] - levels[i]) / (high - low)) * (value - low) + levels[i]
      );
    }
  }
  if (value >= breakpoints[breakpoints.length - 1]) {
    const last = breakpoints.length - 1;
    const ratio = value / breakpoints[last];
    return Math.min(500, Math.round(500 * ratio));
  }
  return 0;
}

function computePrimaryPollutant(pollutants: {
  pm25: number;
  pm10: number;
  so2: number;
  no2: number;
  o3: number;
  co: number;
}): string {
  const iaqis: Record<string, number> = {
    'PM2.5': computeIAQI(pollutants.pm25, [0, 35, 75, 115, 150, 250, 500]),
    PM10: computeIAQI(pollutants.pm10, [0, 50, 150, 250, 350, 420, 600]),
    SO2: computeIAQI(pollutants.so2, [0, 150, 500, 650, 800, 1600, 2100]),
    NO2: computeIAQI(pollutants.no2, [0, 100, 200, 700, 1200, 2340, 3090]),
    O3: computeIAQI(pollutants.o3, [0, 160, 200, 300, 400, 800, 1000]),
    CO: computeIAQI(pollutants.co, [0, 5, 10, 35, 60, 90, 150]),
  };
  let primary = '无';
  let max = -1;
  for (const [name, value] of Object.entries(iaqis)) {
    if (value > max) {
      max = value;
      primary = name;
    }
  }
  return max <= 0 ? '无' : primary;
}

function aqiLevelText(aqi: number): string {
  if (aqi <= 50) return '优';
  if (aqi <= 100) return '良';
  if (aqi <= 150) return '轻度污染';
  if (aqi <= 200) return '中度污染';
  if (aqi <= 300) return '重度污染';
  return '严重污染';
}

function aqiAdvice(level: string): string {
  const map: Record<string, string> = {
    优: '空气质量令人满意，基本无空气污染，各类人群可正常活动。',
    良: '空气质量可接受，但某些污染物可能对极少数异常敏感人群健康有较弱影响。',
    轻度污染: '易感人群症状有轻度加剧，健康人群出现刺激症状。',
    中度污染: '进一步加剧易感人群症状，可能对健康人群心脏、呼吸系统有影响。',
    重度污染: '心脏病和肺病患者症状显著加剧，运动耐受力降低，健康人群普遍出现症状。',
    严重污染: '健康人群运动耐受力降低，有明显强烈症状，提前出现某些疾病。',
  };
  return map[level] || map['良'];
}

export function parseAirQuality(html: string): AirQuality | null {
  const match = html.match(/setAirData\((\{[\s\S]*?\})\);?/);
  if (!match) return null;
  const payload = JSON.parse(match[1]);
  const arr = payload?.data;
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const latest = arr[arr.length - 1];
  const aqi = parseInt(latest.t1, 10);
  const levelCode = String(latest.t2);
  const pm25 = parseFloat(latest.t3);
  const pm10 = parseFloat(latest.t4);
  const co = parseFloat(latest.t5);
  const no2 = parseFloat(latest.t6);
  const o3 = parseFloat(latest.t7);
  const so2 = parseFloat(latest.t9);

  if ([aqi, pm25, pm10, co, no2, o3, so2].some((v) => isNaN(v))) return null;

  const levelMap: Record<string, string> = {
    '1': '优',
    '2': '良',
    '3': '轻度污染',
    '4': '中度污染',
    '5': '重度污染',
    '6': '严重污染',
  };
  const level = levelMap[levelCode] || aqiLevelText(aqi);

  return {
    aqi,
    level,
    primaryPollutant: computePrimaryPollutant({ pm25, pm10, so2, no2, o3, co }),
    pm25,
    pm10,
    o3,
    no2,
    so2,
    co,
    advice: aqiAdvice(level),
  };
}

export const fallbackAir: AirQuality = {
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

export async function fetchAirQuality(cityCode: string): Promise<AirQuality> {
  const data = await fetchQWeatherAirQuality(cityCode);
  const now = data?.now;
  if (now) {
    const aqi = parseInt(now.aqi || '0', 10);
    const level = now.category || aqiLevelText(aqi);
    const primary =
      now.primary === 'NA' || !now.primary ? '无' : now.primary;
    return {
      aqi: isNaN(aqi) ? fallbackAir.aqi : aqi,
      level,
      primaryPollutant: primary,
      pm25: parseFloat(now.pm2p5 || '0') || fallbackAir.pm25,
      pm10: parseFloat(now.pm10 || '0') || fallbackAir.pm10,
      o3: parseFloat(now.o3 || '0') || fallbackAir.o3,
      no2: parseFloat(now.no2 || '0') || fallbackAir.no2,
      so2: parseFloat(now.so2 || '0') || fallbackAir.so2,
      co: parseFloat(now.co || '0') || fallbackAir.co,
      advice: aqiAdvice(level),
      source: 'QWeather',
    };
  }
  return { ...fallbackAir, source: 'fallback' };
}

export function parseLifestyleIndices(html: string): LifestyleIndex[] | null {
  const match = html.match(/var dataZS\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return null;
  const payload = JSON.parse(match[1]);
  const zs = payload?.zs;
  if (!zs || typeof zs !== 'object') return null;

  const keyMap: Record<string, string> = {
    uv_name: '紫外线',
    xc_name: '洗车',
    yd_name: '运动',
    gm_name: '感冒',
    ag_name: '过敏',
    pp_name: '化妆',
    dy_name: '钓鱼',
  };

  const result: LifestyleIndex[] = [];
  for (const [key, label] of Object.entries(keyMap)) {
    const name = zs[key];
    const hintKey = key.replace('_name', '_hint');
    const descKey = key.replace('_name', '_des_s');
    if (name && zs[hintKey]) {
      result.push({
        name: label,
        level: String(zs[hintKey]).trim(),
        description: String(zs[descKey] || '').trim(),
      });
    }
  }

  return result.length > 0 ? result : null;
}

const QWEATHER_LIFESTYLE_TYPE_MAP: Record<string, string> = {
  运动: '1',
  洗车: '2',
  穿衣: '3',
  钓鱼: '4',
  紫外线: '5',
  旅游: '6',
  过敏: '7',
  化妆: '13',
  感冒: '9',
  晾晒: '14',
};

function mapQWeatherIndexName(typeCode?: string): string {
  for (const [name, code] of Object.entries(QWEATHER_LIFESTYLE_TYPE_MAP)) {
    if (code === typeCode) return name;
  }
  return '';
}

function mapQWeatherIndexToLifestyle(item: QWeatherIndexItem): LifestyleIndex | null {
  const name = item.name || mapQWeatherIndexName(item.type);
  if (!name) return null;
  return {
    name,
    level: item.category || String(item.level || '').trim(),
    description: item.text || '',
    source: 'QWeather',
  };
}

function generateLifestyleFallback(current: CurrentWeather): LifestyleIndex[] {
  const { temperature, weatherText, weatherIcon, humidity, windSpeed } = current;
  const rainy =
    /雨|雪|阴/.test(weatherText) ||
    weatherIcon === 'rainy' ||
    weatherIcon === 'snowy' ||
    weatherIcon === 'cloudy';
  const sunny = weatherIcon === 'sunny' || /晴/.test(weatherText);
  const windy = parseInt(windSpeed, 10) >= 5;

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
      current = fallbackCurrent;
    }
  }

  const fallback = generateLifestyleFallback(current);

  try {
    const requiredNames = ['紫外线', '洗车', '运动', '感冒', '过敏', '化妆', '钓鱼'];
    const types = requiredNames
      .map((name) => QWEATHER_LIFESTYLE_TYPE_MAP[name])
      .filter(Boolean);
    const data = await fetchQWeatherLifestyleIndices(cityCode, types);
    const daily = data?.daily || [];
    if (daily.length === 0) {
      throw new Error('lifestyle qweather empty');
    }

    const parsed: LifestyleIndex[] = [];
    for (const item of daily) {
      const mapped = mapQWeatherIndexToLifestyle(item);
      if (mapped) parsed.push(mapped);
    }

    const missing = requiredNames.filter((name) => !parsed.some((p) => p.name === name));
    if (missing.length === 0) return parsed;
    const fallbackItems = fallback
      .filter((item) => missing.includes(item.name))
      .map((item) => ({ ...item, source: 'fallback' as const }));
    return [...parsed, ...fallbackItems];
  } catch {
    return fallback.map((item) => ({ ...item, source: 'fallback' as const }));
  }
}

/**
 * @deprecated 请使用 fetchLifestyleIndices，保留此别名以保持向后兼容。
 */
export async function fetchLifestyleIndexes(cityCode: string): Promise<LifestyleIndex[]> {
  return fetchLifestyleIndices(cityCode);
}

export function parseWeatherAlerts(html: string): WeatherAlert[] | null {
  const match = html.match(/var alarmDZ\s*=\s*(\{[\s\S]*?\});/);
  if (!match) return null;
  const payload = JSON.parse(match[1]);
  const arr = payload?.w;
  if (!Array.isArray(arr) || arr.length === 0) return null;

  return arr.map((item: Record<string, unknown>) => {
    const title = String(item.alarm_title || item.title || item.name || item.headline || '');
    const levelRaw = String(item.alarm_level || item.level || item.color || '蓝色');
    const type = String(item.alarm_type || item.type || item.signalType || item.phenomena || '');
    const content = String(
      item.alarm_content || item.content || item.text || item.description || ''
    );
    const publishTime = String(
      item.alarm_time || item.publishTime || item.issueTime || item.time || item.datetime || new Date().toISOString()
    );

    const cleaned = levelRaw.replace(/色$/, '');
    const levelMap: Record<string, WeatherAlert['level']> = {
      蓝: 'blue',
      黄: 'yellow',
      橙: 'orange',
      红: 'red',
      blue: 'blue',
      yellow: 'yellow',
      orange: 'orange',
      red: 'red',
    };
    let level: WeatherAlert['level'] = levelMap[cleaned] || levelMap[String(item.levelCode)] || 'blue';
    if (levelRaw === '01' || levelRaw === '1') level = 'blue';
    if (levelRaw === '02' || levelRaw === '2') level = 'yellow';
    if (levelRaw === '03' || levelRaw === '3') level = 'orange';
    if (levelRaw === '04' || levelRaw === '4') level = 'red';

    return {
      title,
      level,
      type,
      content,
      publishTime,
      defenseGuide: [],
    };
  });
}

function mapQWeatherWarningLevel(levelRaw?: string): WeatherAlert['level'] {
  if (!levelRaw) return 'blue';
  const cleaned = String(levelRaw).replace(/色$/, '').toLowerCase();
  const map: Record<string, WeatherAlert['level']> = {
    blue: 'blue',
    yellow: 'yellow',
    orange: 'orange',
    red: 'red',
    蓝: 'blue',
    黄: 'yellow',
    橙: 'orange',
    红: 'red',
  };
  let level = map[cleaned];
  if (!level) {
    const numeric = parseInt(cleaned, 10);
    if (numeric === 1) level = 'blue';
    if (numeric === 2) level = 'yellow';
    if (numeric === 3) level = 'orange';
    if (numeric === 4) level = 'red';
  }
  return level || 'blue';
}

function mapQWeatherWarning(item: QWeatherWarningItem): WeatherAlert {
  return {
    title: item.title || `${item.typeName || item.type || ''}预警`,
    level: mapQWeatherWarningLevel(item.level),
    type: item.typeName || item.type || '',
    content: item.text || item.content || '',
    publishTime: item.pubTime || new Date().toISOString(),
    defenseGuide: [],
    source: 'QWeather',
  };
}

export async function fetchWeatherAlerts(cityCode: string): Promise<WeatherAlert[]> {
  const data = await fetchQWeatherWarnings(cityCode);
  const warnings = data?.warning || [];
  if (warnings.length === 0) return [];
  return warnings.map(mapQWeatherWarning);
}

export function parseRadarTiles(html: string): RadarTileInfo | null {
  const linkMatch = html.match(
    /href="(http:\/\/products\.weather\.com\.cn\/product\/radar1\/index\/procode\/[^"]+)"/i
  );
  if (linkMatch) {
    return {
      type: 'radar',
      times: [new Date().toISOString()],
      baseUrl: linkMatch[1],
    };
  }

  const idMatch = html.match(/<input[^>]+id="radarid"[^>]+value="([A-Z0-9]+)"/i);
  if (idMatch) {
    return {
      type: 'radar',
      times: [new Date().toISOString()],
      baseUrl: `http://products.weather.com.cn/product/radar1/index/procode/JC_RADAR_${idMatch[1]}_JB_V3.shtml`,
    };
  }

  return null;
}

export async function fetchRadarTiles(cityCode: string): Promise<RadarTileInfo> {
  try {
    const { data: html } = await weatherClient.get<string>(`/weather1d/${cityCode}.shtml`);
    const parsed = parseRadarTiles(html);
    if (parsed) return parsed;
    throw new Error('radar parse empty');
  } catch (err) {
    return {
      type: 'radar',
      times: [new Date().toISOString()],
      baseUrl: `${config.weatherBaseUrl}/radar/`,
      source: 'fallback',
    };
  }
}
