import { useEffect, useState } from 'react';
import type { Series } from '../types/series';
import { getWikiInfo, type WikiInfo } from '../services/wikipedia';
import { getImdbRating, type ImdbRating } from '../services/imdb';
import { getTmdb, type TmdbInfo } from '../services/tmdb';

/**
 * Реальні дані для серіалу зі списку: TMDB (постер, опис, рік, рейтинг; потрібен ключ),
 * Вікіпедія (постер, опис, стаття), IMDb через OMDb (рейтинг; потрібен ключ). Нічого не вигадується.
 */
export function useSeriesMeta(series: Series | null) {
  const [wiki, setWiki] = useState<WikiInfo | null>(null);
  const [tmdb, setTmdb] = useState<TmdbInfo | null>(null);
  const [imdb, setImdb] = useState<ImdbRating | null>(null);

  useEffect(() => {
    setWiki(null);
    setTmdb(null);
    setImdb(null);
    if (!series || series.kind !== 'title') return;
    let dead = false;
    const ctl = new AbortController();
    getTmdb(series.title, ctl.signal)
      .then((t) => !dead && setTmdb(t))
      .catch(() => undefined);
    getWikiInfo(series.title, ctl.signal)
      .then(async (w) => {
        if (dead) return;
        setWiki(w);
        if (w?.wikidataId) {
          const r = await getImdbRating(w.wikidataId);
          if (!dead) setImdb(r);
        }
      })
      .catch(() => undefined);
    return () => {
      dead = true;
      ctl.abort();
    };
  }, [series?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const rating =
    tmdb?.rating !== undefined
      ? { value: tmdb.rating, source: 'TMDB' }
      : imdb
        ? { value: imdb.value, source: 'IMDb' }
        : null;

  return {
    wiki,
    tmdb,
    rating,
    image: tmdb?.poster ?? wiki?.image,
    description: tmdb?.overview ?? wiki?.extract,
    year: tmdb?.year,
    url: wiki?.url ?? tmdb?.url,
    sourceName: wiki ? 'uk.wikipedia.org' : tmdb ? 'themoviedb.org' : undefined,
  };
}
