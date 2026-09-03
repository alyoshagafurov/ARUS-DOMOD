import { cookies, headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  dictionaries,
  isLocale,
  LOCALE_COOKIE,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

/**
 * Локаль на сервере: кука, иначе Accept-Language, иначе русский.
 *
 * Локаль живёт в куке, а не в адресе: так ни один существующий URL не
 * меняется, а переключение — одно действие без перезагрузки маршрутов.
 * Ценой этого страницы рендерятся динамически (чтение куки), и hreflang
 * для поисковиков не выставляется — адресные локали (/tg/…, /en/…)
 * останутся следующим шагом, если SEO по языкам станет приоритетом.
 */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const accept = (await headers()).get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const tag = part.trim().slice(0, 2).toLowerCase();
    if (tag === "tg" || tag === "tj") return "tg";
    if (tag === "en") return "en";
    if (tag === "ru") return "ru";
  }
  return DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}
