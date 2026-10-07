import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const isReg = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (isReg && password !== confirm) return setError('Паролі не збігаються.');
    setBusy(true);
    try {
      if (isReg) await register(name, email, password);
      else await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Сталася помилка. Спробуйте ще раз.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>{isReg ? 'Реєстрація' : 'Вхід'}</h1>
        <p className="muted">{isReg ? 'Створіть акаунт, щоб зберігати обране й оцінки.' : 'Увійдіть, щоб бачити своє обране й оцінки.'}</p>
        {isReg && (
          <label>Імʼя
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
        )}
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label>Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isReg ? 'new-password' : 'current-password'} required />
        </label>
        {isReg && (
          <label>Повторіть пароль
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
          </label>
        )}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Зачекайте…' : isReg ? 'Створити акаунт' : 'Увійти'}
        </button>
        <p className="muted">
          {isReg ? 'Вже є акаунт? ' : 'Ще немає акаунта? '}
          <Link to={isReg ? '/login' : '/register'} state={{ from }} className="auth-link">{isReg ? 'Увійти' : 'Зареєструватись'}</Link>
        </p>
      </form>
    </div>
  );
}
