import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import SeriesGrid from '../components/SeriesGrid';
import { CATEGORIES } from '../utils/categories';
import { CURATED } from '../data/curated';

const SECTIONS = ['Драма', 'Комедія', 'Детектив', 'Історичні', 'Молодіжні'];

export default function Home() {
  return (
    <>
      <Hero />
      <section className="section">
        <h2 className="h-bar">Категорії</h2>
        <div className="cats">
          {CATEGORIES.map((c) => (
            <Link key={c} className="cat" to={`/catalog?cat=${encodeURIComponent(c)}`}>{c}</Link>
          ))}
        </div>
      </section>
      {SECTIONS.map((g) => (
        <section className="section" key={g}>
          <div className="h-row">
            <h2 className="h-bar">{g}</h2>
            <Link to={`/catalog?cat=${encodeURIComponent(g)}`} className="muted">Усі серіали жанру →</Link>
          </div>
          <SeriesGrid items={CURATED.filter((s) => s.genres?.includes(g)).slice(0, 6)} />
        </section>
      ))}
    </>
  );
}
