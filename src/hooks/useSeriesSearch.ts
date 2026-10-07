import { useCallback, useEffect, useState } from 'react';
import type { Series } from '../types/series';
import { searchAll } from '../services/freeSerpApi';

export function useSeriesSearch(queries: string[]) {
  const key = queries.join('|');
  const [items, setItems] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctl = new AbortController();
    setLoading(true);
    setError(false);
    searchAll(key.split('|'), ctl.signal)
      .then(setItems)
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') {
          console.error('[UASerials] помилка завантаження:', e);
          setError(true);
        }
      })
      .finally(() => {
        if (!ctl.signal.aborted) setLoading(false);
      });
    return () => ctl.abort();
  }, [key, tick]);

  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { items, loading, error, retry };
}
