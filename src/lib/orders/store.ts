import { catalog } from "@/lib/catalog";
import { getDb, nowIso } from "@/lib/db/sqlite";
import type { Order, OrderDraft, OrderLine } from "@/lib/orders/types";
import type { Money } from "@/types/catalog";

const money = (amount: number): Money => ({ amount, currency: "TJS" });

/** Длины, дальше которых строка не несёт смысла, а место в базе занимает */
const MAX = { name: 120, phone: 32, address: 300, comment: 1000 } as const;

/**
 * Телефон к виду 992XXXXXXXXX.
 *
 * Покупатель набирает как привык: «907 66 60 00», «0907666000»,
 * «+992 90 766 60 00». Ссылка wa.me принимает только цифры со страной, и
 * кнопка «Написать в WhatsApp» в админке вела в никуда у каждого, кто
 * набрал номер без кода страны.
 */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("992")) return digits;
  if (digits.length === 9) return `992${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) {
    return `992${digits.slice(1)}`;
  }
  return digits;
}

/** Обрезка по длине: длинную строку отбрасывать жалко, хранить целиком незачем */
const clamp = (value: string, limit: number) => value.slice(0, limit);

export class OrderError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

/**
 * Проверка черновика по форме — на границе системы, как и везде в проекте.
 * Что не прошло, отбрасывается с понятной ошибкой, а не попадает в базу.
 */
function validate(input: unknown): OrderDraft {
  if (typeof input !== "object" || input === null) {
    throw new OrderError("Пустой заказ");
  }
  const d = input as Record<string, unknown>;
  const customer = d.customer as Record<string, unknown> | undefined;
  const delivery = d.delivery as Record<string, unknown> | undefined;

  const name = clamp(String(customer?.name ?? "").trim(), MAX.name);
  const rawPhone = String(customer?.phone ?? "").trim();
  if (name.length < 2) throw new OrderError("Укажите имя");
  if (rawPhone.replace(/\D/g, "").length < 9)
    throw new OrderError("Укажите телефон");
  // Номер приводится к единому виду один раз, здесь: дальше его берут и
  // ссылка tel:, и wa.me, и текст сообщения — все три из одного места
  const phone = clamp(normalisePhone(rawPhone), MAX.phone);

  const method = delivery?.method;
  if (method !== "pickup" && method !== "courier") {
    throw new OrderError("Выберите способ получения");
  }
  const address = clamp(String(delivery?.address ?? "").trim(), MAX.address);
  if (method === "courier" && address.length < 4) {
    throw new OrderError("Укажите адрес доставки");
  }

  const weddingDate = String(d.weddingDate ?? "").trim();
  if (weddingDate) {
    // Мало проверить форму: «0000-99-99» ей соответствует. Дата должна
    // существовать и быть похожей на свадьбу, а не на опечатку
    const parsed = new Date(`${weddingDate}T00:00:00Z`);
    const ok =
      /^\d{4}-\d{2}-\d{2}$/.test(weddingDate) &&
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === weddingDate;
    if (!ok) throw new OrderError("Дата свадьбы в неверном формате");
  }

  const locale = d.locale === "tg" || d.locale === "en" ? d.locale : "ru";

  if (!Array.isArray(d.lines) || d.lines.length === 0) {
    throw new OrderError("Корзина пуста");
  }
  const lines = d.lines.map((raw) => {
    const l = raw as Record<string, unknown>;
    const quantity = Math.round(Number(l.quantity));
    if (
      typeof l.productId !== "string" ||
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {
      throw new OrderError("Некорректная строка заказа");
    }
    // Прокат через сайт не оформляется — только в магазине.
    if (l.offerKind !== "purchase") {
      throw new OrderError("Прокат оформляется в магазине, а не через сайт");
    }
    return {
      productId: l.productId,
      variantId: typeof l.variantId === "string" ? l.variantId : undefined,
      offerKind: "purchase" as const,
      quantity: Math.min(quantity, 20),
    };
  });

  return {
    customer: { name, phone },
    delivery: method === "courier" ? { method, address } : { method },
    ...(weddingDate ? { weddingDate } : null),
    ...(String(d.comment ?? "").trim()
      ? { comment: clamp(String(d.comment).trim(), MAX.comment) }
      : null),
    locale,
    lines,
  };
}

/**
 * Строки заказа собираются из КАТАЛОГА, а не из того, что прислал браузер:
 * цену, название и артикул клиенту доверять нельзя. От формы берутся только
 * идентификаторы и количество.
 */
async function enrich(draft: OrderDraft): Promise<OrderLine[]> {
  const all = await catalog().listProducts({ pageSize: 1000 });
  const lines: OrderLine[] = [];

  for (const item of draft.lines) {
    const product = all.items.find((p) => p.id === item.productId);
    if (!product) throw new OrderError(`Товар ${item.productId} не найден`);

    const offer = product.offers.find((o) => o.kind === "purchase");
    if (!offer) throw new OrderError(`«${product.title}» не продаётся`);

    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : product.variants[0];

    // Корзина назвала вариант, а в каталоге его нет: товар правили в
    // админке, и размеры пересобрались. Молчать нельзя — заказ ушёл бы
    // без размера, и проверка «продан» не сработала бы, потому что
    // проверять было бы нечего.
    if (item.variantId && !variant) {
      throw new OrderError(
        `«${product.title}» изменился — откройте образ и выберите размер заново`,
      );
    }
    if (variant?.availability === "sold_out") {
      throw new OrderError(`«${product.title}» продан`);
    }

    lines.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      ...(product.article ? { article: product.article } : null),
      offerKind: "purchase",
      ...(variant?.size ? { size: variant.size } : null),
      ...(variant?.colorName ? { color: variant.colorName } : null),
      // Каталог уже отдал цену со скидкой; процент запоминается рядом, чтобы
      // администратор видел, откуда цена ниже обычной
      ...(product.sale ? { discountPercent: product.sale.percent } : null),
      quantity: item.quantity,
      unitPrice: offer.price,
      lineTotal: money(offer.price.amount * item.quantity),
    });
  }
  return lines;
}

const pad4 = (n: number) => String(n).padStart(4, "0");

export async function createOrder(input: unknown): Promise<Order> {
  const draft = validate(input);
  const lines = await enrich(draft);
  const goods = lines.reduce((sum, l) => sum + l.lineTotal.amount, 0);
  const items = lines.reduce((sum, l) => sum + l.quantity, 0);
  const db = getDb();
  const now = nowIso();

  db.exec("BEGIN IMMEDIATE");
  try {
    const last = db.prepare("SELECT MAX(number) AS m FROM orders").get() as {
      m: number | null;
    };
    const number = (last.m ?? 0) + 1;
    const order: Order = {
      id: `AD-${pad4(number)}`,
      number,
      status: "new",
      customer: draft.customer,
      delivery: draft.delivery,
      ...(draft.weddingDate ? { weddingDate: draft.weddingDate } : null),
      ...(draft.comment ? { comment: draft.comment } : null),
      lines,
      totals: {
        items,
        goods: money(goods),
        delivery: null,
        grand: money(goods),
      },
      locale: draft.locale,
      createdAt: now,
      updatedAt: now,
    };
    db.prepare(
      `INSERT INTO orders (id, number, status, created_at, updated_at, doc)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(order.id, number, order.status, now, now, JSON.stringify(order));
    db.exec("COMMIT");
    return order;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

type Row = { doc: string };

/**
 * Все заказы, свежие сверху. Фильтра по статусу нет: статусы в админке
 * не ведутся, у каждого заказа в базе остаётся исходный «new».
 */
export function listOrders(): Order[] {
  const rows = getDb()
    .prepare("SELECT doc FROM orders ORDER BY created_at DESC")
    .all() as Row[];
  return rows.map((r) => JSON.parse(r.doc) as Order);
}

export function getOrder(id: string): Order | null {
  const row = getDb().prepare("SELECT doc FROM orders WHERE id = ?").get(id) as
    Row | undefined;
  return row ? (JSON.parse(row.doc) as Order) : null;
}

