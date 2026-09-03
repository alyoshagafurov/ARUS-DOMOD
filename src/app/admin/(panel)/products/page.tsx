import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { catalog } from "@/lib/catalog";
import { readCatalog } from "@/lib/db/catalog-store";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Товары" };

const availability = {
  in_stock: "В наличии",
  made_to_order: "Под заказ",
  rental_only: "Только прокат",
  sold_out: "Продано",
} as const;

export default async function AdminProductsPage() {
  const [{ items }, categories] = await Promise.all([
    catalog().listProducts({ pageSize: 1000 }),
    catalog().listCategories(),
  ]);
  const { featuredSlugs } = readCatalog();
  const catTitle = new Map(categories.map((c) => [c.slug, c.title]));

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="t-h1">
          Товары <span className="t-caption tabular-nums">{items.length}</span>
        </h1>
        <Button href="/admin/products/new">Новый товар</Button>
      </div>

      <ul className="mt-8 flex flex-col border-t border-hairline">
        {items.map((p) => {
          const buy = p.offers.find((o) => o.kind === "purchase");
          const rent = p.offers.find((o) => o.kind === "rental");
          const state = p.variants[0]?.availability ?? "in_stock";
          return (
            <li key={p.id} className="border-b border-hairline">
              <Link
                href={`/admin/products/${p.id}`}
                className="grid grid-cols-[3rem_1fr] items-center gap-4 py-3 hover:bg-muted md:grid-cols-[3rem_1fr_10rem_8rem_8rem_7rem]"
              >
                <span className="relative aspect-[3/4] w-12 overflow-hidden bg-muted">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0].url}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="t-body-sm block truncate">
                    {p.title}
                    {featuredSlugs.includes(p.slug) ? (
                      <span className="t-label ml-2 text-ink-accent">
                        главная
                      </span>
                    ) : null}
                  </span>
                  <span className="t-caption">
                    {p.article ?? "—"} ·{" "}
                    {catTitle.get(p.categorySlug) ?? p.categorySlug}
                  </span>
                </span>
                <span className="t-caption hidden md:block">
                  {availability[state]}
                </span>
                <span className="t-price hidden md:block">
                  {buy ? formatMoney(buy.price) : "—"}
                </span>
                <span className="t-caption hidden md:block">
                  {rent ? `прокат ${formatMoney(rent.price)}` : "—"}
                </span>
                <span className="t-caption hidden md:block">
                  {p.variants
                    .map((v) => v.size)
                    .filter(Boolean)
                    .join(" ") || "OS"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
