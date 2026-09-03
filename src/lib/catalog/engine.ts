import type { CatalogRepository } from "@/lib/catalog/repository";
import { getPrimaryOffer } from "@/lib/format";
import type {
  Availability,
  CatalogFacets,
  CatalogQuery,
  Category,
  Collection,
  FacetValue,
  OfferKind,
  Paginated,
  Product,
} from "@/types/catalog";

/**
 * Снимок данных каталога, над которым работает движок.
 *
 * Движок намеренно ничего не знает об источнике: демо-массивы и база дают
 * ему одну и ту же структуру, и фильтры, фасеты, сортировка и пагинация
 * считаются одним кодом. Так переход на базу не смог изменить поведение
 * витрины — оно не переписывалось.
 */
export interface CatalogData {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  /** Порядок витрины на главной — задан редакцией, а не сортировкой */
  featuredSlugs: string[];
}

const DEFAULT_PAGE_SIZE = 12;

function priceOf(product: Product): number {
  return getPrimaryOffer(product)?.price.amount ?? 0;
}

function sizesOf(product: Product): string[] {
  return [
    ...new Set(
      product.variants
        .map((variant) => variant.size)
        .filter((size): size is string => Boolean(size)),
    ),
  ];
}

function colorsOf(product: Product): string[] {
  return [
    ...new Set(
      product.variants
        .map((variant) => variant.colorName)
        .filter((color): color is string => Boolean(color)),
    ),
  ];
}

function availabilityOf(product: Product): Availability[] {
  return [...new Set(product.variants.map((variant) => variant.availability))];
}

type Predicate = (product: Product) => boolean;

function tally<T>(
  items: Product[],
  pick: (p: Product) => T[],
): FacetValue<T>[] {
  const counts = new Map<T, number>();
  for (const product of items) {
    for (const value of new Set(pick(product))) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts].map(([value, count]) => ({ value, count }));
}

function sorted(items: Product[], sort: CatalogQuery["sort"]): Product[] {
  switch (sort) {
    case "price_asc":
      return [...items].sort((a, b) => priceOf(a) - priceOf(b));
    case "price_desc":
      return [...items].sort((a, b) => priceOf(b) - priceOf(a));
    case "newest":
      return [...items].reverse();
    default:
      return items;
  }
}

/**
 * Собирает репозиторий каталога поверх функции-источника.
 *
 * `source` вызывается на каждый запрос: у базы это дешёвое чтение кэша,
 * который сбрасывается при записи из админки, поэтому витрина видит правку
 * сразу, без перезапуска.
 */
export function createCatalogRepository(
  source: () => CatalogData,
): CatalogRepository {
  /**
   * Поиск идёт по названию, артикулу, имени категории и артикулам вариантов.
   * Артикул нужен для примерочной: сотрудник ищет вещь по бирке, а не по имени.
   */
  const searchIndex = (product: Product, categoryTitle: Map<string, string>) =>
    [
      product.title,
      product.subtitle ?? "",
      product.article ?? "",
      categoryTitle.get(product.categorySlug) ?? "",
      ...product.variants.map((variant) => variant.sku),
    ]
      .join(" ")
      .toLocaleLowerCase("ru");

  /**
   * Каждый фильтр — отдельный предикат под своим ключом. Это нужно фасетам:
   * чтобы посчитать варианты одной грани, её предикат из набора выбрасывается.
   */
  const predicates = (
    query: CatalogQuery,
    categoryTitle: Map<string, string>,
  ): Record<string, Predicate> => {
    const rules: Record<string, Predicate> = {};

    if (query.categorySlug) {
      const slug = query.categorySlug;
      rules.category = (p) => p.categorySlug === slug;
    }
    if (query.collectionSlug) {
      const slug = query.collectionSlug;
      rules.collection = (p) => p.collectionSlug === slug;
    }
    if (query.offerKind) {
      const kind = query.offerKind;
      rules.offerKind = (p) => p.offers.some((offer) => offer.kind === kind);
    }
    if (query.sizes?.length) {
      const wanted = new Set(query.sizes);
      rules.sizes = (p) => sizesOf(p).some((size) => wanted.has(size));
    }
    if (query.colors?.length) {
      const wanted = new Set(query.colors);
      rules.colors = (p) => colorsOf(p).some((color) => wanted.has(color));
    }
    if (query.availability?.length) {
      const wanted = new Set(query.availability);
      rules.availability = (p) =>
        availabilityOf(p).some((value) => wanted.has(value));
    }
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      const min = query.priceMin ?? Number.NEGATIVE_INFINITY;
      const max = query.priceMax ?? Number.POSITIVE_INFINITY;
      rules.price = (p) => priceOf(p) >= min && priceOf(p) <= max;
    }
    if (query.search?.trim()) {
      const needle = query.search.trim().toLocaleLowerCase("ru");
      rules.search = (p) => searchIndex(p, categoryTitle).includes(needle);
    }

    return rules;
  };

  const apply = (data: CatalogData, query: CatalogQuery, except?: string) => {
    const categoryTitle = new Map(
      data.categories.map((c) => [c.slug, c.title]),
    );
    const rules = predicates(query, categoryTitle);
    if (except) delete rules[except];
    const checks = Object.values(rules);
    return data.products.filter((product) =>
      checks.every((check) => check(product)),
    );
  };

  return {
    async listProducts(query = {}): Promise<Paginated<Product>> {
      const data = source();
      const page = Math.max(1, query.page ?? 1);
      const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
      const matched = sorted(apply(data, query), query.sort);
      const start = (page - 1) * pageSize;

      return {
        items: matched.slice(start, start + pageSize),
        total: matched.length,
        page,
        pageSize,
      };
    },

    async listFacets(query = {}): Promise<CatalogFacets> {
      const data = source();
      const byCategory = apply(data, query, "category");
      const byOfferKind = apply(data, query, "offerKind");
      const bySizes = apply(data, query, "sizes");
      const byColors = apply(data, query, "colors");
      const byAvailability = apply(data, query, "availability");
      const byPrice = apply(data, query, "price")
        .map(priceOf)
        .filter((v) => v > 0);

      const order = new Map(data.categories.map((c, i) => [c.slug, i]));
      const kinds: OfferKind[] = ["purchase", "rental"];

      return {
        categories: tally(byCategory, (p) => [p.categorySlug]).sort(
          (a, b) => (order.get(a.value) ?? 99) - (order.get(b.value) ?? 99),
        ),
        offerKinds: tally(byOfferKind, (p) =>
          p.offers.map((offer) => offer.kind),
        ).sort((a, b) => kinds.indexOf(a.value) - kinds.indexOf(b.value)),
        availability: tally(byAvailability, availabilityOf),
        sizes: tally(bySizes, sizesOf).sort(
          (a, b) => Number(a.value) - Number(b.value),
        ),
        colors: tally(byColors, colorsOf).sort((a, b) =>
          a.value.localeCompare(b.value, "ru"),
        ),
        price: byPrice.length
          ? { min: Math.min(...byPrice), max: Math.max(...byPrice) }
          : null,
      };
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
      return source().products.find((p) => p.slug === slug) ?? null;
    },

    async listCategories(): Promise<Category[]> {
      return [...source().categories].sort((a, b) => a.order - b.order);
    },

    async getCategoryBySlug(slug: string): Promise<Category | null> {
      return source().categories.find((c) => c.slug === slug) ?? null;
    },

    async listCollections(): Promise<Collection[]> {
      return source().collections;
    },

    async listFeatured(): Promise<Product[]> {
      const { products, featuredSlugs } = source();
      return featuredSlugs
        .map((slug) => products.find((p) => p.slug === slug))
        .filter((p): p is Product => Boolean(p));
    },
  };
}
