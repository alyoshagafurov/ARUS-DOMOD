import {
  categories,
  collections,
  featuredSlugs,
  products,
} from "@/lib/catalog/mock-data";
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
import type { CatalogRepository } from "@/lib/catalog/repository";

const DEFAULT_PAGE_SIZE = 12;

const categoryTitle = new Map(categories.map((c) => [c.slug, c.title]));

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

function availabilityOf(product: Product): Availability[] {
  return [...new Set(product.variants.map((variant) => variant.availability))];
}

/**
 * Поиск идёт по названию, имени категории и артикулу.
 * Артикул нужен для примерочной: сотрудник ищет вещь по бирке, а не по имени.
 */
function searchIndex(product: Product): string {
  return [
    product.title,
    product.subtitle ?? "",
    categoryTitle.get(product.categorySlug) ?? "",
    ...product.variants.map((variant) => variant.sku),
  ]
    .join(" ")
    .toLocaleLowerCase("ru");
}

type Predicate = (product: Product) => boolean;

/**
 * Каждый фильтр — отдельный предикат под своим ключом. Это нужно фасетам:
 * чтобы посчитать варианты одной грани, её предикат из набора выбрасывается.
 */
function predicates(query: CatalogQuery): Record<string, Predicate> {
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
    rules.search = (p) => searchIndex(p).includes(needle);
  }

  return rules;
}

function apply(query: CatalogQuery, except?: string): Product[] {
  const rules = predicates(query);
  if (except) delete rules[except];
  const checks = Object.values(rules);
  return products.filter((product) => checks.every((check) => check(product)));
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

function tally<T>(items: Product[], pick: (p: Product) => T[]): FacetValue<T>[] {
  const counts = new Map<T, number>();
  for (const product of items) {
    for (const value of new Set(pick(product))) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts].map(([value, count]) => ({ value, count }));
}

/**
 * Демо-реализация каталога поверх статических массивов.
 *
 * Фильтрация, сортировка, фасеты и пагинация сделаны здесь настоящими, хотя
 * данных мало: когда придёт реальный API, поведение витрины не изменится,
 * потому что страницы уже сегодня получают ровно тот же контракт.
 */
export const mockCatalogRepository: CatalogRepository = {
  async listProducts(query = {}): Promise<Paginated<Product>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
    const matched = sorted(apply(query), query.sort);
    const start = (page - 1) * pageSize;

    return {
      items: matched.slice(start, start + pageSize),
      total: matched.length,
      page,
      pageSize,
    };
  },

  async listFacets(query = {}): Promise<CatalogFacets> {
    const byCategory = apply(query, "category");
    const byOfferKind = apply(query, "offerKind");
    const bySizes = apply(query, "sizes");
    const byAvailability = apply(query, "availability");
    const byPrice = apply(query, "price").map(priceOf).filter((v) => v > 0);

    const order = new Map(categories.map((c, i) => [c.slug, i]));
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
      price: byPrice.length
        ? { min: Math.min(...byPrice), max: Math.max(...byPrice) }
        : null,
    };
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) ?? null;
  },

  async listCategories(): Promise<Category[]> {
    return [...categories].sort((a, b) => a.order - b.order);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return categories.find((c) => c.slug === slug) ?? null;
  },

  async listCollections(): Promise<Collection[]> {
    return collections;
  },

  async listFeatured(): Promise<Product[]> {
    return featuredSlugs
      .map((slug) => products.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p));
  },
};
