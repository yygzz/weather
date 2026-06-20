import { GlassCard } from '@/components/ui/GlassCard';
import type { CurrentWeather } from '@/types';
import { Wind, Droplets, Eye, Gauge, Sunrise, Sunset } from 'lucide-react';

interface Props {
  data?: CurrentWeather;
}

export function CurrentDetails({ data }: Props) {
  if (!data) return null;

  const items = [
    { icon: Wind, label: '风向风力', value: `${data.windDirection} ${data.windSpeed}` },
    { icon: Droplets, label: '相对湿度', value: `${data.humidity}%` },
    { icon: Eye, label: '能见度', value: data.visibility },
    { icon: Gauge, label: '气压', value: data.pressure },
    { icon: Sunrise, label: '日出', value: data.sunrise },
    { icon: Sunset, label: '日落', value: data.sunset },
  ];

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {items.map((item, i) => (
          <GlassCard key={item.label} delay={i * 0.05} className="flex flex-col items-center text-center">
            <item.icon className="mb-2 h-6 w-6 text-white/70" />
            <p className="text-sm text-white/60">{item.label}</p>
            <p className="text-lg font-medium text-white">{item.value}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
