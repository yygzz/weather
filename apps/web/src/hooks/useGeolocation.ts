import { useEffect, useState } from 'react';
import { useWeatherStore } from '@/stores/weatherStore';
import type { Coordinates } from '@/types';

export function useGeolocation() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const setCoordinates = useWeatherStore((s) => s.setCoordinates);

  useEffect(() => {
    setStatus('loading');
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoordinates(coords);
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setCoordinates]);

  return { status, error };
}
