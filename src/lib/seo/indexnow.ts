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

   Ключ лежит в `public/<ключ>.txt` и едет вместе с репозиторием. Так
   устроена «Опция 1» протокола — файл в корне сайта, имя которого дословно
   равно ключу; спецификация рекомендует именно её. Поэтому ключ здесь
   константа, а не переменная окружения: значение и адрес файла обязаны
   совпадать, а две настройки в разных местах рано или поздно разъезжаются.
   Так и было — в окружении стоял один ключ, в `public/` лежал другой, и
   поисковик отвергал оповещения, ничем это не показывая.

   Ключ IndexNow не секрет: протокол требует публиковать его по открытому
   адресу — этим и доказывается владение сайтом.
   ------------------------------------------------------------------------- */

/**
 * Ключ IndexNow.
 *
 * ВАЖНО: строка обязана дословно совпадать с именем файла в `public/`.
 * Файл `public/0554b9c29b354197a3a06124d32dd1a4.txt` удалять нельзя — его
 * содержимое и есть доказательство владения сайтом.
 */
const KEY = "0554b9c29b354197a3a06124d32dd1a4";

const ENDPOINT = "https://api.indexnow.org/indexnow";

/** Пауза, раньше которой один и тот же адрес не отправляют повторно */
const QUIET_MS = 5 * 60 * 1000;

/**
 * Когда какой адрес отправляли. В globalThis, а не в переменной модуля:
 * серверные действия админки и route handlers живут в разных бандлах со
 * своими копиями модулей — по той же причине там лежат кэши каталога.
 */
declare global {
  var __arusIndexNowSent: Map<string, number> | undefined;
  var __arusIndexNowWarned: Set<number> | undefined;
}

export function indexNowKey(): string {
  return KEY;
}

/** Адрес файла с ключом — он же keyLocation в запросе */
export function indexNowKeyLocation(): string {
  return absoluteUrl(`/${KEY}.txt`);
}

/**
 * Сайт, за который отвечает ключ.
 *
 * Мало проверить https: файл ключа лежит в репозитории, поэтому любой
 * стенд на служебном адресе Railway отправил бы СВОИ адреса с настоящим
 * ключом — и протокол принял бы их, ведь host, urlList и keyLocation у
 * стенда согласованы. В поиск попала бы копия магазина.
 */
function isCanonicalSite(): boolean {
  if (!isPublicSite()) return false;
  try {
    return !new URL(siteUrl()).hostname.endsWith(".up.railway.app");
  } catch {
    return false;
  }
}

/**
 * Путь, который можно превратить в адрес страницы. Отсекает «/catalog/» с
 * пустым разделом и прочий мусор: незаполненное поле формы иначе уходит в
 * поисковик отдельным несуществующим адресом.
 */
function isPagePath(path: string): boolean {
  if (path === "/") return true;
  return (
    path.startsWith("/") &&
    !path.endsWith("/") &&
    !path.includes("//") &&
    !/\s/.test(path)
  );
}

function sentRecently(url: string, now: number): boolean {
  const at = globalThis.__arusIndexNowSent?.get(url);
  return at !== undefined && now - at < QUIET_MS;
}

function remember(urls: string[], now: number): void {
  const sent = (globalThis.__arusIndexNowSent ??= new Map());
  for (const [url, at] of sent) if (now - at >= QUIET_MS) sent.delete(url);
  for (const url of urls) sent.set(url, now);
}

/**
 * Отказ протокола приходит обычным ответом, а не исключением: 403 значит
 * «ключ не принят», 422 — «адреса не подходят», 429 — «слишком часто».
 * Без чтения кода смена ключа выглядела бы успешной при любом исходе.
 */
function warnStatus(status: number, urlList: string[], body: string): void {
  const warned = (globalThis.__arusIndexNowWarned ??= new Set());
  if (warned.has(status)) return;
  warned.add(status);
  console.warn(
    `[indexnow] Поисковик ответил ${status} на ${urlList.length} адресов ` +
      `(первый — ${urlList[0]}). Ключ: ${indexNowKeyLocation()}. ` +
      `Ответ: ${body.slice(0, 200)}`,
  );
}

/** Сообщить поисковикам, что страницы изменились (на всех трёх языках) */
export async function notifySearchEngines(paths: string[]): Promise<void> {
  if (!isCanonicalSite()) return;

  const pages = [...new Set(paths)].filter(isPagePath);
  if (pages.length === 0) return;

  const now = Date.now();
  const urlList = pages
    .flatMap((path) =>
      LOCALES.map((locale) => absoluteUrl(localizedPath(path, locale))),
    )
    .filter((url) => !sentRecently(url, now));
  if (urlList.length === 0) return;

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(siteUrl()).host,
        key: KEY,
        keyLocation: indexNowKeyLocation(),
        urlList,
      }),
      signal: AbortSignal.timeout(5000),
    });
    // Тело читаем всегда: иначе соединение остаётся висеть
    const body = await response.text().catch(() => "");
    // 202 — «ключ проверяется», обычный ответ на первую отправку после смены
    if (response.status === 200 || response.status === 202) {
      remember(urlList, now);
      return;
    }
    warnStatus(response.status, urlList, body);
  } catch {
    // Сеть недоступна — не страшно: страница всё равно есть в карте сайта
  }
}
