import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { LifestyleIndex } from '@/types';
import { Shirt, Sun, Car, Wind, Pill, Flower2, Dumbbell, Fish } from 'lucide-react';

interface Props {
  data?: LifestyleIndex[];
  isLoading?: boolean;
  error?: Error | null;
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

export function LifestyleIndex({ data, isLoading, error }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) {
    return (
      <section className="px-4 py-8 md:px-8">
        <h2 className="mb-6 text-center text-2xl font-light text-white">生活指数</h2>
        <GlassCard className="mx-auto max-w-6xl py-12 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-4 text-sm text-white/60">正在加载生活指数...</p>
        </GlassCard>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-8 md:px-8">
        <h2 className="mb-6 text-center text-2xl font-light text-white">生活指数</h2>
        <GlassCard className="mx-auto max-w-6xl py-10 text-center">
          <p className="text-white/80">生活指数加载失败</p>
          <p className="mt-2 text-sm text-white/50">{error.message}</p>
        </GlassCard>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="px-4 py-8 md:px-8">
        <h2 className="mb-6 text-center text-2xl font-light text-white">生活指数</h2>
        <GlassCard className="mx-auto max-w-6xl py-10 text-center">
          <p className="text-white/60">暂无生活指数数据</p>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="px-4 py-8 md:px-8">
      <h2 className="mb-6 text-center text-2xl font-light text-white">生活指数</h2>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
        {data.map((item, i) => {
          const Icon = iconMap[item.name] || Sun;
          const isExpanded = expanded === item.name;
          return (
            <GlassCard
              key={item.name}
              delay={i * 0.05}
              onClick={() => setExpanded(isExpanded ? null : item.name)}
              className="text-left"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-7 w-7 shrink-0 text-white/70" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/60">{item.name}</p>
                  <p className="text-lg font-medium text-white">{item.level}</p>
                </div>
              </div>
              <p className={`mt-2 text-xs text-white/50 transition-all ${isExpanded ? '' : 'line-clamp-2'}`}>
                {item.description}
              </p>
              <p className="mt-2 text-right text-xs text-white/40">
                {isExpanded ? '收起' : '查看详情'}
              </p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
