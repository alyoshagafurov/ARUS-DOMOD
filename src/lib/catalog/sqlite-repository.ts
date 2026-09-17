import { applySales } from "@/lib/catalog/discounts";
import { createCatalogRepository } from "@/lib/catalog/engine";
import { readCatalog, readDiscounts } from "@/lib/db/catalog-store";

/**
 * Каталог из базы. Логика выборок — общая с демо-реализацией (engine.ts),
 * здесь только источник данных.
 *
 * Скидки накладываются здесь, на каждое чтение: витрина, корзина и заказ
 * получают одну и ту же сниженную цену. Админка, которой нужна основная
 * цена, читает `readCatalog()` напрямую.
 */
export const sqliteCatalogRepository = createCatalogRepository(() =>
  applySales(readCatalog(), readDiscounts(), Date.now()),
);
