import { createCatalogRepository } from "@/lib/catalog/engine";
import { readCatalog } from "@/lib/db/catalog-store";

/**
 * Каталог из базы. Логика выборок — общая с демо-реализацией (engine.ts),
 * здесь только источник данных.
 */
export const sqliteCatalogRepository = createCatalogRepository(readCatalog);
