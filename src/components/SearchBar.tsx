import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}

export default function SearchBar({ value, onChange, autoFocus }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <div className="search" role="search">
      <span aria-hidden="true">🔍</span>
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder="Шукати українські серіали…"
        aria-label="Пошук серіалів"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
