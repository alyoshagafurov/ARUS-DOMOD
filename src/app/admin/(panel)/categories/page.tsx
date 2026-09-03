import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { catalog } from "@/lib/catalog";

export const metadata = { title: "Категории" };

export default async function AdminCategoriesPage() {
  const [categories, { items }] = await Promise.all([
    catalog().listCategories(),
    catalog().listProducts({ pageSize: 1000 }),
  ]);
  const counts = new Map<string, number>();
  for (const p of items)
    counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="t-h1">Категории</h1>
        <Button href="/admin/categories/new">Новая категория</Button>
      </div>
      <ul className="mt-8 flex flex-col border-t border-hairline">
        {categories.map((c) => (
          <li key={c.id} className="border-b border-hairline">
            <Link
              href={`/admin/categories/${c.id}`}
              className="grid gap-1 py-4 hover:bg-muted sm:grid-cols-[3rem_1fr_10rem_6rem] sm:items-baseline sm:gap-4"
            >
              <span className="t-caption tabular-nums">{c.order}</span>
              <span className="min-w-0">
                <span className="t-body-sm block">{c.title}</span>
                <span className="t-caption">
                  {c.titleTg ?? ""} · /catalog/{c.slug}
                </span>
              </span>
              <span className="t-caption">
                {c.image ? "с кадром" : "без кадра"}
              </span>
              <span className="t-caption tabular-nums sm:text-right">
                {counts.get(c.slug) ?? 0} тов.
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
