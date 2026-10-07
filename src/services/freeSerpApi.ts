import type { Series } from '../types/series';
import { cacheSeries, readCache } from '../utils/cache';
import { getCurated } from '../data/curated';

// У dev/preview запити йдуть через проксі Vite (/freeserp -> https://freeserp.ai), щоб обійти CORS.
const API_URL = '/freeserp/api.php';
const PAGE_SIZE = 20;
const MAX_PAGES = 10;

/** Реальна структура відповіді FreeSerp (index=sites) — перевірено вручну. */
interface RawSite {
  domain?: string;
  title?: string | null;
  url?: string;
  ai_summary?: string | null;
  dr?: number | null;
}
interface RawResponse {
  ok?: boolean;
  total?: number;
  results?: RawSite[];
}

export interface SearchResult {
  items: Series[];
  total: number;
  rawCount: number;
}

export class ApiError extends Error {}

const isAbort = (e: unknown) => (e as Error)?.name === 'AbortError';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function normalize(raw: RawSite): Series | null {
  if (!raw.url || !raw.domain) return null;
  return {
    id: raw.domain,
    title: raw.title?.trim() || raw.domain,
    url: raw.url,
    domain: raw.domain,
    description: raw.ai_summary?.trim() || undefined,
    domainRating: typeof raw.dr === 'number' ? raw.dr : undefined,
  };
}

/** Один запит (одна сторінка). */
export async function searchSeries(
  query: string,
  from = 0,
  size = PAGE_SIZE,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const params = new URLSearchParams({
    index: 'sites',
    q: query,
    size: String(size),
    from: String(from),
  });
  const url = `${API_URL}?${params.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new ApiError(`HTTP ${res.status} для ${url}`);
  let data: RawResponse;
  try {
    data = (await res.json()) as RawResponse;
  } catch {
    throw new ApiError(`Відповідь не JSON для ${url}`);
  }
  if (!Array.isArray(data.results)) {
    // сервер відповів валідним JSON, але без результатів — це «нічого не знайдено», а не збій
    if (data.ok === false) return { items: [], total: 0, rawCount: 0 };
    throw new ApiError(`Невірна структура відповіді для ${url}`);
  }
  const items = data.results.map(normalize).filter((s): s is Series => s !== null);
  cacheSeries(items);
  return { items, total: data.total ?? data.results.length, rawCount: data.results.length };
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (isAbort(e)) throw e;
    await sleep(700);
    return fn();
  }
}

/** Усі сторінки одного запиту (поки не вичерпано `total`). */
async function fetchAllPages(query: string, signal?: AbortSignal): Promise<Series[]> {
  const out: Series[] = [];
  let from = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    try {
      const r = await withRetry(() => searchSeries(query, from, PAGE_SIZE, signal));
      out.push(...r.items);
      from += r.rawCount;
      if (r.rawCount === 0 || from >= r.total) break;
    } catch (e) {
      if (isAbort(e) || page === 0) throw e; // перша сторінка обов'язкова, далі зберігаємо вже отримане
      console.error('[FreeSerp] сторінка не завантажилась:', e);
      break;
    }
  }
  return out;
}

/**
 * Усі результати для набору запитів: усі сторінки, усі варіанти, без дублів.
 * Помилка — лише якщо впали ВСІ запити.
 */
export async function searchAll(queries: string[], signal?: AbortSignal): Promise<Series[]> {
  const settled = await Promise.allSettled(queries.map((q) => fetchAllPages(q, signal)));
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const ok = settled.filter((s): s is PromiseFulfilledResult<Series[]> => s.status === 'fulfilled');
  if (ok.length === 0) {
    settled.forEach((s) => s.status === 'rejected' && console.error('[FreeSerp]', s.reason));
    throw new ApiError('Усі запити до FreeSerp завершились помилкою');
  }
  const seen = new Set<string>();
  const merged: Series[] = [];
  ok.forEach((s) =>
    s.value.forEach((item) => {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }),
  );
  return merged;
}

/** Деталі: спершу кеш, інакше шукаємо домен через API. */
export async function getSeriesById(id: string, signal?: AbortSignal): Promise<Series | null> {
  const cached = getCurated(id) ?? readCache()[id];
  if (cached) return cached;
  const { items } = await withRetry(() => searchSeries(id, 0, 10, signal));
  return items.find((s) => s.id === id) ?? null;
}
