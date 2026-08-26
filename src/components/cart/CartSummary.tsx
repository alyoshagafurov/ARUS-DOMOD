"use client";

import type { CartTotals } from "@/components/cart/useCartProducts";
import { formatMoney } from "@/lib/format";

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
  return (
    <dl className="flex flex-col">
      <Row label="Образов" value={String(totals.items)} />

      {totals.purchaseSum ? (
        <Row label="Покупка" value={formatMoney(totals.purchaseSum)} />
      ) : null}
      {totals.rentalSum ? (
        <Row label="Прокат" value={formatMoney(totals.rentalSum)} />
      ) : null}

      <div className="mt-3 border-t border-hairline pt-3">
        <Row
          label="Итого"
          value={totals.grandTotal ? formatMoney(totals.grandTotal) : "—"}
          strong
        />
      </div>

      {totals.depositSum ? (
        <div className="mt-3 border-t border-hairline pt-4">
          <Row label="Залог за прокат" value={formatMoney(totals.depositSum)} />
          <p className="t-caption mt-1">
            Возвращается после возврата образа и в итог не входит.
          </p>
        </div>
      ) : null}
    </dl>
  );
}
