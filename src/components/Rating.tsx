interface Props {
  value?: number;
  onChange?: (v: number) => void;
}

export default function Rating({ value = 0, onChange }: Props) {
  return (
    <div className="stars" role="group" aria-label="Оцінка від 1 до 10">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? 'star on' : 'star'}
          disabled={!onChange}
          onClick={() => onChange?.(n === value ? 0 : n)}
          aria-label={`Оцінка ${n}`}
          aria-pressed={n <= value}
        >
          ★
        </button>
      ))}
      <span className="stars-value">{value ? `${value}/10` : '—'}</span>
    </div>
  );
}
