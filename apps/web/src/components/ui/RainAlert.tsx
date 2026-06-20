import { useState } from 'react';
import { Umbrella, X } from 'lucide-react';
import type { HourlyForecast } from '@/types';

interface Props {
  data?: HourlyForecast[];
}

export function RainAlert({ data }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!data || data.length === 0 || dismissed) return null;

  const willRain = data.slice(0, 3).some((hour) => hour.precipitationProbability >= 50);
  if (!willRain) return null;

  const enableNotifications = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setConfirmed(true);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-blue-400/30 bg-blue-500/20 px-4 py-3 text-white backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Umbrella className="h-5 w-5 shrink-0 text-blue-200" />
          <p className="text-sm font-medium">未来 3 小时可能有雨，记得带伞</p>
        </div>
        <div className="flex items-center gap-2">
          {'Notification' in window && (
            <button
              onClick={enableNotifications}
              className="whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
            >
              开启降雨提醒
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="关闭提醒"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {confirmed && (
        <div className="mt-2 rounded-xl border border-green-400/30 bg-green-500/20 px-4 py-2 text-sm text-white">
          已开启降雨提醒
        </div>
      )}
    </div>
  );
}
