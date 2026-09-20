import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { graph, storeSchema, websiteSchema } from "@/lib/seo/schema";

/**
 * Оболочка витрины: шапка и подвал.
 *
 * Вынесена из корневого layout в route group, потому что у админки своя
 * оболочка, а адреса при этом не меняются — группа в скобках в URL не
 * попадает.
 *
 * Здесь же один раз на страницу выводится разметка магазина и сайта:
 * товары, списки и крошки на остальных страницах ссылаются на неё по @id.
 */
export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <>
      <JsonLd data={graph(storeSchema(locale), websiteSchema())} />
      {/* Первое, что получает клавиатура на каждой странице: до этой
          ссылки приходилось проходить всю шапку — двенадцать элементов,
          прежде чем добраться до содержимого. Видна только при фокусе. */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed
          focus-visible:left-4 focus-visible:top-4 focus-visible:z-50
          focus-visible:inline-flex focus-visible:h-11 focus-visible:items-center
          focus-visible:rounded-md focus-visible:bg-accent
          focus-visible:px-5 focus-visible:text-accent-contrast"
      >
        <span className="t-label">{t.misc.skipToContent}</span>
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
