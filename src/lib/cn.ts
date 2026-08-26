/**
 * Склейка классов без зависимостей.
 *
 * Внимание: конфликты Tailwind-классов НЕ разрешаются (tailwind-merge не
 * подключён). Конвенция проекта: компонент отдаёт базовые классы, вызывающий
 * добавляет только непересекающиеся — раскладку и отступы.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
