import type { Order, OrderLine, OrderStatus } from "@/lib/orders/types";
import type { Product } from "@/types/catalog";

/* -------------------------------------------------------------------------
   Демо-заказы для показа панели.

   Включаются переменной окружения `ARUS_DEMO_ORDERS=1` и только ею. Без
   неё этот код не выполняется вовсе: демо-заказы — самая опасная
   разновидность тестовых данных, потому что владелец магазина видит в
   панели имена, суммы и статусы и не может отличить их от настоящих.
   Переменная — осознанное действие человека, а не умолчание.

   Убрать: снять переменную. На Railway без тома база пересоздаётся при
   каждой выкладке, поэтому снятая переменная сама означает чистую панель;
   на постоянном диске остаётся `node scripts/demo-orders.mjs clear`.

   Числа не «примерные»: товары, цены и размеры берутся из настоящего
   каталога, а строка заказа обязана быть снимком существующей позиции —
   иначе панель покажет товар, которого нет.
   ------------------------------------------------------------------------- */

/** Сколько дней истории рисуем */
const DAYS = 30;

/**
 * Имена таджикские и русские, как у покупателей дома. Телефоны построены
 * по одному шаблону и заведомо не живые: набрать такой и попасть на
 * постороннего человека нельзя.
 */
const PEOPLE: [name: string, phone: string][] = [
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
 * рассказала о работе магазина. Пара отмен обязательна: воронка без
 * отказов выглядит нарисованной.
 */
function statusForAge(daysAgo: number, seed: number): OrderStatus {
  if (daysAgo <= 2) return seed % 3 === 0 ? "confirming" : "new";
  if (daysAgo <= 5)
    return (["confirming", "confirmed", "awaiting_payment"] as const)[seed % 3];
  if (daysAgo <= 9)
    return seed % 7 === 0
      ? "cancelled"
      : (["awaiting_payment", "paid"] as const)[seed % 2];
  if (daysAgo <= 16)
    return seed % 9 === 0
      ? "cancelled"
      : (["paid", "in_delivery", "delivered"] as const)[seed % 3];
  return seed % 11 === 0
    ? "cancelled"
    : (["delivered", "completed", "completed"] as const)[seed % 3];
}

/** Свадьбы играют к выходным — заказов в пятницу и субботу заметно больше */
function ordersOnDay(date: Date, seed: number): number {
  const weekday = date.getDay(); // 0 — воскресенье
  const base = weekday === 5 || weekday === 6 ? 3 : weekday === 0 ? 2 : 1;
  return Math.max(0, base - (seed % 4 === 0 ? 1 : 0));
}

const money = (amount: number) => ({ amount, currency: "TJS" as const });

/** Заказ с меткой `demo`, по которой его потом находят и удаляют */
export type DemoOrder = Order & { demo: true };

export function buildDemoOrders(
  products: Product[],
  startNumber: number,
): DemoOrder[] {
  const sellable = products.filter((p) =>
    p.offers?.some((o) => o.kind === "purchase"),
  );
  if (sellable.length === 0) return [];

  const out: DemoOrder[] = [];
  let number = startNumber;
  let seed = 7;

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
      const lines: OrderLine[] = [];
      for (let i = 0; i < lineCount; i += 1) {
        const product = sellable[(seed + i * 5) % sellable.length];
        const offer = product.offers.find((o) => o.kind === "purchase");
        if (!offer) continue;
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
      if (lines.length === 0) continue;

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

      out.push({
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
        demo: true,
      });
    }
  }

  return out;
}

/** Включены ли демо-заказы — единственное место, где читается переменная */
export const demoOrdersEnabled = (): boolean =>
  process.env.ARUS_DEMO_ORDERS === "1";
