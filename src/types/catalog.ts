/**
 * Доменные контракты каталога ARUS DOMOD.
 *
 * Эти типы — граница между UI и данными. Сейчас за ними стоят mock-данные,
 * позже — реальный API. Правила, которые делают замену дешёвой:
 *
 *  1. Деньги хранятся в МИНОРНЫХ единицах (дирамах) целым числом.
 *     Никаких float-цен в компонентах.
 *  2. Идентификатор для маршрутов — `slug`, `id` остаётся внутренним.
 *  3. Списки всегда приходят обёрнутыми в `Paginated<T>`, даже если mock
 *     возвращает всё сразу — иначе пагинацию придётся вкручивать позже.
 *  4. Товар может одновременно продаваться и сдаваться в прокат, поэтому
 *     цена живёт в `offers[]`, а не полем `price`.
 */

export type Locale = "ru" | "tg" | "en";

export type CurrencyCode = "TJS";

/** Сумма в минорных единицах: 240000 = 2 400,00 сомонӣ */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

/** Как товар доступен покупателю */
export type OfferKind = "purchase" | "rental";

export type Availability =
  | "in_stock"
  | "made_to_order"
  | "rental_only"
  | "sold_out";

export interface ProductOffer {
  kind: OfferKind;
  price: Money;
  /** Старая цена для перечёркивания; отсутствует, если скидки нет */
  compareAtPrice?: Money;
  /** Только для kind: "rental" — срок аренды в днях */
  rentalPeriodDays?: number;
  /** Только для kind: "rental" — возвратный залог */
  deposit?: Money;
}

export interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  /** base64-заглушка для next/image placeholder="blur" */
  blurDataURL?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  colorName?: string;
  colorHex?: string;
  availability: Availability;
}

/** Короткая плашка на карточке: «Нав», «Прокат», «Танҳо 1» */
export interface ProductBadge {
  label: string;
  tone: "neutral" | "accent" | "gold";
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  /** Артикул изделия вида AD-001 — его называют по телефону и пишут на бирке */
  article?: string;
  categorySlug: string;
  collectionSlug?: string;
  images: ProductImage[];
  offers: ProductOffer[];
  variants: ProductVariant[];
  badges?: ProductBadge[];
  description?: string;
  /** Свободные характеристики: ткань, вышивка, регион, состав */
  attributes?: Record<string, string>;
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  /** Таджикское имя категории — витрина двуязычная */
  titleTg?: string;
  description?: string;
  image?: ProductImage;
  parentSlug?: string;
  order: number;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  cover?: ProductImage;
}

export type CatalogSort =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "newest";

export interface CatalogQuery {
  categorySlug?: string;
  collectionSlug?: string;
  offerKind?: OfferKind;
  sizes?: string[];
  colors?: string[];
  availability?: Availability[];
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sort?: CatalogSort;
  page?: number;
  pageSize?: number;
}

/** Одно значение фильтра и сколько товаров под него подпадает */
export interface FacetValue<T> {
  value: T;
  count: number;
}

/**
 * Что реально можно отфильтровать в текущей выборке.
 *
 * Каждая грань считается по товарам, прошедшим ВСЕ ОСТАЛЬНЫЕ фильтры, кроме
 * самой себя. Иначе выбор одного размера обнулял бы счётчики всех прочих
 * размеров, и фильтр становился бы тупиком.
 *
 * UI обязан скрывать грань, у которой нет значений: показывать фильтр по
 * размеру для украшений, у которых размеров не бывает, — ложь интерфейса.
 */
export interface CatalogFacets {
  categories: FacetValue<string>[];
  offerKinds: FacetValue<OfferKind>[];
  availability: FacetValue<Availability>[];
  sizes: FacetValue<string>[];
  colors: FacetValue<string>[];
  /** Границы цены в минорных единицах; null, если цен в выборке нет */
  price: { min: number; max: number } | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
