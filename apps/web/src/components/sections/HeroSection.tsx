import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { ShareModal } from '@/components/ui/ShareModal';
import type { CurrentWeather } from '@/types';

interface Props {
  data?: CurrentWeather;
  city?: string;
}

export function HeroSection({ data, city = '正在定位...' }: Props) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!data) return null;

  return (
    <>
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-2 inline-flex items-center justify-center gap-2">
            <p className="text-lg font-medium tracking-wide text-white/70">{city}</p>
            <button
              onClick={() => setIsShareOpen(true)}
              className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="分享天气"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <h1 className="text-[8rem] font-thin leading-none tracking-tighter text-white md:text-[12rem]">
            {data.temperature}°
          </h1>
          <p className="mt-2 text-2xl font-light text-white/90">{data.weatherText}</p>
          <p className="mt-1 text-base text-white/60">
            体感 {data.feelsLike}° · 更新于{' '}
            {new Date(data.updateTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="mt-3 text-xs text-white/40">数据来源于 {data.source}</p>
        </motion.div>
      </section>
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        city={city}
        temperature={data.temperature}
        weatherText={data.weatherText}
        source={data.source}
      />
    </>
  );
}
