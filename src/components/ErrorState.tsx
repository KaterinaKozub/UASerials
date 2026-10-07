export default function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="state" role="alert">
      <h2>Не вдалося завантажити серіали</h2>
      <p className="muted">Спробуйте ще раз.</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>Повторити</button>
    </div>
  );
}
