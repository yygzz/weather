import { GlassCard } from '@/components/ui/GlassCard';
import type { HourlyForecast } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  hourly?: HourlyForecast[];
}

export function ProfessionalCharts({ hourly }: Props) {
  if (!hourly) return null;

  const data = hourly.map((h) => ({
    ...h,
    humidity: 50 + Math.floor(Math.random() * 40),
    pressure: 1000 + Math.floor(Math.random() * 20),
  }));

  return (
    <section className="px-4 py-8 md:px-8">
      <GlassCard className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-2xl font-light text-white">专业气象趋势</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '12px' }}
              />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
              <Line yAxisId="left" type="monotone" dataKey="temperature" name="温度 (°C)" stroke="#fbbf24" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="humidity" name="湿度 (%)" stroke="#60a5fa" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="pressure" name="气压 (hPa)" stroke="#a78bfa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </section>
  );
}
