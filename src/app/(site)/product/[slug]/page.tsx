import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ProductGallery } from "@/components/product/ProductGallery";
import {
  PRODUCT_STORY_ID,
  ProductPurchase,
} from "@/components/product/ProductPurchase";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { catalog } from "@/lib/catalog";

const RELATED_COUNT = 4;

/** Образы известны заранее — страницы отрисовываются при сборке */
export async function generateStaticParams() {
  const page = await catalog().listProducts({ pageSize: 200 });
  return page.items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await catalog().getProductBySlug(slug);
  if (!product) return { title: "Образ не найден" };

  return {
    title: product.title,
    description: `${product.title} — коллекция ARUS DOMOD.`,
    openGraph: {
      title: `${product.title} · ARUS DOMOD`,
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
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
  const { slug } = await params;
  const repository = catalog();
  const product = await repository.getProductBySlug(slug);
  if (!product) notFound();

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
      <Container className="pt-4 lg:pt-6">
        <Breadcrumbs
          items={[
            { href: "/", label: "Главная" },
            { href: "/catalog", label: "Каталог" },
            ...(category
              ? [{ href: `/catalog/${category.slug}`, label: category.title }]
              : []),
            { label: product.title },
          ]}
        />

        <div className="mt-6 grid gap-x-[var(--gutter)] gap-y-10 pb-[var(--space-block-y)] lg:mt-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          {/* Кадры занимают шесть модулей из двенадцати, а не семь: на 1440
              семь модулей давали высоту почти в 1000px, и колонка с ценой
              уезжала за первый экран. */}
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
              <ProductPurchase product={product} />
            </div>
          </div>
        </div>
      </Container>

      {/* С этой секции липкая панель телефона больше не нужна: дальше идут
          рассказ о коллекции, другие образы и подвал. Её id — точка
          остановки, на которую смотрит ProductPurchase. */}
      <Section
        id={PRODUCT_STORY_ID}
        surface="night"
        edge="both"
        edgeMotif="chorkhona"
        rhythm="block"
      >
        <Container>
          <div className="grid gap-x-[var(--gutter)] gap-y-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-3">
              <p className="t-label text-ink-secondary">Образ целиком</p>
            </Reveal>
            <Reveal className="lg:col-span-7 lg:col-start-5" delay={80}>
              <p className="t-lead t-measure">
                Мы показываем выход коллекции так, как его видят на свадьбе:
                полностью, со всеми деталями и в движении. Что-то из коллекции
                продаётся, что-то доступно в прокат — это указано в карточке
                каждого образа.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      <RelatedProducts products={related} categories={categories} />
    </>
  );
}
