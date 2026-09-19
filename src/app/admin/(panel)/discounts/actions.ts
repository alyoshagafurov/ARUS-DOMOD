"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { notifySearchEngines } from "@/lib/seo/indexnow";

import {
  MAX_PERCENT,
  MIN_PERCENT,
  dayEnd,
  dayStart,
  discountState,
  discountTargets,
  isDay,
} from "@/lib/catalog/discounts";
import {
  getDiscount,
  readCatalog,
  removeDiscount,
  saveDiscount,
} from "@/lib/db/catalog-store";
import type { Discount, DiscountScope } from "@/types/catalog";

const SCOPES: DiscountScope[] = ["all", "categories", "products"];

/** Список строк из скрытого поля JSON; всё постороннее отбрасывается */
function strings(value: FormDataEntryValue | null): string[] {
  try {
    const parsed: unknown = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((s): s is string => typeof s === "string"))]
      : [];
  } catch {
    return [];
  }
}

export async function saveDiscountAction(formData: FormData): Promise<void> {
  const existingId = String(formData.get("id") ?? "").trim();
  const back = `/admin/discounts/${existingId || "new"}`;

  const percent = Math.round(Number(formData.get("percent")));
  if (
    !Number.isFinite(percent) ||
    percent < MIN_PERCENT ||
    percent > MAX_PERCENT
  ) {
    redirect(`${back}?error=percent`);
  }

  const rawScope = String(formData.get("scope") ?? "") as DiscountScope;
  const scope = SCOPES.includes(rawScope) ? rawScope : "all";

  // Выбор сверяется с каталогом: форма приходит из браузера, и в скидку не
  // должен попасть ни удалённый товар, ни выдуманная категория
  const { products, categories } = readCatalog();
  const categorySlugs =
    scope === "categories"
      ? strings(formData.get("categorySlugs")).filter((slug) =>
          categories.some((c) => c.slug === slug),
        )
      : [];
  const productIds =
    scope === "products"
      ? strings(formData.get("productIds")).filter((id) =>
          products.some((p) => p.id === id),
        )
      : [];
  if (
    (scope === "categories" && categorySlugs.length === 0) ||
    (scope === "products" && productIds.length === 0)
  ) {
    redirect(`${back}?error=targets`);
  }

  // Дни «2026-09-17» сравниваются строкой: формат это позволяет
  const from = String(formData.get("from") ?? "");
  const to = String(formData.get("to") ?? "");
  if (!isDay(from) || !isDay(to) || to < from) {
    redirect(`${back}?error=dates`);
  }

  const existing = existingId ? getDiscount(existingId) : null;
  // Поправленная владельцем демо-скидка становится его скидкой: метка
  // «демо» с неё снимается
  const discount: Discount = {
    id: existing?.id ?? `d-${Date.now().toString(36)}`,
    percent,
    scope,
    categorySlugs,
    productIds,
    startsAt: dayStart(from),
    endsAt: dayEnd(to),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  saveDiscount(discount);

  revalidatePath("/", "layout");
  // Цена со скидкой — изменение страниц этих товаров. Но только если
  // скидка уже идёт: у запланированной на будущее цены пока прежние, и
  // звать поисковик не на что.
  const started = discountState(discount, Date.now()) === "active";
  after(() =>
    notifySearchEngines(
      started
        ? [
            ...discountTargets(discount, products).map(
              (p) => `/product/${p.slug}`,
            ),
            "/catalog",
          ]
        : [],
    ),
  );
  redirect("/admin/discounts?saved=1");
}

export async function deleteDiscountAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const removed = getDiscount(id);
  removeDiscount(id);
  revalidatePath("/", "layout");
  // Цены вернулись к прежним — но только у той скидки, что шла сейчас:
  // снятие запланированной или уже истёкшей витрину не меняет
  const wasActive = removed
    ? discountState(removed, Date.now()) === "active"
    : false;
  after(() =>
    notifySearchEngines(
      wasActive && removed
        ? [
            ...discountTargets(removed, readCatalog().products).map(
              (p) => `/product/${p.slug}`,
            ),
            "/catalog",
          ]
        : [],
    ),
  );
  redirect("/admin/discounts?deleted=1");
}
