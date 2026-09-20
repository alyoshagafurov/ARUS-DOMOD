import { catalog } from "@/lib/catalog";
import { productSizes } from "@/lib/catalog/variants";
import { contact, rental, site, socialLinks } from "@/lib/config/site";
import { formatMoney, formatShortDate } from "@/lib/format";
import { ru } from "@/lib/i18n/dictionary";
import { seoCopy } from "@/lib/seo/copy";
import { absoluteUrl } from "@/lib/seo/url";

export const dynamic = "force-dynamic";

/**
 * llms.txt — сайт в виде, удобном ИИ-ассистенту.
 *
 * Формат llms.txt: Markdown с кратким описанием, ссылками и фактами.
 * Ассистенту не нужно разбирать вёрстку, чтобы ответить «где взять
 * свадебное платье напрокат в Душанбе и сколько стоит» — всё лежит здесь
 * одним текстом: кто, где, как заказать, условия проката, каждый образ с
 * ценой и ссылкой. Текст собирается из базы на каждый запрос, поэтому
 * цены и новые товары всегда актуальны.
 *
 * Только подтверждённые данные: улицы, часов работы и отзывов здесь нет.
 */
export async function GET() {
  const repo = catalog();
  const [products, categories] = await Promise.all([
    repo.listProducts({ pageSize: 1000 }),
    repo.listCategories(),
  ]);

  const count = new Map<string, number>();
  for (const p of products.items) {
    count.set(p.categorySlug, (count.get(p.categorySlug) ?? 0) + 1);
  }
  const categoryName = new Map(categories.map((c) => [c.slug, c.title]));
  const minRental = formatMoney({
    amount: rental.priceFromMinor,
    currency: "TJS",
  });

  // Диапазон цен покупки — по каталогу. Без него ассистент называет свой:
  // проверка показала, что модель уверенно выдумывает цены, если их не
  // заявить прямо.
  const purchases = products.items
    .map((p) => p.offers.find((o) => o.kind === "purchase")?.price)
    .filter((price) => price !== undefined);
  const priceRange = purchases.length
    ? `Покупка — от ${formatMoney(
        purchases.reduce((min, price) => (price.amount < min.amount ? price : min)),
      )} до ${formatMoney(
        purchases.reduce((max, price) => (price.amount > max.amount ? price : max)),
      )}; прокат — от ${minRental}`
    : null;

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${seoCopy.ru.home.description}`,
    "",
    `English: ${seoCopy.en.home.description}`,
    "",
    `${site.name} (Instagram @${site.handle}) — «${site.tagline}». ${site.positioning}. Город: ${site.city}, Таджикистан. Цены в сомони (TJS). Сайт на русском, таджикском (?lang=tg) и английском (?lang=en).`,
    "",
    `Сайт: ${absoluteUrl("/")}`,
    ...(priceRange ? [priceRange] : []),
    "",
    "## Контакты",
    `- ${contact.phoneName} — главный номер, заказы: ${contact.phoneDisplay} (телефон и WhatsApp)`,
    `- ${contact.phoneSecondaryName}: ${contact.phoneSecondaryDisplay} (телефон и WhatsApp)`,
    ...socialLinks.map((link) => `- ${link.label}: ${link.href}`),
    "",
    "## Как купить",
    "- Выбрать образ и размер на сайте, оформить заказ: имя, телефон, способ получения.",
    "- Заказ приходит администратору в WhatsApp; администратор подтверждает наличие и цену.",
    "- Оплата — после подтверждения заказа, напрямую администратору. Онлайн-оплаты на сайте нет.",
    `- Получение: самовывоз из магазина в Душанбе или доставка — стоимость доставки согласуется отдельно.`,
    "",
    "## Прокат",
    `- Оформляется только в магазине, срок до ${rental.maxDays} дней, цена от ${minRental}`,
    `- Залог: ${rental.depositKinds.join(", ")}. Залог возвращается после возврата образа в сохранности.`,
    "- Цена проката указана на странице каждого образа, где прокат доступен.",
    "",
    "## Разделы каталога",
    ...categories
      .filter((c) => count.get(c.slug))
      .map(
        (c) =>
          `- [${c.title}](${absoluteUrl(`/catalog/${c.slug}`)}): ${count.get(c.slug)} шт.`,
      ),
    "",
    "## Образы и цены",
    ...products.items.map((p) => {
      const purchase = p.offers.find((o) => o.kind === "purchase");
      const rent = p.offers.find((o) => o.kind === "rental");
      const sizes = productSizes(p);
      const parts = [
        categoryName.get(p.categorySlug),
        purchase
          ? `покупка ${formatMoney(purchase.price)}${
              p.sale
                ? ` (скидка ${p.sale.percent}% до ${formatShortDate(p.sale.endsAt)})`
                : ""
            }`
          : null,
        rent ? `прокат ${formatMoney(rent.price)}` : null,
        sizes.length ? `размеры ${sizes.join(", ")}` : null,
        ru.product.availability[p.variants[0]?.availability ?? "in_stock"],
      ].filter(Boolean);
      return `- [${p.title}](${absoluteUrl(`/product/${p.slug}`)}): ${parts.join("; ")}`;
    }),
    "",
    "## Страницы",
    `- [Каталог](${absoluteUrl("/catalog")})`,
    `- [Прокат](${absoluteUrl("/rental")})`,
    `- [Доставка и получение](${absoluteUrl("/delivery")})`,
    `- [О бренде](${absoluteUrl("/about")})`,
    `- [Контакты](${absoluteUrl("/contacts")})`,
    `- [Карта сайта](${absoluteUrl("/sitemap.xml")})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
