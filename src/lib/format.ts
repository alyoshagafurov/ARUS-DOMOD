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
    product.offers.find((offer) => offer.kind === preferred) ?? product.offers[0]
  );
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
