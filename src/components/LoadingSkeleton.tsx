export default function LoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Завантаження">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton">
          <div className="sk sk-media" />
          <div className="card-body">
            <div className="sk sk-line" />
            <div className="sk sk-line short" />
            <div className="sk sk-line" />
          </div>
        </div>
      ))}
    </div>
  );
}
