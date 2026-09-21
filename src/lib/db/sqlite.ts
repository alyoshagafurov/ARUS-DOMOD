import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import {
  categories as seedCategories,
  collections as seedCollections,
  featuredSlugs as seedFeatured,
  products as seedProducts,
} from "@/lib/catalog/mock-data";
import { dataDir } from "@/lib/db/data-dir";

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
// Каталог данных — на томе Railway, если он есть: см. data-dir.ts
const DATA_DIR = dataDir();
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
  CREATE TABLE IF NOT EXISTS discounts (
    id        TEXT PRIMARY KEY,
    starts_at TEXT NOT NULL,
    ends_at   TEXT NOT NULL,
    doc       TEXT NOT NULL
  );
`;

/** Заглушка, которой прежние версии засевали описание каждого образа */
const DEMO_DESCRIPTION =
  "Демонстрационная карточка. Описание образа, состав и происхождение " +
  "заполняются вместе с данными бренда.";

/**
 * Уборка демо-данных прежних версий: выдуманные заказы с клиентами,
 * демо-скидки и заглушка в описании товаров. Сами товары, цены и кадры
 * остаются — их владелец правит в админке.
 *
 * Идёт при каждом запуске: на чистой базе ничего не находит, а на базе,
 * засеянной раньше (том на Railway, локальный data/), убирает демо без
 * ручных скриптов.
 *
 * Отметка ищется через json_extract, а не `LIKE '%"demo":true%'`: такую
 * подстроку мог бы содержать комментарий покупателя, и настоящий заказ
 * ушёл бы вместе с выдуманными.
 */
function purgeDemoData(db: DatabaseSync): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("DELETE FROM orders WHERE json_extract(doc, '$.demo') = 1").run();
    db.prepare(
      "DELETE FROM discounts WHERE json_extract(doc, '$.demo') = 1",
    ).run();
    db.prepare(
      `UPDATE products SET doc = json_remove(doc, '$.description')
       WHERE json_extract(doc, '$.description') = ?`,
    ).run(DEMO_DESCRIPTION);
    db.prepare("DELETE FROM settings WHERE key = 'demoDiscountsSeeded'").run();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/**
 * Первичное наполнение — демонстрационные данные из mock-data.ts. Идёт один
 * раз, пока таблица товаров пуста; дальше источником правды становится база,
 * и правки из админки переживают перезапуск.
 */
function seed(db: DatabaseSync): void {
  /*
   * BEGIN IMMEDIATE берёт блокировку записи сразу, поэтому проверка «база
   * уже засеяна» и сами вставки происходят под одной блокировкой. Обычный
   * BEGIN этого не даёт: два процесса успели бы прочитать нулевой счётчик
   * и оба пошли бы вставлять — второй упал бы на UNIQUE. Проигравший здесь
   * просто ждёт busy_timeout, затем видит непустую таблицу и выходит.
   */
  db.exec("BEGIN IMMEDIATE");
  const count = db.prepare("SELECT COUNT(*) AS n FROM products").get() as {
    n: number;
  };
  if (count.n > 0) {
    db.exec("COMMIT");
    return;
  }

  const insCat = db.prepare(
    "INSERT INTO categories (id, slug, sort, doc) VALUES (?, ?, ?, ?)",
  );
  const insProd = db.prepare(
    "INSERT INTO products (id, slug, sort, doc) VALUES (?, ?, ?, ?)",
  );
  const insSetting = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
  );

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

  /*
   * busy_timeout выставляется ПЕРВЫМ и отдельным вызовом — до любой записи.
   *
   * `PRAGMA journal_mode = WAL` сам по себе пишет в заголовок базы. Раньше
   * он стоял в одном exec с busy_timeout, то есть таймаут к моменту записи
   * ещё не действовал: процесс, не выигравший гонку за блокировку, падал
   * мгновенно с SQLITE_BUSY вместо того, чтобы подождать. Именно так
   * разваливалась сборка на Railway: `next build` собирает данные страниц
   * в 29 параллельных процессах, база в чистом контейнере отсутствует, и
   * все 29 одновременно бросались её создавать.
   */
  db.exec("PRAGMA busy_timeout = 10000");
  // WAL: читатели не ждут писателя — витрина не замирает, пока админ сохраняет
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(SCHEMA);
  seed(db);
  purgeDemoData(db);

  globalThis.__arusDb = db;
  return db;
}

export const nowIso = (): string => new Date().toISOString();
