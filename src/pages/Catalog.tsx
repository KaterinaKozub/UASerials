import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import SeriesGrid from '../components/SeriesGrid';
import EmptyState from '../components/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { CURATED } from '../data/curated';

type Sort = 'relevance' | 'title';
const STEP = 12;

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const category = params.get('cat') ?? '';
  const q = params.get('q') ?? '';
  const [text, setText] = useState(q);
  const [sort, setSort] = useState<Sort>('relevance');
  const [visTitles, setVisTitles] = useState(STEP);
  const debounced = useDebounce(text, 500);

  useEffect(() => {
    if (debounced === q) return;
    const next = new URLSearchParams(params);
    if (debounced) next.set('q', debounced);
    else next.delete('q');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);


  useEffect(() => {
    setVisTitles(STEP);
  }, [q, category, sort]);

  const titles = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = CURATED.filter(
      (s) => (!category || s.genres?.includes(category)) && (!needle || s.title.toLowerCase().includes(needle)),
    );
    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'uk'));
    return list;
  }, [q, category, sort]);

  const setCategory = (c: string) => {
    const next = new URLSearchParams(params);
    if (c) next.set('cat', c);
    else next.delete('cat');
    setParams(next);
  };
  const reset = () => {
    setText('');
    setSort('relevance');
    setParams({});
  };

  return (
    <div className="section">
      <h1>Каталог серіалів</h1>
      <div className="toolbar">
        <SearchBar value={text} onChange={setText} autoFocus={params.get('focus') === '1'} />
        <label className="select">
          <span className="muted">Сортування</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="relevance">За замовчуванням</option>
            <option value="title">За назвою (А–Я)</option>
          </select>
        </label>
      </div>
      <CategoryFilter value={category} onChange={setCategory} />

      <section className="section">
        <h2>Серіали ({titles.length})</h2>
        <p className="muted note">Обкладинки, опис, рік і рейтинг підтягуються з TMDB та Вікіпедії, якщо їх вдалося знайти.</p>
        {titles.length === 0 ? (
          <EmptyState onAction={reset} />
        ) : (
          <>
            <SeriesGrid items={titles.slice(0, visTitles)} />
            <div className="more">
              <button type="button" className="btn btn-primary" onClick={() => setVisTitles((v) => v + STEP)} disabled={visTitles >= titles.length}>
                {visTitles >= titles.length ? 'Це все' : `Завантажити ще (${titles.length - visTitles})`}
              </button>
            </div>
          </>
        )}
      </section>

    </div>
  );
}
