import type { Locale } from "@/types/catalog";

/* -------------------------------------------------------------------------
   Адрес сайта для поисковиков.

   Канонические адреса, карта сайта, robots.txt и превью в соцсетях должны
   указывать на адрес, по которому сайт действительно открывается. Раньше
   здесь стоял неподтверждённый домен — поисковики получали ссылки на чужой
   сайт. Теперь адрес берётся из окружения:

     SITE_URL               свой домен (https://arusdomod.shop)
     RAILWAY_PUBLIC_DOMAIN  Railway задаёт сам — адрес *.up.railway.app
     localhost              разработка

   Значение из окружения приводится к виду `https://хост`. Так сделано
   потому, что цена опечатки здесь непропорционально велика: `new URL()`
   в `layout.tsx` на строке без схемы бросает исключение, и страница
   отдаётся с кодом 200, но вообще без заголовка, описания, canonical,
   hreflang и разметки Schema.org. Поисковик видит пустую страницу, а на
   сайте всё выглядит целым — ошибку замечают через недели. Поэтому
   `arusdomod.shop`, `http://arusdomod.shop` и лишние слеши принимаются и
   чинятся, а непригодное значение отбрасывается с предупреждением.
   ------------------------------------------------------------------------- */

/** Разобранный адрес или null, если строка вообще не похожа на адрес */
function normalise(raw: string | undefined): string | null {
  const value = raw?.trim().replace(/\/+$/, "");
  if (!value) return null;

  // Без схемы — дописываем https: домен в переменной пишут именно так.
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
    ? value
    : `https://${value}`;

  try {
    const url = new URL(withScheme);
    // Разработка идёт по http, всё остальное — только по https: канонический
    // адрес по http увёл бы поисковик на редирект с каждой страницы.
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (!local) url.protocol = "https:";
    return `${url.protocol}//${url.host}`;
  } catch {
    warnOnce(value);
    return null;
  }
}

/** Предупреждение в журнал — один раз на процесс, чтобы не залить логи */
let warned = false;
function warnOnce(value: string): void {
  if (warned) return;
  warned = true;
  console.warn(
    `[seo] Значение адреса сайта не разобрано и пропущено: ${JSON.stringify(value)}. ` +
      "Ожидается вида https://arusdomod.shop",
  );
}

export function siteUrl(): string {
  return (
    normalise(process.env.SITE_URL) ??
    normalise(process.env.RAILWAY_PUBLIC_DOMAIN) ??
    "http://localhost:3000"
  );
}

/** Сайт открыт миру по https — только тогда есть смысл звать поисковики */
export const isPublicSite = (): boolean => siteUrl().startsWith("https://");

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Адрес страницы на языке. Русская версия — основной адрес без параметра,
 * таджикская и английская — тот же адрес с `?lang=`.
 */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === "ru") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}
