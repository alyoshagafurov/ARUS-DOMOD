import { productColors, productSizes } from "@/lib/catalog/variants";
import { contact, site, socialLinks } from "@/lib/config/site";
import { seoCopy } from "@/lib/seo/copy";
import { absoluteUrl, siteUrl } from "@/lib/seo/url";
import type { Locale, Product } from "@/types/catalog";

/* -------------------------------------------------------------------------
   Разметка Schema.org (JSON-LD).

   Её читают Google и Яндекс для расширенной выдачи и ИИ-ассистенты, когда
   собирают ответ: «магазин свадебных нарядов в Душанбе, телефон такой-то,
   такое-то платье стоит столько-то». Узлы ссылаются друг на друга по @id,
   поэтому магазин описан один раз, а товары, списки и сайт указывают на
   него.

   Только то, что есть в данных. Улицы и часов работы нет — их не
   передавали; рейтингов и отзывов нет — выдуманные нарушают правила
   поисковиков и приводят к санкциям.
   ------------------------------------------------------------------------- */

type Node = Record<string, unknown>;

const storeId = () => `${siteUrl()}/#store`;
const websiteId = () => `${siteUrl()}/#website`;

export const graph = (...nodes: Node[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

const AVAILABILITY = {
  in_stock: "https://schema.org/InStock",
  made_to_order: "https://schema.org/PreOrder",
  rental_only: "https://schema.org/InStoreOnly",
  sold_out: "https://schema.org/SoldOut",
} as const;

/** Магазин: имя, город, телефоны, соцсети */
export function storeSchema(locale: Locale): Node {
  return {
    "@type": "ClothingStore",
    "@id": storeId(),
    name: site.name,
    alternateName: ["Арус Домод", "Арӯс Домод", site.handle],
    description: seoCopy[locale].home.description,
    slogan: site.tagline,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/arus-domod-logo.jpg"),
    image: absoluteUrl("/brand/arus-domod-og.jpg"),
    telephone: contact.phone,
    contactPoint: [
      {
        "@type": "ContactPoint",
        name: contact.phoneName,
        telephone: contact.phone,
        contactType: "sales",
      },
      {
        "@type": "ContactPoint",
        name: contact.phoneSecondaryName,
        telephone: contact.phoneSecondary,
        contactType: "customer service",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressCountry: "TJ",
    },
    areaServed: { "@type": "City", name: site.city },
    currenciesAccepted: "TJS",
    sameAs: socialLinks.map((link) => link.href),
  };
}

/** Сайт и поиск по нему — поисковик может показать строку поиска в выдаче */
export function websiteSchema(): Node {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    url: absoluteUrl("/"),
    name: site.name,
    alternateName: "Арус Домод",
    inLanguage: ["ru", "tg", "en"],
    publisher: { "@id": storeId() },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/catalog")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Товар с ценой покупки и, если есть, ценой проката. Прокат описан
 * отдельным предложением с businessFunction LeaseOut — так словарь
 * GoodRelations обозначает сдачу в аренду, и ассистент не спутает цену
 * проката с ценой покупки.
 */
export function productSchema({
  product,
  category,
  path,
  description,
}: {
  product: Product;
  category?: string;
  path: string;
  description: string;
}): Node {
  const url = absoluteUrl(path);
  const purchase = product.offers.find((o) => o.kind === "purchase");
  const rental = product.offers.find((o) => o.kind === "rental");
  const availability =
    AVAILABILITY[product.variants[0]?.availability ?? "in_stock"];
  const sizes = productSizes(product);
  const colors = productColors(product).map((color) => color.name);

  const offers: Node[] = [];
  if (purchase) {
    offers.push({
      "@type": "Offer",
      url,
      priceCurrency: purchase.price.currency,
      price: (purchase.price.amount / 100).toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": storeId() },
      ...(product.sale
        ? { priceValidUntil: product.sale.endsAt.slice(0, 10) }
        : null),
    });
  }
  if (rental) {
    offers.push({
      "@type": "Offer",
      url,
      priceCurrency: rental.price.currency,
      price: (rental.price.amount / 100).toFixed(2),
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      availability: "https://schema.org/InStoreOnly",
      availableAtOrFrom: { "@id": storeId() },
      seller: { "@id": storeId() },
    });
  }

  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    url,
    description: product.description ?? description,
    ...(product.article ? { sku: product.article } : null),
    ...(category ? { category } : null),
    image: product.images.map((image) => absoluteUrl(image.url)),
    brand: { "@type": "Brand", name: site.name },
    ...(sizes.length ? { size: sizes.join(", ") } : null),
    ...(colors.length ? { color: colors.join(", ") } : null),
    ...(offers.length
      ? { offers: offers.length === 1 ? offers[0] : offers }
      : null),
  };
}

/** Страница-список: каталог или раздел с перечнем образов */
export function collectionSchema({
  name,
  description,
  path,
  products,
}: {
  name: string;
  description: string;
  path: string;
  products: Product[];
}): Node {
  const url = absoluteUrl(path);
  return {
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    url,
    name,
    description,
    isPartOf: { "@id": websiteId() },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/product/${product.slug}`),
        name: product.title,
        ...(product.images[0]
          ? { image: absoluteUrl(product.images[0].url) }
          : null),
      })),
    },
  };
}

export function faqSchema(items: { q: string; a: string }[]): Node {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
