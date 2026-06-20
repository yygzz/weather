import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useWeatherStore } from '@/stores/weatherStore';
import { useSavedCities } from '@/hooks/useSavedCities';
import { CITIES, type CityItem } from '@/data/cities';

export function CitySearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const setCoordinates = useWeatherStore((s) => s.setCoordinates);
  const setLocation = useWeatherStore((s) => s.setLocation);
  const currentCity = useWeatherStore((s) => s.location?.city);

  const { addCity, removeCity, isSaved } = useSavedCities();

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const lower = trimmed.toLowerCase();
    return CITIES.filter(
      (c) =>
        c.city.toLowerCase().includes(lower) ||
        c.province.toLowerCase().includes(lower) ||
        c.cityCode.includes(trimmed)
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: CityItem) => {
    setCoordinates({ lat: city.lat, lon: city.lon });
    setLocation({ city: city.city, cityCode: city.cityCode, province: city.province });
    setQuery(city.city);
    setIsOpen(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
  };

  const showNoResults = query.trim() && results.length === 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-[240px]">
      <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 shadow-sm backdrop-blur-xl transition focus-within:bg-white/15 focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/20">
        <MapPin className="h-4 w-4 shrink-0 text-white/70" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => (results.length > 0 || showNoResults) && setIsOpen(true)}
          placeholder={currentCity || '搜索城市…'}
          className="w-full bg-transparent text-sm text-white placeholder:text-white/50 outline-none"
        />
        <Search className="h-4 w-4 shrink-0 text-white/70" />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-2xl border border-white/20 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-xl">
          {results.length > 0 ? (
            results.map((city) => {
              const saved = isSaved(city.cityCode);
              return (
                <button
                  key={city.cityCode}
                  onClick={() => handleSelect(city)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/15"
                >
                  <span className="font-medium">{city.city}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-white/50">{city.province}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (saved) {
                          removeCity(city.cityCode);
                        } else {
                          addCity(city);
                        }
                      }}
                      className={`rounded-full px-2 py-0.5 text-xs transition ${
                        saved
                          ? 'bg-white/20 text-white/80'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {saved ? '已收藏' : '+ 收藏'}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-white/50">未找到相关城市</div>
          )}
        </div>
      )}
    </div>
  );
}
