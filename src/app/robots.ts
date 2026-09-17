import type { MetadataRoute } from "next";

import { absoluteUrl, siteUrl } from "@/lib/seo/url";

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
 * Закрыто только то, что индексировать нечего: админка, API, корзина,
 * оформление и избранное.
 *
 * `/uploads/` раньше тоже был закрыт — а там лежат фото товаров,
 * загруженные из админки. Поиск по картинкам их не видел.
 */
const DISALLOW = ["/admin", "/api/", "/cart", "/checkout", "/favorites"];

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
    host: siteUrl(),
  };
}
