import type { CatalogData } from "@/lib/catalog/engine";
import type { Discount, Product, ProductSale } from "@/types/catalog";

/* -------------------------------------------------------------------------
   Скидки: срок, выбор товаров, цена.

   Скидка не записывается в товар. Каталог хранит основную цену, таблица
   скидок — проценты и сроки, а сниженная цена вычисляется при чтении.
   Так скидка сама начинается и сама заканчивается, её удаление ничего не
   ломает, а форма товара в админке никогда не видит сниженную цену и не
   может сохранить её как основную.

   Модуль чистый: его импортируют и сервер, и форма скидки в браузере —
   для предпросмотра цены.
   ------------------------------------------------------------------------- */

export const SHOP_TIME_ZONE = "Asia/Dushanbe";
/** Таджикистан не переходит на летнее время — смещение постоянное */
const SHOP_OFFSET = "+05:00";

export const MIN_PERCENT = 1;
export const MAX_PERCENT = 90;

const DAY_KEY = new Intl.DateTimeFormat("en-CA", {
  timeZone: SHOP_TIME_ZONE,
  dateStyle: "short",
});

/** День магазина «2026-09-17» для момента времени */
export const shopDay = (moment: number | string | Date): string =>
  DAY_KEY.format(new Date(moment));

/** Начало дня по Душанбе, ISO */
export const dayStart = (day: string): string =>
  new Date(`${day}T00:00:00.000${SHOP_OFFSET}`).toISOString();

/** Конец дня по Душанбе, ISO */
export const dayEnd = (day: string): string =>
  new Date(`${day}T23:59:59.999${SHOP_OFFSET}`).toISOString();

export function addDays(day: string, days: number): string {
  // Полдень, а не полночь: прибавление суток не перескочит через границу дня
  const moment = new Date(`${day}T12:00:00${SHOP_OFFSET}`);
  moment.setUTCDate(moment.getUTCDate() + days);
  return shopDay(moment);
}

export const isDay = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export type DiscountState = "active" | "scheduled" | "ended";

export function discountState(discount: Discount, now: number): DiscountState {
  if (now < Date.parse(discount.startsAt)) return "scheduled";
  if (now > Date.parse(discount.endsAt)) return "ended";
  return "active";
}

/**
 * Скидка снижает цену покупки. Образ только для проката её не получает:
 * цены покупки у него нет, а лента «Скидка» без сниженной цены была бы
 * неправдой.
 */
export const purchasable = (product: Product): boolean =>
  product.offers.some((offer) => offer.kind === "purchase");

export function appliesTo(discount: Discount, product: Product): boolean {
  if (!purchasable(product)) return false;
  switch (discount.scope) {
    case "all":
      return true;
    case "categories":
      return discount.categorySlugs.includes(product.categorySlug);
    case "products":
      return discount.productIds.includes(product.id);
  }
}

export const discountTargets = (
  discount: Discount,
  products: Product[],
): Product[] => products.filter((product) => appliesTo(discount, product));

/** Цена со скидкой — до целого сомони и не ниже одного сомони */
export const discountedAmount = (amount: number, percent: number): number =>
  Math.max(100, Math.round((amount * (100 - percent)) / 10_000) * 100);

/**
 * Скидка, которая действует на товар сейчас. Скидки не складываются:
 * если товар попал под несколько, берётся наибольшая — так покупатель
 * видит одну понятную цифру, а не произведение процентов.
 */
export function saleFor(
  product: Product,
  discounts: Discount[],
  now: number,
): ProductSale | null {
  let best: ProductSale | null = null;
  for (const discount of discounts) {
    if (discountState(discount, now) !== "active") continue;
    if (!appliesTo(discount, product)) continue;
    if (
      !best ||
      discount.percent > best.percent ||
      (discount.percent === best.percent && discount.endsAt > best.endsAt)
    ) {
      best = { percent: discount.percent, endsAt: discount.endsAt };
    }
  }
  return best;
}

/** Товар со сниженной ценой покупки; основная цена уходит в compareAtPrice */
export function withSale(product: Product, sale: ProductSale): Product {
  return {
    ...product,
    sale,
    offers: product.offers.map((offer) =>
      offer.kind === "purchase"
        ? {
            ...offer,
            price: {
              ...offer.price,
              amount: discountedAmount(offer.price.amount, sale.percent),
            },
            compareAtPrice: offer.price,
          }
        : offer,
    ),
  };
}

/**
 * Каталог со скидками на момент `now`.
 *
 * Результат запоминается, пока не сменились снимок каталога, список скидок
 * или минута: витрина читает каталог несколько раз за запрос, и пересчёт
 * на каждое чтение был бы пустой работой. Минуты достаточно — скидка
 * начинается и кончается на границе суток.
 */
let memo: {
  catalog: CatalogData;
  discounts: Discount[];
  minute: number;
  result: CatalogData;
} | null = null;

export function applySales(
  catalog: CatalogData,
  discounts: Discount[],
  now: number,
): CatalogData {
  const minute = Math.floor(now / 60_000);
  if (
    memo &&
    memo.catalog === catalog &&
    memo.discounts === discounts &&
    memo.minute === minute
  ) {
    return memo.result;
  }

  const result =
    discounts.length === 0
      ? catalog
      : {
          ...catalog,
          products: catalog.products.map((product) => {
            const sale = saleFor(product, discounts, now);
            return sale ? withSale(product, sale) : product;
          }),
        };
  memo = { catalog, discounts, minute, result };
  return result;
}
