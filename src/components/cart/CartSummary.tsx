"use client";

import type { CartTotals } from "@/components/cart/useCartProducts";
import { formatMoney } from "@/lib/format";
import { useDictionary } from "@/lib/i18n/client";

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={strong ? "t-label" : "t-body-sm text-ink-secondary"}>
        {label}
      </dt>
      <dd className={strong ? "t-price text-[1.0625rem]" : "t-price"}>
        {value}
      </dd>
    </div>
  );
}

/**
 * Итог заказа.
 *
 * Залог показан отдельной строкой и НЕ входит в итог: это возвратные деньги,
 * и сложить их с ценой значило бы завысить сумму к оплате.
 */
export function CartSummary({ totals }: { totals: CartTotals }) {
  const t = useDictionary();
  return (
    <dl className="flex flex-col">
      <Row label={t.cart.items} value={String(totals.items)} />

      {totals.purchaseSum ? (
        <Row label={t.cart.purchase} value={formatMoney(totals.purchaseSum)} />
      ) : null}
      {totals.rentalSum ? (
        <Row label={t.cart.rental} value={formatMoney(totals.rentalSum)} />
      ) : null}

      <div className="mt-3 border-t border-hairline pt-3">
        <Row
          label={t.cart.total}
          value={totals.grandTotal ? formatMoney(totals.grandTotal) : "—"}
          strong
        />
      </div>

      {totals.depositSum ? (
        <div className="mt-3 border-t border-hairline pt-4">
          <Row
            label={t.cart.depositLine}
            value={formatMoney(totals.depositSum)}
          />
          <p className="t-caption mt-1">{t.cart.depositNote}</p>
        </div>
      ) : null}
    </dl>
  );
}
