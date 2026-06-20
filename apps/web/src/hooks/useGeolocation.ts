import { useEffect, useState } from 'react';
import { useWeatherStore } from '@/stores/weatherStore';
import { weatherApi } from '@/services/api';
import type { Coordinates } from '@/types';

export function useGeolocation() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const setCoordinates = useWeatherStore((s) => s.setCoordinates);
  const setLocation = useWeatherStore((s) => s.setLocation);

  useEffect(() => {
    setStatus('loading');
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoordinates(coords);
        try {
          const location = await weatherApi.reverseGeocode(coords);
          setLocation(location);
        } catch (e) {
          // 逆地理编码失败时保持默认城市
        }
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setCoordinates, setLocation]);

  return { status, error };
}
