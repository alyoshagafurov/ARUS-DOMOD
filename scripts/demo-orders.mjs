/**
 * Уборка демо-заказов.
 *
 *   node scripts/demo-orders.mjs status  — сколько чего в базе
 *   node scripts/demo-orders.mjs clear   — удалить только демо-записи
 *
 * Создаются демо-заказы не здесь, а приложением при посеве пустой базы и
 * только при `ARUS_DEMO_ORDERS=1` (см. src/lib/orders/demo.ts). Генератор
 * живёт в одном месте: копия в скрипте разошлась бы с оригиналом на первой
 * же правке.
 *
 * Этот скрипт нужен там, где база постоянная (том на сервере, локальная
 * разработка): снять переменную мало — записи уже лежат. На Railway без
 * тома база пересоздаётся при каждой выкладке, и снятой переменной
 * достаточно.
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const DB_PATH = path.join(
  process.env.ARUS_DATA_DIR ?? path.join(process.cwd(), "data"),
  "arus.sqlite",
);

const DEMO_MARK = '%"demo":true%';

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA busy_timeout = 10000");

const all = () => db.prepare("SELECT COUNT(*) n FROM orders").get().n;
const demo = () =>
  db.prepare("SELECT COUNT(*) n FROM orders WHERE doc LIKE ?").get(DEMO_MARK).n;

const command = process.argv[2] ?? "status";

if (command === "clear") {
  const before = demo();
  db.prepare("DELETE FROM orders WHERE doc LIKE ?").run(DEMO_MARK);
  console.log(`удалено демо-заказов: ${before}; настоящих осталось: ${all()}`);
  console.log("Не забудьте снять ARUS_DEMO_ORDERS, иначе посев вернёт их.");
} else if (command === "status") {
  console.log(`всего заказов: ${all()}, из них демо: ${demo()}`);
  console.log(
    `ARUS_DEMO_ORDERS = ${process.env.ARUS_DEMO_ORDERS ?? "не задана"}`,
  );
} else {
  console.error("Команда должна быть clear или status");
  process.exit(1);
}
