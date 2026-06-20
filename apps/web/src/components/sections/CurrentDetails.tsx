import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { DetailModal } from '@/components/ui/DetailModal';
import type { CurrentWeather } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { Wind, Droplets, Eye, Gauge, Sunrise, Sunset } from 'lucide-react';

interface DetailItem {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
}

interface Props {
  data?: CurrentWeather;
}

export function CurrentDetails({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  if (!data) return null;

  const items: DetailItem[] = [
    {
      icon: Wind,
      label: '风向风力',
      value: `${data.windDirection} ${data.windSpeed}`,
      description:
        '风向指风的来向，风力反映空气流动的强度。微风适合户外活动，强风时请注意高空坠物与行车安全。',
    },
    {
      icon: Droplets,
      label: '相对湿度',
      value: `${data.humidity}%`,
      description:
        '相对湿度表示空气中水汽的饱和程度。40%–60% 体感最舒适；湿度过高容易闷热，过低则皮肤与呼吸道易干燥。',
    },
    {
      icon: Eye,
      label: '能见度',
      value: data.visibility,
      description:
        '能见度是肉眼能看清目标的最大距离。低能见度常伴随雾、霾或降水，驾车时请减速并开启雾灯。',
    },
    {
      icon: Gauge,
      label: '气压',
      value: data.pressure,
      description:
        '气压是单位面积上空气柱的重量。气压快速下降常预示阴雨或风暴来临，稳定高压则多晴朗天气。',
    },
    {
      icon: Sunrise,
      label: '日出',
      value: data.sunrise,
      description: '今天的日出时间。清晨紫外线较弱、空气清新，适合晨练或摄影。',
    },
    {
      icon: Sunset,
      label: '日落',
      value: data.sunset,
      description: '今天的日落时间。日落后气温下降较快，晚间外出建议备一件薄外套。',
    },
  ];

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <section className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {items.map((item, i) => (
          <GlassCard
            key={item.label}
            delay={i * 0.05}
            onClick={() => setActiveIndex(i)}
            className="flex flex-col items-center text-center"
          >
            <item.icon className="mb-2 h-6 w-6 text-white/70" />
            <p className="text-sm text-white/60">{item.label}</p>
            <p className="text-lg font-medium text-white">{item.value}</p>
          </GlassCard>
        ))}
      </div>

      {activeItem && (
        <DetailModal
          isOpen={activeIndex !== null}
          onClose={() => setActiveIndex(null)}
          icon={activeItem.icon}
          title={activeItem.label}
          value={activeItem.value}
          description={activeItem.description}
        />
      )}
    </section>
  );
}
