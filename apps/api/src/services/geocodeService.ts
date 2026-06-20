import { GeocodeResult } from '../types';

// 简化实现：坐标转城市先使用默认城市，后续可接入高德/腾讯等 GEO API
export async function reverseGeocode(_lat: number, _lon: number): Promise<GeocodeResult> {
  return {
    city: '北京',
    cityCode: '101010100',
    province: '北京',
  };
}
