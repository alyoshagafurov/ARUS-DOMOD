import { JsonLd } from "@/components/seo/JsonLd";
import { seoCopy } from "@/lib/seo/copy";
import { productPageCopy } from "@/lib/seo/metadata";
import { breadcrumbSchema, graph, productSchema } from "@/lib/seo/schema";
import type { Locale, Product } from "@/types/catalog";

/**
 * Разметка страницы образа: товар с ценами покупки и проката и хлебные
 * крошки «Главная → Каталог → Раздел → Образ». Только то, что есть в
 * данных. Никаких рейтингов и отзывов: их нет, а выдуманные — нарушение
 * правил поиска.
 */
export function ProductJsonLd({
  product,
  category,
  locale,
}: {
  product: Product;
  /** Раздел с подписью на языке страницы */
  category?: { slug: string; title: string };
  locale: Locale;
}) {
  const path = `/product/${product.slug}`;
  const { breadcrumbs } = seoCopy[locale];
  const page = productPageCopy(product, category?.title, locale);

  return (
    <JsonLd
      data={graph(
        breadcrumbSchema([
          { name: breadcrumbs.home, path: "/" },
          { name: breadcrumbs.catalog, path: "/catalog" },
          ...(category
            ? [{ name: category.title, path: `/catalog/${category.slug}` }]
            : []),
          { name: product.title, path },
        ]),
        productSchema({
          product,
          category: category?.title,
          path,
          description: page.description,
        }),
      )}
    />
  );
}
