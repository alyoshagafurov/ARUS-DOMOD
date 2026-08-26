import type {
  CatalogFacets,
  CatalogQuery,
  Category,
  Collection,
  Paginated,
  Product,
} from "@/types/catalog";

/**
 * Единственная дверь между UI и данными каталога.
 *
 * Страницы и компоненты НИКОГДА не импортируют mock-данные напрямую — только
 * `getCatalogRepository()`. Благодаря этому переход на реальный API сводится к
 * одной новой реализации интерфейса и одной строке регистрации.
 *
 * Все методы асинхронные намеренно: mock отдаёт готовый объект, но сигнатура
 * уже совпадает с сетевой, поэтому вызывающий код не придётся переписывать.
 */
export interface CatalogRepository {
  listProducts(query?: CatalogQuery): Promise<Paginated<Product>>;
  getProductBySlug(slug: string): Promise<Product | null>;
  listCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  listCollections(): Promise<Collection[]>;
  /**
   * Витринная подборка. Отдельный метод, а не `listProducts({sort})`: порядок
   * «Коллекции 01» задаёт редакция, и никакая сортировка его не выражает.
   */
  listFeatured(): Promise<Product[]>;
  /**
   * Доступные значения фильтров для текущего запроса. Отдельный вызов, а не
   * поле в Paginated: у реального бэкенда это обычно другой эндпоинт, и
   * витрина не должна тянуть грани там, где ей нужен только список.
   */
  listFacets(query?: CatalogQuery): Promise<CatalogFacets>;
}

let activeRepository: CatalogRepository | null = null;

/** Регистрируется один раз при старте приложения (см. src/lib/catalog/index.ts) */
export function setCatalogRepository(repository: CatalogRepository): void {
  activeRepository = repository;
}

export function getCatalogRepository(): CatalogRepository {
  if (!activeRepository) {
    throw new Error(
      "Catalog repository не зарегистрирован. " +
        "Вызовите setCatalogRepository() до первого обращения к каталогу.",
    );
  }

  return activeRepository;
}
