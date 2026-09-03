import Link from "next/link";

import { catalog } from "@/lib/catalog";
import { countOrders, listOrders } from "@/lib/orders/store";
import { ORDER_STATUS_LABELS } from "@/lib/orders/labels";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Обзор" };

export default async function AdminDashboard() {
  const counts = countOrders();
  const latest = listOrders().slice(0, 6);
  const [products, categories] = await Promise.all([
    catalog().listProducts({ pageSize: 1000 }),
    catalog().listCategories(),
  ]);

  const tiles = [
    {
      label: "Новых заказов",
      value: counts.new,
      href: "/admin/orders?status=new",
    },
    { label: "Всего заказов", value: counts.all, href: "/admin/orders" },
    { label: "Товаров", value: products.total, href: "/admin/products" },
    { label: "Категорий", value: categories.length, href: "/admin/categories" },
  ];

  return (
    <>
      <h1 className="t-h1">Обзор</h1>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.label} className="border border-hairline">
            <Link href={tile.href} className="block p-5 hover:bg-muted">
              <span className="t-label text-ink-muted">{tile.label}</span>
              <span className="t-display-2 mt-3 block tabular-nums">
                {tile.value}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="t-h2">Последние заказы</h2>
          <Link
            href="/admin/orders"
            className="tap-row text-ink-secondary hover:text-ink"
          >
            <span className="t-label motion-underline">Все заказы</span>
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="t-body-sm mt-5 text-ink-secondary">Заказов пока нет.</p>
        ) : (
          <ul className="mt-5 flex flex-col border-t border-hairline">
            {latest.map((order) => (
              <li key={order.id} className="border-b border-hairline">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-1 py-4 hover:bg-muted sm:grid-cols-[7rem_1fr_9rem_8rem] sm:items-baseline sm:gap-4"
                >
                  <span className="t-price">{order.id}</span>
                  <span className="t-body-sm truncate">
                    {order.customer.name} · {order.customer.phone}
                  </span>
                  <span className="t-caption">
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="t-price sm:text-right">
                    {formatMoney(order.totals.grand)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
