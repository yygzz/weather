import { X } from 'lucide-react';
import { useSavedCities } from '@/hooks/useSavedCities';

export function SavedCities() {
  const { savedCities, removeCity, selectCity } = useSavedCities();

  if (savedCities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {savedCities.map((city) => (
        <div
          key={city.cityCode}
          className="group flex items-center gap-1 rounded-full border border-white/20 bg-white/10 pl-3 pr-1 text-sm text-white backdrop-blur-xl transition hover:bg-white/20"
        >
          <button
            onClick={() => selectCity(city.cityCode)}
            className="py-1 font-medium transition group-hover:text-white"
          >
            {city.city}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeCity(city.cityCode);
            }}
            className="ml-1 rounded-full p-1 text-white/60 transition hover:bg-white/20 hover:text-white"
            aria-label={`删除 ${city.city}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
