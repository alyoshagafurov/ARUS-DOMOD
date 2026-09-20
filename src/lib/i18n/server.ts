import { cookies, headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  dictionaries,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

/**
 * Поисковые и ИИ-боты. По основному адресу они всегда получают русскую
 * версию: иначе бот с `Accept-Language: en` увидел бы английскую страницу
 * там, где разметка обещает русскую, и счёл бы версии перепутанными.
 * Остальные языки у ботов — по своим адресам `?lang=tg` и `?lang=en`.
 */
const CRAWLER =
  /bot|crawl|spider|slurp|yandex|bingpreview|facebookexternalhit|embedly|whatsapp|telegram|preview/i;

/** Язык, явно заданный адресом (`?lang=`), или null */
export async function getUrlLocale(): Promise<Locale | null> {
  const fromUrl = (await headers()).get(LOCALE_HEADER);
  return isLocale(fromUrl) ? fromUrl : null;
}

/**
 * Локаль на сервере: адрес (`?lang=`), иначе кука, иначе Accept-Language
 * (кроме ботов), иначе русский.
 *
 * Основные адреса не меняются: русская версия живёт без параметра, а у
 * таджикской и английской есть свои адреса с `?lang=` — их видят поисковики
 * через hreflang и карту сайта. Выбор человека по-прежнему хранит кука.
 */
export async function getLocale(): Promise<Locale> {
  const fromUrl = await getUrlLocale();
  if (fromUrl) return fromUrl;

  // Проверка на бота стоит раньше куки, а не после. Краулеры хранят куки
  // между запросами: зайдя один раз по `?lang=tg`, бот получал таджикскую
  // страницу по русскому каноническому адресу — и видел на ней разметку,
  // которая обещает русский. Адресный `?lang=` выше остаётся сильнее
  // всего, поэтому языковые версии у ботов по-прежнему доступны.
  const requestHeaders = await headers();
  if (CRAWLER.test(requestHeaders.get("user-agent") ?? "")) {
    return DEFAULT_LOCALE;
  }

  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const accept = requestHeaders.get("accept-language") ?? "";
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
