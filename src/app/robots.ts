import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/url";

/**
 * Боты ИИ-ассистентов и их поиска. Правила для «*» к ним и так относятся,
 * но часть сайтов закрывает этих ботов, и явное разрешение — прямой сигнал,
 * что материалы сайта можно брать в ответы: ChatGPT, Claude, Perplexity,
 * Gemini, Apple Intelligence. CCBot собирает Common Crawl — открытый архив,
 * на котором учатся многие модели.
 */
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

/**
 * Закрыто только то, где индексировать нечего и где нет разметки:
 * админка и API.
 *
 * Корзина, оформление и избранное отсюда убраны намеренно. На них стоит
 * noindex, а запрет в robots.txt не даёт краулеру зайти и этот noindex
 * прочитать: страница остаётся в индексе без описания. Два запрета
 * одновременно слабее одного — пусть зайдёт и увидит запрет.
 *
 * `/uploads/` не закрыт: там лежат фото товаров из админки, и поиск по
 * картинкам должен их видеть.
 */
const DISALLOW = ["/admin", "/api/"];

/**
 * По запросу, а не при сборке: адрес сайта приходит из окружения во время
 * работы, и статический файл запомнил бы localhost сборочного контейнера.
 */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_BOTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
