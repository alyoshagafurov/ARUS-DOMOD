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

/** Разделы известны заранее — маршруты можно отрисовать при сборке */
export async function generateStaticParams() {
  const categories = await catalog().listCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/catalog/[category]">) {
  const { category: slug } = await params;
  const category = await catalog().getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.title,
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
        categoryTitle={category.title}
        categoryTitleTg={category.titleTg}
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
