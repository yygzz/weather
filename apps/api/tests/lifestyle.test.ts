import request from 'supertest';
import { createApp } from '../src/app';
import { cache } from '../src/services/cache';
import { fetchLifestyleIndices, parseLifestyleIndices } from '../src/services/weatherScraper';
import type { CurrentWeather, LifestyleIndex } from '../src/types';

const app = createApp();

const mockWeather: CurrentWeather = {
  temperature: 28,
  feelsLike: 30,
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

const mockIndices: LifestyleIndex[] = [
  { name: '穿衣', level: '较热', description: '建议穿短袖、短裤等清凉服装。' },
  { name: '紫外线', level: '强', description: '外出时涂抹防晒霜，戴遮阳帽或太阳镜。' },
  { name: '洗车', level: '适宜', description: '天气较好，适合擦洗汽车。' },
  { name: '晾晒', level: '适宜', description: '天气不错，抓紧时机让衣物晒晒太阳。' },
  { name: '感冒', level: '少发', description: '各项气象条件适宜，发生感冒机率较低。' },
  { name: '过敏', level: '不易发', description: '气象条件不易诱发过敏。' },
  { name: '运动', level: '适宜', description: '天气较好，推荐进行户外运动。' },
  { name: '化妆', level: '保湿', description: '天气较干燥，建议使用保湿型化妆品，涂抹润唇膏。' },
  { name: '钓鱼', level: '适宜', description: '水温适宜，鱼儿活跃，适合垂钓。' },
];

jest.mock('../src/services/weatherScraper', () => {
  const actual = jest.requireActual('../src/services/weatherScraper') as typeof import('../src/services/weatherScraper');
  return {
    ...actual,
    fetchLifestyleIndices: jest.fn((cityCode: string, injectedCurrent?: CurrentWeather) =>
      actual.fetchLifestyleIndices(cityCode, injectedCurrent)
    ),
  };
});

const mockedFetchLifestyleIndices = jest.mocked(fetchLifestyleIndices);
const actualFetchLifestyleIndices = jest.requireActual('../src/services/weatherScraper').fetchLifestyleIndices as typeof fetchLifestyleIndices;
const actualParseLifestyleIndices = jest.requireActual('../src/services/weatherScraper').parseLifestyleIndices as typeof parseLifestyleIndices;

describe('Lifestyle API', () => {
  beforeEach(() => {
    cache.flush();
    mockedFetchLifestyleIndices.mockClear();
  });

  it('GET /api/weather/lifestyle/:cityCode should return lifestyle indices', async () => {
    mockedFetchLifestyleIndices.mockResolvedValue(mockIndices);

    const res = await request(app).get('/api/weather/lifestyle/101010100');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toEqual(mockIndices);
    expect(mockedFetchLifestyleIndices).toHaveBeenCalledWith('101010100');
  });

  it('should use cache on repeated requests', async () => {
    mockedFetchLifestyleIndices.mockResolvedValue(mockIndices);

    const res1 = await request(app).get('/api/weather/lifestyle/101010100');
    expect(res1.status).toBe(200);
    expect(res1.body.cachedAt).toBeUndefined();

    const res2 = await request(app).get('/api/weather/lifestyle/101010100');
    expect(res2.status).toBe(200);
    expect(res2.body.cachedAt).toBeDefined();
    expect(mockedFetchLifestyleIndices).toHaveBeenCalledTimes(1);
  });

  it('should return 400 for invalid cityCode', async () => {
    const res = await request(app).get('/api/weather/lifestyle/invalid');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('cityCode');
    expect(mockedFetchLifestyleIndices).not.toHaveBeenCalled();
  });
});

describe('fetchLifestyleIndices logic', () => {
  it('should generate indices based on sunny weather', async () => {
    const indices = await actualFetchLifestyleIndices('101010100', mockWeather);
    const names = indices.map((item) => item.name);
    expect(names).toContain('紫外线');
    expect(names).toContain('洗车');
    expect(names).toContain('运动');
    expect(names).toContain('感冒');
    expect(names).toContain('过敏');
    expect(names).toContain('化妆');
    expect(names).toContain('钓鱼');

    indices.forEach((item) => {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('level');
      expect(item).toHaveProperty('description');
      expect(typeof item.name).toBe('string');
      expect(typeof item.level).toBe('string');
      expect(typeof item.description).toBe('string');
    });

    const uv = indices.find((item) => item.name === '紫外线');
    expect(uv?.level).toBe('中等');
  });

  it('should reflect rainy weather in car wash and sport indices', async () => {
    const indices = await actualFetchLifestyleIndices('101010100', {
      ...mockWeather,
      weatherText: '小雨',
      weatherIcon: 'rainy',
    });

    const carWash = indices.find((item) => item.name === '洗车');
    expect(carWash).toBeDefined();
    expect(carWash!.level).toBe('不宜');

    const sport = indices.find((item) => item.name === '运动');
    expect(sport).toBeDefined();
    expect(sport!.level).toBe('较不宜');
  });

  it('should reflect cold weather in clothing and cold indices', async () => {
    const indices = await actualFetchLifestyleIndices('101010100', {
      ...mockWeather,
      temperature: 2,
      weatherText: '多云',
      weatherIcon: 'cloudy',
    });

    const clothing = indices.find((item) => item.name === '穿衣');
    expect(clothing).toBeDefined();
    expect(clothing!.level).toBe('寒冷');

    const cold = indices.find((item) => item.name === '感冒');
    expect(cold).toBeDefined();
    expect(cold!.level).toBe('易发');
  });
});

describe('parseLifestyleIndices', () => {
  it('parses dataZS payload into lifestyle indices', () => {
    const html = `
      <script>
      var dataZS = {
        "zs": {
          "uv_name": "紫外线",
          "uv_hint": "强",
          "uv_des_s": "外出涂抹防晒霜，戴遮阳帽或太阳镜。",
          "xc_name": "洗车",
          "xc_hint": "适宜",
          "xc_des_s": "天气较好，适合擦洗汽车。",
          "yd_name": "运动",
          "yd_hint": "适宜",
          "yd_des_s": "天气较好，推荐进行户外运动。",
          "gm_name": "感冒",
          "gm_hint": "少发",
          "gm_des_s": "各项气象条件适宜，发生感冒机率较低。"
        }
      };
      </script>
    `;
    const result = actualParseLifestyleIndices(html);
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThanOrEqual(4);

    const uv = result!.find((item) => item.name === '紫外线');
    expect(uv).toBeDefined();
    expect(uv!.level).toBe('强');
    expect(uv!.description).toContain('防晒霜');

    const carWash = result!.find((item) => item.name === '洗车');
    expect(carWash).toBeDefined();
    expect(carWash!.level).toBe('适宜');
  });

  it('returns null when dataZS is missing', () => {
    const result = actualParseLifestyleIndices('<html>empty</html>');
    expect(result).toBeNull();
  });

  it('returns null when dataZS has no zs object', () => {
    const html = '<script>var dataZS = {};</script>';
    const result = actualParseLifestyleIndices(html);
    expect(result).toBeNull();
  });
});
