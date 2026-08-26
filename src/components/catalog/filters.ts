import { formatMoney } from "@/lib/format";
import type {
  Availability,
  CatalogFacets,
  CatalogQuery,
  CatalogSort,
  OfferKind,
} from "@/types/catalog";

/**
 * Состояние фильтров каталога.
 *
 * Живёт отдельно от компонентов, потому что его читают трое: панель фильтров,
 * панель активных условий и сам запрос к репозиторию. Держать это внутри
 * одного компонента — значит рано или поздно рассинхронизировать их.
 */
export interface CatalogFilters {
  categorySlug?: string;
  offerKind?: OfferKind;
  sizes: string[];
  availability: Availability[];
  /** Индекс ценового диапазона из priceBands(); undefined — любая цена */
  priceBand?: number;
  search: string;
  sort: CatalogSort;
}

/** Шаг ленты: столько карточек добавляет «Показать ещё» */
export const CATALOG_PAGE_SIZE = 12;

export const emptyFilters: CatalogFilters = {
  sizes: [],
  availability: [],
  search: "",
  sort: "featured",
};

export const offerKindLabels: Record<OfferKind, string> = {
  purchase: "Покупка",
  rental: "Прокат",
};

export const availabilityLabels: Record<Availability, string> = {
  in_stock: "В наличии",
  made_to_order: "Под заказ",
  rental_only: "Только прокат",
  sold_out: "Продано",
};

export interface PriceBand {
  label: string;
  min?: number;
  max?: number;
}

/**
 * Диапазоны цены выводятся из данных, а не задаются константами: если
 * в выборке остались одни аксессуары, «от 900 000» показывать бессмысленно.
 * Ползунок здесь был бы хуже — на телефоне в него трудно попасть.
 */
export function priceBands(range: CatalogFacets["price"]): PriceBand[] {
  if (!range || range.max <= range.min) return [];

  const money = (amount: number) => formatMoney({ amount, currency: "TJS" });
  const step = Math.ceil((range.max - range.min) / 3 / 50000) * 50000;
  if (step <= 0) return [];

  const first = range.min + step;
  const second = range.min + step * 2;

  return [
    { label: `до ${money(first)}`, max: first },
    { label: `${money(first)} — ${money(second)}`, min: first, max: second },
    { label: `от ${money(second)}`, min: second },
  ];
}

export function toQuery(
  filters: CatalogFilters,
  bands: PriceBand[],
  pageSize: number,
): CatalogQuery {
  const band = filters.priceBand !== undefined ? bands[filters.priceBand] : undefined;

  return {
    categorySlug: filters.categorySlug,
    offerKind: filters.offerKind,
    sizes: filters.sizes.length ? filters.sizes : undefined,
    availability: filters.availability.length ? filters.availability : undefined,
    priceMin: band?.min,
    priceMax: band?.max,
    search: filters.search.trim() || undefined,
    sort: filters.sort,
    page: 1,
    pageSize,
  };
}

/** Ключ запроса — им же сверяется, устарела ли текущая выдача */
export function queryKey(query: CatalogQuery): string {
  return JSON.stringify(query);
}

/** Категория и сортировка не считаются: у них есть собственные элементы UI */
export function activeFilterCount(filters: CatalogFilters): number {
  return (
    (filters.offerKind ? 1 : 0) +
    (filters.priceBand !== undefined ? 1 : 0) +
    filters.availability.length +
    filters.sizes.length
  );
}
