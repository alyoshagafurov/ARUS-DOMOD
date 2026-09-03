"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { slugify } from "@/lib/admin/slug";
import {
  readCatalog,
  removeCategory,
  saveCategory,
} from "@/lib/db/catalog-store";
import type { Category, ProductImage } from "@/types/catalog";

export async function saveCategoryAction(formData: FormData): Promise<void> {
  const existingId = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/admin/categories/${existingId || "new"}?error=title`);
  const slug = slugify(String(formData.get("slug") ?? "").trim() || title);
  const { categories } = readCatalog();
  if (categories.some((c) => c.slug === slug && c.id !== existingId)) {
    redirect(`/admin/categories/${existingId || "new"}?error=slug`);
  }
  const existing = categories.find((c) => c.id === existingId);
  let image: ProductImage | undefined = existing?.image;
  try {
    const parsed: unknown = JSON.parse(String(formData.get("image") ?? "[]"));
    const first = Array.isArray(parsed) ? parsed[0] : null;
    image =
      first && typeof first.url === "string"
        ? {
            url: first.url,
            width: Number(first.width) || 1000,
            height: Number(first.height) || 1000,
            alt: title,
          }
        : undefined;
  } catch {}

  const category: Category = {
    id: existingId || `cat-${slug}`,
    slug,
    title,
    ...(String(formData.get("titleTg") ?? "").trim()
      ? { titleTg: String(formData.get("titleTg")).trim() }
      : null),
    ...(String(formData.get("titleEn") ?? "").trim()
      ? { titleEn: String(formData.get("titleEn")).trim() }
      : null),
    ...(String(formData.get("description") ?? "").trim()
      ? { description: String(formData.get("description")).trim() }
      : null),
    ...(image ? { image } : null),
    order: Math.round(Number(formData.get("order")) || categories.length + 1),
  };
  saveCategory(category);
  revalidatePath("/", "layout");
  redirect(`/admin/categories/${category.id}?saved=1`);
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { products, categories } = readCatalog();
  const cat = categories.find((c) => c.id === id);
  if (cat && products.some((p) => p.categorySlug === cat.slug)) {
    redirect(`/admin/categories/${id}?error=used`);
  }
  removeCategory(id);
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}
