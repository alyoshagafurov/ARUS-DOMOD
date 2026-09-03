"use client";

import { useDictionary } from "@/lib/i18n/client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ActiveFilters } from "@/components/catalog/ActiveFilters";
import { CatalogEmpty } from "@/components/catalog/CatalogEmpty";
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { CategoryTabs } from "@/components/catalog/CategoryTabs";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import {
  activeFilterCount,
  CATALOG_PAGE_SIZE,
  emptyFilters,
  priceBands,
  queryKey,
  toQuery,
  type CatalogFilters,
} from "@/components/catalog/filters";
import { Container } from "@/components/layout/Container";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { Button } from "@/components/ui/Button";
import { catalog } from "@/lib/catalog/client";
import type {
  CatalogFacets,
  Category,
  Paginated,
  Product,
} from "@/types/catalog";

const PAGE_STEP = CATALOG_PAGE_SIZE;

export interface CatalogSnapshot {
  key: string;
  page: Paginated<Product>;
  facets: CatalogFacets;
}

interface CatalogViewProps {
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
  /** Выдача под запрос по умолчанию, посчитанная на сервере */
  initial: CatalogSnapshot;
}

/**
 * Каталог: состояние фильтров, запрос к репозиторию, раскладка.
 *
 * Данные берутся через `catalog()` — тот же контракт, что и у главной. Пока за
 * ним стоит mock, вызов исполняется прямо в браузере; когда появится API,
 * реализация репозитория станет сетевой, а этот компонент не изменится.
 *
 * Состояния «идёт загрузка» здесь нет отдельным флагом: выдача хранится
 * вместе с ключом запроса, который её породил, и устаревание выводится
 * сравнением ключей. Так невозможно забыть сбросить флаг.
 */
export function CatalogView({
  categories,
  initialCategory,
  initialSearch,
  initial,
}: CatalogViewProps) {
  const t = useDictionary();
  const [filters, setFilters] = useState<CatalogFilters>({
    ...emptyFilters,
    categorySlug: initialCategory,
    search: initialSearch ?? "",
  });
  const [pageSize, setPageSize] = useState(PAGE_STEP);
  const [data, setData] = useState<CatalogSnapshot>(initial);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Стабильные обработчики закрытия: панель и оверлей подписываются на
  // клавиатуру внутри эффекта, и новая функция на каждый рендер заставляла
  // бы их переподписываться без причины.
  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  /**
   * Границы цены берутся числами, а не объектом из фасетов.
   *
   * `listFacets` возвращает новый объект `{min, max}` при каждом вызове, и
   * memo по его идентичности пересчитывался всегда. Дальше по цепочке
   * пересобирался `query`, менялись зависимости эффекта, эффект снова ходил
   * за данными — и так без конца. Страница простаивала, а главный поток был
   * занят: именно отсюда брались «залипающие» клики.
   */
  const priceMin = data.facets.price?.min ?? null;
  const priceMax = data.facets.price?.max ?? null;
  const bands = useMemo(
    () =>
      priceMin === null || priceMax === null
        ? []
        : priceBands({ min: priceMin, max: priceMax }),
    [priceMin, priceMax],
  );

  const query = useMemo(
    () => toQuery(filters, bands, pageSize),
    [filters, bands, pageSize],
  );
  const key = queryKey(query);
  const stale = data.key !== key;

  useEffect(() => {
    let cancelled = false;
    const repository = catalog();
    const nextKey = queryKey(query);

    Promise.all([
      repository.listProducts(query),
      repository.listFacets(query),
    ]).then(([page, facets]) => {
      if (cancelled) return;
      // Тот же запрос — то же состояние: возвращаем прежний снимок, чтобы
      // React вышел из обновления и цикл был невозможен структурно.
      setData((prev) =>
        prev.key === nextKey ? prev : { key: nextKey, page, facets },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  /**
   * Любое изменение условий возвращает ленту к первой странице: оставлять
   * «показано 36» после смены раздела — верный способ показать пустоту.
   * Диапазон цены сбрасывается вместе с разделом, потому что вместе с ним
   * меняются и сами границы.
   */
  const update = (next: Partial<CatalogFilters>) => {
    setPageSize(PAGE_STEP);
    setFilters((current) => {
      const scopeChanged =
        ("categorySlug" in next &&
          next.categorySlug !== current.categorySlug) ||
        ("offerKind" in next && next.offerKind !== current.offerKind);
      return {
        ...current,
        ...next,
        ...(scopeChanged ? { priceBand: undefined } : null),
      };
    });
  };

  const reset = () =>
    update({
      offerKind: undefined,
      sizes: [],
      availability: [],
      priceBand: undefined,
    });

  const chips = [
    ...(filters.offerKind
      ? [
          {
            id: "offer",
            label:
              filters.offerKind === "rental" ? t.cart.rental : t.cart.purchase,
            onRemove: () => update({ offerKind: undefined }),
          },
        ]
      : []),
    ...(filters.priceBand !== undefined && bands[filters.priceBand]
      ? [
          {
            id: "price",
            label: bands[filters.priceBand].label,
            onRemove: () => update({ priceBand: undefined }),
          },
        ]
      : []),
    ...filters.availability.map((value) => ({
      id: `availability-${value}`,
      label: t.product.availability[value],
      onRemove: () =>
        update({
          availability: filters.availability.filter((v) => v !== value),
        }),
    })),
    ...filters.sizes.map((value) => ({
      id: `size-${value}`,
      label: `Размер ${value}`,
      onRemove: () =>
        update({ sizes: filters.sizes.filter((v) => v !== value) }),
    })),
    ...(filters.search
      ? [
          {
            id: "search",
            label: `«${filters.search}»`,
            onRemove: () => update({ search: "" }),
          },
        ]
      : []),
  ];

  const { items, total } = data.page;
  const hasMore = total > items.length;

  return (
    <>
      <Container>
        <CategoryTabs
          categories={categories}
          counts={data.facets.categories}
          value={filters.categorySlug}
          onChange={(slug) => update({ categorySlug: slug })}
          total={data.facets.categories.reduce((sum, c) => sum + c.count, 0)}
        />
      </Container>

      <Container className="mt-6">
        <CatalogToolbar
          total={total}
          sort={filters.sort}
          onSortChange={(sort) => update({ sort })}
          onOpenFilters={() => setFiltersOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          activeFilterCount={activeFilterCount(filters)}
          searchQuery={filters.search}
        />

        <ActiveFilters
          chips={chips}
          onReset={() => update({ ...emptyFilters, sort: filters.sort })}
        />

        <section
          aria-label="Результаты"
          className="pb-[var(--space-section-y)] pt-12 lg:pt-16"
        >
          <h2 className="sr-only">Образы коллекции</h2>
          {stale && items.length === 0 ? (
            <CatalogSkeleton />
          ) : items.length === 0 ? (
            <CatalogEmpty
              onReset={() => update({ ...emptyFilters, sort: filters.sort })}
            />
          ) : (
            <div
              aria-busy={stale}
              className={
                stale
                  ? "opacity-50 transition-opacity duration-[var(--dur-fast)]"
                  : "transition-opacity duration-[var(--dur-fast)]"
              }
            >
              <ProductGrid products={items} categories={categories} />

              {hasMore ? (
                <div className="mt-20 flex items-center gap-6 lg:mt-28">
                  <span
                    className="h-px flex-1 bg-hairline"
                    aria-hidden="true"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setPageSize((size) => size + PAGE_STEP)}
                  >
                    Показать ещё
                  </Button>
                  <span
                    className="h-px flex-1 bg-hairline"
                    aria-hidden="true"
                  />
                </div>
              ) : null}
            </div>
          )}
        </section>
      </Container>

      <FilterPanel
        open={filtersOpen}
        onClose={closeFilters}
        facets={data.facets}
        filters={filters}
        onChange={update}
        onReset={reset}
        total={total}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={closeSearch}
        categories={categories}
        onApply={(value) => update({ search: value })}
      />
    </>
  );
}
