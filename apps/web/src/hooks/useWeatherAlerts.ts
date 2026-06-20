import { useCallback, useEffect, useState } from 'react';
import { useWeatherStore } from '@/stores/weatherStore';
import type { CurrentWeather, HourlyForecast, WeatherAlertRule } from '@/types';

const STORAGE_KEY = 'weather-glass-alert-rules';
const COOLDOWN_MS = 60 * 60 * 1000;

function readRules(): WeatherAlertRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WeatherAlertRule[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRules(rules: WeatherAlertRule[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseWindLevel(windSpeed: string): number {
  const match = windSpeed.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function evaluateRule(
  rule: WeatherAlertRule,
  current?: CurrentWeather,
  hourly?: HourlyForecast[]
): boolean {
  if (!current) return false;
  let value: number;
  switch (rule.metric) {
    case 'temperature':
      value = current.temperature;
      break;
    case 'windLevel':
      value = parseWindLevel(current.windSpeed);
      break;
    case 'rainProbability':
      if (!hourly || hourly.length === 0) return false;
      value = Math.max(...hourly.slice(0, 24).map((h) => h.precipitationProbability));
      break;
    default:
      return false;
  }
  switch (rule.operator) {
    case '>':
      return value > rule.threshold;
    case '<':
      return value < rule.threshold;
    case '>=':
      return value >= rule.threshold;
    case '<=':
      return value <= rule.threshold;
    case '==':
      return value === rule.threshold;
    default:
      return false;
  }
}

function getMetricLabel(metric: WeatherAlertRule['metric']): string {
  switch (metric) {
    case 'temperature':
      return '温度';
    case 'rainProbability':
      return '降雨概率';
    case 'windLevel':
      return '风力';
  }
}

export interface AlertToast {
  id: string;
  message: string;
}

export type AlertPermission = NotificationPermission | 'unsupported';

export function useWeatherAlerts(current?: CurrentWeather, hourly?: HourlyForecast[]) {
  const [rules, setRules] = useState<WeatherAlertRule[]>(readRules);
  const [permission, setPermission] = useState<AlertPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [toasts, setToasts] = useState<AlertToast[]>([]);

  const cityCode = useWeatherStore((s) => s.location?.cityCode);

  const addRule = useCallback((rule: Omit<WeatherAlertRule, 'id'>) => {
    setRules((prev) => {
      const next = [...prev, { ...rule, id: generateId() }];
      writeRules(next);
      return next;
    });
  }, []);

  const updateRule = useCallback((id: string, patch: Partial<WeatherAlertRule>) => {
    setRules((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
      writeRules(next);
      return next;
    });
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => {
      const next = prev.filter((r) => r.id !== id);
      writeRules(next);
      return next;
    });
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRules((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      writeRules(next);
      return next;
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported' as const;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!cityCode || !current) return;
    const now = Date.now();
    const triggered = rules.filter((rule) => {
      if (!rule.enabled || rule.cityCode !== cityCode) return false;
      if (rule.lastTriggeredAt && now - rule.lastTriggeredAt < COOLDOWN_MS) return false;
      return evaluateRule(rule, current, hourly);
    });

    if (triggered.length === 0) return;

    const cityName = useWeatherStore.getState().location?.city || cityCode;

    triggered.forEach((rule) => {
      const message = `${cityName} 触发提醒：${getMetricLabel(rule.metric)} ${rule.operator} ${rule.threshold}`;
      setToasts((prev) => {
        if (prev.some((t) => t.message === message)) return prev;
        return [...prev, { id: `${rule.id}-${now}`, message }];
      });
      if (permission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
        try {
          new Notification('天气提醒', { body: message, icon: '/favicon.svg' });
        } catch {
          // Ignore notification errors
        }
      }
    });

    setRules((prev) => {
      const next = prev.map((r) =>
        triggered.some((t) => t.id === r.id) ? { ...r, lastTriggeredAt: now } : r
      );
      writeRules(next);
      return next;
    });
  }, [cityCode, current, hourly, permission, rules]);

  return {
    rules,
    addRule,
    updateRule,
    removeRule,
    toggleRule,
    permission,
    requestPermission,
    toasts,
    dismissToast,
  };
}
