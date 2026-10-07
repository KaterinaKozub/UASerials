export interface ImdbRating {
  value: number;
  votes?: string;
  imdbId: string;
}

const KEY = 'ua_serials_imdb';
const OMDB_KEY = import.meta.env.VITE_OMDB_KEY as string | undefined;

function readCache(): Record<string, ImdbRating | null> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, ImdbRating | null>;
  } catch {
    return {};
  }
}

/**
 * Реальний рейтинг IMDb: Вікіпедія -> Wikidata (P345 = IMDb ID) -> OMDb.
 * OMDb потребує безкоштовний ключ у .env (VITE_OMDB_KEY). Без ключа повертає null — нічого не вигадуємо.
 */
export async function getImdbRating(wikidataId: string): Promise<ImdbRating | null> {
  if (!OMDB_KEY) return null;
  const cache = readCache();
  if (wikidataId in cache) return cache[wikidataId];

  let result: ImdbRating | null = null;
  try {
    const wd = new URLSearchParams({
      action: 'wbgetclaims', entity: wikidataId, property: 'P345', format: 'json', origin: '*',
    });
    const wdRes = await fetch(`https://www.wikidata.org/w/api.php?${wd.toString()}`);
    const wdData = (await wdRes.json()) as {
      claims?: { P345?: { mainsnak?: { datavalue?: { value?: string } } }[] };
    };
    const imdbId = wdData.claims?.P345?.map((c) => c.mainsnak?.datavalue?.value).find((v) => v?.startsWith('tt'));
    if (imdbId) {
      const om = new URLSearchParams({ i: imdbId, apikey: OMDB_KEY });
      const omRes = await fetch(`https://www.omdbapi.com/?${om.toString()}`);
      const omData = (await omRes.json()) as { imdbRating?: string; imdbVotes?: string };
      const value = Number(omData.imdbRating);
      if (omData.imdbRating && omData.imdbRating !== 'N/A' && !Number.isNaN(value)) {
        result = { value, votes: omData.imdbVotes, imdbId };
      }
    }
  } catch {
    return null; // не кешуємо збій мережі
  }
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readCache(), [wikidataId]: result }));
  } catch {
    /* ignore */
  }
  return result;
}
