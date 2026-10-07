export interface TmdbInfo {
  poster?: string;
  overview?: string;
  year?: number;
  rating?: number;
  votes?: number;
  url: string;
}

interface TmdbResult {
  id: number;
  name: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  origin_country?: string[];
  original_language?: string;
  popularity?: number;
}

const CACHE_KEY = 'ua_serials_tmdb';
const API_KEY = import.meta.env.VITE_TMDB_KEY as string | undefined;
const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function readCache(): Record<string, TmdbInfo | null> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Record<string, TmdbInfo | null>;
  } catch {
    return {};
  }
}

/**
 * Постер, опис, рік і рейтинг з TMDB (themoviedb.org). Потрібен безкоштовний ключ VITE_TMDB_KEY.
 * Беремо лише результат, де назва збігається, а країна — Україна або мова — українська.
 */
export async function getTmdb(title: string, signal?: AbortSignal): Promise<TmdbInfo | null> {
  if (!API_KEY) return null;
  const cache = readCache();
  if (title in cache) return cache[title];

  const params = new URLSearchParams({ api_key: API_KEY, query: title, language: 'uk-UA', include_adult: 'false' });
  const res = await fetch(`https://api.themoviedb.org/3/search/tv?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`);
  const data = (await res.json()) as { results?: TmdbResult[] };

  const full = norm(title);
  const base = norm(title.split('.')[0]);
  const isUa = (r: TmdbResult) => r.origin_country?.includes('UA') || r.original_language === 'uk';
  const pool = (data.results ?? []).filter(isUa);
  const hit =
    pool.find((r) => norm(r.name) === full || norm(r.original_name ?? '') === full) ??
    pool.find((r) => norm(r.name) === base || norm(r.original_name ?? '') === base);

  const info: TmdbInfo | null = hit
    ? {
        poster: hit.poster_path ? `https://image.tmdb.org/t/p/w500${hit.poster_path}` : undefined,
        overview: hit.overview?.trim() || undefined,
        year: hit.first_air_date ? Number(hit.first_air_date.slice(0, 4)) || undefined : undefined,
        rating: hit.vote_count && hit.vote_average ? Math.round(hit.vote_average * 10) / 10 : undefined,
        votes: hit.vote_count,
        url: `https://www.themoviedb.org/tv/${hit.id}`,
      }
    : null;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readCache(), [title]: info }));
  } catch {
    /* ignore */
  }
  return info;
}
