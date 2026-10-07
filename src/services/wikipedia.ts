export interface WikiInfo {
  title: string;
  extract: string;
  url: string;
  image?: string;
  wikidataId?: string;
}

interface WikiPage {
  title: string;
  index?: number;
  extract?: string;
  fullurl?: string;
  thumbnail?: { source: string };
  pageprops?: { wikibase_item?: string };
}

const KEY = 'ua_serials_wiki_v3';
const WIKI_API = 'https://uk.wikipedia.org/w/api.php';

/* ---- черга: не більше 4 одночасних запитів, щоб Вікіпедія не обмежувала ---- */
let active = 0;
const waiters: (() => void)[] = [];
async function limited<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= 4) await new Promise<void>((r) => waiters.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiters.shift()?.();
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { signal });
    if (res.ok) return (await res.json()) as T;
    if (res.status !== 429 && res.status < 500) break;
    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  throw new Error(`HTTP помилка: ${url}`);
}

function readCache(): Record<string, WikiInfo | null> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, WikiInfo | null>;
  } catch {
    return {};
  }
}

const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const startsWithWord = (pageTitle: string, base: string) => {
  const p = norm(pageTitle);
  return p === base || p.startsWith(base + ' ');
};

async function searchPages(query: string, signal?: AbortSignal): Promise<WikiPage[]> {
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '8',
    prop: 'extracts|pageimages|info|pageprops', ppprop: 'wikibase_item',
    exintro: '1', explaintext: '1', exsentences: '3',
    piprop: 'thumbnail', pithumbsize: '600', inprop: 'url', format: 'json', origin: '*',
  });
  const data = await getJson<{ query?: { pages?: Record<string, WikiPage> } }>(`${WIKI_API}?${params.toString()}`, signal);
  return Object.values(data.query?.pages ?? {}).sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
}

/** Постер з Wikidata (P3383 — постер, P18 — зображення) через Wikimedia Commons. */
async function wikidataImage(qid: string, signal?: AbortSignal): Promise<string | undefined> {
  try {
    const params = new URLSearchParams({ action: 'wbgetentities', ids: qid, props: 'claims', format: 'json', origin: '*' });
    const data = await getJson<{
      entities?: Record<string, { claims?: Record<string, { mainsnak?: { datavalue?: { value?: string } } }[]> }>;
    }>(`https://www.wikidata.org/w/api.php?${params.toString()}`, signal);
    const claims = data.entities?.[qid]?.claims;
    const file = claims?.P3383?.[0]?.mainsnak?.datavalue?.value ?? claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    return file ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=600` : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Реальні дані з української Вікіпедії. Приймається лише стаття про серіал з відповідною назвою;
 * якщо у статті немає зображення — шукаємо постер у Wikidata. Інакше повертаємо null (нічого не вигадуємо).
 */
export function getWikiInfo(title: string, signal?: AbortSignal): Promise<WikiInfo | null> {
  return limited(async () => {
    const cache = readCache();
    if (title in cache) return cache[title];

    const full = norm(title);
    const base = norm(title.split('.')[0]);
    const queries = [`${title} телесеріал`, `${title} серіал`, `"${title}" український серіал`];

    let best: WikiPage | null = null;
    for (const q of queries) {
      const pages = (await searchPages(q, signal)).filter(
        (p) => p.fullurl && (/серіал/i.test(p.extract ?? '') || /серіал/i.test(p.title)),
      );
      const exact = pages.filter((p) => startsWithWord(p.title, full));
      const loose = pages.filter((p) => startsWithWord(p.title, base));
      const candidates = exact.length ? exact : loose;
      const withImg = candidates.find((p) => p.thumbnail?.source);
      if (withImg || (candidates[0] && !best)) best = withImg ?? candidates[0];
      if (withImg) break;
    }

    let info: WikiInfo | null = null;
    if (best) {
      const wikidataId = best.pageprops?.wikibase_item;
      const image = best.thumbnail?.source ?? (wikidataId ? await wikidataImage(wikidataId, signal) : undefined);
      info = { title: best.title, extract: (best.extract ?? '').trim(), url: best.fullurl as string, image, wikidataId };
    }
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...readCache(), [title]: info }));
    } catch {
      /* ignore */
    }
    return info;
  });
}
