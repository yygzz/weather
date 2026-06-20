import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { X, Crosshair, MapPin, Loader2 } from 'lucide-react';
import { useWeatherStore } from '@/stores/weatherStore';
import { weatherApi } from '@/services/api';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  open: boolean;
  onClose: () => void;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapMover({ target }: { target: LatLngTuple | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 13);
    }
  }, [map, target]);
  return null;
}

export function MapPicker({ open, onClose }: MapPickerProps) {
  const coordinates = useWeatherStore((s) => s.coordinates);
  const setCoordinates = useWeatherStore((s) => s.setCoordinates);
  const setLocation = useWeatherStore((s) => s.setLocation);

  const initial: LatLngTuple = coordinates
    ? [coordinates.lat, coordinates.lon]
    : [39.9042, 116.4074];

  const [markerPosition, setMarkerPosition] = useState<LatLngTuple>(initial);
  const [mapCenter] = useState<LatLngTuple>(initial);
  const [flyTarget, setFlyTarget] = useState<LatLngTuple | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && coordinates) {
      const next: LatLngTuple = [coordinates.lat, coordinates.lon];
      setMarkerPosition(next);
    }
  }, [open, coordinates]);

  if (!open) return null;

  const handleMapClick = async (lat: number, lon: number) => {
    setMarkerPosition([lat, lon]);
    setIsLoading(true);
    setError(null);
    setSelectedLabel(null);
    try {
      const location = await weatherApi.reverseGeocode(lat, lon);
      setCoordinates({ lat, lon });
      setLocation(location);
      setSelectedLabel(`${location.city} · ${location.province}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : '位置识别失败';
      setError(`无法识别该位置：${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('浏览器不支持定位');
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const next: LatLngTuple = [lat, lon];
        setMarkerPosition(next);
        setFlyTarget(next);
        try {
          const location = await weatherApi.reverseGeocode(lat, lon);
          setCoordinates({ lat, lon });
          setLocation(location);
          setSelectedLabel(`${location.city} · ${location.province}`);
        } catch (e) {
          // 仅定位成功但反地理编码失败时，保留地图交互
          const message = e instanceof Error ? e.message : '位置识别失败';
          setError(`定位成功，但无法识别城市：${message}`);
        }
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setError(`定位失败：${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:h-[380px] md:w-[min(480px,calc(100vw-2rem))] md:rounded-2xl md:border md:border-white/20 md:bg-slate-950/90 md:shadow-2xl overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="地图选点"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <MapPin className="h-4 w-4 text-white/70" />
          <span className="text-sm font-medium">地图选点</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Crosshair className="h-3.5 w-3.5" />
            )}
            定位到我
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        <MapContainer
          center={mapCenter}
          zoom={10}
          scrollWheelZoom
          className="h-full w-full"
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onClick={handleMapClick} />
          <MapMover target={flyTarget} />
          <Marker position={markerPosition} />
        </MapContainer>

        {isLoading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-md">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              识别位置中…
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        {error ? (
          <p className="text-xs text-rose-300">{error}</p>
        ) : selectedLabel ? (
          <p className="text-xs text-emerald-300">已选择：{selectedLabel}</p>
        ) : (
          <p className="text-xs text-white/50">点击地图任意位置选择城市</p>
        )}
      </div>
    </div>
  );
}
