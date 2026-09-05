import { notFound } from "next/navigation";

import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CatalogView } from "@/components/catalog/CatalogView";
import {
  CATALOG_PAGE_SIZE,
  emptyFilters,
  queryKey,
  toQuery,
} from "@/components/catalog/filters";
import { Divider } from "@/components/ui/Divider";
import { catalog } from "@/lib/catalog";
import { categoryTitle as localizedCategoryTitle } from "@/lib/i18n/labels";
import { getLocale } from "@/lib/i18n/server";

/*
 * generateStaticParams здесь НЕТ намеренно.
 *
 * Страница читает куку локали, поэтому она серверная по запросу
 * (в сборке — ƒ Dynamic). Параметры, собранные заранее, всё равно
 * отбрасывались: предрисовки не происходит. Платой за них была попытка
 * открыть базу во время `next build` — а сборка собирает данные страниц
 * в 29 параллельных процессах. В чистом контейнере Railway базы ещё нет,
 * и все 29 бросались создавать и засевать её одновременно: один выигрывал
 * блокировку записи, остальные падали с «database is locked», и деплой
 * разваливался. Сборка не должна знать о базе вообще.
 */
export async function generateMetadata({
  params,
}: PageProps<"/catalog/[category]">) {
  const { category: slug } = await params;
  const category = await catalog().getCategoryBySlug(slug);
  const locale = await getLocale();
  if (!category) return {};

  return {
    title: localizedCategoryTitle(category, locale),
    description: category.description,
  };
}

/**
 * Раздел каталога. Отличается от /catalog только предвыбранной категорией:
 * вся логика — та же, что и на общей странице, второго каталога не заводим.
 */
export default async function CatalogCategoryPage({
  params,
}: PageProps<"/catalog/[category]">) {
  const { category: slug } = await params;
  const repository = catalog();
  const category = await repository.getCategoryBySlug(slug);
  const locale = await getLocale();
  if (!category) notFound();

  const query = toQuery(
    { ...emptyFilters, categorySlug: slug },
    [],
    CATALOG_PAGE_SIZE,
  );

  const [categories, page, facets] = await Promise.all([
    repository.listCategories(),
    repository.listProducts(query),
    repository.listFacets(query),
  ]);

  return (
    <>
      <CatalogHeader
        categoryTitle={localizedCategoryTitle(category, locale)}
        categoryTitleTg={locale === "tg" ? category.title : category.titleTg}
      />
      <Divider variant="ornament" motif="mavj" />
      <CatalogView
        categories={categories}
        initialCategory={slug}
        initial={{ key: queryKey(query), page, facets }}
      />
    </>
  );
}
