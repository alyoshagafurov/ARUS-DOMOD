import type { NavLink } from "@/lib/config/site";
import type { Dictionary } from "@/lib/i18n";
import type { Category, Locale } from "@/types/catalog";

/** Подпись пункта навигации: перевод по ключу, иначе русская строка */
export function navLabel(link: NavLink, t: Dictionary): string {
  return link.key ? t.nav[link.key] : link.label;
}

/**
 * Название категории по локали. Таджикское берётся из карточки категории
 * (titleTg), английское — из titleEn; нет перевода — остаётся русское.
 * Название товара не переводится: у него нет переводов в данных.
 */
export function categoryTitle(category: Category, locale: Locale): string {
  if (locale === "tg") return category.titleTg ?? category.title;
  if (locale === "en") return category.titleEn ?? category.title;
  return category.title;
}
