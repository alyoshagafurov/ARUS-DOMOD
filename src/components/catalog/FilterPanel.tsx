"use client";

import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { cn } from "@/lib/cn";
import { useDictionary } from "@/lib/i18n/client";
import type { Availability, CatalogFacets, OfferKind } from "@/types/catalog";

import { priceBands, type CatalogFilters } from "./filters";

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  facets: CatalogFacets;
  filters: CatalogFilters;
  onChange: (next: Partial<CatalogFilters>) => void;
  onReset: () => void;
  total: number;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-hairline pt-6 first:border-t-0 first:pt-0">
      <legend className="t-label float-left w-full pb-4 text-ink-muted">
        {title}
      </legend>
      <div className="clear-both flex flex-col gap-1">{children}</div>
    </fieldset>
  );
}

function Option({
  checked,
  onSelect,
  label,
  count,
  type,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  count?: number;
  type: "radio" | "checkbox";
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-between gap-4 py-2.5",
        "transition-colors duration-[var(--dur-fast)]",
        checked ? "text-ink" : "text-ink-secondary hover:text-ink",
      )}
    >
      <span className="flex items-center gap-3">
        <input
          type={type}
          checked={checked}
          onChange={onSelect}
          className="h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
        <span className="t-body-sm">{label}</span>
      </span>
      {count !== undefined ? (
        <span className="t-caption tabular-nums">{count}</span>
      ) : null}
    </label>
  );
}

/**
 * Панель фильтров.
 *
 * Показываются только те грани, для которых в текущей выборке есть данные:
 * фильтр по размеру среди украшений — ложь интерфейса. Категория сюда
 * намеренно не вынесена: ею управляет ряд разделов над сеткой, и второй
 * элемент управления тем же полем сбивает с толку.
 */
export function FilterPanel({
  open,
  onClose,
  facets,
  filters,
  onChange,
  onReset,
  total,
}: FilterPanelProps) {
  const t = useDictionary();
  const bands = priceBands(facets.price);
  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t.catalog.filters}
      footer={
        <div className="flex items-center gap-3">
          <Button onClick={onClose} fullWidth>
            {t.catalog.show(total)}
          </Button>
          <Button onClick={onReset} variant="ghost" className="shrink-0 px-4">
            {t.catalog.reset}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        {facets.offerKinds.length > 1 ? (
          <Section title={t.catalog.offerKind}>
            {facets.offerKinds.map(({ value, count }) => (
              <Option
                key={value}
                type="radio"
                checked={filters.offerKind === value}
                onSelect={() =>
                  onChange({
                    offerKind:
                      filters.offerKind === value
                        ? undefined
                        : (value as OfferKind),
                  })
                }
                label={value === "rental" ? t.cart.rental : t.cart.purchase}
                count={count}
              />
            ))}
          </Section>
        ) : null}

        {bands.length > 0 ? (
          <Section title={t.catalog.price}>
            {bands.map((band, index) => (
              <Option
                key={band.label}
                type="radio"
                checked={filters.priceBand === index}
                onSelect={() =>
                  onChange({
                    priceBand: filters.priceBand === index ? undefined : index,
                  })
                }
                label={band.label}
              />
            ))}
          </Section>
        ) : null}

        {facets.availability.length > 1 ? (
          <Section title={t.catalog.availability}>
            {facets.availability.map(({ value, count }) => (
              <Option
                key={value}
                type="checkbox"
                checked={filters.availability.includes(value)}
                onSelect={() =>
                  onChange({
                    availability: toggle(
                      filters.availability,
                      value as Availability,
                    ),
                  })
                }
                label={t.product.availability[value]}
                count={count}
              />
            ))}
          </Section>
        ) : null}

        {facets.sizes.length > 0 ? (
          <Section title={t.catalog.sizes}>
            <div className="flex flex-wrap gap-2 pt-1">
              {facets.sizes.map(({ value, count }) => {
                const checked = filters.sizes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={checked}
                    onClick={() =>
                      onChange({ sizes: toggle(filters.sizes, value) })
                    }
                    className={cn(
                      "t-label h-11 min-w-[3.25rem] rounded-pill border px-4",
                      "transition-colors duration-[var(--dur-fast)]",
                      checked
                        ? "border-accent bg-accent text-accent-contrast"
                        : "border-strong text-ink-secondary hover:border-accent hover:text-ink",
                    )}
                  >
                    {value}
                    <span className="t-caption ml-1.5 tabular-nums">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
        ) : null}
      </div>
    </Drawer>
  );
}
