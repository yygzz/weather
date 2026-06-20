import { GeocodeResult, CitySearchResult } from '../types';

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult> {
  // 在本地城市表中找最近的城市作为坐标反查结果
  let nearest = CITIES[0];
  let minDist = Infinity;
  for (const city of CITIES) {
    const dist = Math.sqrt((city.lat - lat) ** 2 + (city.lon - lon) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }
  return {
    city: nearest.city,
    cityCode: nearest.cityCode,
    province: nearest.province,
    lat: nearest.lat,
    lon: nearest.lon,
  };
}

const CITIES: CitySearchResult[] = [
  { city: '北京', cityCode: '101010100', province: '北京', lat: 39.9042, lon: 116.4074 },
  { city: '上海', cityCode: '101020100', province: '上海', lat: 31.2304, lon: 121.4737 },
  { city: '广州', cityCode: '101280101', province: '广东', lat: 23.1291, lon: 113.2644 },
  { city: '深圳', cityCode: '101280601', province: '广东', lat: 22.5431, lon: 114.0579 },
  { city: '杭州', cityCode: '101210101', province: '浙江', lat: 30.2741, lon: 120.1551 },
  { city: '成都', cityCode: '101270101', province: '四川', lat: 30.5728, lon: 104.0668 },
  { city: '武汉', cityCode: '101200101', province: '湖北', lat: 30.5928, lon: 114.3055 },
  { city: '西安', cityCode: '101110101', province: '陕西', lat: 34.3416, lon: 108.9398 },
  { city: '南京', cityCode: '101190101', province: '江苏', lat: 32.0603, lon: 118.7969 },
  { city: '重庆', cityCode: '101040100', province: '重庆', lat: 29.5630, lon: 106.5516 },
  { city: '天津', cityCode: '101030100', province: '天津', lat: 39.0842, lon: 117.2009 },
  { city: '苏州', cityCode: '101190401', province: '江苏', lat: 31.2989, lon: 120.5853 },
  { city: '长沙', cityCode: '101250101', province: '湖南', lat: 28.2280, lon: 112.9388 },
  { city: '郑州', cityCode: '101180101', province: '河南', lat: 34.7466, lon: 113.6253 },
  { city: '沈阳', cityCode: '101070101', province: '辽宁', lat: 41.8057, lon: 123.4315 },
  { city: '青岛', cityCode: '101120201', province: '山东', lat: 36.0671, lon: 120.3826 },
  { city: '宁波', cityCode: '101210401', province: '浙江', lat: 29.8683, lon: 121.5440 },
  { city: '东莞', cityCode: '101281601', province: '广东', lat: 23.0489, lon: 113.7447 },
  { city: '厦门', cityCode: '101230201', province: '福建', lat: 24.4798, lon: 118.0894 },
  { city: '福州', cityCode: '101230101', province: '福建', lat: 26.0745, lon: 119.2965 },
  { city: '昆明', cityCode: '101290101', province: '云南', lat: 25.0389, lon: 102.7183 },
  { city: '哈尔滨', cityCode: '101050101', province: '黑龙江', lat: 45.8038, lon: 126.5350 },
  { city: '济南', cityCode: '101120101', province: '山东', lat: 36.6512, lon: 117.1201 },
  { city: '大连', cityCode: '101070201', province: '辽宁', lat: 38.9140, lon: 121.6147 },
  { city: '南宁', cityCode: '101300101', province: '广西', lat: 22.8170, lon: 108.3665 },
  { city: '贵阳', cityCode: '101260101', province: '贵州', lat: 26.6470, lon: 106.6302 },
  { city: '乌鲁木齐', cityCode: '101130101', province: '新疆', lat: 43.8256, lon: 87.6168 },
  { city: '兰州', cityCode: '101160101', province: '甘肃', lat: 36.0611, lon: 103.8343 },
  { city: '银川', cityCode: '101170101', province: '宁夏', lat: 38.4872, lon: 106.2309 },
  { city: '西宁', cityCode: '101150101', province: '青海', lat: 36.6171, lon: 101.7782 },
  { city: '拉萨', cityCode: '101140101', province: '西藏', lat: 29.6500, lon: 91.1000 },
  { city: '呼和浩特', cityCode: '101080101', province: '内蒙古', lat: 40.8414, lon: 111.7519 },
  { city: '石家庄', cityCode: '101090101', province: '河北', lat: 38.0428, lon: 114.5149 },
  { city: '太原', cityCode: '101100101', province: '山西', lat: 37.8706, lon: 112.5489 },
  { city: '合肥', cityCode: '101220101', province: '安徽', lat: 31.8206, lon: 117.2272 },
  { city: '南昌', cityCode: '101240101', province: '江西', lat: 28.6820, lon: 115.8579 },
  { city: '海口', cityCode: '101310101', province: '海南', lat: 20.0174, lon: 110.3492 },
  { city: '三亚', cityCode: '101310201', province: '海南', lat: 18.2528, lon: 109.5120 },
  { city: '香港', cityCode: '101320101', province: '香港', lat: 22.3193, lon: 114.1694 },
  { city: '澳门', cityCode: '101330101', province: '澳门', lat: 22.1987, lon: 113.5439 },
  { city: '台北', cityCode: '101340101', province: '台湾', lat: 25.0330, lon: 121.5654 },
];

export async function searchCity(query: string): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const lower = trimmed.toLowerCase();
  return CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(lower) ||
      c.province.toLowerCase().includes(lower) ||
      c.cityCode.includes(trimmed)
  ).slice(0, 8);
}
