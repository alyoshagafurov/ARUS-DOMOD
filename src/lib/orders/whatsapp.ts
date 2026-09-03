import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/orders/types";

/**
 * Текст заказа для администратора.
 *
 * Собирается по шаблону, согласованному с клиентом: по одному сообщению
 * администратор должен понять весь заказ, не открывая сайт. Формат
 * намеренно плоский — WhatsApp не рендерит разметку, а моноширинных
 * таблиц у него нет.
 */
export function formatOrderMessage(order: Order): string {
  const lines: string[] = [];
  const push = (s = "") => lines.push(s);

  push(`НОВЫЙ ЗАКАЗ — ARUS DOMOD`);
  push(`№ ${order.id}`);
  push();
  push(`Клиент:`);
  push(order.customer.name);
  push(`Телефон:`);
  push(order.customer.phone);
  push();
  if (order.weddingDate) {
    push(`Дата свадьбы:`);
    push(formatDate(order.weddingDate));
    push();
  }
  push(`Способ получения:`);
  push(order.delivery.method === "courier" ? "Доставка" : "Самовывоз");
  if (order.delivery.method === "courier" && order.delivery.address) {
    push(`Адрес:`);
    push(order.delivery.address);
  }
  push();
  push(`ТОВАРЫ:`);
  order.lines.forEach((line, index) => {
    push(`${index + 1}. ${line.title}`);
    if (line.article) push(`Артикул: ${line.article}`);
    if (line.size) push(`Размер: ${line.size}`);
    if (line.color) push(`Цвет: ${line.color}`);
    push(`Количество: ${line.quantity}`);
    push(`Цена: ${formatMoney(line.unitPrice)}`);
    if (line.quantity > 1) push(`Сумма: ${formatMoney(line.lineTotal)}`);
  });
  push();
  push(`ТОВАРОВ: ${order.totals.items}`);
  push(`ТОВАРЫ ИТОГО:`);
  push(formatMoney(order.totals.goods));
  push(`ДОСТАВКА:`);
  push(
    order.totals.delivery ? formatMoney(order.totals.delivery) : "Уточняется",
  );
  push(`ИТОГО:`);
  push(formatMoney(order.totals.grand));
  if (order.comment) {
    push();
    push(`КОММЕНТАРИЙ:`);
    push(order.comment);
  }

  return lines.join("\n");
}

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
