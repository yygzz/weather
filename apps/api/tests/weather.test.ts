import request from 'supertest';
import { createApp } from '../src/app';
import { cache } from '../src/services/cache';
import * as weatherScraper from '../src/services/weatherScraper';
import * as qweatherService from '../src/services/qweatherService';
import type { CurrentWeather } from '../src/types';

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

  it('GET /api/weather/daily should return daily forecast', async () => {
    const res = await request(app).get('/api/weather/daily?lat=39.9&lon=116.4');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 400 when lat/lon missing', async () => {
    const res = await request(app).get('/api/weather/current');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/weather/current/:cityCode should return current weather and use cache', async () => {
    const mockWeather: CurrentWeather = {
      temperature: 25,
      feelsLike: 27,
      weatherText: '晴',
      weatherIcon: 'sunny',
      windDirection: '南风',
      windSpeed: '2级',
      humidity: 45,
      visibility: '10km',
      pressure: '1010hPa',
      sunrise: '05:30',
      sunset: '19:15',
      updateTime: new Date().toISOString(),
      source: '中国天气网',
    };
    const spy = jest.spyOn(weatherScraper, 'fetchCurrentWeather').mockResolvedValue(mockWeather);

    const res = await request(app).get('/api/weather/current/101010100');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockWeather);
    expect(spy).toHaveBeenCalledWith('101010100');

    const res2 = await request(app).get('/api/weather/current/101010100');
    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
    expect(res2.body.cachedAt).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });
});

describe('parseHourlyForecast', () => {
  it('parses 3-hour interval data into 24 hourly forecasts', () => {
    const html = `
      <script>
      var hour3data = {
        "1d": [
          "20日14时,01,多云,26℃,东南风,<3级,10",
          "20日17时,01,多云,25℃,东南风,<3级,10",
          "20日20时,02,阴,23℃,东风,<3级,20",
          "20日23时,02,阴,21℃,东风,<3级,20",
          "21日02时,00,晴,19℃,北风,<3级,0",
          "21日05时,00,晴,18℃,北风,<3级,0",
          "21日08时,00,晴,22℃,北风,<3级,0",
          "21日11时,01,多云,27℃,东南风,<3级,10"
        ]
      };
      </script>
    `;
    const result = weatherScraper.parseHourlyForecast(html);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(24);
    expect(result![0].time).toBe('14:00');
    expect(result![0].temperature).toBe(26);
    expect(result![0].weatherText).toBe('多云');
    expect(result![0].windDirection).toBe('东南风');
    expect(result![0].windSpeed).toBe('<3级');
    expect(result![0].precipitationProbability).toBe(10);
  });

  it('returns null when hour3data is missing', () => {
    const result = weatherScraper.parseHourlyForecast('<html>empty</html>');
    expect(result).toBeNull();
  });

  it('returns null when hour3data has empty array', () => {
    const html = '<script>var hour3data = {"1d": []};</script>';
    const result = weatherScraper.parseHourlyForecast(html);
    expect(result).toBeNull();
  });
});

describe('parseDailyForecast', () => {
  it('parses 7-day forecast HTML', () => {
    const html = `
      <div id="7d">
        <ul class="t">
          <li>
            <h1>20日（今天）</h1>
            <p class="wea" title="多云转晴">多云转晴</p>
            <p class="tem"><span>28</span><i>18℃</i></p>
            <p class="win"><em><span title="东南风"></span></em><i>3级</i></p>
          </li>
          <li>
            <h1>21日（明天）</h1>
            <p class="wea" title="晴">晴</p>
            <p class="tem"><span>30</span><i>20℃</i></p>
            <p class="win"><em><span title="南风"></span></em><i>2级</i></p>
          </li>
        </ul>
      </div>
    `;
    const result = weatherScraper.parseDailyForecast(html);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(2);
    expect(result![0].dayWeather).toBe('多云');
    expect(result![0].nightWeather).toBe('晴');
    expect(result![0].highTemperature).toBe(28);
    expect(result![0].lowTemperature).toBe(18);
    expect(result![0].windDirection).toBe('东南风');
    expect(result![0].windSpeed).toBe('3级');
    expect(result![1].dayWeather).toBe('晴');
  });

  it('returns null when forecast list is missing', () => {
    const result = weatherScraper.parseDailyForecast('<html>empty</html>');
    expect(result).toBeNull();
  });
});

describe('parseAirQuality', () => {
  it('parses setAirData payload', () => {
    const html = `
      <script>
      setAirData({"data":[{"t1":"85","t2":"2","t3":"58","t4":"72","t5":"0.8","t6":"32","t7":"95","t9":"12"}]});
      </script>
    `;
    const result = weatherScraper.parseAirQuality(html);
    expect(result).not.toBeNull();
    expect(result!.aqi).toBe(85);
    expect(result!.level).toBe('良');
    expect(result!.pm25).toBe(58);
    expect(result!.pm10).toBe(72);
    expect(result!.co).toBe(0.8);
    expect(result!.no2).toBe(32);
    expect(result!.o3).toBe(95);
    expect(result!.so2).toBe(12);
    expect(result!.primaryPollutant).toBe('PM2.5');
    expect(result!.advice).toBeDefined();
  });

  it('returns null when setAirData is missing', () => {
    const result = weatherScraper.parseAirQuality('<html>empty</html>');
    expect(result).toBeNull();
  });

  it('returns null when data array is empty', () => {
    const html = '<script>setAirData({"data":[]});</script>';
    const result = weatherScraper.parseAirQuality(html);
    expect(result).toBeNull();
  });
});

describe('parseWeatherAlerts', () => {
  it('parses alarmDZ payload', () => {
    const html = `
      <script>
      var alarmDZ = {"w":[{"alarm_title":"暴雨蓝色预警","alarm_level":"蓝色","alarm_type":"暴雨","alarm_content":"预计未来有暴雨","alarm_time":"2026-06-20T10:00:00"}]};
      </script>
    `;
    const result = weatherScraper.parseWeatherAlerts(html);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0].title).toBe('暴雨蓝色预警');
    expect(result![0].level).toBe('blue');
    expect(result![0].type).toBe('暴雨');
    expect(result![0].content).toBe('预计未来有暴雨');
    expect(result![0].publishTime).toBe('2026-06-20T10:00:00');
  });

  it('maps numeric alarm levels to colors', () => {
    const html = `
      <script>
      var alarmDZ = {"w":[{"alarm_title":"高温红色预警","alarm_level":"04","alarm_type":"高温","alarm_content":"极高气温"}]};
      </script>
    `;
    const result = weatherScraper.parseWeatherAlerts(html);
    expect(result).not.toBeNull();
    expect(result![0].level).toBe('red');
  });

  it('returns null when no alerts', () => {
    const html = '<script>var alarmDZ = {"w":[]};</script>';
    const result = weatherScraper.parseWeatherAlerts(html);
    expect(result).toBeNull();
  });
});

describe('parseRadarTiles', () => {
  it('parses radar link', () => {
    const html = `
      <a href="http://products.weather.com.cn/product/radar1/index/procode/JC_RADAR_AZ9011_JB_V3.shtml">雷达图</a>
    `;
    const result = weatherScraper.parseRadarTiles(html);
    expect(result).not.toBeNull();
    expect(result!.type).toBe('radar');
    expect(result!.baseUrl).toContain('JC_RADAR_AZ9011_JB_V3.shtml');
  });

  it('parses radarid input', () => {
    const html = `
      <input id="radarid" value="AZ9011">
    `;
    const result = weatherScraper.parseRadarTiles(html);
    expect(result).not.toBeNull();
    expect(result!.baseUrl).toContain('AZ9011');
  });

  it('returns null when no radar info', () => {
    const result = weatherScraper.parseRadarTiles('<html>empty</html>');
    expect(result).toBeNull();
  });
});

describe('fetchAirQuality with QWeather', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('parses QWeather air quality response and marks source', async () => {
    const fixture = {
      code: '200',
      now: {
        aqi: '45',
        level: '1',
        category: '优',
        primary: 'NA',
        pm10: '35',
        pm2p5: '20',
        no2: '25',
        so2: '8',
        co: '0.6',
        o3: '70',
      },
    };
    jest.spyOn(qweatherService, 'fetchQWeatherAirQuality').mockResolvedValue(fixture);

    const result = await weatherScraper.fetchAirQuality('101010100');
    expect(result.source).toBe('QWeather');
    expect(result.aqi).toBe(45);
    expect(result.level).toBe('优');
    expect(result.primaryPollutant).toBe('无');
    expect(result.pm25).toBe(20);
    expect(result.pm10).toBe(35);
    expect(result.o3).toBe(70);
    expect(result.no2).toBe(25);
    expect(result.so2).toBe(8);
    expect(result.co).toBe(0.6);
    expect(result.advice).toBeDefined();
  });

  it('falls back when QWeather returns null', async () => {
    jest.spyOn(qweatherService, 'fetchQWeatherAirQuality').mockResolvedValue(null);

    const result = await weatherScraper.fetchAirQuality('101010100');
    expect(result.source).toBe('fallback');
    expect(result).toEqual(expect.objectContaining(weatherScraper.fallbackAir));
  });
});

describe('fetchWeatherAlerts with QWeather', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('parses QWeather warnings and marks source', async () => {
    const fixture = {
      code: '200',
      warning: [
        {
          id: '101010100202606200101',
          title: '北京市暴雨蓝色预警',
          level: '蓝色',
          type: '11B01',
          typeName: '暴雨',
          content: '预计未来6小时有暴雨',
          text: '预计未来6小时有暴雨',
          pubTime: '2026-06-20T10:00:00+08:00',
          status: 'active',
        },
      ],
    };
    jest.spyOn(qweatherService, 'fetchQWeatherWarnings').mockResolvedValue(fixture);

    const result = await weatherScraper.fetchWeatherAlerts('101010100');
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('北京市暴雨蓝色预警');
    expect(result[0].level).toBe('blue');
    expect(result[0].type).toBe('暴雨');
    expect(result[0].content).toBe('预计未来6小时有暴雨');
    expect(result[0].publishTime).toBe('2026-06-20T10:00:00+08:00');
    expect(result[0].source).toBe('QWeather');
  });

  it('returns empty array when QWeather returns null or no warnings', async () => {
    jest.spyOn(qweatherService, 'fetchQWeatherWarnings').mockResolvedValue(null);

    const result = await weatherScraper.fetchWeatherAlerts('101010100');
    expect(result).toEqual([]);
  });
});
