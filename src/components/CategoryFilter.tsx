import { CATEGORIES } from '../utils/categories';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="cats" role="group" aria-label="Категорії">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          type="button"
          className={c === value ? 'cat on' : 'cat'}
          aria-pressed={c === value}
          onClick={() => onChange(c === value ? '' : c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
