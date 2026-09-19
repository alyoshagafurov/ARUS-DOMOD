#!/usr/bin/env node
/* -------------------------------------------------------------------------
   Разовая отправка адресов в IndexNow.

   Повседневная отправка идёт сама: админка зовёт notifySearchEngines()
   после каждой правки товара, раздела и скидки. Этот скрипт нужен для
   редких случаев, когда изменился весь сайт разом, — смена домена или
   ключа, переезд, пересборка каталога.

   Полную карту сайта НЕ отправляют регулярно и не вешают на деплой:
   протокол прямо говорит, что он не предназначен для отправки всех
   адресов сайта сразу, а повторная отправка неизменившихся страниц —
   среди причин отказа 422 и ограничения 429.

       npm run indexnow -- /product/look-01 /catalog   один или несколько путей
       npm run indexnow -- --all                       всё из карты сайта
       npm run indexnow -- --all --dry                 только показать, не слать

   Ключ берётся из файла в public/ — того самого, имя которого равно
   ключу, — и перед отправкой сверяется с тем, что отдаёт живой сайт.
   Не совпало — скрипт ничего не отправит.
   ------------------------------------------------------------------------- */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10000; // предел протокола на один запрос
// Языки — как в src/lib/i18n/locales.ts: русский без параметра
const LOCALES = ["ru", "tg", "en"];

// Адрес сайта. В приложении он приходит только из SITE_URL (src/lib/seo/url.ts),
// но скрипт запускают с машины владельца, где переменной обычно нет. Ошибка в
// адресе безвредна: ниже идёт сверка ключа, и при несовпадении ничего не уйдёт.
const site = (process.env.SITE_URL?.trim() || "https://arusdomod.shop").replace(
  /\/+$/,
  "",
);

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const all = args.includes("--all");
const paths = args.filter((a) => a.startsWith("/"));

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

/** Ключ = имя файла в public/, содержимое которого равно этому же имени */
function readKey() {
  const dir = "public";
  const found = readdirSync(dir)
    .filter((name) => /^[A-Za-z0-9-]{8,128}\.txt$/.test(name))
    .find(
      (name) =>
        readFileSync(join(dir, name), "utf8").trim() === name.slice(0, -4),
    );
  if (!found) fail("в public/ нет файла ключа IndexNow (<ключ>.txt)");
  return found.slice(0, -4);
}

/** Адреса из живой карты сайта — ровно то, что сайт считает своими страницами */
async function fromSitemap() {
  const response = await fetch(`${site}/sitemap.xml`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) fail(`карта сайта недоступна: ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/** Путь → адреса всех трёх языков, как это делает сайт */
function expand(path) {
  return LOCALES.map((locale) =>
    locale === "ru" ? `${site}${path}` : `${site}${path}?lang=${locale}`,
  );
}

const key = readKey();
const keyLocation = `${site}/${key}.txt`;

// Сверка: сайт обязан отдавать по keyLocation ровно этот ключ. Иначе
// поисковик ответит отказом, и отправка только потратит квоту обхода.
const check = await fetch(keyLocation, {
  signal: AbortSignal.timeout(20000),
}).catch(() => null);
if (!check || !check.ok) fail(`${keyLocation} не отдаётся (${check?.status})`);
const served = (await check.text()).trim();
if (served !== key) {
  fail(
    `ключ на сайте не совпадает с файлом: ${keyLocation} отдаёт «${served}», ожидался «${key}»`,
  );
}

let urlList;
if (paths.length) {
  urlList = paths.flatMap(expand);
} else if (all) {
  urlList = await fromSitemap();
} else {
  console.log(
    [
      "Укажите, что отправлять:",
      "  npm run indexnow -- /product/look-01 /catalog   один или несколько путей",
      "  npm run indexnow -- --all                       всё из карты сайта (разовая операция)",
      "  npm run indexnow -- --all --dry                 показать список, ничего не отправляя",
      "",
      `Сайт: ${site}`,
      `Ключ: ${key} (${keyLocation}) — проверен, совпадает`,
    ].join("\n"),
  );
  process.exit(0);
}

urlList = [...new Set(urlList)].filter((url) => url.startsWith(`${site}/`));
if (!urlList.length) fail("список адресов пуст");

console.log(`Сайт:  ${site}`);
console.log(`Ключ:  ${key} — сверен с ${keyLocation}`);
console.log(`Адреса: ${urlList.length}`);
for (const url of urlList.slice(0, 5)) console.log(`  ${url}`);
if (urlList.length > 5) console.log(`  … и ещё ${urlList.length - 5}`);

if (dry) {
  console.log("\n--dry: ничего не отправлено");
  process.exit(0);
}

const host = new URL(site).host;
let failed = false;
for (let i = 0; i < urlList.length; i += BATCH) {
  const batch = urlList.slice(i, i + BATCH);
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList: batch }),
    signal: AbortSignal.timeout(30000),
  });
  const body = (await response.text().catch(() => "")).trim();
  // 202 — «ключ проверяется»: обычный ответ на первую отправку после смены
  const ok = response.status === 200 || response.status === 202;
  console.log(
    `${ok ? "✓" : "✗"} ${batch.length} адресов → ${response.status}${body ? ` ${body.slice(0, 120)}` : ""}`,
  );
  if (!ok) failed = true;
}

process.exit(failed ? 1 : 0);
