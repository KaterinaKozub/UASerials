/**
 * Клієнтська автентифікація (без backend): акаунти зберігаються в localStorage.
 * Пароль не зберігається — лише PBKDF2-хеш із випадковою сіллю. Це НЕ заміна справжньому серверу.
 */
export interface User {
  name: string;
  email: string;
}
interface StoredUser extends User {
  salt: string;
  hash: string;
  createdAt: string;
}

const USERS_KEY = 'ua_serials_users';
const SESSION_KEY = 'ua_serials_session';

export class AuthError extends Error {}

const readUsers = (): Record<string, StoredUser> => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}') as Record<string, StoredUser>;
  } catch {
    return {};
  }
};
const toB64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function hashPassword(password: string, salt: string): Promise<string> {
  if (!crypto?.subtle) throw new AuthError('Браузер не підтримує безпечне хешування (потрібен localhost або HTTPS).');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromB64(salt), iterations: 150000, hash: 'SHA-256' },
    key,
    256,
  );
  return toB64(new Uint8Array(bits));
}

const normEmail = (e: string) => e.trim().toLowerCase();

export function getSession(): User | null {
  const email = localStorage.getItem(SESSION_KEY);
  const u = email ? readUsers()[email] : undefined;
  return u ? { name: u.name, email: u.email } : null;
}

export async function registerUser(name: string, emailRaw: string, password: string): Promise<User> {
  const email = normEmail(emailRaw);
  const cleanName = name.trim();
  if (cleanName.length < 2 || cleanName.length > 40) throw new AuthError('Імʼя має містити від 2 до 40 символів.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new AuthError('Введіть коректний email.');
  if (password.length < 8) throw new AuthError('Пароль має містити щонайменше 8 символів.');
  const users = readUsers();
  if (users[email]) throw new AuthError('Користувач із таким email уже існує.');

  const salt = toB64(crypto.getRandomValues(new Uint8Array(16)));
  users[email] = { name: cleanName, email, salt, hash: await hashPassword(password, salt), createdAt: new Date().toISOString() };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, email);

  // переносимо обране й оцінки, зібрані до реєстрації
  for (const base of ['ua_serials_favorites', 'ua_serials_ratings']) {
    const v = localStorage.getItem(base);
    if (v && !localStorage.getItem(`${base}:${email}`)) localStorage.setItem(`${base}:${email}`, v);
  }
  return { name: cleanName, email };
}

export async function loginUser(emailRaw: string, password: string): Promise<User> {
  const email = normEmail(emailRaw);
  const u = readUsers()[email];
  const bad = new AuthError('Невірний email або пароль.');
  if (!u) throw bad;
  if ((await hashPassword(password, u.salt)) !== u.hash) throw bad;
  localStorage.setItem(SESSION_KEY, email);
  return { name: u.name, email: u.email };
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
}
