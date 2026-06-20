import { GlassCard } from '@/components/ui/GlassCard';
import type { AirQuality } from '@/types';

interface Props {
  data?: AirQuality;
}

export function AirQuality({ data }: Props) {
  if (!data) return null;

  const pollutants = [
    { label: 'PM2.5', value: data.pm25 },
    { label: 'PM10', value: data.pm10 },
    { label: 'O₃', value: data.o3 },
    { label: 'NO₂', value: data.no2 },
    { label: 'SO₂', value: data.so2 },
    { label: 'CO', value: data.co },
  ];

  return (
    <section className="px-4 py-8 md:px-8">
      <GlassCard className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-light text-white">空气质量</h2>
            <p className="mt-2 text-sm text-white/60">主要污染物：{data.primaryPollutant}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-thin text-white">{data.aqi}</p>
            <p className="text-lg text-green-300">{data.level}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 md:grid-cols-6">
          {pollutants.map((p) => (
            <div key={p.label} className="text-center">
              <p className="text-xs text-white/50">{p.label}</p>
              <p className="text-lg font-medium text-white">{p.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-white/70">{data.advice}</p>
      </GlassCard>
    </section>
  );
}
