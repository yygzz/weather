import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageBackground } from '@/components/ui/PageBackground';
import { HeroSection } from '@/components/sections/HeroSection';
import { CurrentDetails } from '@/components/sections/CurrentDetails';
import { HourlyForecast } from '@/components/sections/HourlyForecast';
import { DailyForecast } from '@/components/sections/DailyForecast';
import { AirQuality } from '@/components/sections/AirQuality';
import { LifestyleIndex } from '@/components/sections/LifestyleIndex';
import { RadarMap } from '@/components/sections/RadarMap';
import { ProfessionalCharts } from '@/components/sections/ProfessionalCharts';
import { AlertModal } from '@/components/ui/AlertModal';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeatherData } from '@/hooks/useWeather';
import { useWeatherStore } from '@/stores/weatherStore';

const queryClient = new QueryClient();

function WeatherApp() {
  useGeolocation();
  const coordinates = useWeatherStore((s) => s.coordinates);
  const location = useWeatherStore((s) => s.location);
  const { current, hourly, daily, air, lifestyle, alerts, radar } = useWeatherData();

  const isLoading = current.isLoading;

  return (
    <div className="min-h-screen pb-20">
      <PageBackground weatherType={current.data?.weatherIcon} />
      <AlertModal alerts={alerts.data || []} />
      <main className="mx-auto max-w-7xl">
        <HeroSection data={current.data} city={location?.city} />
        {isLoading && (
          <div className="py-20 text-center text-white/60">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="mt-4">正在获取天气数据...</p>
          </div>
        )}
        <CurrentDetails data={current.data} />
        <HourlyForecast data={hourly.data} />
        <DailyForecast data={daily.data} />
        <ProfessionalCharts hourly={hourly.data} />
        {coordinates && <RadarMap data={radar.data} coordinates={coordinates} />}
        <AirQuality data={air.data} />
        <LifestyleIndex data={lifestyle.data} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  );
}
