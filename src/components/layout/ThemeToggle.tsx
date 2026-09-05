"use client";

import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { useDictionary } from "@/lib/i18n/client";

/* -------------------------------------------------------------------------
   Переключатель дня и ночи.

   Тема живёт в атрибуте `data-theme` на <html> — там же, где её ставит
   скрипт в <head> до первой отрисовки. Второго источника правды нет: React
   не хранит копию темы в состоянии, а читает атрибут через
   useSyncExternalStore. Иначе после гидратации сервер и клиент разошлись бы
   ровно на один кадр — и страница мигнула бы белым.
   ------------------------------------------------------------------------- */

export const THEME_KEY = "arus.theme";
export type Theme = "light" | "dark";

/**
 * Скрипт, который выполняется в <head> синхронно, до отрисовки. Именно он
 * не даёт вспышке белого случиться: к первому кадру атрибут уже стоит.
 *
 * Выбор человека старше системного. Если выбора нет — берётся системный, но
 * в атрибут он пишется всё равно явно: тогда CSS обходится одним блоком
 * `[data-theme="dark"]` без дублирующего медиазапроса, и значения темы
 * не расходятся по двум местам.
 */
export const themeScript = `(function(){try{var k=${JSON.stringify(THEME_KEY)};var s=localStorage.getItem(k);var d=(s==="dark"||s==="light")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=d;}catch(e){document.documentElement.dataset.theme="light";}})();`;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const readTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** На сервере темы нет: до гидратации кнопка рисуется в дневном состоянии */
const serverTheme = (): Theme => "light";

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, serverTheme);
}

export function setTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Приватный режим: тема доживёт до конца сессии, и это допустимо
  }
}

/**
 * Месяц и солнце нарисованы здесь, а не в общем наборе: они нужны только
 * этой кнопке и обязаны совпадать обводкой 1.25px с остальными иконками.
 */
function ThemeIcon({ theme }: { theme: Theme }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="h-[1.15em] w-[1.15em]"
    >
      {theme === "dark" ? (
        <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="4.1" />
          <path d="M12 2.6v2.1M12 19.3v2.1M4.4 4.4l1.5 1.5M18.1 18.1l1.5 1.5M2.6 12h2.1M19.3 12h2.1M4.4 19.6l1.5-1.5M18.1 5.9l1.5-1.5" />
        </>
      )}
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const t = useDictionary();
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === "dark" ? t.nav.themeDark : t.nav.themeLight}
      aria-pressed={theme === "dark"}
      className={className}
    >
      {/* Знак показывает, КУДА переключит нажатие, а не текущее состояние:
          у кнопки-действия и подпись, и значок называют результат. */}
      <ThemeIcon theme={next} />
    </button>
  );
}

/** Пункт меню на телефоне: там кнопка без подписи потерялась бы */
export function ThemeMenuItem({ className }: { className?: string }) {
  const theme = useTheme();
  const t = useDictionary();
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-pressed={theme === "dark"}
      className={cn(
        "tap-row gap-2 text-ink-secondary hover:text-ink",
        className,
      )}
    >
      <ThemeIcon theme={next} />
      <span className="t-label motion-underline">
        {next === "dark" ? t.nav.themeDark : t.nav.themeLight}
      </span>
    </button>
  );
}
