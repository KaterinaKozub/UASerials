import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from './useLocalStorage';

/** Обране й оцінки зберігаються окремо для кожного акаунта: ключ + :email */
export function useFavorites() {
  const { user } = useAuth();
  return useLocalStorage<string[]>(user ? `ua_serials_favorites:${user.email}` : 'ua_serials_favorites', []);
}
export function useRatings() {
  const { user } = useAuth();
  return useLocalStorage<Record<string, number>>(user ? `ua_serials_ratings:${user.email}` : 'ua_serials_ratings', {});
}
