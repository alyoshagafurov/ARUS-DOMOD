import { LOCALES } from "@/lib/i18n/locales";
import {
  absoluteUrl,
  isPublicSite,
  localizedPath,
  siteUrl,
} from "@/lib/seo/url";

/* -------------------------------------------------------------------------
   IndexNow — мгновенное оповещение поисковиков.

   Обычно поисковик узнаёт о новом товаре, когда сам снова зайдёт на сайт —
   через дни или недели. IndexNow сообщает об изменении сразу: один запрос
   доходит до Bing, Яндекса, Seznam и других участников протокола. Через
   индекс Bing сайт видят ChatGPT и Copilot, так что новый образ быстрее
   попадает и в ответы ассистентов.

   Ключ — любая строка из букв, цифр и дефисов (8–128 символов) в
   INDEXNOW_KEY. Сам ключ сайт отдаёт по /indexnow.txt: так поисковик
   проверяет, что оповещение прислал владелец. Без ключа или без https
   ничего не отправляется.
   ------------------------------------------------------------------------- */

const KEY = /^[A-Za-z0-9-]{8,128}$/;

export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && KEY.test(key) ? key : null;
}

/** Сообщить поисковикам, что страницы изменились (на всех трёх языках) */
export async function notifySearchEngines(paths: string[]): Promise<void> {
  const key = indexNowKey();
  if (!key || !isPublicSite() || paths.length === 0) return;

  const urlList = [...new Set(paths)].flatMap((path) =>
    LOCALES.map((locale) => absoluteUrl(localizedPath(path, locale))),
  );

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(siteUrl()).host,
        key,
        keyLocation: absoluteUrl("/indexnow.txt"),
        urlList,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Сеть недоступна — не страшно: страница всё равно есть в карте сайта
  }
}
