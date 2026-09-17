import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/lib/i18n/server";
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
  const locale = await getLocale();
  return (
    <>
      <JsonLd data={graph(storeSchema(locale), websiteSchema())} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
