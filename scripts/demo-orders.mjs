/**
 * Демо-заказы для предпросмотра админки.
 *
 *   node scripts/demo-orders.mjs add     — засеять месяц заказов
 *   node scripts/demo-orders.mjs clear   — удалить только демо-записи
 *   node scripts/demo-orders.mjs status  — сколько чего в базе
 *
 * ПОЧЕМУ ЭТО СКРИПТ, А НЕ КОД ПРИЛОЖЕНИЯ.
 *
 * Демо-заказы — самая опасная разновидность тестовых данных: владелец
 * магазина видит в панели имена, суммы и статусы и не может отличить их от
 * настоящих. Если бы посев жил в приложении, любая выкладка на пустую базу
 * насыпала бы туда выдуманных клиентов. Вне `src/` этого не случится: сборка
 * о файле не знает, а запускают его руками и осознанно.
 *
 * Каждая запись помечена `demo: true`, и `clear` удаляет строго их —
 * настоящие заказы остаются на месте. Номера идут ПОСЛЕ последнего
 * настоящего, поэтому нумерация не сталкивается.
 *
 * Товары, цены и размеры берутся из реального каталога в базе: строка
 * заказа обязана быть снимком существующей позиции, иначе админка покажет
 * товар, которого нет.
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const DB_PATH = path.join(
  process.env.ARUS_DATA_DIR ?? path.join(process.cwd(), "data"),
  "arus.sqlite",
);

/* Имена таджикские и русские, как у покупателей дома. Телефоны построены по
   одному шаблону и заведомо не живые: набрать такой и попасть на
   постороннего человека нельзя. */
const PEOPLE = [
  ["Нилуфар Ҷалилова", "+992 90 000 10 11"],
  ["Мадина Раҳимова", "+992 90 000 10 12"],
  ["Зарина Каримова", "+992 90 000 10 13"],
  ["Фарзона Назарова", "+992 90 000 10 14"],
  ["Саида Юсупова", "+992 90 000 10 15"],
  ["Гулнора Шарипова", "+992 90 000 10 16"],
  ["Дилноза Ҳакимова", "+992 90 000 10 17"],
  ["Мохира Сафарова", "+992 90 000 10 18"],
  ["Анна Соколова", "+992 90 000 10 19"],
  ["Рухшона Одинаева", "+992 90 000 10 20"],
  ["Шабнам Икромова", "+992 90 000 10 21"],
  ["Парвина Азизова", "+992 90 000 10 22"],
  ["Ситора Раҷабова", "+992 90 000 10 23"],
  ["Малика Турсунова", "+992 90 000 10 24"],
  ["Елена Морозова", "+992 90 000 10 25"],
  ["Зебо Мирзоева", "+992 90 000 10 26"],
];

/**
 * Куда приходит заказ по мере старения.
 *
 * Свежие лежат в начале воронки, месячные давно закрыты — иначе диаграмма
 * по статусам показала бы ровный столбик «Новый» на весь месяц и ничего не
 * рассказала о работе магазина. Пара отмен обязательна: воронка без отказов
 * выглядит нарисованной.
 */
function statusForAge(daysAgo, seed) {
  if (daysAgo <= 2) return seed % 3 === 0 ? "confirming" : "new";
  if (daysAgo <= 5)
    return ["confirming", "confirmed", "awaiting_payment"][seed % 3];
  if (daysAgo <= 9)
    return seed % 7 === 0 ? "cancelled" : ["awaiting_payment", "paid"][seed % 2];
  if (daysAgo <= 16)
    return seed % 9 === 0
      ? "cancelled"
      : ["paid", "in_delivery", "delivered"][seed % 3];
  return seed % 11 === 0
    ? "cancelled"
    : ["delivered", "completed", "completed"][seed % 3];
}

/** Свадьбы играют к выходным — заказов в пятницу и субботу заметно больше */
function ordersOnDay(date, seed) {
  const weekday = date.getDay(); // 0 — воскресенье
  const base = weekday === 5 || weekday === 6 ? 3 : weekday === 0 ? 2 : 1;
  return Math.max(0, base - (seed % 4 === 0 ? 1 : 0));
}

const money = (amount) => ({ amount, currency: "TJS" });

function main() {
  const command = process.argv[2] ?? "status";
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA busy_timeout = 10000");

  const countAll = () => db.prepare("SELECT COUNT(*) n FROM orders").get().n;
  const countDemo = () =>
    db.prepare("SELECT COUNT(*) n FROM orders WHERE doc LIKE ?").get(
      '%"demo":true%',
    ).n;

  if (command === "status") {
    console.log(`всего заказов: ${countAll()}, из них демо: ${countDemo()}`);
    return;
  }

  if (command === "clear") {
    const before = countDemo();
    db.prepare("DELETE FROM orders WHERE doc LIKE ?").run('%"demo":true%');
    console.log(
      `удалено демо-заказов: ${before}; настоящих осталось: ${countAll()}`,
    );
    return;
  }

  if (command !== "add") {
    console.error("Команда должна быть add, clear или status");
    process.exit(1);
  }

  if (countDemo() > 0) {
    console.log(
      `демо-заказы уже есть (${countDemo()}). Сначала: node scripts/demo-orders.mjs clear`,
    );
    return;
  }

  const products = db
    .prepare("SELECT doc FROM products ORDER BY sort")
    .all()
    .map((r) => JSON.parse(r.doc))
    .filter((p) => p.offers?.some((o) => o.kind === "purchase"));

  if (products.length === 0) {
    console.error("В каталоге нет товаров с покупкой — засевать нечего");
    process.exit(1);
  }

  const maxNumber = db.prepare(
    "SELECT COALESCE(MAX(number), 0) n FROM orders",
  ).get().n;

  const insert = db.prepare(
    "INSERT INTO orders (id, number, status, created_at, updated_at, doc) VALUES (?, ?, ?, ?, ?, ?)",
  );

  let number = maxNumber;
  let seed = 7;
  const rows = [];
  const DAYS = 30;

  for (let daysAgo = DAYS; daysAgo >= 0; daysAgo -= 1) {
    const day = new Date(Date.now() - daysAgo * 86_400_000);
    const howMany = ordersOnDay(day, (seed += 13));

    for (let k = 0; k < howMany; k += 1) {
      seed += 17;
      number += 1;

      const created = new Date(day);
      created.setHours(10 + ((seed * 3) % 11), (seed * 7) % 60, 0, 0);

      const [name, phone] = PEOPLE[seed % PEOPLE.length];

      // Одна-две позиции: берут образ, иногда добавляют второй
      const lineCount = seed % 5 === 0 ? 2 : 1;
      const lines = [];
      for (let i = 0; i < lineCount; i += 1) {
        const product = products[(seed + i * 5) % products.length];
        const offer = product.offers.find((o) => o.kind === "purchase");
        const variants = product.variants ?? [];
        const variant = variants.length
          ? variants[(seed + i) % variants.length]
          : undefined;
        const quantity = seed % 13 === 0 ? 2 : 1;
        lines.push({
          productId: product.id,
          slug: product.slug,
          title: product.title,
          article: product.article,
          offerKind: "purchase",
          size: variant?.size,
          quantity,
          unitPrice: money(offer.price.amount),
          lineTotal: money(offer.price.amount * quantity),
        });
      }

      const goods = lines.reduce((sum, l) => sum + l.lineTotal.amount, 0);
      const items = lines.reduce((sum, l) => sum + l.quantity, 0);
      const status = statusForAge(daysAgo, seed);
      const courier = seed % 3 === 0;

      // Свадьбу играют через месяц-полтора после заказа — так и бывает
      const wedding = new Date(created);
      wedding.setDate(wedding.getDate() + 30 + (seed % 25));

      const updated = new Date(created);
      if (status !== "new") {
        updated.setDate(updated.getDate() + Math.min(daysAgo, 1 + (seed % 5)));
      }

      rows.push({
        id: `AD-${String(number).padStart(4, "0")}`,
        number,
        status,
        customer: { name, phone },
        delivery: courier
          ? { method: "courier", address: "Душанбе, адрес уточняется" }
          : { method: "pickup" },
        weddingDate: wedding.toISOString().slice(0, 10),
        lines,
        totals: {
          items,
          goods: money(goods),
          delivery: null,
          grand: money(goods),
        },
        locale: seed % 4 === 0 ? "tg" : "ru",
        createdAt: created.toISOString(),
        updatedAt: updated.toISOString(),
        // Метка удаления. По ней и только по ней работает `clear`.
        demo: true,
      });
    }
  }

  db.exec("BEGIN IMMEDIATE");
  try {
    for (const o of rows) {
      insert.run(
        o.id,
        o.number,
        o.status,
        o.createdAt,
        o.updatedAt,
        JSON.stringify(o),
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const byStatus = {};
  for (const o of rows) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  const sum = rows.reduce((s, o) => s + o.totals.grand.amount, 0);

  console.log(`добавлено демо-заказов: ${rows.length} за ${DAYS} дней`);
  console.log(
    `  номера: AD-${String(maxNumber + 1).padStart(4, "0")} … ${rows.at(-1).id}`,
  );
  console.log(`  сумма: ${(sum / 100).toLocaleString("ru-RU")} с.`);
  console.log("  по статусам:", byStatus);
  console.log("\nУдалить: node scripts/demo-orders.mjs clear");
}

main();
