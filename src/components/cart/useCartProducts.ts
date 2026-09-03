"use client";

import { useEffect, useState } from "react";

import { catalog } from "@/lib/catalog/client";
import { useCartLines, type CartLine } from "@/lib/cart";
import { getPrimaryOffer } from "@/lib/format";
import type { Money, Product, ProductOffer } from "@/types/catalog";

export interface ResolvedLine {
  line: CartLine;
  product: Product;
  offer: ProductOffer;
  /** Цена позиции с учётом количества */
  total: Money;
}

export interface CartTotals {
  purchase: ResolvedLine[];
  rental: ResolvedLine[];
  items: number;
  purchaseSum: Money | null;
  rentalSum: Money | null;
  depositSum: Money | null;
  grandTotal: Money | null;
}

const sum = (values: Money[]): Money | null =>
  values.length === 0
    ? null
    : {
        amount: values.reduce((acc, value) => acc + value.amount, 0),
        currency: values[0].currency,
      };

/**
 * Разворачивает строки корзины в товары.
 *
 * Корзина хранит только идентификаторы, поэтому названия, кадры и цены
 * каждый раз берутся из репозитория — второй копии данных о товаре в проекте
 * не появляется. Когда за репозиторием окажется API, изменится только он.
 */
export function useCartProducts(): { ready: boolean; totals: CartTotals } {
  const lines = useCartLines();
  const [products, setProducts] = useState<Map<string, Product> | null>(null);

  const slugs = lines.map((line) => line.slug).join(",");

  useEffect(() => {
    let cancelled = false;
    const wanted = slugs ? slugs.split(",") : [];

    Promise.all(
      [...new Set(wanted)].map((slug) => catalog().getProductBySlug(slug)),
    ).then((found) => {
      if (cancelled) return;
      const map = new Map<string, Product>();
      for (const product of found) if (product) map.set(product.slug, product);
      setProducts(map);
    });

    return () => {
      cancelled = true;
    };
  }, [slugs]);

  const resolved: ResolvedLine[] = [];
  if (products) {
    for (const line of lines) {
      const product = products.get(line.slug);
      if (!product) continue;
      const offer =
        product.offers.find((item) => item.kind === line.offerKind) ??
        getPrimaryOffer(product);
      if (!offer) continue;
      resolved.push({
        line,
        product,
        offer,
        total: {
          amount: offer.price.amount * line.quantity,
          currency: offer.price.currency,
        },
      });
    }
  }

  const purchase = resolved.filter((item) => item.offer.kind === "purchase");
  const rental = resolved.filter((item) => item.offer.kind === "rental");

  return {
    ready: products !== null,
    totals: {
      purchase,
      rental,
      items: lines.reduce((acc, line) => acc + line.quantity, 0),
      purchaseSum: sum(purchase.map((item) => item.total)),
      rentalSum: sum(rental.map((item) => item.total)),
      depositSum: sum(
        rental
          .filter((item) => item.offer.deposit)
          .map((item) => ({
            amount: item.offer.deposit!.amount * item.line.quantity,
            currency: item.offer.deposit!.currency,
          })),
      ),
      grandTotal: sum(resolved.map((item) => item.total)),
    },
  };
}
