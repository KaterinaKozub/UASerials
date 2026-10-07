# UASerials — каталог українських серіалів

**Українські серіали, які варто подивитися.** Сучасний темний streaming-style каталог: постери, жанри, власні оцінки та список обраного.

> **Базовий функціонал працює без API key і без реєстрації.** Додаткові ключі (TMDB, OMDb) необов'язкові: вони лише додають більше обкладинок і реальні рейтинги.

## Технології

React 18 · TypeScript · Vite · React Router · Fetch API · чистий CSS (CSS variables, анімації, glassmorphism). Без backend.

## Звідки беруться дані

Нічого не вигадується: якщо даних немає, поле просто не показується.

| Що | Джерело |
|---|---|
| Назви та жанри | Список у `src/data/curated.ts`, наданий автором проєкту (лише назви й жанри) |
| Обкладинка, опис, рік | TMDB (за наявності ключа) → українська Вікіпедія → постер з Wikidata |
| Рейтинг | TMDB (за наявності ключа) або IMDb через Wikidata + OMDb (за наявності ключа) |
| Джерела (посилання на сайти) | **FreeSerp API** (`index=sites`), реальні URL з відповіді |

**FreeSerp API** (`https://freeserp.ai/api.php`) повертає *сайти*, а не окремі серіали (`title`, `url`, `domain`, `ai_summary`, `dr`). Тому він використовується в блоці «Джерела» на сторінці серіалу (пошук за назвою). Релевантність таких результатів не гарантується. `dr` (Domain Rating) — це авторитетність сайту, а не оцінка серіалу.

## Функціонал

- **Головна:** hero, категорії, добірки за жанрами.
- **Каталог:** пошук з debounce (500 мс), 13 категорій, сортування (за замовчуванням / за назвою А–Я), кнопка «Завантажити ще».
- **Сторінка серіалу:** обкладинка, жанри, опис і рік (якщо знайдено), рейтинг (якщо доступний), джерела з FreeSerp, кнопка «Відкрити джерело».
- **Оцінка користувача 1–10** (локальна, не «офіційний» рейтинг).
- **Обране** (❤️ на картці та на сторінці серіалу).
- Skeleton-завантаження, стани помилки та «нічого не знайдено», адаптивний дизайн, семантичний HTML, `alt` для зображень.

## Структура

```text
src/
├── components/   Header, Hero, SeriesCard, SeriesGrid, Rating, SearchBar,
│                 CategoryFilter, LoadingSkeleton, EmptyState, ErrorState
├── pages/        Home, Catalog, Favorites, SeriesDetails
├── services/     freeSerpApi.ts, wikipedia.ts, tmdb.ts, imdb.ts
├── hooks/        useLocalStorage, useDebounce, useSeriesMeta, useSeriesSearch
├── data/         curated.ts (назви й жанри)
├── types/        series.ts
├── utils/        categories.ts, cache.ts
├── styles/       global.css
├── App.tsx
└── main.tsx
```

## Запуск

Потрібен **Node.js 20+**.

```bash
npm install
npm run dev        # dev-сервер, зазвичай http://localhost:5173
npm run build      # перевірка TypeScript + збірка
npm run preview    # перегляд зібраної версії
```

### Необов'язкові ключі (`.env`)

Скопіюйте `.env.example` як `.env`, впишіть ключі та **перезапустіть** `npm run dev`:

```env
VITE_TMDB_KEY=   # TMDB: постери, опис, рік, рейтинг (themoviedb.org/settings/api)
VITE_OMDB_KEY=   # OMDb: рейтинг IMDb (omdbapi.com/apikey.aspx)
```

Без ключів сайт працює: обкладинки й описи беруться з Вікіпедії, а рейтинг не показується.

## localStorage

| Ключ | Вміст |
|---|---|
| `ua_serials_favorites` | `string[]` — id обраних серіалів |
| `ua_serials_ratings` | `Record<string, number>` — оцінки користувача |
| `ua_serials_cache` | знімок карток FreeSerp |
| `ua_serials_wiki_v3`, `ua_serials_tmdb`, `ua_serials_imdb` | кеш знайдених обкладинок/описів/рейтингів |

## CORS і проксі

`freeserp.ai` викликається через проксі Vite: запити йдуть на `/freeserp/api.php`, а `vite.config.ts` перенаправляє їх на `https://freeserp.ai/api.php`. Це працює для `dev` і `preview`. При публікації на хостингу налаштуйте rewrite `/freeserp/*` → `https://freeserp.ai/*` (Netlify, Vercel, nginx).

## Особливості та обмеження

- Обкладинки шукаються автоматично за назвою; **не для всіх серіалів вони знайдуться**, тоді показується placeholder з назвою. Іноді пошук може підібрати не ту статтю: перевіряйте результат.
- Рейтинг показується лише там, де його вдалося отримати (потрібен ключ TMDB або OMDb).
- Пошук у каталозі фільтрує список за назвою на клієнті; FreeSerp викликається лише на сторінці серіалу.

## Атрибуція

- Тексти й зображення з Вікіпедії: [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
- This product uses the TMDB API but is not endorsed or certified by TMDB.
- Дані FreeSerp: [freeserp.ai](https://freeserp.ai).

## Реєстрація та вхід
Сторінки `/register` і `/login`. Без входу можна переглядати каталог; додавати в обране й оцінювати можна лише після входу, а сторінка «Обране» доступна тільки авторизованим.
Обране й оцінки зберігаються окремо для кожного акаунта (`ua_serials_favorites:<email>`, `ua_serials_ratings:<email>`); дані, зібрані до реєстрації, переносяться в перший створений акаунт.

> **Важливо:** це клієнтська автентифікація без backend. Акаунти лежать у `localStorage` цього браузера (`ua_serials_users`), пароль зберігається лише як PBKDF2-хеш із сіллю, сесія — `ua_serials_session`. Акаунт не синхронізується між пристроями й не захищає від людини з доступом до браузера. Для справжнього продукту потрібен сервер (JWT/сесії, база даних).
