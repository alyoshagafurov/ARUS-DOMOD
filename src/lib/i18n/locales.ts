import type { Locale } from "@/types/catalog";

/* -------------------------------------------------------------------------
   Языки — без словарей.

   Отдельный модуль, потому что эти константы нужны proxy: он работает на
   каждом запросе, и тянуть в него три словаря интерфейса незачем.
   ------------------------------------------------------------------------- */

export const LOCALES: readonly Locale[] = ["ru", "tg", "en"];
export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_COOKIE = "arus_locale";

/**
 * Язык из адреса (`?lang=tg`). Proxy переносит параметр в этот заголовок
 * запроса, а сервер читает его раньше куки: у каждой языковой версии
 * получается собственный адрес, который поисковик может проиндексировать.
 */
export const LOCALE_HEADER = "x-arus-locale";

/** Параметр адреса с языком */
export const LOCALE_PARAM = "lang";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
