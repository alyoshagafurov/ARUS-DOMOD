"use client";

import { OrnamentBand } from "@/components/ornament/Ornament";
import { cn } from "@/lib/cn";
import { useDictionary } from "@/lib/i18n/client";
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
      label: category.title,
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
        className="flex w-max items-end gap-7 border-b border-hairline"
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
                // pt-2 к нижнему отступу даёт строке разделов полные 48px по высоте
                "relative whitespace-nowrap pb-4 pt-2 transition-colors",
                "duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
                active ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              <span className="t-label">{tab.label}</span>
              <span className="t-caption ml-2 tabular-nums">{tab.count}</span>

              {active ? (
                <OrnamentBand
                  motif="dandona"
                  height={5}
                  strength="strong"
                  className="absolute inset-x-0 -bottom-px"
                />
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
