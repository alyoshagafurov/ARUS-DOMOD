"use client";

import { Reveal } from "@/components/motion/Reveal";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ProductCard } from "@/components/product/ProductCard";
import type { Category, Product } from "@/types/catalog";

/**
 * Раскладка каталога.
 *
 * На широких экранах — редакционный ритм с периодом в семь карточек: ряд из
 * четырёх компактных, затем ряд из трёх покрупнее. Ряды всегда складываются
 * ровно в 12 колонок, поэтому дырок в сетке не бывает ни при какой длине
 * выдачи, а порядок сортировки не нарушается (никакого grid-auto-flow: dense).
 *
 * Ритм задаётся сменой калибра, а не гигантскими карточками: пара кадров во
 * всю половину сетки была выше экрана, и каталог приходилось листать вслепую.
 *
 * Внутри ряда пропорция кадра одна на всех. Первая версия ставила рядом с
 * крупной карточкой две компактные — крупная оказывалась вдвое выше, и справа
 * от неё зияло 400 пикселей пустоты.
 *
 * На телефоне ритма нет намеренно: там две ровные колонки. Разнокалиберные
 * карточки на узком экране мешают просматривать список, а каталог существует
 * ради просмотра.
 */
const desktopSpan = [
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

const sizesHint = [
  "(min-width: 1024px) 24vw, 46vw",
  "(min-width: 1024px) 24vw, 46vw",
  "(min-width: 1024px) 24vw, 46vw",
  "(min-width: 1024px) 24vw, 46vw",
  "(min-width: 1024px) 32vw, 46vw",
  "(min-width: 1024px) 32vw, 46vw",
  "(min-width: 1024px) 32vw, 46vw",
];

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  /** Сколько карточек грузить с приоритетом — только первый экран */
  priorityCount?: number;
}

export function ProductGrid({
  products,
  categories,
  priorityCount = 3,
}: ProductGridProps) {
  const labels = new Map(categories.map((c) => [c.slug, c.title]));

  return (
    <ul className="grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-12 lg:gap-y-12">
      {products.map((product, index) => {
        const slot = index % desktopSpan.length;
        return (
          <Reveal
            as="li"
            key={product.id}
            delay={(index % 3) * 70}
            className={desktopSpan[slot]}
          >
            <ProductCard
              product={product}
              categoryLabel={labels.get(product.categorySlug)}
              ratio={slot >= 4 ? "editorial" : "portrait"}
              sizes={sizesHint[slot]}
              priority={index < priorityCount}
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
  );
}
