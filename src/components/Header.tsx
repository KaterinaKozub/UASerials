import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav-link active' : 'nav-link');
  return (
    <header className="header">
      <Link to="/" className="logo">
        UA<span>Serials</span>
      </Link>
      <nav className="nav" aria-label="Основна навігація">
        <NavLink to="/" end className={cls}>Головна</NavLink>
        <NavLink to="/catalog" className={cls}>Каталог</NavLink>
        <NavLink to="/favorites" className={cls}>Обране</NavLink>
      </nav>
      <Link to="/catalog?focus=1" className="header-search" aria-label="Пошук">
        🔍 <span>Пошук</span>
      </Link>
      <div className="auth-box">
        {user ? (
          <>
            <span className="user-chip" title={user.email}>👤 {user.name}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>Вийти</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Увійти</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Реєстрація</Link>
          </>
        )}
      </div>
    </header>
  );
}
