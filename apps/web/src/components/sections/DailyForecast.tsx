import { GlassCard } from '@/components/ui/GlassCard';
import type { DailyForecast } from '@/types';
import { Cloud } from 'lucide-react';

interface Props {
  data?: DailyForecast[];
}

export function DailyForecast({ data }: Props) {
  if (!data) return null;

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.map((day, i) => (
          <GlassCard key={day.date} delay={i * 0.05} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">
                {new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short', month: 'numeric', day: 'numeric' })}
              </p>
              <p className="mt-1 text-white/90">{day.dayWeather}</p>
              <p className="text-xs text-white/50">{day.windDirection} {day.windSpeed}</p>
            </div>
            <div className="text-right">
              <Cloud className="mb-1 ml-auto h-8 w-8 text-white/70" />
              <p className="text-lg font-medium text-white">
                {day.highTemperature}° <span className="text-white/50">/ {day.lowTemperature}°</span>
              </p>
              <p className="text-xs text-blue-300">降水 {day.precipitationProbability}%</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
