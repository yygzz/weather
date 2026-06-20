import { useCallback, useState } from 'react';
import type { SavedCity } from '@/types';
import { useWeatherStore } from '@/stores/weatherStore';

const STORAGE_KEY = 'weather-glass-saved-cities';

function readSavedCities(): SavedCity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedCity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedCities(cities: SavedCity[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
}

export function useSavedCities() {
  const [savedCities, setSavedCities] = useState<SavedCity[]>(readSavedCities);

  const setCoordinates = useWeatherStore((s) => s.setCoordinates);
  const setLocation = useWeatherStore((s) => s.setLocation);

  const addCity = useCallback((city: SavedCity) => {
    setSavedCities((prev) => {
      if (prev.some((c) => c.cityCode === city.cityCode)) return prev;
      const next = [...prev, city];
      writeSavedCities(next);
      return next;
    });
  }, []);

  const removeCity = useCallback((cityCode: string) => {
    setSavedCities((prev) => {
      const next = prev.filter((c) => c.cityCode !== cityCode);
      writeSavedCities(next);
      return next;
    });
  }, []);

  const selectCity = useCallback(
    (cityCode: string) => {
      const city = savedCities.find((c) => c.cityCode === cityCode);
      if (!city) return;
      setCoordinates({ lat: city.lat, lon: city.lon });
      setLocation({ city: city.city, cityCode: city.cityCode, province: city.province });
    },
    [savedCities, setCoordinates, setLocation]
  );

  const isSaved = useCallback(
    (cityCode: string) => savedCities.some((c) => c.cityCode === cityCode),
    [savedCities]
  );

  return { savedCities, addCity, removeCity, selectCity, isSaved };
}
