"use client";

import Link from "next/link";

import type { ResolvedLine } from "@/components/cart/useCartProducts";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { Media } from "@/components/ui/Media";
import { Tag } from "@/components/ui/Tag";
import { useDictionary } from "@/lib/i18n/client";
import { removeLine, setQuantity } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

interface CartLinesProps {
  title: string;
  note?: string;
  items: ResolvedLine[];
}

/**
 * Список позиций одного типа.
 *
 * Покупка и прокат разведены в отдельные группы намеренно: у них разный смысл
 * и разные последствия для суммы, и мешать их в одном столбце — верный способ
 * получить вопрос «а почему итог такой».
 */
export function CartLines({ title, note, items }: CartLinesProps) {
  const t = useDictionary();
  if (items.length === 0) return null;

  return (
    <section className="border-t border-hairline pt-7 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="t-label text-ink-muted">{title}</h2>
        {note ? <p className="t-caption">{note}</p> : null}
      </div>

      <ul className="mt-5 flex flex-col">
        {items.map(({ line, product, offer, total }) => (
          <li
            key={line.id}
            className="flex gap-4 border-b border-hairline py-6 sm:gap-6"
          >
            <Link
              href={`/product/${product.slug}`}
              aria-label={t.cart.open(product.title)}
              className="w-20 shrink-0 sm:w-24"
            >
              <Media
                image={product.images[0]}
                ratio="portrait"
                sizes="96px"
                zoomOnHover={false}
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <h3 className="t-h3">
                    {/* Строка корзины — не карточка: растянутой ссылки тут нет,
                        поэтому зону нажатия названию даём явно. */}
                    <Link href={`/product/${product.slug}`} className="tap-row">
                      <span className="motion-underline">{product.title}</span>
                    </Link>
                  </h3>
                  <p className="t-caption mt-1.5">
                    {line.size ? t.cart.sizeLine(line.size) : ""}
                    {line.variantId
                      ? product.variants.find((v) => v.id === line.variantId)
                          ?.sku
                      : null}
                  </p>
                </div>
                <p className="t-price shrink-0">{formatMoney(total)}</p>
              </div>

              {offer.kind === "rental" ? (
                <p className="t-caption">
                  {t.cart.rentalTerm(offer.rentalPeriodDays)}
                  {offer.deposit
                    ? t.cart.depositShort(formatMoney(offer.deposit))
                    : ""}
                </p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <QuantityStepper
                  value={line.quantity}
                  label={product.title}
                  onChange={(next) => setQuantity(line.id, next)}
                />
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  className="tap-row self-start text-ink-muted hover:text-ink-accent"
                >
                  <span className="t-label motion-underline">
                    {t.cart.remove}
                  </span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Плашка типа предложения — используется и в корзине, и на оформлении */
export function OfferTag({ kind }: { kind: "purchase" | "rental" }) {
  const t = useDictionary();
  return kind === "rental" ? (
    <Tag tone="gold">{t.product.rental}</Tag>
  ) : (
    <Tag tone="outline">{t.product.purchase}</Tag>
  );
}
