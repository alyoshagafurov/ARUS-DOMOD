import Link from "next/link";

import { Empty, FreshMark } from "@/components/admin/form";
import { formatMoney } from "@/lib/format";
import { listOrders } from "@/lib/orders/store";

export const metadata = { title: "Заказы" };

const WHEN = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Dushanbe",
  dateStyle: "short",
  timeStyle: "short",
});

/** Время запроса: отметка «Новый» считается от него */
const requestTime = () => Date.now();

/**
 * Заказы — просто лента, свежие сверху.
 *
 * Статусов вручную здесь нет: владельцу некогда переключать их у каждой
 * заявки, а незаполненный статус врал бы хуже, чем его отсутствие.
 * Новый заказ отмечен сам — пока ему меньше суток.
 */
export default async function AdminOrdersPage() {
  const now = requestTime();
  const orders = listOrders();

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="t-h1">Заказы</h1>
        {orders.length ? (
          <span className="t-caption tabular-nums">
            всего {orders.length}
          </span>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <Empty
          title="Заказов пока нет"
          hint="Заказы приходят с сайта: покупатель оформляет корзину, заказ появляется здесь с отметкой «Новый», и вам приходит сообщение в WhatsApp. Прокат сюда не попадает — он оформляется в магазине."
        />
      ) : (
        <ul className="mt-6 flex flex-col border-t border-hairline">
          {orders.map((o) => (
            <li key={o.id} className="border-b border-hairline">
              <Link
                href={`/admin/orders/${o.id}`}
                className="flex flex-col gap-2 py-4 transition-colors duration-[var(--dur-fast)] hover:bg-muted md:grid md:grid-cols-[6rem_minmax(0,1fr)_auto_7rem] md:items-center md:gap-4"
              >
                {/* Телефон: номер и сумма в одной строке, отметка и время
                    под ними. Четыре колонки на 390px давали строки по
                    одному слову — прочесть список было невозможно. */}
                <span className="flex items-baseline justify-between gap-3 md:block">
                  <span className="t-price tabular-nums">{o.id}</span>
                  <span className="t-price tabular-nums md:hidden">
                    {formatMoney(o.totals.grand)}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="t-body-sm block truncate">
                    {o.customer.name}
                  </span>
                  <span className="t-caption">
                    {o.customer.phone} · {o.totals.items} поз.
                  </span>
                </span>
                <span className="flex items-center gap-3 md:justify-end">
                  <FreshMark createdAt={o.createdAt} now={now} />
                  <span className="t-caption tabular-nums">
                    {WHEN.format(new Date(o.createdAt))}
                  </span>
                </span>
                <span className="t-price hidden tabular-nums md:block md:text-right">
                  {formatMoney(o.totals.grand)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
