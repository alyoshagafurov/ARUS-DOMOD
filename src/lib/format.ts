import type { Money, OfferKind, Product, ProductOffer } from "@/types/catalog";

const CURRENCY_SUFFIX: Record<Money["currency"], string> = {
  TJS: "с.",
};

const amountFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Форматирует минорные единицы в человеческую цену: 240000 → «2 400 с.»
 * Копейки (дирамы) показываются только когда они есть.
 */
export function formatMoney(money: Money): string {
  const value = money.amount / 100;
  return `${amountFormatter.format(value)} ${CURRENCY_SUFFIX[money.currency]}`;
}

/** Предложение, которое карточка показывает первым */
export function getPrimaryOffer(
  product: Product,
  preferred: OfferKind = "purchase",
): ProductOffer | undefined {
  return (
    product.offers.find((offer) => offer.kind === preferred) ??
    product.offers[0]
  );
}

const SHORT_DATE = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Asia/Dushanbe",
  day: "2-digit",
  month: "2-digit",
});

/**
 * «01.10» — дата по времени магазина. Числом, а не названием месяца:
 * так одна строка годится для всех трёх языков, и сервер с браузером
 * не расходятся в названиях месяцев на таджикском.
 */
export const formatShortDate = (iso: string): string =>
  SHORT_DATE.format(new Date(iso));

/** 1 товар, 3 товара, 5 товаров */
export function pluralRu(
  n: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return forms[1];
  }
  return forms[2];
}

export function hasDiscount(offer: ProductOffer): boolean {
  return (
    offer.compareAtPrice !== undefined &&
    offer.compareAtPrice.amount > offer.price.amount
  );
}

export function discountPercent(offer: ProductOffer): number | null {
  if (!hasDiscount(offer) || !offer.compareAtPrice) return null;
  const ratio = 1 - offer.price.amount / offer.compareAtPrice.amount;
  return Math.round(ratio * 100);
}
