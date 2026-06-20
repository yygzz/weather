import { forwardRef } from 'react';

interface Props {
  city?: string;
  temperature?: number;
  weatherText?: string;
  source?: string;
}

export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { city = '正在定位...', temperature, weatherText = '-', source = 'Weather Glass' },
  ref
) {
  return (
    <div
      ref={ref}
      className="relative w-[320px] overflow-hidden rounded-3xl border border-white/20 p-8 text-center text-white shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, rgb(30,41,59) 0%, rgb(15,23,42) 100%)',
      }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl" />
      <p className="relative text-lg font-medium tracking-wide text-white/70">{city}</p>
      <p className="relative mt-2 text-7xl font-thin tracking-tighter text-white">
        {temperature ?? '-'}°
      </p>
      <p className="relative mt-2 text-xl font-light text-white/90">{weatherText}</p>
      <p className="relative mt-6 text-xs text-white/40">数据来源于 {source}</p>
    </div>
  );
});
