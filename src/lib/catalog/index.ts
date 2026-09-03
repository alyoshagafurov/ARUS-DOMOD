import {
  getCatalogRepository,
  setCatalogRepository,
  type CatalogRepository,
} from "@/lib/catalog/repository";
import { sqliteCatalogRepository } from "@/lib/catalog/sqlite-repository";

/**
 * Серверная дверь в каталог — единственное место, которое знает, что за
 * данными стоит SQLite.
 *
 * Импортируется ТОЛЬКО из серверного кода: страниц, route handlers,
 * серверных компонентов. Клиентские компоненты ходят через
 * `@/lib/catalog/client` — тот же контракт CatalogRepository, но поверх
 * HTTP: в браузере базы нет, и тянуть node:sqlite в бандл нельзя.
 *
 * Переход на внешний Postgres = другая реализация репозитория и одна строка
 * ниже. Ни одна страница при этом не меняется.
 */
setCatalogRepository(sqliteCatalogRepository);

export const catalog = (): CatalogRepository => getCatalogRepository();

export type { CatalogRepository };
