import Link from "next/link";

import { Empty, StatusChip } from "@/components/admin/form";
import { catalog } from "@/lib/catalog";
import { countOrders, listOrders } from "@/lib/orders/store";
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

      {/* Не «большая цифра с подписью» вчетвером: счётчик и есть ссылка на
          отфильтрованный список, поэтому он набран рабочей гарнитурой с
          табличными цифрами и стоит в строке с названием раздела. Витринная
          антиква в рабочем месте читается медленнее, а четыре одинаковые
          плитки с крупным числом — готовый шаблон панели, а не решение. */}
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link
              href={tile.href}
              className="flex items-baseline justify-between gap-4 rounded-md border border-hairline px-4 py-4 transition-colors duration-[var(--dur-fast)] hover:border-strong hover:bg-muted"
            >
              <span className="t-label text-ink-secondary">{tile.label}</span>
              <span className="t-price text-[1.5rem] tabular-nums text-ink">
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
          <Empty
            title="Заказов пока нет"
            hint="Как только покупатель оформит корзину на сайте, заказ появится здесь со статусом «Новый»."
          />
        ) : (
          <ul className="mt-5 flex flex-col border-t border-hairline">
            {latest.map((order) => (
              <li key={order.id} className="border-b border-hairline">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-col gap-2 py-4 transition-colors duration-[var(--dur-fast)] hover:bg-muted sm:grid sm:grid-cols-[7rem_1fr_11rem_8rem] sm:items-center sm:gap-4"
                >
                  <span className="t-price tabular-nums">{order.id}</span>
                  <span className="t-body-sm truncate">
                    {order.customer.name} · {order.customer.phone}
                  </span>
                  <StatusChip status={order.status} />
                  <span className="t-price tabular-nums sm:text-right">
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
