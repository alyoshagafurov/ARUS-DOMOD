import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import {
  categories as seedCategories,
  collections as seedCollections,
  featuredSlugs as seedFeatured,
  products as seedProducts,
} from "@/lib/catalog/mock-data";

/**
 * База ARUS DOMOD — SQLite через встроенный node:sqlite (Node 22.5+).
 *
 * Почему так, а не Postgres и не ORM:
 *
 * - ни одной зависимости: проект держит состав пакетов ровно таким, каким его
 *   создаёт create-next-app, и база это правило не нарушает;
 * - один магазин, один администратор, сотни товаров — SQLite здесь не
 *   компромисс, а правильный размер инструмента;
 * - файл лежит в data/ рядом с проектом, переезжает копированием, бэкапится
 *   копированием.
 *
 * Чего SQLite-файл НЕ умеет: жить на serverless-хостинге с файловой системой
 * только для чтения (Vercel, Netlify). Там нужен внешний Postgres — и вся
 * замена сводится к другой реализации CatalogRepository и OrderStore, шов
 * между UI и данными для этого и существует.
 *
 * Товары и категории хранятся JSON-документами: их форма меняется вместе с
 * админкой, и держать её в колонках значило бы писать миграцию на каждое
 * новое поле. Выборки идут через движок каталога в памяти — набор данных
 * бутика на это рассчитан. Заказы, напротив, разложены по колонкам там, где
 * по ним ищут: номер, статус, дата.
 */
const DATA_DIR = process.env.ARUS_DATA_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "arus.sqlite");

declare global {
  // Один дескриптор на процесс: dev-сервер перезагружает модули при правке,
  // и без глобального хранилища открывал бы базу заново на каждую правку.
  var __arusDb: DatabaseSync | undefined;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS categories (
    id   TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    sort INTEGER NOT NULL,
    doc  TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id   TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    sort INTEGER NOT NULL,
    doc  TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id         TEXT PRIMARY KEY,
    number     INTEGER NOT NULL UNIQUE,
    status     TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    doc        TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS orders_created ON orders (created_at DESC);
  CREATE INDEX IF NOT EXISTS orders_status  ON orders (status);
`;

/**
 * Первичное наполнение — демонстрационные данные из mock-data.ts. Идёт один
 * раз, пока таблица товаров пуста; дальше источником правды становится база,
 * и правки из админки переживают перезапуск.
 */
function seed(db: DatabaseSync): void {
  const count = db.prepare("SELECT COUNT(*) AS n FROM products").get() as {
    n: number;
  };
  if (count.n > 0) return;

  const insCat = db.prepare(
    "INSERT INTO categories (id, slug, sort, doc) VALUES (?, ?, ?, ?)",
  );
  const insProd = db.prepare(
    "INSERT INTO products (id, slug, sort, doc) VALUES (?, ?, ?, ?)",
  );
  const insSetting = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
  );

  db.exec("BEGIN");
  try {
    for (const c of seedCategories) {
      insCat.run(c.id, c.slug, c.order, JSON.stringify(c));
    }
    seedProducts.forEach((p, i) => {
      insProd.run(p.id, p.slug, i, JSON.stringify(p));
    });
    insSetting.run("collections", JSON.stringify(seedCollections));
    insSetting.run("featuredSlugs", JSON.stringify(seedFeatured));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getDb(): DatabaseSync {
  if (globalThis.__arusDb) return globalThis.__arusDb;

  mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  // WAL: читатели не ждут писателя — витрина не замирает, пока админ сохраняет
  db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 3000;");
  db.exec(SCHEMA);
  seed(db);

  globalThis.__arusDb = db;
  return db;
}

export const nowIso = (): string => new Date().toISOString();
