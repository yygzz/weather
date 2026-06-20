import { useQuery } from '@tanstack/react-query';
import { useWeatherStore } from '@/stores/weatherStore';
import { weatherApi } from '@/services/api';

export function useWeatherData() {
  const coordinates = useWeatherStore((s) => s.coordinates);
  const coords = coordinates || { lat: 39.9042, lon: 116.4074 };

  const current = useQuery({
    queryKey: ['current', coords],
    queryFn: () => weatherApi.current(coords),
    refetchInterval: 5 * 60 * 1000,
    enabled: !!coordinates,
  });

  const hourly = useQuery({
    queryKey: ['hourly', coords],
    queryFn: () => weatherApi.hourly(coords),
    refetchInterval: 30 * 60 * 1000,
    enabled: !!coordinates,
  });

  const daily = useQuery({
    queryKey: ['daily', coords],
    queryFn: () => weatherApi.daily(coords),
    refetchInterval: 60 * 60 * 1000,
    enabled: !!coordinates,
  });

  const air = useQuery({
    queryKey: ['air', coords],
    queryFn: () => weatherApi.air(coords),
    refetchInterval: 15 * 60 * 1000,
    enabled: !!coordinates,
  });

  const lifestyle = useQuery({
    queryKey: ['lifestyle', coords],
    queryFn: () => weatherApi.lifestyle(coords),
    refetchInterval: 60 * 60 * 1000,
    enabled: !!coordinates,
  });

  const alerts = useQuery({
    queryKey: ['alerts', coords],
    queryFn: () => weatherApi.alerts(coords),
    refetchInterval: 5 * 60 * 1000,
    enabled: !!coordinates,
  });

  const radar = useQuery({
    queryKey: ['radar', coords],
    queryFn: () => weatherApi.radar(coords),
    refetchInterval: 10 * 60 * 1000,
    enabled: !!coordinates,
  });

  return { current, hourly, daily, air, lifestyle, alerts, radar };
}
