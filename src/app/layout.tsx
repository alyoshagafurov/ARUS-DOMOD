import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Golos_Text } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { site } from "@/lib/config/site";

import "./globals.css";

/**
 * Две гарнитуры, обе с кириллицей — сайт говорит по-русски и по-таджикски.
 *
 * Cormorant Garamond — контрастная антиква для витринной типографики: она даёт
 * couture-интонацию и не выглядит как блоговый Playfair.
 * Golos Text — гротеск для интерфейса, цен и микро-заголовков.
 *
 * Golos взят вместо привычных Manrope/Inter намеренно: он нарисован от
 * кириллицы, а не адаптирован под неё, и содержит полный таджикский набор.
 * У Manrope и Onest глифов ӯ ҳ ҷ қ ғ ӣ нет вовсе — слово молча разваливается
 * на два шрифта; Inter их содержит, но звучит как интерфейс SaaS, а не как
 * дом моды.
 *
 * Подмножество cyrillic-ext обязательно для обеих гарнитур: таджикские буквы
 * лежат именно там (проверено измерением глифов в браузере, не по описанию).
 */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — свадебные наряды`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: site.name,
    title: `${site.name} — свадебные наряды`,
    description: site.description,
    images: [{ url: "/brand/arus-domod-og.jpg", width: 1200, height: 900 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f1",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${cormorant.variable} ${golos.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
