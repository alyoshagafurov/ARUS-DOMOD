"use client";

import type { CatalogRepository } from "@/lib/catalog/repository";
import type {
  CatalogFacets,
  CatalogQuery,
  Category,
  Collection,
  Paginated,
  Product,
} from "@/types/catalog";

/**
 * Клиентская дверь в каталог — тот же контракт, что на сервере, но поверх
 * HTTP. В браузере базы нет, поэтому каждая операция уходит в
 * /api/catalog/<op>, а сервер отвечает из SQLite через ту же реализацию.
 *
 * Запрос передаётся одним JSON-параметром: у CatalogQuery есть массивы
 * (размеры, цвета, наличие), и раскладывать их по query-string было бы
 * хрупче, чем сериализовать целиком.
 */
async function call<T>(op: string, query?: unknown): Promise<T> {
  const url = new URL(`/api/catalog/${op}`, window.location.origin);
  if (query !== undefined) url.searchParams.set("q", JSON.stringify(query));
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Каталог: ${op} ответил ${response.status}`);
  }
  return (await response.json()) as T;
}

const apiCatalogRepository: CatalogRepository = {
  listProducts: (query: CatalogQuery = {}) =>
    call<Paginated<Product>>("products", query),
  listFacets: (query: CatalogQuery = {}) =>
    call<CatalogFacets>("facets", query),
  getProductBySlug: (slug: string) =>
    call<Product | null>(`product/${encodeURIComponent(slug)}`),
  listCategories: () => call<Category[]>("categories"),
  getCategoryBySlug: (slug: string) =>
    call<Category | null>(`category/${encodeURIComponent(slug)}`),
  listCollections: () => call<Collection[]>("collections"),
  listFeatured: () => call<Product[]>("featured"),
};

export const catalog = (): CatalogRepository => apiCatalogRepository;
