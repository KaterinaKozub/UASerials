import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <i key={i} style={{ left: `${(i * 8.3) % 100}%`, animationDelay: `${i * 0.7}s` }} />
        ))}
      </div>
      <p className="hero-sub">Українські серіали, які варто подивитися</p>
      <h1>Українські серіали</h1>
      <p className="hero-text">Знаходь, оцінюй та відкривай нові українські історії.</p>
      <Link to="/catalog" className="btn btn-primary">Переглянути каталог</Link>
    </section>
  );
}
