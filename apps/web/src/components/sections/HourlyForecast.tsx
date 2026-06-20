import { GlassCard } from '@/components/ui/GlassCard';
import type { HourlyForecast } from '@/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Props {
  data?: HourlyForecast[];
}

export function HourlyForecast({ data }: Props) {
  if (!data) return null;

  return (
    <section className="px-4 py-8 md:px-8">
      <GlassCard className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-2xl font-light text-white">逐小时预报</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
              />
              <Area type="monotone" dataKey="temperature" stroke="#fbbf24" strokeWidth={3} fill="url(#tempGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '12px' }}
              />
              <Bar dataKey="precipitationProbability" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </section>
  );
}
