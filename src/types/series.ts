export interface Series {
  id: string;
  title: string;
  url: string;
  domain: string;
  description?: string;
  year?: number;
  category?: string;
  rating?: number;
  image?: string;
  /** Domain Rating (поле `dr` з FreeSerp) — авторитетність домену, НЕ оцінка серіалу */
  domainRating?: number;
  /** 'title' — серіал зі списку користувача; 'site' (за замовчуванням) — сайт з FreeSerp */
  kind?: 'title' | 'site';
  /** Жанри зі списку користувача */
  genres?: string[];
}
