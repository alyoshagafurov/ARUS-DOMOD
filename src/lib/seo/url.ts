import type { Locale } from "@/types/catalog";

/* -------------------------------------------------------------------------
   Адрес сайта для поисковиков.

   Канонические адреса, карта сайта, robots.txt и превью в соцсетях должны
   указывать на адрес, по которому сайт действительно открывается. Раньше
   здесь стоял неподтверждённый домен — поисковики получали ссылки на чужой
   сайт. Теперь адрес берётся из окружения:

     SITE_URL               свой домен, когда он появится (https://…)
     RAILWAY_PUBLIC_DOMAIN  Railway задаёт сам — адрес *.up.railway.app
     localhost              разработка
   ------------------------------------------------------------------------- */

export function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return `https://${railway.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
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
