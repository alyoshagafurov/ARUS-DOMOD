"use client";

import Image from "next/image";

import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { useCartProducts } from "@/components/cart/useCartProducts";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { removeLine, setQuantity } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Выезжающая корзина — из шапки, не уводя со страницы.
 *
 * Содержимое вынесено во внутренний компонент намеренно: Drawer в закрытом
 * состоянии ничего не рендерит, поэтому и useCartProducts (а с ним запрос
 * за товарами) живёт только пока панель открыта. Иначе каждая страница
 * ходила бы за карточками корзины, которую никто не открывал.
 */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Корзина">
      <CartDrawerBody onClose={onClose} />
    </Drawer>
  );
}

function CartDrawerBody({ onClose }: { onClose: () => void }) {
  const { ready, totals } = useCartProducts();
  const lines = [...totals.purchase, ...totals.rental];

  if (!ready) {
    return <p className="t-caption">Собираем корзину…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-5">
        <p className="t-h3">Корзина пуста</p>
        <p className="t-body-sm text-ink-secondary">
          Выберите образы в коллекции — они появятся здесь.
        </p>
        <Button href="/catalog" onClick={onClose}>
          Смотреть образы
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col border-t border-hairline">
        {lines.map(({ line, product, offer, total }) => (
          <li
            key={line.id}
            className="flex gap-4 border-b border-hairline py-4"
          >
            <span className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-muted">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : null}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="flex items-baseline justify-between gap-3">
                <span className="t-body-sm truncate">{product.title}</span>
                <span className="t-price shrink-0">{formatMoney(total)}</span>
              </span>
              <span className="t-caption">
                {offer.kind === "rental" ? "Прокат" : "Покупка"}
                {line.size ? ` · размер ${line.size}` : ""}
              </span>
              <span className="flex items-center justify-between gap-3">
                <QuantityStepper
                  value={line.quantity}
                  label={product.title}
                  onChange={(next) => setQuantity(line.id, next)}
                />
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  className="tap-row text-ink-muted hover:text-ink-accent"
                >
                  <span className="t-label motion-underline">Удалить</span>
                </button>
              </span>
            </span>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2">
        {totals.purchaseSum ? (
          <div className="flex items-baseline justify-between">
            <dt className="t-label">К заказу</dt>
            <dd className="t-price text-[1.0625rem]">
              {formatMoney(totals.purchaseSum)}
            </dd>
          </div>
        ) : null}
        {totals.rental.length ? (
          <p className="t-caption">
            Прокат ({totals.rental.length}) в заказ не входит — его оформляют в
            магазине.
          </p>
        ) : null}
      </dl>

      <div className="flex flex-col gap-3">
        <Button
          href="/checkout"
          fullWidth
          onClick={onClose}
          disabled={!totals.purchaseSum}
        >
          Оформить заказ
        </Button>
        <Button href="/cart" variant="secondary" fullWidth onClick={onClose}>
          Открыть корзину
        </Button>
      </div>
    </div>
  );
}
