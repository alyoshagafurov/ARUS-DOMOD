import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { CatalogView } from "@/components/catalog/CatalogView";
import {
  CATALOG_PAGE_SIZE,
  emptyFilters,
  queryKey,
  toQuery,
} from "@/components/catalog/filters";
import { JsonLd } from "@/components/seo/JsonLd";
import { Divider } from "@/components/ui/Divider";
import { catalog } from "@/lib/catalog";
import { getLocale } from "@/lib/i18n/server";
import { seoCopy } from "@/lib/seo/copy";
import { seoMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionSchema, graph } from "@/lib/seo/schema";

export async function generateMetadata({ searchParams }: PageProps<"/catalog">) {
  const { q } = await searchParams;
  const { catalog: copy } = seoCopy[await getLocale()];
  return seoMetadata({
    path: "/catalog",
    title: copy.title,
    description: copy.description,
    // Выдача поиска в индекс не идёт: иначе каждое слово стало бы
    // отдельной «страницей» с тем же каталогом
    noindex: typeof q === "string" && q.length > 0,
  });
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

  const [categories, page, facets, all, locale] = await Promise.all([
    repository.listCategories(),
    repository.listProducts(query),
    repository.listFacets(query),
    repository.listProducts({ pageSize: 1000 }),
    getLocale(),
  ]);
  const copy = seoCopy[locale];

  return (
    <>
      {/* Полный список образов — для поисковиков и ИИ-ботов: на экране
          первая страница, остальное подгружается кнопкой, а бот кнопок
          не нажимает */}
      <JsonLd
        data={graph(
          breadcrumbSchema(
            [
              { name: copy.breadcrumbs.home, path: "/" },
              { name: copy.breadcrumbs.catalog, path: "/catalog" },
            ],
            locale,
          ),
          collectionSchema({
            name: copy.catalog.title,
            description: copy.catalog.description,
            path: "/catalog",
            products: all.items,
            locale,
          }),
        )}
      />
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
