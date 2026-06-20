import { useEffect, useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { RadarTileInfo } from '@/types';
import { Play, Pause } from 'lucide-react';

interface Props {
  data?: RadarTileInfo;
  coordinates: { lat: number; lon: number };
}

export function RadarMap({ data, coordinates }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame] = useState(0);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    import('leaflet').then((L) => {
      mapInstance.current = L.default.map(mapRef.current as HTMLElement).setView([coordinates.lat, coordinates.lon], 8);
      L.default
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        })
        .addTo(mapInstance.current);
    });
  }, [coordinates]);

  if (!data) return null;

  return (
    <section className="px-4 py-8 md:px-8">
      <GlassCard className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-light text-white">气象雷达</h2>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition hover:bg-white/20"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? '暂停' : '播放'}
          </button>
        </div>
        <div ref={mapRef} className="h-[400px] w-full rounded-2xl overflow-hidden" />
        <p className="mt-2 text-xs text-white/50">当前帧：{data.times[currentFrame] || '无数据'} {isPlaying ? '（播放中）' : ''}</p>
      </GlassCard>
    </section>
  );
}
