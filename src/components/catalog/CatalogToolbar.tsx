"use client";

import { ArrowIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useDictionary } from "@/lib/i18n/client";
import type { CatalogSort } from "@/types/catalog";

/**
 * Значение по умолчанию должно помещаться в узкий <select> на телефоне
 * целиком — иначе первое, что видит пользователь, это обрезанное слово.
 */

interface CatalogToolbarProps {
  total: number;
  sort: CatalogSort;
  onSortChange: (sort: CatalogSort) => void;
  onOpenFilters: () => void;
  onOpenSearch: () => void;
  activeFilterCount: number;
  searchQuery: string;
}

/**
 * Панель над сеткой: сколько нашлось, чем искать, чем сортировать.
 *
 * Липкая на всех экранах — при длинной ленте фильтр не должен требовать
 * прокрутки вверх. Отступ сверху ровно в высоту шапки: в прокрученном
 * состоянии она занимает первые var(--header-h) пикселей, и панель обязана
 * встать под ней, а не за ней. Сортировка — нативный <select>: он бесплатно даёт
 * клавиатуру, скринридер и родное колесо на телефоне, а внешний вид у него
 * здесь всё равно наш.
 */
export function CatalogToolbar({
  total,
  sort,
  onSortChange,
  onOpenFilters,
  onOpenSearch,
  activeFilterCount,
  searchQuery,
}: CatalogToolbarProps) {
  const t = useDictionary();
  const sortLabels: Record<CatalogSort, string> = {
    featured: t.catalog.sortFeatured,
    newest: t.catalog.sortNewest,
    price_asc: t.catalog.sortPriceAsc,
    price_desc: t.catalog.sortPriceDesc,
  };
  return (
    <div
      data-surface="day"
      className="sticky top-[calc(var(--header-h)+0.5rem)] z-30 rounded-[var(--radius-card)] bg-white/90 px-4 shadow-raise backdrop-blur-[10px] sm:px-5"
    >
      <div className="flex h-14 items-center justify-between gap-3">
        <p className="t-label min-w-0 shrink text-ink-muted" aria-live="polite">
          <span className="tabular-nums text-ink">{total}</span>
          {searchQuery ? (
            <span className="hidden sm:inline"> · «{searchQuery}»</span>
          ) : null}
        </p>

        <div className="flex min-w-0 items-center gap-1 sm:gap-4">
          <button
            type="button"
            onClick={onOpenSearch}
            className="t-label tap-icon inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2
              text-ink-secondary hover:text-ink sm:w-auto sm:px-2"
          >
            <SearchIcon className="h-[1.1em] w-[1.1em]" />
            <span className="hidden sm:inline">{t.nav.search}</span>
          </button>

          {/* Ширина нативного <select> равна его самому длинному пункту,
              поэтому на узком экране её приходится ограничивать явно —
              иначе «Цена: по возрастанию» выталкивает корзину за край. */}
          <label className="relative inline-flex h-11 min-w-0 items-center">
            <span className="sr-only">{t.catalog.sort}</span>
            <select
              value={sort}
              onChange={(event) =>
                onSortChange(event.target.value as CatalogSort)
              }
              className="t-label h-11 max-w-[6.5rem] cursor-pointer appearance-none overflow-hidden
                text-ellipsis bg-transparent pl-2 pr-6 text-ink-secondary hover:text-ink
                focus-visible:text-ink sm:max-w-none"
            >
              {(Object.keys(sortLabels) as CatalogSort[]).map((key) => (
                <option key={key} value={key}>
                  {sortLabels[key]}
                </option>
              ))}
            </select>
            <ArrowIcon
              aria-hidden="true"
              className="pointer-events-none absolute right-0 h-[0.8em] w-[0.8em] rotate-90 text-ink-muted"
            />
          </label>

          <button
            type="button"
            onClick={onOpenFilters}
            className={cn(
              "t-label inline-flex h-11 shrink-0 items-center gap-2 rounded-pill border px-4",
              "transition-[background-color,color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
              activeFilterCount > 0
                ? "border-accent bg-accent text-accent-contrast"
                : "border-strong text-ink hover:border-accent hover:bg-accent-quiet",
            )}
          >
            {t.catalog.filters}
            {activeFilterCount > 0 ? (
              <span className="tabular-nums">{activeFilterCount}</span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
}
