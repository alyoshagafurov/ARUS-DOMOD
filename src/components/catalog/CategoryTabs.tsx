"use client";

import { cn } from "@/lib/cn";
import { useDictionary, useLocale } from "@/lib/i18n/client";
import { categoryTitle } from "@/lib/i18n/labels";
import type { Category, FacetValue } from "@/types/catalog";

interface CategoryTabsProps {
  categories: Category[];
  counts: FacetValue<string>[];
  value?: string;
  onChange: (slug: string | undefined) => void;
  total: number;
}

/**
 * Переключатель разделов.
 *
 * Активный отмечен тонкой каймой снизу, а не залитой капсулой: каталог должен
 * остаться интерфейсом дома моды. На узких экранах ряд горизонтально
 * прокручивается и уходит под край — так видно, что справа есть продолжение.
 *
 * Это <nav> с aria-current, а не role="tablist": вкладки обязывают к панелям
 * и навигации стрелками, а здесь ни того, ни другого нет. Обещать роль,
 * которую не отработал, хуже, чем не обещать её вовсе.
 */
export function CategoryTabs({
  categories,
  counts,
  value,
  onChange,
  total,
}: CategoryTabsProps) {
  const t = useDictionary();
  const locale = useLocale();
  const countOf = new Map(counts.map((c) => [c.value, c.count]));
  const shown = categories.filter((category) => countOf.has(category.slug));

  const tabs = [
    {
      slug: undefined as string | undefined,
      label: t.common.all,
      count: total,
    },
    ...shown.map((category) => ({
      slug: category.slug,
      label: categoryTitle(category, locale),
      count: countOf.get(category.slug) ?? 0,
    })),
  ];

  return (
    <div
      className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)]
        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <nav
        aria-label={t.misc.catalogSections}
        className="flex w-max items-center gap-2 py-1"
      >
        {tabs.map((tab) => {
          const active = tab.slug === value;
          return (
            <button
              key={tab.slug ?? "all"}
              type="button"
              aria-current={active ? "true" : undefined}
              onClick={() => onChange(tab.slug)}
              className={cn(
                "inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-pill border px-4",
                "transition-[background-color,color,border-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
                active
                  ? "border-accent bg-accent text-accent-contrast shadow-raise"
                  : "border-strong text-ink hover:-translate-y-0.5 hover:border-accent hover:bg-accent-quiet",
              )}
            >
              <span className="t-label">{tab.label}</span>
              <span
                className={cn(
                  "t-caption tabular-nums",
                  active ? "text-accent-contrast/80" : "text-ink-muted",
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
