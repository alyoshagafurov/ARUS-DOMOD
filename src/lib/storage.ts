/**
 * Чтение и запись состояния сессии в localStorage.
 *
 * Хранилище может быть недоступно: приватный режим, отключённые куки,
 * переполненная квота, чужая запись под тем же ключом. Ни один из этих
 * случаев не должен ронять витрину, поэтому любое обращение обёрнуто, а
 * непрошедшие проверку данные молча отбрасываются.
 */
export function readStored<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Переполненная квота или запрет записи — не повод ломать страницу
  }
}
