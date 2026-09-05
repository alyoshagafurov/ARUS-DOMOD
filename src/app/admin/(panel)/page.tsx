import Link from "next/link";

import {
  ColumnChart,
  StatusChart,
  type Bucket,
} from "@/components/admin/Charts";
import { Empty, StatusChip } from "@/components/admin/form";
import { catalog } from "@/lib/catalog";
import { countOrders, listOrders } from "@/lib/orders/store";
import { ORDER_STATUSES } from "@/lib/orders/types";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Обзор" };

/** Дни считаются по времени магазина, а не по UTC: заказ в 02:00 в
 *  Душанбе иначе попал бы во вчерашний столбец. */
const DAY = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Dushanbe",
  day: "numeric",
  month: "long",
});
const SHORT = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Dushanbe",
  day: "numeric",
  month: "2-digit",
});
const KEY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dushanbe",
  dateStyle: "short",
});

/** Четырнадцать дней подряд, включая пустые: провал в череде заказов —
 *  тоже факт, и пропускать такие дни значило бы его спрятать. */
function daily(orders: { createdAt: string }[], days = 14): Bucket[] {
  const counted = new Map<string, number>();
  for (const order of orders) {
    const key = KEY.format(new Date(order.createdAt));
    counted.set(key, (counted.get(key) ?? 0) + 1);
  }

  const out: Bucket[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now - i * 86_400_000);
    out.push({
      label: SHORT.format(date),
      full: DAY.format(date),
      value: counted.get(KEY.format(date)) ?? 0,
    });
  }
  return out;
}

export default async function AdminDashboard() {
  const counts = countOrders();
  const all = listOrders();
  const latest = all.slice(0, 6);
  const byDay = daily(all);
  const byStatus = ORDER_STATUSES.map((status) => ({
    status,
    value: counts[status],
  }));
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

      {/* Диаграммы стоят на настоящих числах из базы. Пока заказов нет,
          рисовать нечего — пустая сетка честнее «примерного» графика. */}
      {all.length > 0 ? (
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <ColumnChart
            title="Заказы по дням · 14 дней"
            buckets={byDay}
            unit="за период"
          />
          <StatusChart title="Заказы по статусам" rows={byStatus} />
        </div>
      ) : null}

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
