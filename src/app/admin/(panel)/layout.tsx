import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { AdminNav } from "@/components/admin/pending";
import { requireAdmin } from "@/lib/admin/auth";

import { logout } from "../login/actions";

const nav = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
];

export const metadata = {
  title: { default: "Админка", template: "%s · Админка ARUS DOMOD" },
  robots: { index: false, follow: false },
};

/**
 * Оболочка админки. Рабочее место, а не витрина: светлая поверхность,
 * плотная типографика, никакого дамаска. Из бренда здесь только знак,
 * золотая линия и та же гарнитура — чтобы владелец узнавал свой сайт.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div
      data-surface="day"
      className="min-h-svh lg:grid lg:grid-cols-[15rem_1fr]"
    >
      <aside className="border-b border-hairline bg-muted lg:sticky lg:top-0 lg:h-svh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-6">
          <Link href="/admin" className="flex h-11 items-center text-[0.9rem]">
            <Logo variant="lockup" />
          </Link>
          <span className="t-label text-ink-muted lg:mt-2 lg:block">
            Админка
          </span>
        </div>
        <nav
          aria-label="Разделы админки"
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3"
        >
          <AdminNav items={nav} />
          <Link
            href="/"
            className="tap-icon flex h-11 shrink-0 items-center rounded-md px-3 text-ink-secondary hover:text-ink lg:mt-auto"
          >
            <span className="t-label">На сайт →</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="tap-icon flex h-11 w-full items-center rounded-md px-3 text-ink-muted hover:text-ink"
            >
              <span className="t-label">Выйти</span>
            </button>
          </form>
        </nav>
      </aside>
      <main className="min-w-0 px-[var(--gutter)] py-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
