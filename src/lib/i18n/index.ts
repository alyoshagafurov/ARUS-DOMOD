import { ru, type Dictionary } from "@/lib/i18n/dictionary";
import { en } from "@/lib/i18n/en";
import { tg } from "@/lib/i18n/tg";
import type { Locale } from "@/types/catalog";

export const LOCALES: readonly Locale[] = ["ru", "tg", "en"];
export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_COOKIE = "arus_locale";

export const LOCALE_NAMES: Record<Locale, string> = {
  ru: "Русский",
  tg: "Тоҷикӣ",
  en: "English",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  ru: "RU",
  tg: "TJ",
  en: "EN",
};

export const dictionaries: Record<Locale, Dictionary> = { ru, tg, en };

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

export type { Dictionary, Locale };
