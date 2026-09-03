import Link from "next/link";

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
                    "t-label inline-flex h-10 items-center gap-2 rounded-pill border px-4",
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
        <p className="t-body-sm mt-8 text-ink-secondary">Заказов нет.</p>
      ) : (
        <ul className="mt-6 flex flex-col border-t border-hairline">
          {orders.map((o) => (
            <li key={o.id} className="border-b border-hairline">
              <Link
                href={`/admin/orders/${o.id}`}
                className="grid gap-1 py-4 hover:bg-muted md:grid-cols-[6rem_1fr_10rem_9rem_7rem] md:items-baseline md:gap-4"
              >
                <span className="t-price">{o.id}</span>
                <span className="min-w-0">
                  <span className="t-body-sm block truncate">
                    {o.customer.name}
                  </span>
                  <span className="t-caption">
                    {o.customer.phone} · {o.totals.items} поз.
                  </span>
                </span>
                <span className="t-caption">
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
                <span className="t-caption">{fmtDate(o.createdAt)}</span>
                <span className="t-price md:text-right">
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
