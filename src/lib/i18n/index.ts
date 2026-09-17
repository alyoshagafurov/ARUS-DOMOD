import { ru, type Dictionary } from "@/lib/i18n/dictionary";
import { en } from "@/lib/i18n/en";
import { tg } from "@/lib/i18n/tg";
import type { Locale } from "@/types/catalog";

export {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  LOCALE_PARAM,
  LOCALES,
} from "@/lib/i18n/locales";

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

export type { Dictionary, Locale };
