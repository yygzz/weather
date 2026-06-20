import { create } from 'zustand';
import type { Coordinates, GeocodeResult } from '@/types';

interface WeatherState {
  coordinates: Coordinates | null;
  location: GeocodeResult | null;
  setCoordinates: (coords: Coordinates) => void;
  setLocation: (location: GeocodeResult) => void;
}

const DEFAULT_COORDS: Coordinates = { lat: 39.9042, lon: 116.4074 };

const DEFAULT_LOCATION: GeocodeResult = { city: '北京', cityCode: '101010100', province: '北京' };

export const useWeatherStore = create<WeatherState>((set) => ({
  coordinates: DEFAULT_COORDS,
  location: DEFAULT_LOCATION,
  setCoordinates: (coordinates) => set({ coordinates }),
  setLocation: (location) => set({ location }),
}));
