export const CATEGORIES = [
  'Драма', 'Комедія', 'Детектив', 'Кримінал', 'Мелодрама', 'Трилер', 'Історичні', 'Романтика',
  'Детектив + комедія', 'Медичні', 'Молодіжні', 'Пригоди', 'Сімейні',
] as const;

export const BASE_QUERY = 'українські серіали';

/** Усі базові варіанти запиту — результати об'єднуються без дублів. */
export const BASE_QUERIES = [
  'українські серіали',
  'український серіал',
  'українські телесеріали',
  'Ukrainian TV series',
];

/**
 * Категорія змінює лише пошукові запити; картки жанр НЕ отримують (API його не повертає).
 */
export function buildQueries(text: string, category: string): string[] {
  const t = text.trim();
  const c = category.toLowerCase();
  if (t && category) return [`${t} ${c}`];
  if (t) return [t];
  if (category) return [`український серіал ${c}`, `українські серіали ${c}`];
  return BASE_QUERIES;
}
