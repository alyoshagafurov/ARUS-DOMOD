"use client";

import { useDictionary } from "@/lib/i18n/client";

import { CartLines } from "@/components/cart/CartLines";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartProducts } from "@/components/cart/useCartProducts";
import { Container } from "@/components/layout/Container";
import { OrnamentBand } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";

/**
 * Корзина.
 *
 * Здесь спокойнее, чем на главной: человек пришёл проверить состав заказа и
 * идти дальше, а не рассматривать кампанию. Поэтому ни ночных секций, ни
 * крупной вёрстки — только список, итог и одна кнопка.
 */
export function CartView() {
  const t = useDictionary();
  const { ready, totals } = useCartProducts();
  const empty = ready && totals.items === 0;

  return (
    <Container className="pb-[var(--space-section-y)] pt-4 lg:pt-8">
      <h1 className="t-h1">{t.cart.title}</h1>

      {empty ? (
        <div className="flex flex-col items-center py-24 text-center lg:py-32">
          <OrnamentBand motif="mavj" height={10} className="max-w-[9rem]" />
          <p className="t-h2 mt-9 max-w-[20ch] text-balance">{t.cart.empty}</p>
          <p className="t-body-sm mt-4 max-w-[38ch] text-ink-secondary">
            {t.cart.emptyHint}
          </p>
          <Button href="/catalog" className="mt-8">
            {t.cart.browse}
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-x-[var(--gutter)] gap-y-12 lg:mt-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CartLines title={t.cart.purchase} items={totals.purchase} />
            <CartLines
              title={t.cart.rental}
              note={t.misc.rentalReturns}
              items={totals.rental}
            />
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <h2 className="t-label text-ink-muted">{t.cart.summary}</h2>
              <div className="mt-5 border-t border-hairline pt-4">
                <CartSummary totals={totals} />
              </div>

              <Button href="/checkout" fullWidth className="mt-7">
                {t.cart.checkout}
              </Button>
              <Button href="/catalog" variant="ghost" className="mt-5">
                {t.cart.continueShopping}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
