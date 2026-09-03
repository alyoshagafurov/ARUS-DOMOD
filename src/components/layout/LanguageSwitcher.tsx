"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/cn";
import { LOCALE_NAMES, LOCALE_SHORT, LOCALES, type Locale } from "@/lib/i18n";
import { setLocaleAction } from "@/lib/i18n/actions";
import { useDictionary, useLocale } from "@/lib/i18n/client";

/**
 * Переключатель языка: три кнопки, текущая отмечена. Кука ставится server
 * action'ом, после чего маршрут обновляется — без перезагрузки и без смены
 * адреса.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const current = useLocale();
  const t = useDictionary();
  const router = useRouter();
  const [pending, start] = useTransition();

  const choose = (locale: Locale) => {
    if (locale === current) return;
    const data = new FormData();
    data.set("locale", locale);
    start(async () => {
      await setLocaleAction(data);
      router.refresh();
    });
  };

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={cn(
        "flex items-center gap-0.5 rounded-pill border border-hairline p-0.5",
        className,
      )}
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => choose(locale)}
          aria-pressed={locale === current}
          aria-label={LOCALE_NAMES[locale]}
          disabled={pending}
          className={cn(
            "t-label inline-flex h-9 min-w-9 items-center justify-center rounded-pill px-2.5",
            "transition-[background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
            locale === current
              ? "bg-accent text-accent-contrast"
              : "text-ink-secondary hover:text-ink",
          )}
        >
          {LOCALE_SHORT[locale]}
        </button>
      ))}
    </div>
  );
}
