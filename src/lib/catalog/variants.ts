import type { Product, ProductImage } from "@/types/catalog";

/* -------------------------------------------------------------------------
   Размеры и цвета образа.

   Варианты товара — это размер × цвет, и витрина, корзина и заказ работают
   с вариантами. Здесь из вариантов выводятся оси выбора: какие размеры
   и какие цвета у образа есть, в каком порядке их показывать и какие
   кадры относятся к выбранному цвету. Модуль чистый, его импортируют и
   сервер, и клиент.
   ------------------------------------------------------------------------- */

export interface ColorOption {
  name: string;
  /** Образец для кружка; у своего цвета без образца — нет */
  hex?: string;
}

/**
 * Цвета, из которых владелец выбирает нажатием. Это варианты интерфейса,
 * а не сведения о товарах: какой цвет у образа, решает человек в админке.
 * Цвет, вписанный вручную, после сохранения тоже появится среди вариантов —
 * их список собирается из каталога.
 */
export const COLOR_PRESETS: ColorOption[] = [
  { name: "Белый", hex: "#ffffff" },
  { name: "Молочный", hex: "#f3ead7" },
  { name: "Бежевый", hex: "#d9c3a0" },
  { name: "Золотой", hex: "#c9a04e" },
  { name: "Серебристый", hex: "#c4c7cb" },
  { name: "Розовый", hex: "#e3a3b6" },
  { name: "Красный", hex: "#b3261e" },
  { name: "Бордовый", hex: "#6e1b2a" },
  { name: "Зелёный", hex: "#1f6b4a" },
  { name: "Бирюзовый", hex: "#2a9d9a" },
  { name: "Синий", hex: "#23408e" },
  { name: "Фиолетовый", hex: "#5e3b7c" },
  { name: "Чёрный", hex: "#1b1b1b" },
];

/** Размеры, которые предлагаются, даже если в каталоге их ещё нет */
export const SIZE_PRESETS = [
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
  "50",
  "52",
  "54",
  "56",
];

/** «38» < «40» < «100», буквенные — по алфавиту */
export const compareSizes = (a: string, b: string) =>
  a.localeCompare(b, "ru", { numeric: true });

export function productSizes(product: Product): string[] {
  return [
    ...new Set(
      product.variants
        .map((variant) => variant.size)
        .filter((size): size is string => Boolean(size)),
    ),
  ];
}

/** Цвета образа в том порядке, в каком их расставил владелец */
export function productColors(product: Product): ColorOption[] {
  const seen = new Map<string, ColorOption>();
  for (const variant of product.variants) {
    if (!variant.colorName || seen.has(variant.colorName)) continue;
    seen.set(variant.colorName, {
      name: variant.colorName,
      ...(variant.colorHex ? { hex: variant.colorHex } : null),
    });
  }
  return [...seen.values()];
}

/** Одинаковые имена цвета сравниваются без учёта регистра и «ё» */
export const colorKey = (name: string) =>
  name.trim().toLocaleLowerCase("ru").replace(/ё/g, "е");

/**
 * Кадры для выбранного цвета: сначала снимки этого цвета, за ними общие.
 *
 * Снимки других цветов не показываются — покупатель выбрал синий и не
 * должен листать красный. Если у цвета своих кадров нет, остаются общие;
 * если нет и общих, показывается всё, что есть: пустая галерея хуже
 * кадра соседнего цвета.
 */
export function imagesForColor(
  images: ProductImage[],
  color: string | undefined,
): ProductImage[] {
  const common = images.filter((image) => !image.color);
  const own = color ? images.filter((image) => image.color === color) : [];
  const visible = [...own, ...common];
  return visible.length > 0 ? visible : images;
}
