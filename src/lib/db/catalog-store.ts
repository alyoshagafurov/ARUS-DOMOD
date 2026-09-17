import type { CatalogData } from "@/lib/catalog/engine";
import { getDb } from "@/lib/db/sqlite";
import type {
  Category,
  Collection,
  Discount,
  Product,
} from "@/types/catalog";

/**
 * Каталог из базы — с кэшем на процесс.
 *
 * Витрина читает каталог на каждый запрос, а меняется он редко и только из
 * админки. Поэтому снимок собирается один раз и живёт до первой записи:
 * любая мутация ниже сбрасывает его, и следующий читатель получает свежие
 * данные. Никакого TTL — устаревание выводится из факта записи, а не из
 * таймера, который надо не забыть.
 *
 * Кэши лежат в globalThis, а не в переменных модуля. Next собирает
 * страницы с серверными действиями и route handlers (/api/catalog,
 * /api/orders) в разные бандлы, и у каждого своя копия модуля: переменная
 * сбрасывалась только там, где прошла запись. Так и случилось — админка
 * сохранила скидку, витрина её показала, а приём заказа читал старый
 * снимок и взял с покупателя полную цену. Соединение с базой по той же
 * причине уже живёт в globalThis (sqlite.ts).
 */
declare global {
  var __arusCatalogCache: CatalogData | null | undefined;
  var __arusDiscountCache: Discount[] | null | undefined;
}

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
  if (globalThis.__arusCatalogCache) return globalThis.__arusCatalogCache;
  const db = getDb();
  const snapshot: CatalogData = {
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
  globalThis.__arusCatalogCache = snapshot;
  return snapshot;
}

export function invalidateCatalog(): void {
  globalThis.__arusCatalogCache = null;
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

/* ---------- Скидки ------------------------------------------------------- */

/**
 * Скидки кэшируются так же, как каталог: до первой записи. Сниженные цены
 * из них считаются на каждое чтение (`applySales`), поэтому кэш не мешает
 * скидке начаться и закончиться вовремя.
 */
export function readDiscounts(): Discount[] {
  if (globalThis.__arusDiscountCache) return globalThis.__arusDiscountCache;
  const discounts = parseAll<Discount>(
    getDb()
      .prepare("SELECT doc FROM discounts ORDER BY starts_at DESC")
      .all() as Row[],
  );
  globalThis.__arusDiscountCache = discounts;
  return discounts;
}

export const getDiscount = (id: string): Discount | null =>
  readDiscounts().find((d) => d.id === id) ?? null;

export function saveDiscount(discount: Discount): void {
  getDb()
    .prepare(
      `INSERT INTO discounts (id, starts_at, ends_at, doc) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET starts_at = excluded.starts_at,
         ends_at = excluded.ends_at, doc = excluded.doc`,
    )
    .run(
      discount.id,
      discount.startsAt,
      discount.endsAt,
      JSON.stringify(discount),
    );
  globalThis.__arusDiscountCache = null;
}

export function removeDiscount(id: string): void {
  getDb().prepare("DELETE FROM discounts WHERE id = ?").run(id);
  globalThis.__arusDiscountCache = null;
}

/* ---------- Витрина ------------------------------------------------------ */

export function setFeaturedSlugs(slugs: string[]): void {
  getDb()
    .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
    .run("featuredSlugs", JSON.stringify(slugs));
  invalidateCatalog();
}
