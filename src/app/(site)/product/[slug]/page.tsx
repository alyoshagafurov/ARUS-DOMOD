import { notFound } from "next/navigation";

import { Aivan } from "@/components/layout/Aivan";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ProductColorProvider } from "@/components/product/ProductColor";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import {
  PRODUCT_STORY_ID,
  ProductPurchase,
} from "@/components/product/ProductPurchase";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Button } from "@/components/ui/Button";
import { isAdmin } from "@/lib/admin/auth";
import { catalog } from "@/lib/catalog";
import { productColors } from "@/lib/catalog/variants";
import { categoryTitle } from "@/lib/i18n/labels";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { productPageCopy, seoMetadata } from "@/lib/seo/metadata";

const RELATED_COUNT = 4;

/*
 * generateStaticParams здесь НЕТ намеренно.
 *
 * Страница читает куку локали, поэтому она серверная по запросу
 * (в сборке — ƒ Dynamic). Параметры, собранные заранее, всё равно
 * отбрасывались: предрисовки не происходит. Платой за них была попытка
 * открыть базу во время `next build` — а сборка собирает данные страниц
 * в 29 параллельных процессах. В чистом контейнере Railway базы ещё нет,
 * и все 29 бросались создавать и засевать её одновременно: один выигрывал
 * блокировку записи, остальные падали с «database is locked», и деплой
 * разваливался. Сборка не должна знать о базе вообще.
 */
export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const repository = catalog();
  const [product, categories, locale, t] = await Promise.all([
    repository.getProductBySlug(slug),
    repository.listCategories(),
    getLocale(),
    getDictionary(),
  ]);
  if (!product) return { title: t.meta.notFound };

  const category = categories.find((c) => c.slug === product.categorySlug);
  const copy = productPageCopy(
    product,
    category ? categoryTitle(category, locale) : undefined,
    locale,
  );
  return seoMetadata({
    path: `/product/${slug}`,
    title: copy.title,
    description: copy.description,
    images: product.images.slice(0, 1).map((image) => ({
      url: image.url,
      width: image.width,
      height: image.height,
      alt: image.alt,
    })),
  });
}

/**
 * Страница образа.
 *
 * Композиция редакционная, а не «фото слева, карточка справа»: кадры занимают
 * семь колонок из двенадцати и прокручиваются, а колонка с ценой прилипает
 * рядом — читается как подпись к развороту, а не как товарный блок.
 *
 * Никаких сведений об изделии сверх того, что лежит в репозитории: состав,
 * происхождение и техника не выводятся ни из фотографии, ни из названия.
 */
export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const t = await getDictionary();
  const locale = await getLocale();
  const { slug } = await params;
  const repository = catalog();
  const product = await repository.getProductBySlug(slug);
  if (!product) notFound();

  const admin = await isAdmin();
  const [categories, sameCategory] = await Promise.all([
    repository.listCategories(),
    repository.listProducts({
      categorySlug: product.categorySlug,
      pageSize: RELATED_COUNT + 1,
    }),
  ]);

  const category = categories.find(
    (item) => item.slug === product.categorySlug,
  );

  // Если в разделе мало образов, добираем остальными из коллекции
  let related = sameCategory.items.filter((item) => item.id !== product.id);
  if (related.length < RELATED_COUNT) {
    const rest = await repository.listProducts({ pageSize: 40 });
    const seen = new Set([product.id, ...related.map((item) => item.id)]);
    related = [...related, ...rest.items.filter((item) => !seen.has(item.id))];
  }
  related = related.slice(0, RELATED_COUNT);

  return (
    <>
      <ProductJsonLd
        product={product}
        locale={locale}
        category={
          category
            ? { slug: category.slug, title: categoryTitle(category, locale) }
            : undefined
        }
      />
      <Container className="pt-4 lg:pt-6">
        {/* Владелец, вошедший в админку, правит образ прямо со страницы;
            покупатель этой кнопки не видит */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Breadcrumbs
            items={[
              { href: "/", label: t.nav.home },
              { href: "/catalog", label: t.catalog.title },
              ...(category
                ? [
                    {
                      href: `/catalog/${category.slug}`,
                      label: categoryTitle(category, locale),
                    },
                  ]
                : []),
              { label: product.title },
            ]}
          />
          {admin ? (
            <Button
              href={`/admin/products/${product.id}`}
              variant="secondary"
              size="sm"
            >
              Изменить товар
            </Button>
          ) : null}
        </div>

        {/* Цвет выбирается в панели, а кадры меняет галерея — выбор
            общий для обеих колонок. */}
        <ProductColorProvider initial={productColors(product)[0]?.name}>
          <div className="mt-6 grid gap-x-[var(--gutter)] gap-y-10 pb-[var(--space-block-y)] lg:mt-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ProductGallery
                images={product.images}
                title={product.title}
                sale={product.sale}
              />
            </div>

            {/* Панель покупки — белая плавающая карточка, прилипающая к шапке:
                подпись к развороту, лежащая поверх страницы, а не колонка. */}
            <div className="lg:col-span-5 lg:col-start-8">
              <div
                data-surface="day"
                className="card card--float p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:p-8"
              >
                <ProductPurchase product={product} />
              </div>
            </div>
          </div>
        </ProductColorProvider>
      </Container>

      {/* С этой секции липкая панель телефона больше не нужна: дальше идут
          рассказ о коллекции, другие образы и подвал. Её id — точка
          остановки, на которую смотрит ProductPurchase. */}
      <Section id={PRODUCT_STORY_ID} rhythm="block">
        <Container>
          <Aivan
            surface="green"
            pad="block"
            ornament="corner"
            ornamentOrigin={[100, 0]}
          >
            <div className="grid gap-x-[var(--gutter)] gap-y-8 lg:grid-cols-12">
              <Reveal className="lg:col-span-4">
                <h2 className="t-h3">{t.misc.lookLabel}</h2>
                <span
                  aria-hidden="true"
                  className="hoshiya-line mt-5 block max-w-[4rem]"
                />
              </Reveal>
              <Reveal className="lg:col-span-7 lg:col-start-6" delay={80}>
                <p className="t-h2 t-measure text-balance">{t.misc.lookLead}</p>
              </Reveal>
            </div>
          </Aivan>
        </Container>
      </Section>

      <RelatedProducts products={related} categories={categories} />
    </>
  );
}
