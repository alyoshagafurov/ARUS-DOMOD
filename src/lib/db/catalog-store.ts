import type { CatalogData } from "@/lib/catalog/engine";
import { getDb } from "@/lib/db/sqlite";
import type { Category, Collection, Product } from "@/types/catalog";

/**
 * Каталог из базы — с кэшем на процесс.
 *
 * Витрина читает каталог на каждый запрос, а меняется он редко и только из
 * админки. Поэтому снимок собирается один раз и живёт до первой записи:
 * любая мутация ниже сбрасывает его, и следующий читатель получает свежие
 * данные. Никакого TTL — устаревание выводится из факта записи, а не из
 * таймера, который надо не забыть.
 */
let cache: CatalogData | null = null;

type Row = { doc: string };

function parseAll<T>(rows: Row[]): T[] {
  return rows.map((row) => JSON.parse(row.doc) as T);
}

function setting<T>(key: string, fallback: T): T {
  const row = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row ? (JSON.parse(row.value) as T) : fallback;
}

export function readCatalog(): CatalogData {
  if (cache) return cache;
  const db = getDb();
  cache = {
    products: parseAll<Product>(
      db.prepare("SELECT doc FROM products ORDER BY sort, slug").all() as Row[],
    ),
    categories: parseAll<Category>(
      db
        .prepare("SELECT doc FROM categories ORDER BY sort, slug")
        .all() as Row[],
    ),
    collections: setting<Collection[]>("collections", []),
    featuredSlugs: setting<string[]>("featuredSlugs", []),
  };
  return cache;
}

export function invalidateCatalog(): void {
  cache = null;
}

/* ---------- Товары ------------------------------------------------------- */

export function saveProduct(product: Product): void {
  const db = getDb();
  const existing = db
    .prepare("SELECT sort FROM products WHERE id = ?")
    .get(product.id) as { sort: number } | undefined;
  const sort =
    existing?.sort ??
    ((
      db.prepare("SELECT MAX(sort) AS m FROM products").get() as {
        m: number | null;
      }
    ).m ?? -1) + 1;

  db.prepare(
    `INSERT INTO products (id, slug, sort, doc) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET slug = excluded.slug, doc = excluded.doc`,
  ).run(product.id, product.slug, sort, JSON.stringify(product));
  invalidateCatalog();
}

export function removeProduct(id: string): void {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
  invalidateCatalog();
}

/* ---------- Категории ---------------------------------------------------- */

export function saveCategory(category: Category): void {
  getDb()
    .prepare(
      `INSERT INTO categories (id, slug, sort, doc) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET slug = excluded.slug, sort = excluded.sort, doc = excluded.doc`,
    )
    .run(category.id, category.slug, category.order, JSON.stringify(category));
  invalidateCatalog();
}

export function removeCategory(id: string): void {
  getDb().prepare("DELETE FROM categories WHERE id = ?").run(id);
  invalidateCatalog();
}

/* ---------- Витрина ------------------------------------------------------ */

export function setFeaturedSlugs(slugs: string[]): void {
  getDb()
    .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
    .run("featuredSlugs", JSON.stringify(slugs));
  invalidateCatalog();
}
