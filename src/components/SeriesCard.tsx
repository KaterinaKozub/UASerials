import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Series } from '../types/series';
import { useFavorites, useRatings } from '../hooks/useUserData';
import { useAuth } from '../context/AuthContext';
import { useSeriesMeta } from '../hooks/useSeriesMeta';

export default function SeriesCard({ series, index = 0 }: { series: Series; index?: number }) {
  const [favs, setFavs] = useFavorites();
  const [ratings] = useRatings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const { image, rating } = useSeriesMeta(series);
  const isFav = favs.includes(series.id);
  const mine = ratings[series.id];
  const img = image ?? series.image;
  const to = `/series/${encodeURIComponent(series.id)}`;

  const toggle = () =>
    !user ? navigate('/login', { state: { from: loc.pathname + loc.search } }) : setFavs((p) => (p.includes(series.id) ? p.filter((x) => x !== series.id) : [...p, series.id]));

  return (
    <article className="pcard" style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}>
      <Link to={to} className="pcard-link" aria-label={series.title}>
        <div className="pcard-media">
          {img ? (
            <img src={img} alt={`Обкладинка: ${series.title}`} loading="lazy" />
          ) : (
            <div className="placeholder"><span>{series.title}</span></div>
          )}
        </div>
        <div className="pcard-shade" />
        <div className="pcard-info">
          <h3>{series.title}</h3>
          <div className="pcard-genres">
            {series.genres?.slice(0, 2).map((g) => <span key={g}>{g}</span>)}
          </div>
          <span className="pcard-cta">Детальніше</span>
        </div>
      </Link>
      <div className="pcard-badges">
        {rating && <span className="badge badge-imdb" title={`Рейтинг ${rating.source}`}>★ {rating.value.toFixed(1)}</span>}
        {mine ? <span className="badge badge-mine" title="Ваша оцінка">♥ {mine}/10</span> : null}
      </div>
      <button
        type="button"
        className={isFav ? 'fav on' : 'fav'}
        onClick={toggle}
        aria-pressed={isFav}
        aria-label={isFav ? 'Прибрати з обраного' : 'Додати в обране'}
      >
        {isFav ? '❤️' : '🤍'}
      </button>
    </article>
  );
}
