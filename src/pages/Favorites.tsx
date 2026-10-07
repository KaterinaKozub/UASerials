import { useNavigate } from 'react-router-dom';
import SeriesGrid from '../components/SeriesGrid';
import EmptyState from '../components/EmptyState';
import { useFavorites } from '../hooks/useUserData';
import { readCache } from '../utils/cache';
import { getCurated } from '../data/curated';
import type { Series } from '../types/series';

export default function Favorites() {
  const [favs] = useFavorites();
  const navigate = useNavigate();
  const cache = readCache();
  const items = favs.map((id) => cache[id] ?? getCurated(id)).filter((s): s is Series => Boolean(s));

  return (
    <div className="section">
      <h1>Обрані серіали</h1>
      {items.length === 0 ? (
        <EmptyState
          title="Мої обрані"
          text="Тут поки порожньо. Додай серіали, які хочеш переглянути."
          actionLabel="Перейти до каталогу"
          onAction={() => navigate('/catalog')}
        />
      ) : (
        <SeriesGrid items={items} />
      )}
    </div>
  );
}
