import type { MetadataRoute } from "next";

import { catalog } from "@/lib/catalog";
import { catalogUpdatedAt } from "@/lib/db/catalog-store";
import { LOCALES } from "@/lib/i18n/locales";
import { absoluteUrl, localizedPath } from "@/lib/seo/url";

/**
 * Карта сайта — из базы, а не из списка руками: новый товар или раздел из
 * админки попадает сюда сам. Служебные маршруты (корзина, оформление,
 * избранное, админка) не включаются — им нечего индексировать.
 *
 * Каждая страница записана на трёх языках (`?lang=tg`, `?lang=en`) со
 * ссылками друг на друга: Google берёт связь языков из hreflang, а Яндекс
 * и Bing просто находят таджикские и английские адреса. К товарам
 * приложены их кадры — так фото попадают в поиск по картинкам.
 *
 * Карта строится по запросу, а не при сборке: в чистом контейнере базы во
 * время `next build` ещё нет. Кэш на час снимает нагрузку с диска.
 */
export const dynamic = "force-dynamic";
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

function localized(
  path: string,
  priority: number,
  changeFrequency: Entry["changeFrequency"],
  images?: string[],
  lastModified?: Date,
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((locale) => [locale, absoluteUrl(localizedPath(path, locale))]),
  );
  // Тот же x-default, что стоит в <head>: наборы языков в двух местах
  // должны описывать страницу одинаково
  languages["x-default"] = absoluteUrl(path);
  return LOCALES.map((locale) => ({
    url: absoluteUrl(localizedPath(path, locale)),
    ...(lastModified ? { lastModified } : null),
    changeFrequency,
    // Русская версия основная — остальным чуть меньший приоритет
    priority: locale === "ru" ? priority : Math.round(priority * 8) / 10,
    alternates: { languages },
    ...(images?.length ? { images } : null),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = catalog();
  const [products, categories] = await Promise.all([
    repo.listProducts({ pageSize: 1000 }),
    repo.listCategories(),
  ]);

  // Настоящее время правки каталога, а не время запроса
  const changed = catalogUpdatedAt();

  // Раздел без образов в карту не идёт: его страница честно говорит, что
  // ничего не нашлось, и вести на неё поисковик незачем. Появится товар —
  // раздел вернётся сам, карта собирается по запросу.
  const filled = new Set(products.items.map((p) => p.categorySlug));

  return [
    ...localized("/", 1, "weekly", undefined, changed),
    ...localized("/catalog", 0.9, "daily", undefined, changed),
    ...categories
      .filter((c) => filled.has(c.slug))
      .flatMap((c) =>
        localized(`/catalog/${c.slug}`, 0.8, "weekly", undefined, changed),
      ),
    ...products.items.flatMap((p) =>
      localized(
        `/product/${p.slug}`,
        0.8,
        "weekly",
        p.images.map((image) => absoluteUrl(image.url)),
        changed,
      ),
    ),
    ...localized("/rental", 0.7, "monthly"),
    ...localized("/delivery", 0.6, "monthly"),
    ...localized("/about", 0.6, "monthly"),
    ...localized("/contacts", 0.6, "monthly"),
  ];
}
