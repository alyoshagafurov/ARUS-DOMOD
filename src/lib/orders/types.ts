import type { Locale, Money, OfferKind } from "@/types/catalog";

/**
 * Статусы заказа — в том порядке, в каком заказ по ним проходит.
 *
 * Сайт денег не принимает: после «Нового» администратор сам связывается с
 * клиентом, подтверждает состав и цену, сообщает реквизиты и отмечает
 * оплату. Статусы заведены с запасом, чтобы позже подключить Alif и
 * автоматизировать переход «ожидает оплаты → оплачен», не меняя модель.
 */
export const ORDER_STATUSES = [
  "new",
  "confirming",
  "confirmed",
  "awaiting_payment",
  "paid",
  "in_delivery",
  "delivered",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type DeliveryMethod = "pickup" | "courier";

/**
 * Строка заказа — СНИМОК товара на момент оформления.
 *
 * Корзина хранит только идентификаторы и берёт цены из каталога, но заказ
 * так устроен быть не может: администратор поменяет цену в карточке, а
 * старый заказ обязан помнить, за сколько его оформляли.
 */
export interface OrderLine {
  productId: string;
  slug: string;
  title: string;
  article?: string;
  offerKind: OfferKind;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
}

export interface OrderCustomer {
  name: string;
  phone: string;
}

export interface OrderDelivery {
  method: DeliveryMethod;
  /** Только при доставке */
  address?: string;
}

export interface OrderTotals {
  items: number;
  goods: Money;
  /**
   * Стоимость доставки согласовывается отдельно и в момент оформления не
   * известна — поле остаётся null, а не нулём: ноль был бы обещанием.
   */
  delivery: Money | null;
  grand: Money;
}

export interface Order {
  /** Публичный номер вида AD-0001 — его называют по телефону */
  id: string;
  number: number;
  status: OrderStatus;
  customer: OrderCustomer;
  delivery: OrderDelivery;
  /** ISO-дата (YYYY-MM-DD), без времени */
  weddingDate?: string;
  comment?: string;
  lines: OrderLine[];
  totals: OrderTotals;
  /** Язык, на котором клиент оформлял заказ */
  locale: Locale;
  createdAt: string;
  updatedAt: string;
}

/** Что присылает форма оформления — до валидации и обогащения из каталога */
export interface OrderDraft {
  customer: OrderCustomer;
  delivery: OrderDelivery;
  weddingDate?: string;
  comment?: string;
  locale: Locale;
  lines: {
    productId: string;
    variantId?: string;
    offerKind: OfferKind;
    quantity: number;
  }[];
}
