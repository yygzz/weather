import { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { weatherApi } from '@/services/api';
import { useWeatherStore } from '@/stores/weatherStore';
import type { CitySearchResult } from '@/types';

export function CitySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const setCoordinates = useWeatherStore((s) => s.setCoordinates);
  const setLocation = useWeatherStore((s) => s.setLocation);
  const currentCity = useWeatherStore((s) => s.location?.city);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      weatherApi
        .searchCity(query.trim())
        .then((cities) => {
          setResults(cities);
          setIsOpen(cities.length > 0);
        })
        .catch(() => {
          setResults([]);
          setIsOpen(false);
        })
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timer);
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

  const handleSelect = (city: CitySearchResult) => {
    setCoordinates({ lat: city.lat, lon: city.lon });
    setLocation({ city: city.city, cityCode: city.cityCode, province: city.province });
    setQuery(city.city);
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl transition focus-within:bg-white/15 focus-within:border-white/30">
        <MapPin className="h-4 w-4 shrink-0 text-white/60" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={currentCity || '搜索城市…'}
          className="w-full bg-transparent text-sm text-white placeholder:text-white/50 outline-none"
        />
        {isLoading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white/60" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-white/60" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-auto rounded-2xl border border-white/15 bg-black/40 p-2 backdrop-blur-xl shadow-2xl">
          {results.map((city) => (
            <button
              key={city.cityCode}
              onClick={() => handleSelect(city)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
            >
              <span className="font-medium">{city.city}</span>
              <span className="text-white/50">{city.province}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
