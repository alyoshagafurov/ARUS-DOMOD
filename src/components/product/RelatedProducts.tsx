import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import type { Category, Product } from "@/types/catalog";
import { categoryTitle } from "@/lib/i18n/labels";
import { getDictionary, getLocale } from "@/lib/i18n/server";

interface RelatedProductsProps {
  products: Product[];
  categories: Category[];
}

/**
 * Продолжение просмотра. Карточки те же, что в каталоге, — страница товара
 * не заводит собственный вид карточки.
 */
export async function RelatedProducts({
  products,
  categories,
}: RelatedProductsProps) {
  const t = await getDictionary();
  if (products.length === 0) return null;
  const locale = await getLocale();
  const labels = new Map(
    categories.map((c) => [c.slug, categoryTitle(c, locale)]),
  );

  return (
    <Section surface="muted" edge="top" edgeMotif="mavj" rhythm="block">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <h2 className="t-h2">{t.product.related}</h2>
          <Button href="/catalog" variant="ghost">
            {t.product.viewCollection}
          </Button>
        </div>

        <ul className="mt-9 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:mt-12 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal as="li" key={product.id} delay={(index % 4) * 70}>
              <ProductCard
                product={product}
                categoryLabel={labels.get(product.categorySlug)}
                sizes="(min-width: 1024px) 22vw, 46vw"
                action={
                  <FavoriteButton
                    productId={product.id}
                    productTitle={product.title}
                  />
                }
              />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
