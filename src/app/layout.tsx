import type { Metadata, Viewport } from "next";
import { Cormorant, Golos_Text } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { site } from "@/lib/config/site";

import "./globals.css";

/**
 * Две гарнитуры, обе с кириллицей — сайт говорит по-русски и по-таджикски.
 *
 * Cormorant — витринный крой семейства, а не текстовый Cormorant Garamond,
 * стоявший в отвергнутой версии. Он заметно резче и контрастнее, и это
 * ближайшее, что удалось получить к антикве дидо из логотипа.
 *
 * Почему не сама дидо. Надпись ARUS.DOMOD.TJ в знаке — именно дидо, и в
 * концепции P4.1 планировался Playfair Display. Замер в браузере показал,
 * что у него нет фейса cyrillic-ext вовсе: загружается диапазон
 * U+301, U+400-45F, U+490-491, U+4B0-4B1 — а таджикские ғ U+0493, қ U+049B,
 * ҳ U+04B3, ҷ U+04B7, ӣ U+04E3, ӯ U+04EF лежат вне его. Проверены и другие
 * дидо: Bodoni Moda даёт 0 из 6 таджикских глифов, Prata и Alice — 5 из 6.
 * Полные 6 из 6 нашлись только у семейства Cormorant, Source Serif 4, Lora,
 * PT Serif и EB Garamond — дидо среди них нет ни одной.
 *
 * Выбор между ними решён характером: Lora и PT Serif — тексто́вые лица без
 * витринного контраста, EB Garamond мягче Cormorant. Правило проекта
 * («покрытие проверяется измерением глифа, а не списком subsets») здесь и
 * сработало: без замера сайт молча набирал бы таджикские слова запасным
 * шрифтом.
 *
 * Golos Text взят вместо привычных Manrope/Inter намеренно: он нарисован от
 * кириллицы, а не адаптирован под неё, и содержит полный таджикский набор.
 * У Manrope и Onest глифов ӯ ҳ ҷ қ ғ ӣ нет вовсе — слово молча разваливается
 * на два шрифта; Inter их содержит, но звучит как интерфейс SaaS.
 *
 * Подмножество cyrillic-ext обязательно для обеих гарнитур: таджикские буквы
 * лежат именно там (проверяется измерением глифов в браузере, не по описанию).
 */
const cormorant = Cormorant({
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
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

/**
 * Цвет темы — та самая углублённая бирюза, что служит средой сайта. Строка
 * адреса на телефоне продолжает поле логотипа, а не спорит с ним.
 */
export const viewport: Viewport = {
  themeColor: "#03211f",
  colorScheme: "dark",
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
