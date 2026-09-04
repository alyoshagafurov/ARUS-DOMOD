import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/i18n/server";
import type { Collection, Product } from "@/types/catalog";

interface FeaturedCollectionProps {
  products: Product[];
  categoryLabels: Record<string, string>;
  collection?: Collection;
}

/**
 * Подборка — айвон с рейкой предметов.
 *
 * Внутри зелёного объёма лежат белые карточки: первая крупнее и выше,
 * остальные идут за ней лентой, которая прокручивается по горизонтали на
 * любом экране и уходит за правый край блока. Карточки приподняты и при
 * наведении поднимаются ещё — предметы на поверхности, а не ячейки сетки.
 */
export async function FeaturedCollection({
  products,
  categoryLabels,
  collection,
}: FeaturedCollectionProps) {
  const t = await getDictionary();
  if (products.length === 0) return null;

  return (
    <Section id="featured" rhythm="block">
      <Container>
        <Aivan
          surface="green"
          pad="none"
          ornament="corner"
          ornamentOrigin={[100, 100]}
        >
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 px-[var(--block-pad)] pt-[var(--block-pad)]">
            <Reveal>
              <h2 className="t-display-2 mt-5 max-w-[14ch] text-balance">
                {collection?.title ?? t.misc.catalogLabel}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <Button href="/catalog" variant="secondary" arrow>
                {t.home.seeAll}
              </Button>
            </Reveal>
          </div>

          <ul className="rail mt-10 gap-4 px-[var(--block-pad)] pb-[var(--block-pad)] lg:mt-14 lg:gap-6">
            {products.map((product, index) => (
              <Reveal
                as="li"
                key={product.id}
                delay={Math.min(index, 4) * 90}
                className={cn(
                  index === 0
                    ? "w-[78vw] max-w-[26rem] sm:w-[24rem] lg:w-[28rem]"
                    : "w-[62vw] max-w-[20rem] sm:w-[17rem] lg:w-[19rem]",
                  index !== 0 && "self-end",
                )}
              >
                <ProductCard
                  product={product}
                  categoryLabel={categoryLabels[product.categorySlug]}
                  ratio={index === 0 ? "editorial" : "portrait"}
                  sizes={
                    index === 0
                      ? "(min-width: 1024px) 28rem, 78vw"
                      : "(min-width: 1024px) 19rem, 62vw"
                  }
                  priority={index < 2}
                  action={
                    <FavoriteButton
                      productId={product.id}
                      productTitle={product.title}
                    />
                  }
                />
              </Reveal>
            ))}

            {/* Хвост рейки: ссылка на всю коллекцию как ещё один предмет */}
            <li className="flex w-[44vw] max-w-[14rem] items-stretch sm:w-[12rem]">
              <Button
                href="/catalog"
                variant="secondary"
                className="h-auto w-full flex-col gap-3 rounded-[var(--radius-card)] py-10"
                arrow
              >
                {t.home.allCollection}
              </Button>
            </li>
          </ul>
        </Aivan>
      </Container>
    </Section>
  );
}
