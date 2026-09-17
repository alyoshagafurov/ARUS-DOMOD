import type { Metadata } from "next";

import { productSizes } from "@/lib/catalog/variants";
import { contact, site } from "@/lib/config/site";
import { formatMoney } from "@/lib/format";
import { LOCALES } from "@/lib/i18n/locales";
import { getLocale, getUrlLocale } from "@/lib/i18n/server";
import { OG_LOCALE, seoCopy, type PageCopy } from "@/lib/seo/copy";
import { localizedPath } from "@/lib/seo/url";
import type { Locale, Product } from "@/types/catalog";

export const DEFAULT_OG_IMAGE = {
  url: "/brand/arus-domod-og.jpg",
  width: 1200,
  height: 900,
  alt: site.name,
};

/**
 * Заголовок и описание образа из его данных: раздел, цена, прокат,
 * размеры, скидка. Одна функция на метаданные, разметку и llms.txt —
 * чтобы поисковик и ассистент получали одинаковое описание.
 */
export function productPageCopy(
  product: Product,
  category: string | undefined,
  locale: Locale,
): PageCopy {
  const purchase = product.offers.find((o) => o.kind === "purchase");
  const rental = product.offers.find((o) => o.kind === "rental");
  const sizes = productSizes(product);
  return seoCopy[locale].product({
    title: product.title,
    category,
    price: purchase ? formatMoney(purchase.price) : undefined,
    rental: rental ? formatMoney(rental.price) : undefined,
    sizes: sizes.length ? sizes.join(", ") : undefined,
    sale: product.sale?.percent,
  });
}

/** «Рустам +992 90 766 60 00, Азиза +992 94 973 11 11» на языке страницы */
export function contactPhones(locale: Locale): string {
  const [main, spare] = seoCopy[locale].names;
  return `${main} ${contact.phoneDisplay}, ${spare} ${contact.phoneSecondaryDisplay}`;
}

interface SeoInput {
  /** Путь страницы без языка: «/catalog/arus» */
  path: string;
  title: string;
  description: string;
  /** Заголовок целиком, без приписки «· ARUS DOMOD» (главная) */
  absoluteTitle?: boolean;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  /** Служебные страницы и поиск — в индекс не берутся */
  noindex?: boolean;
}

/**
 * Метаданные страницы для поисковиков и соцсетей.
 *
 * Канонический адрес — тот, по которому пришли: русская версия без
 * параметра, таджикская и английская с `?lang=`. Все три версии связаны
 * hreflang, а `x-default` указывает на русскую — её показывают тем, чей
 * язык не совпал ни с одним. Превью (Open Graph) собирается здесь же:
 * ссылка, отправленная в WhatsApp или Telegram, приходит с кадром,
 * заголовком и описанием.
 */
export async function seoMetadata({
  path,
  title,
  description,
  absoluteTitle,
  images,
  noindex,
}: SeoInput): Promise<Metadata> {
  const [locale, urlLocale] = await Promise.all([getLocale(), getUrlLocale()]);
  const canonical = localizedPath(path, urlLocale ?? "ru");
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [l, localizedPath(path, l)]),
  );
  languages["x-default"] = path;

  const ogImages = images?.length ? images : [DEFAULT_OG_IMAGE];
  const fullTitle = absoluteTitle ? title : `${title} · ${site.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      siteName: site.name,
      url: canonical,
      title: fullTitle,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALE[l],
      ),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImages.map((image) => image.url),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : null),
  };
}
