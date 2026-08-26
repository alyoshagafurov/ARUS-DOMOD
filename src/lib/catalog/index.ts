import { mockCatalogRepository } from "@/lib/catalog/mock-repository";
import {
  getCatalogRepository,
  setCatalogRepository,
  type CatalogRepository,
} from "@/lib/catalog/repository";

/**
 * Точка регистрации источника каталога — единственное место в проекте,
 * которое знает, что сейчас за данными стоит mock.
 *
 * Переход на реальный API = заменить здесь импорт на apiCatalogRepository.
 * Ни одна страница и ни один компонент при этом не меняются.
 */
setCatalogRepository(mockCatalogRepository);

export const catalog = (): CatalogRepository => getCatalogRepository();

export type { CatalogRepository };
