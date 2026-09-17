import type { MetadataRoute } from "next";

import { catalog } from "@/lib/catalog";
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
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [locale, absoluteUrl(localizedPath(path, locale))]),
  );
  const lastModified = new Date();
  return LOCALES.map((locale) => ({
    url: absoluteUrl(localizedPath(path, locale)),
    lastModified,
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

  return [
    ...localized("/", 1, "weekly"),
    ...localized("/catalog", 0.9, "daily"),
    ...categories.flatMap((c) => localized(`/catalog/${c.slug}`, 0.8, "weekly")),
    ...products.items.flatMap((p) =>
      localized(
        `/product/${p.slug}`,
        0.8,
        "weekly",
        p.images.map((image) => absoluteUrl(image.url)),
      ),
    ),
    ...localized("/rental", 0.7, "monthly"),
    ...localized("/delivery", 0.6, "monthly"),
    ...localized("/about", 0.6, "monthly"),
    ...localized("/contacts", 0.6, "monthly"),
  ];
}
