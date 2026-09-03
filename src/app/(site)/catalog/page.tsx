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
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.meta.catalog, description: t.meta.catalogDescription };
}

/**
 * Каталог целиком.
 *
 * Первая выдача считается на сервере и уезжает в разметку: страница
 * открывается с товарами, а не со скелетом. Дальше состоянием управляет
 * CatalogView, но ключ первого запроса совпадает с тем, что он посчитает
 * сам, поэтому лишнего перезапроса на старте не происходит.
 */
export default async function CatalogPage({
  searchParams,
}: PageProps<"/catalog">) {
  const params = await searchParams;
  const rawQuery = params.q;
  const search = typeof rawQuery === "string" ? rawQuery : "";

  const repository = catalog();
  const query = toQuery({ ...emptyFilters, search }, [], CATALOG_PAGE_SIZE);

  const [categories, page, facets] = await Promise.all([
    repository.listCategories(),
    repository.listProducts(query),
    repository.listFacets(query),
  ]);

  return (
    <>
      <CatalogHeader />
      <Divider variant="ornament" motif="mavj" />
      <CatalogView
        categories={categories}
        initialSearch={search || undefined}
        initial={{ key: queryKey(query), page, facets }}
      />
    </>
  );
}
