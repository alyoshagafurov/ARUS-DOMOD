import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/orders/types";

const CREATED = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Dushanbe",
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * Текст заказа для Рустама — он приходит ему в WhatsApp.
 *
 * Сообщение читают с телефона на ходу, поэтому всё главное — в первых
 * строках: номер заказа, кто, как связаться. Подпись и значение стоят в
 * одной строке, подписи набраны жирным (`*текст*` WhatsApp показывает
 * жирным), а каждый товар — отдельным пунктом с размером, цветом и ценой.
 * Итог выделен последним, чтобы сумму не искать.
 */
export function formatOrderMessage(order: Order): string {
  const lines: string[] = [];
  const push = (s = "") => lines.push(s);

  push(`*Новый заказ ${order.id}*`);
  push(`С сайта ARUS DOMOD · ${CREATED.format(new Date(order.createdAt))}`);
  push();
  push(`*Клиент:* ${order.customer.name}`);
  push(`*Телефон:* ${order.customer.phone}`);
  push(
    `*Получение:* ${order.delivery.method === "courier" ? "доставка" : "самовывоз"}`,
  );
  if (order.delivery.method === "courier" && order.delivery.address) {
    push(`*Адрес:* ${order.delivery.address}`);
  }
  if (order.weddingDate) {
    push(`*Дата свадьбы:* ${formatDate(order.weddingDate)}`);
  }
  push();
  push(`*Товары (${order.totals.items} шт.)*`);
  order.lines.forEach((line, index) => {
    push(`${index + 1}. ${line.title}${line.article ? ` · ${line.article}` : ""}`);
    const details = [
      line.size ? `размер ${line.size}` : null,
      line.color ?? null,
    ].filter(Boolean);
    if (details.length) push(`   ${details.join(" · ")}`);
    push(
      `   ${line.quantity} шт. × ${formatMoney(line.unitPrice)}` +
        (line.quantity > 1 ? ` = ${formatMoney(line.lineTotal)}` : "") +
        (line.discountPercent ? ` (скидка ${line.discountPercent}%)` : ""),
    );
  });
  push();
  push(`*Итого: ${formatMoney(order.totals.grand)}*`);
  if (order.delivery.method === "courier") {
    push(
      `Доставка: ${order.totals.delivery ? formatMoney(order.totals.delivery) : "уточняется"}`,
    );
  }
  if (order.comment) {
    push();
    push(`*Комментарий:*`);
    push(order.comment);
  }

  return lines.join("\n");
}

/**
 * Тот же текст для показа на странице: звёздочки разметки WhatsApp в
 * обычном тексте выглядели бы мусором. Копируется и отправляется —
 * исходный вариант с разметкой.
 */
export const plainOrderMessage = (message: string): string =>
  message.replace(/\*/g, "");

/** «2026-09-14» → «14.09.2026» — так дату читают в Таджикистане */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

/**
 * Ссылка, открывающая WhatsApp с готовым текстом.
 *
 * Сайт не отправляет сообщение сам: для этого нужен WhatsApp Business API с
 * платным аккаунтом и проверкой Meta. Вместо этого после оформления клиент
 * одним касанием открывает чат с администратором, где текст уже набран, —
 * это стандартный приём для магазинов, принимающих заказы в мессенджере.
 */
export function whatsappLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
