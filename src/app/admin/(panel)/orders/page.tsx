import Link from "next/link";

import { Empty, StatusChip } from "@/components/admin/form";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders/labels";
import { countOrders, listOrders } from "@/lib/orders/store";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/types";

export const metadata = { title: "Заказы" };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  });

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  const params = await searchParams;
  const status = ORDER_STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;
  const orders = listOrders(status ? { status } : {});
  const counts = countOrders();

  return (
    <>
      <h1 className="t-h1">Заказы</h1>

      <nav
        aria-label="Фильтр по статусу"
        className="-mx-[var(--gutter)] mt-6 overflow-x-auto px-[var(--gutter)]"
      >
        <ul className="flex w-max gap-2">
          {[undefined, ...ORDER_STATUSES].map((s) => {
            const active = s === status;
            const n = s ? counts[s] : counts.all;
            return (
              <li key={s ?? "all"}>
                <Link
                  href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "t-label inline-flex h-11 items-center gap-2 rounded-pill border px-4",
                    active
                      ? "border-accent text-ink-accent"
                      : "border-hairline text-ink-secondary hover:border-strong",
                  )}
                >
                  {s ? ORDER_STATUS_LABELS[s] : "Все"}
                  <span className="tabular-nums text-ink-muted">{n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {orders.length === 0 ? (
        <Empty
          title={status ? "В этом статусе заказов нет" : "Заказов пока нет"}
          hint={
            status
              ? "Снимите фильтр, чтобы увидеть остальные заказы."
              : "Заказы приходят с сайта: покупатель оформляет корзину, заказ появляется здесь со статусом «Новый», и вам приходит сообщение в WhatsApp. Прокат сюда не попадает — он оформляется в магазине."
          }
        />
      ) : (
        <ul className="mt-6 flex flex-col border-t border-hairline">
          {orders.map((o) => (
            <li key={o.id} className="border-b border-hairline">
              <Link
                href={`/admin/orders/${o.id}`}
                className="flex flex-col gap-2 py-4 transition-colors duration-[var(--dur-fast)] hover:bg-muted md:grid md:grid-cols-[6rem_1fr_11rem_8rem_7rem] md:items-center md:gap-4"
              >
                {/* Телефон: номер и сумма в одной строке, статус под ними.
                    Пятиколоночная сетка на 390px давала пять строк по одному
                    слову — прочесть список было невозможно. */}
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
                <span className="flex items-center gap-3">
                  <StatusChip status={o.status} />
                  <span className="t-caption md:hidden">
                    {fmtDate(o.createdAt)}
                  </span>
                </span>
                <span className="t-caption hidden md:block">
                  {fmtDate(o.createdAt)}
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
