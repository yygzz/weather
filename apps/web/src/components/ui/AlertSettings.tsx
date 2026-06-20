import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, BellRing, Plus, Trash2, X } from 'lucide-react';
import { useSavedCities } from '@/hooks/useSavedCities';
import type { AlertPermission, AlertToast } from '@/hooks/useWeatherAlerts';
import type { WeatherAlertRule } from '@/types';

interface AlertSettingsProps {
  rules: WeatherAlertRule[];
  addRule: (rule: Omit<WeatherAlertRule, 'id'>) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  permission: AlertPermission;
  requestPermission: () => Promise<AlertPermission>;
  toasts: AlertToast[];
  dismissToast: (id: string) => void;
}

const METRICS: { value: WeatherAlertRule['metric']; label: string }[] = [
  { value: 'temperature', label: '温度 (°C)' },
  { value: 'rainProbability', label: '降雨概率 (%)' },
  { value: 'windLevel', label: '风力 (级)' },
];

const OPERATORS: { value: WeatherAlertRule['operator']; label: string }[] = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '==', label: '=' },
];

export function AlertSettings({
  rules,
  addRule,
  removeRule,
  toggleRule,
  permission,
  requestPermission,
  toasts,
  dismissToast,
}: AlertSettingsProps) {
  const { savedCities } = useSavedCities();
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<{
    cityCode: string;
    metric: WeatherAlertRule['metric'];
    operator: WeatherAlertRule['operator'];
    threshold: string;
  }>({
    cityCode: savedCities[0]?.cityCode ?? '',
    metric: 'temperature',
    operator: '>',
    threshold: '',
  });

  useEffect(() => {
    if (savedCities.length > 0 && !savedCities.some((c) => c.cityCode === draft.cityCode)) {
      setDraft((prev) => ({ ...prev, cityCode: savedCities[0].cityCode }));
    }
  }, [savedCities, draft.cityCode]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleAdd = () => {
    if (!draft.cityCode || draft.threshold === '') return;
    addRule({
      cityCode: draft.cityCode,
      metric: draft.metric,
      operator: draft.operator,
      threshold: Number(draft.threshold),
      enabled: true,
    });
    setDraft((prev) => ({ ...prev, threshold: '' }));
  };

  const enabledCount = rules.filter((r) => r.enabled).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur-xl transition hover:bg-white/20"
        aria-label="天气提醒设置"
      >
        <Bell className="h-4 w-4" />
        {enabledCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white">
            {enabledCount > 9 ? '9+' : enabledCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="w-full max-w-lg rounded-3xl border border-white/20 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">天气提醒设置</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {permission !== 'granted' && (
              <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/70">
                  {permission === 'unsupported'
                    ? '当前浏览器不支持系统通知'
                    : '开启浏览器通知后，触发规则时会收到系统提醒'}
                </p>
                {permission !== 'unsupported' && (
                  <button
                    onClick={requestPermission}
                    className="mt-3 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    开启浏览器通知
                  </button>
                )}
              </div>
            )}

            {savedCities.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                请先收藏城市，再为其设置提醒规则。
              </p>
            ) : (
              <>
                <div className="mb-5 space-y-3">
                  <h3 className="text-sm font-medium text-white/80">添加新规则</h3>
                  <select
                    value={draft.cityCode}
                    onChange={(e) => setDraft((prev) => ({ ...prev, cityCode: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
                  >
                    {savedCities.map((city) => (
                      <option key={city.cityCode} value={city.cityCode} className="bg-slate-900">
                        {city.city}
                      </option>
                    ))}
                  </select>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      value={draft.metric}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, metric: e.target.value as WeatherAlertRule['metric'] }))
                      }
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
                    >
                      {METRICS.map((m) => (
                        <option key={m.value} value={m.value} className="bg-slate-900">
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={draft.operator}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, operator: e.target.value as WeatherAlertRule['operator'] }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center text-sm text-white outline-none transition focus:border-white/30 sm:w-20"
                    >
                      {OPERATORS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-slate-900">
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={draft.threshold}
                      onChange={(e) => setDraft((prev) => ({ ...prev, threshold: e.target.value }))}
                      placeholder="阈值"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/30"
                    />
                    <button
                      onClick={handleAdd}
                      disabled={!draft.cityCode || draft.threshold === ''}
                      className="rounded-xl bg-white/10 px-4 py-2 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/80">已设置规则</h3>
                  {rules.length === 0 ? (
                    <p className="text-sm text-white/50">暂无规则，请添加一条</p>
                  ) : (
                    rules.map((rule) => {
                      const city = savedCities.find((c) => c.cityCode === rule.cityCode);
                      const metricLabel = METRICS.find((m) => m.value === rule.metric)?.label ?? rule.metric;
                      return (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <div className="min-w-0 text-sm text-white">
                            <span className="font-medium">{city?.city ?? rule.cityCode}</span>
                            <span className="mx-2 text-white/50">·</span>
                            <span className="text-white/80">
                              {metricLabel} {rule.operator} {rule.threshold}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleRule(rule.id)}
                              className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                              aria-label={rule.enabled ? '禁用' : '启用'}
                            >
                              {rule.enabled ? (
                                <BellRing className="h-4 w-4" />
                              ) : (
                                <BellOff className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => removeRule(rule.id)}
                              className="rounded-full p-1.5 text-white/70 transition hover:bg-rose-500/20 hover:text-rose-300"
                              aria-label="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-950/90 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-xl"
          >
            <Bell className="h-4 w-4 shrink-0 text-amber-300" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="关闭"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
