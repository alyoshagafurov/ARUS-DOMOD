import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import type { OrnamentMotif } from "@/components/ornament/Ornament";
import type { PlateTone } from "@/components/ui/FabricPlate";
import type { Collection, Product } from "@/types/catalog";

/**
 * Раскладка полосы задана вручную, а не циклом по одинаковым ячейкам.
 * Разные пропорции кадра, разные ширины колонок и вертикальные сдвиги дают
 * витрине ритм журнального разворота; тона плит подобраны в одну гамму.
 */
const layout: {
  cell: string;
  ratio: "editorial" | "tall" | "portrait" | "square";
  tone: PlateTone;
  motif: OrnamentMotif;
  sizes: string;
}[] = [
  {
    cell: "col-span-2 lg:col-span-7",
    ratio: "editorial",
    tone: "madder",
    motif: "chorkhona",
    sizes: "(min-width: 1024px) 56vw, 100vw",
  },
  {
    cell: "lg:col-span-4 lg:col-start-9 lg:mt-32",
    ratio: "tall",
    tone: "nil",
    motif: "mavj",
    sizes: "(min-width: 1024px) 32vw, 50vw",
  },
  {
    cell: "lg:col-span-4 lg:col-start-2",
    ratio: "square",
    tone: "ink",
    motif: "gul",
    sizes: "(min-width: 1024px) 32vw, 50vw",
  },
  {
    cell: "col-span-2 sm:col-span-1 lg:col-span-5 lg:col-start-7 lg:mt-24",
    ratio: "portrait",
    tone: "bone",
    motif: "chorkhona",
    sizes: "(min-width: 1024px) 40vw, (min-width: 640px) 46vw, 100vw",
  },
];

interface FeaturedCollectionProps {
  products: Product[];
  categoryLabels: Record<string, string>;
  collection?: Collection;
}

export function FeaturedCollection({
  products,
  categoryLabels,
  collection,
}: FeaturedCollectionProps) {
  if (products.length === 0) return null;

  return (
    <Section id="featured">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div>
            <p className="t-label text-ink-muted">
              {collection?.subtitle ?? "Сезон свадеб"}
            </p>
            <h2 className="t-h1 mt-4">{collection?.title ?? "Коллекция 01"}</h2>
          </div>
          <Button href="/catalog" variant="ghost">
            Смотреть все
          </Button>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-14 lg:mt-20 lg:grid-cols-12 lg:gap-y-6">
          {products.slice(0, layout.length).map((product, index) => {
            const cell = layout[index];
            return (
              <Reveal
                as="li"
                key={product.id}
                delay={index * 90}
                className={cell.cell}
              >
                <ProductCard
                  product={product}
                  categoryLabel={categoryLabels[product.categorySlug]}
                  ratio={cell.ratio}
                  tone={cell.tone}
                  plateMotif={cell.motif}
                  sizes={cell.sizes}
                  priority={index === 0}
                  action={
                    <FavoriteButton
                      productId={product.id}
                      productTitle={product.title}
                    />
                  }
                />
              </Reveal>
            );
          })}
        </ul>

        {/* Редакционная линейка вместо обычной кнопки по центру */}
        <div className="mt-20 flex items-center gap-6 lg:mt-28">
          <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
          <Button href="/catalog" variant="secondary">
            Вся коллекция
          </Button>
          <span className="h-px flex-1 bg-hairline" aria-hidden="true" />
        </div>
      </Container>
    </Section>
  );
}
