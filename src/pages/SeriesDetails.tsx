import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getSeriesById, searchSeries } from '../services/freeSerpApi';
import { useSeriesMeta } from '../hooks/useSeriesMeta';
import { useFavorites, useRatings } from '../hooks/useUserData';
import { useAuth } from '../context/AuthContext';
import type { Series } from '../types/series';

const NA = 'Інформація відсутня';

export default function SeriesDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const loc = useLocation();
  const sid = decodeURIComponent(id);
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);
  const [sources, setSources] = useState<Series[]>([]);
  const meta = useSeriesMeta(series);
  const { wiki, tmdb, rating } = meta;
  const [ratings, setRatings] = useRatings();
  const [favs, setFavs] = useFavorites();

  useEffect(() => {
    const ctl = new AbortController();
    setLoading(true);
    setError(false);
    getSeriesById(sid, ctl.signal)
      .then(setSeries)
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setError(true);
      })
      .finally(() => {
        if (!ctl.signal.aborted) setLoading(false);
      });
    return () => ctl.abort();
  }, [sid, tick]);

  useEffect(() => {
    if (series?.kind !== 'title') return;
    const ctl = new AbortController();
    setSources([]);
    searchSeries(`${series.title} серіал`, 0, 8, ctl.signal)
      .then((r) => setSources(r.items))
      .catch(() => setSources([]));
    return () => ctl.abort();
  }, [series]);

  if (loading) return <div className="section"><LoadingSkeleton count={1} /></div>;
  if (error) return <ErrorState onRetry={() => setTick((t) => t + 1)} />;
  if (!series) return <EmptyState title="Серіал не знайдено" text="Спробуйте відкрити його з каталогу." actionLabel="До каталогу" onAction={() => navigate('/catalog')} />;

  const view: Series = {
    ...series,
    description: meta.description ?? series.description,
    image: meta.image ?? series.image,
    year: meta.year ?? series.year,
    url: meta.url ?? series.url,
    domain: meta.sourceName ?? series.domain,
    rating: rating?.value,
  };
  const mine = ratings[series.id] ?? 0;
  const isFav = favs.includes(series.id);
  const needLogin = () => navigate('/login', { state: { from: loc.pathname } });
  const setMine = (v: number) =>
    !user ? needLogin() : setRatings((p) => {
      const next = { ...p };
      if (v) next[series.id] = v;
      else delete next[series.id];
      return next;
    });

  return (
    <article className="details">
      <Link to="/catalog" className="muted">← До каталогу</Link>
      <div className="details-grid">
        <div className="details-media">
          {view.image ? (
            <img src={view.image} alt={series.title} />
          ) : (
            <div className="placeholder big"><span>{series.title}</span></div>
          )}
        </div>
        <div>
          <h1>{series.title}</h1>
          {view.description && <p className="desc full">{view.description}</p>}
          {(wiki || tmdb) && (
            <p className="muted note">
              Дані: {tmdb && <a href={tmdb.url} target="_blank" rel="noopener noreferrer">TMDB</a>}
              {tmdb && wiki && ' · '}
              {wiki && <><a href={wiki.url} target="_blank" rel="noopener noreferrer">українська Вікіпедія</a> (CC BY-SA)</>}
            </p>
          )}
          <dl className="facts">
            {series.year && (<><dt>Рік</dt><dd>{series.year}</dd></>)}
            {(series.genres?.length || series.category) && (<><dt>Жанр</dt><dd>{series.genres?.join(', ') ?? series.category}</dd></>)}
            {view.domain && (<><dt>Джерело</dt><dd>{view.domain}</dd></>)}
            {(view.rating !== undefined || view.domainRating !== undefined) && (
              <>
                <dt>Рейтинг джерела</dt>
                <dd>
                  {view.rating !== undefined ? `${rating?.source ?? 'IMDb'} ${view.rating.toFixed(1)}/10` : NA}
                  {view.domainRating !== undefined && <span className="muted"> · Domain Rating сайту: {view.domainRating}</span>}
                </dd>
              </>
            )}
          </dl>
          <h2>Рейтинг користувачів</h2>
          <p className="muted note">Ваша локальна оцінка, зберігається лише у цьому браузері.</p>
          <Rating value={mine} onChange={setMine} />
          {!user && <p className="muted note">Увійдіть, щоб оцінювати й додавати в обране.</p>}
          <div className="actions">
            {view.url && <a className="btn btn-primary" href={view.url} target="_blank" rel="noopener noreferrer">Відкрити джерело</a>}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => !user ? needLogin() : setFavs((p) => (p.includes(series.id) ? p.filter((x) => x !== series.id) : [...p, series.id]))}
            >
              {isFav ? '❤️ В обраному' : '🤍 Додати в обране'}
            </button>
          </div>
          {series.kind === 'title' && (
            <>
              <h2 style={{ marginTop: '2rem' }}>Джерела (FreeSerp)</h2>
              <p className="muted note">Сайти з пошуку за назвою; релевантність не гарантована.</p>
              {sources.length === 0 ? (
                <p className="muted">{NA}</p>
              ) : (
                <ul className="sources">
                  {sources.map((x) => (
                    <li key={x.id}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title} <span className="muted">· {x.domain}</span></a></li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
