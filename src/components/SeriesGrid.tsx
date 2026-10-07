import type { Series } from '../types/series';
import SeriesCard from './SeriesCard';

export default function SeriesGrid({ items }: { items: Series[] }) {
  return (
    <div className="grid">
      {items.map((s, i) => (
        <SeriesCard key={s.id} series={s} index={i} />
      ))}
    </div>
  );
}
