import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { catalog } from "@/lib/catalog";
import { categoryTitle } from "@/lib/i18n/labels";
import { getLocale } from "@/lib/i18n/server";
import { seoCopy } from "@/lib/seo/copy";
import { contactPhones } from "@/lib/seo/metadata";
import { faqSchema, graph } from "@/lib/seo/schema";

/**
 * Вопросы и ответы.
 *
 * Именно так люди спрашивают поисковик и ИИ-ассистента: «где купить
 * свадебное платье в Душанбе», «как взять наряд напрокат». Ассистент
 * охотнее всего цитирует страницу, где такой вопрос задан дословно и на
 * него дан короткий фактический ответ. Поэтому блок видимый — разметка
 * FAQPage повторяет ровно тот текст, что стоит на странице, как требуют
 * правила поисковиков.
 *
 * Разделы в первом ответе — только те, где сейчас есть образы: пустой
 * раздел в ответе «что у вас продаётся» был бы обещанием без товара.
 */
export async function HomeFaq() {
  const locale = await getLocale();
  const copy = seoCopy[locale];
  const [categories, products] = await Promise.all([
    catalog().listCategories(),
    catalog().listProducts({ pageSize: 1000 }),
  ]);

  const filled = new Set(products.items.map((p) => p.categorySlug));
  const items = copy.faq({
    categories: categories
      .filter((category) => filled.has(category.slug))
      .map((category) => categoryTitle(category, locale).toLocaleLowerCase())
      .join(", "),
    phones: contactPhones(locale),
  });

  return (
    <Section rhythm="block">
      <JsonLd data={graph(faqSchema(items))} />
      <Container width="narrow">
        <h2 className="t-h1 text-balance">{copy.faqTitle}</h2>
        <span aria-hidden="true" className="hoshiya-line mt-6 max-w-[5rem]" />

        <div className="mt-8 flex flex-col border-t border-hairline">
          {items.map((item) => (
            <details key={item.q} className="group border-b border-hairline">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                <h3 className="t-h3 text-balance">{item.q}</h3>
                <span
                  aria-hidden="true"
                  className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-strong text-ink-secondary transition-transform duration-[var(--dur-base)] ease-[var(--ease-quiet)] group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="t-body max-w-[62ch] pb-6 text-ink-secondary">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
