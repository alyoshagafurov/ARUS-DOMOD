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
      className={cn("flex items-center", className)}
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
            "tap-icon t-label inline-flex h-11 min-w-11 items-center justify-center px-2",
            locale === current
              ? "text-ink-accent"
              : "text-ink-secondary hover:text-ink",
          )}
        >
          {LOCALE_SHORT[locale]}
        </button>
      ))}
    </div>
  );
}
