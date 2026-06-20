import { GlassCard } from '@/components/ui/GlassCard';
import type { LifestyleIndex } from '@/types';
import { Shirt, Sun, Car, Wind, Pill, Flower2, Dumbbell, Fish } from 'lucide-react';

interface Props {
  data?: LifestyleIndex[];
}

const iconMap: Record<string, React.ElementType> = {
  穿衣: Shirt,
  紫外线: Sun,
  洗车: Car,
  晾晒: Wind,
  感冒: Pill,
  过敏: Flower2,
  运动: Dumbbell,
  钓鱼: Fish,
};

export function LifestyleIndex({ data }: Props) {
  if (!data) return null;

  return (
    <section className="px-4 py-8 md:px-8">
      <h2 className="mb-6 text-center text-2xl font-light text-white">生活指数</h2>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
        {data.map((item, i) => {
          const Icon = iconMap[item.name] || Sun;
          return (
            <GlassCard key={item.name} delay={i * 0.05} className="text-center">
              <Icon className="mx-auto mb-2 h-7 w-7 text-white/70" />
              <p className="text-sm text-white/60">{item.name}</p>
              <p className="text-lg font-medium text-white">{item.level}</p>
              <p className="mt-1 text-xs text-white/50">{item.description}</p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
