import { NextResponse, type NextRequest } from "next/server";

import { catalog } from "@/lib/catalog";
import type { CatalogQuery } from "@/types/catalog";

/**
 * HTTP-обёртка над каталогом для клиентских компонентов.
 *
 * Только чтение. Все операции — те же методы CatalogRepository, что и на
 * сервере; здесь нет ни одной своей выборки, поэтому клиент и сервер не
 * могут разойтись в логике фильтров.
 */
function parseQuery(request: NextRequest): CatalogQuery {
  const raw = request.nextUrl.searchParams.get("q");
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as CatalogQuery)
      : {};
  } catch {
    return {};
  }
}

/* Тип контекста записан руками: сгенерированный RouteContext появляется
   только после next build, а typecheck на свежем клоне должен проходить. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ op: string[] }> },
) {
  const { op } = await context.params;
  const [head, arg] = op;
  const repo = catalog();

  switch (head) {
    case "products":
      return NextResponse.json(await repo.listProducts(parseQuery(request)));
    case "facets":
      return NextResponse.json(await repo.listFacets(parseQuery(request)));
    case "product":
      return NextResponse.json(
        arg ? await repo.getProductBySlug(decodeURIComponent(arg)) : null,
      );
    case "categories":
      return NextResponse.json(await repo.listCategories());
    case "category":
      return NextResponse.json(
        arg ? await repo.getCategoryBySlug(decodeURIComponent(arg)) : null,
      );
    case "collections":
      return NextResponse.json(await repo.listCollections());
    case "featured":
      return NextResponse.json(await repo.listFeatured());
    default:
      return NextResponse.json(
        { error: "Неизвестная операция" },
        { status: 404 },
      );
  }
}
