"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { notifySearchEngines } from "@/lib/seo/indexnow";

import { slugify } from "@/lib/admin/slug";
import { catalog } from "@/lib/catalog";
import { colorKey, compareSizes } from "@/lib/catalog/variants";
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

const MAX_SIZE = 10;
const MAX_COLOR_NAME = 32;
const PHOTOS_PER_COLOR = 6;
const HEX = /^#[0-9a-f]{6}$/i;

/** «1 250,50» → 125050 дирамов; пусто → undefined */
function minor(value: FormDataEntryValue | null): number | undefined {
  const text = String(value ?? "")
    .replace(/\s/g, "")
    .replace(",", ".");
  if (!text) return undefined;
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : undefined;
}

/** Скрытые поля приходят JSON; сломанное или чужое — пустой список */
function jsonArray(value: FormDataEntryValue | null): unknown[] {
  try {
    const parsed: unknown = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Кадр из формы. Адрес принимается только свой — `/uploads/…` или
 * `/photo/…`: форма приходит из браузера, и чужой адрес в карточке
 * значил бы картинку с постороннего сервера на витрине.
 */
function toImage(
  raw: unknown,
  alt: string,
  color?: string,
): ProductImage | null {
  if (typeof raw !== "object" || raw === null) return null;
  const image = raw as Partial<ProductImage>;
  if (typeof image.url !== "string" || !/^\/(?!\/)/.test(image.url)) {
    return null;
  }
  return {
    url: image.url,
    width: Number(image.width) || 1000,
    height: Number(image.height) || 1333,
    alt,
    ...(typeof image.blurDataURL === "string"
      ? { blurDataURL: image.blurDataURL }
      : null),
    ...(color ? { color } : null),
  };
}

function parseSizes(value: FormDataEntryValue | null): string[] {
  const sizes = jsonArray(value)
    .filter((size): size is string => typeof size === "string")
    .map((size) => size.trim().slice(0, MAX_SIZE))
    .filter(Boolean);
  return [...new Set(sizes)].sort(compareSizes);
}

interface ColorInput {
  name: string;
  hex?: string;
  images: ProductImage[];
}

function parseColors(
  value: FormDataEntryValue | null,
  title: string,
): ColorInput[] {
  const seen = new Set<string>();
  const out: ColorInput[] = [];
  for (const raw of jsonArray(value)) {
    if (typeof raw !== "object" || raw === null) continue;
    const input = raw as { name?: unknown; hex?: unknown; images?: unknown };
    const name =
      typeof input.name === "string"
        ? input.name.trim().replace(/\s+/g, " ").slice(0, MAX_COLOR_NAME)
        : "";
    if (!name || seen.has(colorKey(name))) continue;
    seen.add(colorKey(name));

    const images = (Array.isArray(input.images) ? input.images : [])
      .map((image) => toImage(image, `${title} — ${name}`, name))
      .filter((image): image is ProductImage => image !== null)
      .slice(0, PHOTOS_PER_COLOR);

    out.push({
      name,
      ...(typeof input.hex === "string" && HEX.test(input.hex)
        ? { hex: input.hex.toLowerCase() }
        : null),
      images,
    });
  }
  return out;
}

/** Адрес страницы из названия; занят — с номером: obraz-22, obraz-22-2 */
function uniqueSlug(title: string, products: Product[], id: string): string {
  const base = slugify(title) || "look";
  const taken = new Set(
    products.filter((p) => p.id !== id).map((p) => p.slug),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** Следующий артикул по порядку: после AD-21 идёт AD-22 */
function nextArticle(products: Product[]): string {
  const last = products.reduce((max, p) => {
    const match = /^AD-(\d+)$/i.exec(p.article ?? "");
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `AD-${String(last + 1).padStart(2, "0")}`;
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

  const { products, categories } = readCatalog();
  const existing = existingId
    ? products.find((p) => p.id === existingId)
    : undefined;

  // Адрес и артикул присваиваются один раз и потом не меняются, даже если
  // переименовать образ: ссылкой на страницу уже могли поделиться, а
  // артикул называют по телефону и пишут в заказах.
  const id = existingId || `p-${Date.now().toString(36)}`;
  const slug = existing?.slug ?? uniqueSlug(title, products, id);
  const article = existing?.article ?? nextArticle(products);

  const availability = AVAILABILITY.includes(
    formData.get("availability") as Availability,
  )
    ? (formData.get("availability") as Availability)
    : "in_stock";

  // Старой цены, срока проката и залога в форме нет: скидки не ведутся,
  // а срок и залог обсуждаются в магазине. Сохранение их снимает.
  const offers: ProductOffer[] = [];
  const purchase = minor(formData.get("purchase"));
  if (purchase) {
    offers.push({ kind: "purchase", price: { amount: purchase, currency: "TJS" } });
  }
  const rentalPrice = minor(formData.get("rental"));
  if (rentalPrice) {
    offers.push({
      kind: "rental",
      price: { amount: rentalPrice, currency: "TJS" },
    });
  }
  if (offers.length === 0)
    redirect(`/admin/products/${existingId || "new"}?error=price`);

  // Варианты: размер × цвет; нет ни того ни другого — один вариант «OS».
  // Идентификатор варианта строится из значений, а не из позиции: иначе
  // после вставки размера в середину корзина покупателя указывала бы
  // на соседний размер.
  const sizes = parseSizes(formData.get("sizes"));
  const colors = parseColors(formData.get("colors"), title);
  const variants: ProductVariant[] = [];
  for (const size of sizes.length ? sizes : [undefined]) {
    for (const color of colors.length ? colors : [undefined]) {
      const colorSlug = color ? slugify(color.name) || "color" : null;
      variants.push({
        id: [id, size ? slugify(size) || size : "os", colorSlug ?? "any"].join(
          "-",
        ),
        sku: [article, size ?? "OS", colorSlug?.toUpperCase()]
          .filter(Boolean)
          .join("-"),
        ...(size ? { size } : null),
        ...(color ? { colorName: color.name } : null),
        ...(color?.hex ? { colorHex: color.hex } : null),
        availability,
      });
    }
  }

  // Подпись к кадру — для поиска по картинкам и скринридера: название и
  // раздел («Образ 22 — наряды для невесты, ARUS DOMOD»), а не одно имя
  const categoryName = categories.find(
    (c) => c.slug === String(formData.get("categorySlug") ?? ""),
  )?.title;
  const imageAlt = categoryName
    ? `${title} — ${categoryName.toLocaleLowerCase("ru")}, ARUS DOMOD`
    : `${title}, ARUS DOMOD`;

  // Общие кадры первыми: первый из них — обложка карточки в каталоге
  const common = jsonArray(formData.get("images"))
    .map((image) => toImage(image, imageAlt))
    .filter((image): image is ProductImage => image !== null);
  const description = String(formData.get("description") ?? "").trim();

  const product: Product = {
    id,
    slug,
    title,
    article,
    categorySlug: String(formData.get("categorySlug") ?? ""),
    collectionSlug: existing?.collectionSlug ?? "collection-01",
    images: [...common, ...colors.flatMap((color) => color.images)],
    offers,
    variants,
    ...(description ? { description } : null),
  };
  saveProduct(product);

  const { featuredSlugs } = readCatalog();
  const wantFeatured = formData.get("featured") === "on";
  const isFeatured = featuredSlugs.includes(slug);
  if (wantFeatured && !isFeatured) setFeaturedSlugs([...featuredSlugs, slug]);
  if (!wantFeatured && isFeatured)
    setFeaturedSlugs(featuredSlugs.filter((s) => s !== slug));

  revalidateStorefront(slug);
  // Поисковикам — после ответа, чтобы сохранение не ждало их сервера.
  // Раздел, из которого товар ушёл, изменился тоже: там стало на образ меньше
  const movedFrom =
    existing && existing.categorySlug !== product.categorySlug
      ? [`/catalog/${existing.categorySlug}`]
      : [];
  after(() =>
    notifySearchEngines([
      `/product/${slug}`,
      `/catalog/${product.categorySlug}`,
      ...movedFrom,
      "/catalog",
      "/",
    ]),
  );
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
  // Удаление меняет не только страницу образа: он пропал из своего раздела,
  // из каталога и, если был избранным, с главной
  after(() =>
    notifySearchEngines(
      product
        ? [
            `/product/${product.slug}`,
            `/catalog/${product.categorySlug}`,
            "/catalog",
            "/",
          ]
        : ["/catalog", "/"],
    ),
  );
  redirect("/admin/products");
}
