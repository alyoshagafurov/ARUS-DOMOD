import type { MetadataRoute } from "next";

import { catalog } from "@/lib/catalog";
import { site } from "@/lib/config/site";

/**
 * Карта сайта — из базы, а не из списка руками: новый товар или раздел из
 * админки попадает сюда сам. Служебные маршруты (корзина, оформление,
 * избранное, админка) не включаются — им нечего индексировать.
 */
/**
 * Карта строится по запросу, а не при сборке.
 *
 * В чистом контейнере базы во время `next build` ещё нет, и статическая
 * карта засеяла бы её демо-данными прямо в образ. По запросу она всегда
 * отражает настоящий каталог; кэш на час снимает нагрузку с диска.
 */
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = catalog();
  const [products, categories] = await Promise.all([
    repo.listProducts({ pageSize: 1000 }),
    repo.listCategories(),
  ]);
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const fixed: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/catalog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/rental`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/delivery`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/contacts`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return [
    ...fixed,
    ...categories.map((c) => ({
      url: `${base}/catalog/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.items.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
