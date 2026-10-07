interface Props {
  title?: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'Нічого не знайдено',
  text = 'Спробуйте змінити пошуковий запит або категорію.',
  actionLabel = 'Скинути фільтри',
  onAction,
}: Props) {
  return (
    <div className="state">
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      {onAction && <button type="button" className="btn btn-primary" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
