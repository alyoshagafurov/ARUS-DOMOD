"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { slugify } from "@/lib/admin/slug";
import { catalog } from "@/lib/catalog";
import {
  readCatalog,
  removeProduct,
  saveProduct,
  setFeaturedSlugs,
} from "@/lib/db/catalog-store";
import type {
  Availability,
  Product,
  ProductImage,
  ProductOffer,
  ProductVariant,
} from "@/types/catalog";

const AVAILABILITY: Availability[] = [
  "in_stock",
  "made_to_order",
  "rental_only",
  "sold_out",
];

/** «1 250,50» → 125050 дирамов; пусто → undefined */
function minor(value: FormDataEntryValue | null): number | undefined {
  const text = String(value ?? "")
    .replace(/\s/g, "")
    .replace(",", ".");
  if (!text) return undefined;
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : undefined;
}

const list = (value: FormDataEntryValue | null): string[] =>
  String(value ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

function parseImages(
  value: FormDataEntryValue | null,
  alt: string,
): ProductImage[] {
  try {
    const parsed: unknown = JSON.parse(String(value ?? "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i): i is ProductImage =>
          typeof i === "object" &&
          i !== null &&
          typeof (i as ProductImage).url === "string",
      )
      .map((i) => ({
        url: i.url,
        width: Number(i.width) || 1000,
        height: Number(i.height) || 1333,
        alt,
        ...(i.blurDataURL ? { blurDataURL: i.blurDataURL } : null),
      }));
  } catch {
    return [];
  }
}

/** Все, кто ходит в базу, обязаны сбросить статику витрины */
function revalidateStorefront(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/product/${slug}`);
}

export async function saveProductAction(formData: FormData): Promise<void> {
  const existingId = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/admin/products/${existingId || "new"}?error=title`);

  const article = String(formData.get("article") ?? "").trim() || undefined;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug =
    slugify(slugInput || article || title) || `item-${Date.now().toString(36)}`;

  // slug обязан быть уникальным: это адрес страницы
  const { products } = readCatalog();
  const clash = products.find((p) => p.slug === slug && p.id !== existingId);
  if (clash) redirect(`/admin/products/${existingId || "new"}?error=slug`);

  const id = existingId || `p-${Date.now().toString(36)}`;
  const availability = AVAILABILITY.includes(
    formData.get("availability") as Availability,
  )
    ? (formData.get("availability") as Availability)
    : "in_stock";

  const offers: ProductOffer[] = [];
  const purchase = minor(formData.get("purchase"));
  const compareAt = minor(formData.get("compareAt"));
  if (purchase) {
    offers.push({
      kind: "purchase",
      price: { amount: purchase, currency: "TJS" },
      ...(compareAt && compareAt > purchase
        ? { compareAtPrice: { amount: compareAt, currency: "TJS" } }
        : null),
    });
  }
  const rentalPrice = minor(formData.get("rental"));
  if (rentalPrice) {
    const days = Math.max(
      1,
      Math.min(3, Math.round(Number(formData.get("rentalDays")) || 3)),
    );
    const deposit = minor(formData.get("deposit"));
    offers.push({
      kind: "rental",
      price: { amount: rentalPrice, currency: "TJS" },
      rentalPeriodDays: days,
      ...(deposit ? { deposit: { amount: deposit, currency: "TJS" } } : null),
    });
  }
  if (offers.length === 0)
    redirect(`/admin/products/${existingId || "new"}?error=price`);

  // Варианты: размер × цвет; нет ни того ни другого — один вариант «OS»
  const sizes = list(formData.get("sizes"));
  const colors = list(formData.get("colors"));
  const base = (article ?? slug).toUpperCase();
  const variants: ProductVariant[] = [];
  const sizeAxis = sizes.length ? sizes : [undefined];
  const colorAxis = colors.length ? colors : [undefined];
  sizeAxis.forEach((size, si) =>
    colorAxis.forEach((color, ci) => {
      variants.push({
        id: `${id}-${si}-${ci}`,
        sku: [base, size ?? "OS", color ? slugify(color).toUpperCase() : null]
          .filter(Boolean)
          .join("-"),
        ...(size ? { size } : null),
        ...(color ? { colorName: color } : null),
        availability,
      });
    }),
  );

  const product: Product = {
    id,
    slug,
    title,
    ...(String(formData.get("subtitle") ?? "").trim()
      ? { subtitle: String(formData.get("subtitle")).trim() }
      : null),
    ...(article ? { article } : null),
    categorySlug: String(formData.get("categorySlug") ?? ""),
    collectionSlug: "collection-01",
    images: parseImages(formData.get("images"), title),
    offers,
    variants,
    ...(String(formData.get("description") ?? "").trim()
      ? { description: String(formData.get("description")).trim() }
      : null),
  };
  saveProduct(product);

  const { featuredSlugs } = readCatalog();
  const wantFeatured = formData.get("featured") === "on";
  const isFeatured = featuredSlugs.includes(slug);
  if (wantFeatured && !isFeatured) setFeaturedSlugs([...featuredSlugs, slug]);
  if (!wantFeatured && isFeatured)
    setFeaturedSlugs(featuredSlugs.filter((s) => s !== slug));

  revalidateStorefront(slug);
  redirect(`/admin/products/${id}?saved=1`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const product = (await catalog().listProducts({ pageSize: 1000 })).items.find(
    (p) => p.id === id,
  );
  removeProduct(id);
  if (product) {
    const { featuredSlugs } = readCatalog();
    if (featuredSlugs.includes(product.slug))
      setFeaturedSlugs(featuredSlugs.filter((s) => s !== product.slug));
  }
  revalidateStorefront(product?.slug);
  redirect("/admin/products");
}
