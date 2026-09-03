import { site } from "@/lib/config/site";
import type { Product } from "@/types/catalog";

const availabilityUrl = {
  in_stock: "https://schema.org/InStock",
  made_to_order: "https://schema.org/PreOrder",
  rental_only: "https://schema.org/InStoreOnly",
  sold_out: "https://schema.org/SoldOut",
} as const;

/**
 * Разметка Product для поисковиков. Только то, что есть в данных: название,
 * артикул, кадры, цена покупки, наличие. Бренд — ARUS DOMOD. Никаких
 * рейтингов и отзывов: их нет, а выдуманные — нарушение правил поиска.
 */
export function ProductJsonLd({ product }: { product: Product }) {
  const base = site.url.replace(/\/$/, "");
  const purchase = product.offers.find((o) => o.kind === "purchase");
  const availability = product.variants[0]?.availability ?? "in_stock";

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.article ? { sku: product.article } : null),
    ...(product.description ? { description: product.description } : null),
    image: product.images.map((i) => `${base}${i.url}`),
    brand: { "@type": "Brand", name: site.name },
    url: `${base}/product/${product.slug}`,
    ...(purchase
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "TJS",
            price: (purchase.price.amount / 100).toFixed(2),
            availability: availabilityUrl[availability],
            url: `${base}/product/${product.slug}`,
            seller: { "@type": "Organization", name: site.name },
          },
        }
      : null),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
