"use client";

import { useDictionary } from "@/lib/i18n/client";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { OrnamentBand } from "@/components/ornament/Ornament";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { catalog } from "@/lib/catalog/client";
import { useFavoriteIds } from "@/lib/favorites";
import type { Category, Product } from "@/types/catalog";

/**
 * Сохранённые образы.
 *
 * Избранное хранит только идентификаторы, поэтому товары берутся из
 * репозитория — второй копии данных не появляется. Реальный API отдавал бы
 * их одним запросом по списку id; пока выборка идёт по общему списку.
 */
export function FavoritesView() {
  const t = useDictionary();
  const ids = useFavoriteIds();
  const [all, setAll] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    const repository = catalog();
    Promise.all([
      repository.listProducts({ pageSize: 200 }),
      repository.listCategories(),
    ]).then(([page, list]) => {
      if (cancelled) return;
      setAll(page.items);
      setCategories(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const chosen = new Set(ids);
  const products = (all ?? []).filter((product) => chosen.has(product.id));
  const labels = new Map(categories.map((c) => [c.slug, c.title]));
  const empty = all !== null && products.length === 0;

  return (
    <Container className="pb-[var(--space-section-y)] pt-4 lg:pt-8">
      <h1 className="t-h1">{t.favorites.title}</h1>

      {empty ? (
        <div className="flex flex-col items-center py-24 text-center lg:py-32">
          <OrnamentBand motif="gul" height={12} className="max-w-[9rem]" />
          <p className="t-h2 mt-9 max-w-[22ch] text-balance">
            {t.favorites.empty}
          </p>
          <p className="t-body-sm mt-4 max-w-[38ch] text-ink-secondary">
            {t.favorites.emptyHint}
          </p>
          <Button href="/catalog" className="mt-8">
            {t.favorites.browse}
          </Button>
        </div>
      ) : (
        <>
          <p className="t-label mt-4 text-ink-muted" aria-live="polite">
            {t.favorites.count(products.length)}
          </p>

          <ul className="mt-9 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:mt-12 lg:grid-cols-4">
            {products.map((product, index) => (
              <Reveal as="li" key={product.id} delay={(index % 4) * 70}>
                <ProductCard
                  product={product}
                  categoryLabel={labels.get(product.categorySlug)}
                  sizes="(min-width: 1024px) 24vw, 46vw"
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
        </>
      )}
    </Container>
  );
}
