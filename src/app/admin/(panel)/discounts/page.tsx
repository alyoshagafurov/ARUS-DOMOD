import Link from "next/link";

import { Empty } from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { catalog } from "@/lib/catalog";
import {
  discountState,
  discountTargets,
  type DiscountState,
} from "@/lib/catalog/discounts";
import { readCatalog, readDiscounts } from "@/lib/db/catalog-store";
import { formatShortDate, pluralRu } from "@/lib/format";
import type { Discount } from "@/types/catalog";

export const metadata = { title: "Скидки" };

/** Время запроса: состояние скидки считается от него */
const requestTime = () => Date.now();

const GOODS = ["товар", "товара", "товаров"] as const;

const STATE: Record<DiscountState, { label: string; tone: string; order: number }> = {
  active: { label: "Действует", tone: "border-success text-success", order: 0 },
  scheduled: {
    label: "Запланирована",
    tone: "border-gold text-gold-ink",
    order: 1,
  },
  ended: {
    label: "Закончилась",
    tone: "border-hairline text-ink-muted",
    order: 2,
  },
};

/** Что покрывает скидка — одной строкой, как о ней скажут вслух */
function scopeLabel(
  discount: Discount,
  titles: { category: Map<string, string>; product: Map<string, string> },
): string {
  if (discount.scope === "all") return "Все товары";
  if (discount.scope === "categories") {
    return discount.categorySlugs
      .map((slug) => titles.category.get(slug) ?? slug)
      .join(", ");
  }
  const names = discount.productIds
    .map((id) => titles.product.get(id))
    .filter(Boolean);
  return names.length > 3
    ? `${names.slice(0, 3).join(", ")} и ещё ${names.length - 3}`
    : names.join(", ") || "Товары удалены";
}

/**
 * Скидки: действующие сверху, за ними запланированные, внизу прошедшие.
 *
 * Прошедшие не удаляются сами: по ним видно, какие скидки уже были, и
 * их можно открыть и запустить заново с новыми датами.
 */
export default async function AdminDiscountsPage({
  searchParams,
}: PageProps<"/admin/discounts">) {
  const query = await searchParams;
  const now = requestTime();
  const { products } = readCatalog();
  const categories = await catalog().listCategories();
  const titles = {
    category: new Map(categories.map((c) => [c.slug, c.title])),
    product: new Map(products.map((p) => [p.id, p.title])),
  };

  const rows = readDiscounts()
    .map((discount) => ({
      discount,
      state: discountState(discount, now),
      targets: discountTargets(discount, products).length,
    }))
    .sort(
      (a, b) =>
        STATE[a.state].order - STATE[b.state].order ||
        b.discount.startsAt.localeCompare(a.discount.startsAt),
    );

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="t-h1">Скидки</h1>
        <Button href="/admin/discounts/new">Новая скидка</Button>
      </div>
      <p className="t-body-sm mt-3 max-w-[60ch] text-ink-secondary">
        Скидка снижает цену покупки на выбранных товарах и сама включается и
        выключается по датам. На сайте такие товары отмечены красной лентой
        «Скидка».
      </p>
      {query.saved || query.deleted ? (
        <p role="status" className="t-body-sm mt-3 text-success">
          {query.saved ? "Скидка сохранена" : "Скидка удалена"}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <Empty
          title="Скидок пока нет"
          hint="Выберите товары, процент и даты — цены на сайте снизятся в первый день скидки и вернутся после последнего."
          action={<Button href="/admin/discounts/new">Новая скидка</Button>}
        />
      ) : (
        <ul className="mt-8 flex flex-col border-t border-hairline">
          {rows.map(({ discount, state, targets }) => (
            <li key={discount.id} className="border-b border-hairline">
              <Link
                href={`/admin/discounts/${discount.id}`}
                className="flex flex-col gap-2 py-4 transition-colors duration-[var(--dur-fast)] hover:bg-muted md:grid md:grid-cols-[5.5rem_minmax(0,1fr)_auto_9rem] md:items-center md:gap-4"
              >
                <span
                  className={`t-h2 tabular-nums ${state === "ended" ? "text-ink-muted" : "text-danger"}`}
                >
                  −{discount.percent}%
                </span>
                <span className="min-w-0">
                  <span className="t-body-sm block truncate">
                    {scopeLabel(discount, titles)}
                  </span>
                  <span className="t-caption">
                    {targets} {pluralRu(targets, GOODS)} со скидкой
                  </span>
                </span>
                <span
                  className={`t-label inline-flex w-fit items-center whitespace-nowrap rounded-pill border px-3 py-1.5 ${STATE[state].tone}`}
                >
                  {STATE[state].label}
                </span>
                <span className="t-caption tabular-nums md:text-right">
                  {formatShortDate(discount.startsAt)} —{" "}
                  {formatShortDate(discount.endsAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
