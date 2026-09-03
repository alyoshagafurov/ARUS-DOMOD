import { createCatalogRepository } from "@/lib/catalog/engine";
import {
  categories,
  collections,
  featuredSlugs,
  products,
} from "@/lib/catalog/mock-data";

/**
 * Демо-реализация каталога поверх статических массивов.
 *
 * Логика фильтров, фасетов и пагинации живёт в engine.ts и общая с базой:
 * этот файл лишь подставляет источник. Остаётся как запасной вариант и как
 * источник первичного наполнения базы.
 */
export const mockCatalogRepository = createCatalogRepository(() => ({
  products,
  categories,
  collections,
  featuredSlugs,
}));
