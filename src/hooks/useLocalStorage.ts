import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T) {
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  };
  const [value, setValue] = useState<T>(read);

  // при зміні ключа (інший акаунт) перечитуємо значення
  useEffect(() => {
    setValue(read());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const onSync = (e: Event) => {
      if ((e as CustomEvent<string>).detail === key) setValue(read());
    };
    window.addEventListener('ls-sync', onSync);
    return () => window.removeEventListener('ls-sync', onSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = (next: T | ((prev: T) => T)) => {
    const current = read();
    const resolved = typeof next === 'function' ? (next as (p: T) => T)(current) : next;
    try {
      localStorage.setItem(key, JSON.stringify(resolved));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent('ls-sync', { detail: key }));
  };

  return [value, set] as const;
}
