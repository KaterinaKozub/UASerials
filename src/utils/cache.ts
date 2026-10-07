import type { Series } from '../types/series';

const KEY = 'ua_serials_cache';

export function readCache(): Record<string, Series> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, Series>;
  } catch {
    return {};
  }
}

export function cacheSeries(items: Series[]): void {
  const cache = readCache();
  items.forEach((s) => {
    cache[s.id] = s;
  });
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage full / disabled */
  }
}
