"use client";

import { useEffect, useId, useRef, useState } from "react";

import { FavoriteButton } from "@/components/product/FavoriteButton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useAddToCart, useCartHas } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import type { OfferKind, Product, ProductOffer } from "@/types/catalog";

const offerTitles: Record<OfferKind, string> = {
  purchase: "Покупка",
  rental: "Прокат",
};

const availabilityLabels = {
  in_stock: "В наличии",
  made_to_order: "Под заказ",
  rental_only: "Только прокат",
  sold_out: "Продано",
} as const;

/**
 * Якорь, ниже которого липкая панель телефона прячется. Экспортируется,
 * чтобы страница и панель не разошлись в написании селектора.
 */
export const PRODUCT_STORY_ID = "product-story";

interface ProductPurchaseProps {
  product: Product;
}

/**
 * Выбор предложения, размера и добавление в корзину.
 *
 * Ничего не рисуется «на всякий случай»: если предложение одно — переключателя
 * нет, если размеров у изделия не бывает — нет и ряда размеров. Пустой
 * селектор врёт о товаре не меньше, чем выдуманная характеристика.
 */
export function ProductPurchase({ product }: ProductPurchaseProps) {
  const groupId = useId();
  const ctaRef = useRef<HTMLDivElement>(null);
  const addToCart = useAddToCart();

  const purchase = product.offers.find((offer) => offer.kind === "purchase");
  const rental = product.offers.find((offer) => offer.kind === "rental");
  const [kind, setKind] = useState<OfferKind>(purchase ? "purchase" : "rental");

  const sized = product.variants.filter((variant) => variant.size);
  const [variantId, setVariantId] = useState(
    sized.length > 0 ? sized[0].id : product.variants[0]?.id,
  );
  const variant =
    product.variants.find((item) => item.id === variantId) ??
    product.variants[0];

  const soldOut = product.variants.every((v) => v.availability === "sold_out");
  const inCart = useCartHas(product.id, variant?.id, kind);
  const [flash, setFlash] = useState(0);
  const [stuck, setStuck] = useState(false);

  // Кнопка коротко подтверждает нажатие; постоянное состояние живёт строкой ниже
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(0), 1800);
    return () => clearTimeout(timer);
  }, [flash]);

  /**
   * Липкая панель на телефоне появляется, когда основной CTA уехал за экран,
   * и снова прячется, когда читатель дошёл до следующих секций: иначе она
   * навсегда закрывает нижнюю строку подвала. Точку остановки размечает
   * страница — секцией с id PRODUCT_STORY_ID.
   */
  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;

    const stop = document.getElementById(PRODUCT_STORY_ID);
    let ctaVisible = true;
    let stopReached = false;
    const apply = () => setStuck(!ctaVisible && !stopReached);

    const ctaObserver = new IntersectionObserver(
      ([entry]) => {
        ctaVisible = entry.isIntersecting;
        apply();
      },
      { threshold: 0 },
    );
    ctaObserver.observe(cta);

    const stopObserver = stop
      ? new IntersectionObserver(
          ([entry]) => {
            stopReached = entry.isIntersecting;
            apply();
          },
          { threshold: 0 },
        )
      : null;
    if (stop && stopObserver) stopObserver.observe(stop);

    return () => {
      ctaObserver.disconnect();
      stopObserver?.disconnect();
    };
  }, []);

  const offer: ProductOffer | undefined =
    kind === "purchase" ? purchase : rental;
  const both = Boolean(purchase && rental);

  const submit = () => {
    if (soldOut || !offer) return;
    addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      variantId: variant?.id,
      size: variant?.size,
      offerKind: kind,
    });
    setFlash((value) => value + 1);
  };

  const ctaLabel = soldOut
    ? "Нет в наличии"
    : flash
      ? "Добавлено"
      : "Добавить в корзину";

  return (
    <>
      <div className="flex flex-col">
        <p className="t-label text-ink-muted">ARUS DOMOD</p>
        <h1 className="t-h1 mt-3">{product.title}</h1>

        {/* Предложения */}
        <div className="mt-7">
          {both ? (
            <fieldset>
              <legend className="t-label text-ink-muted">
                Покупка или прокат
              </legend>
              <div className="mt-4 flex flex-col">
                {(["purchase", "rental"] as const).map((value) => {
                  const item = value === "purchase" ? purchase : rental;
                  if (!item) return null;
                  const active = kind === value;
                  return (
                    <label
                      key={value}
                      className={cn(
                        "flex cursor-pointer items-baseline justify-between gap-6 border-t border-hairline py-4",
                        "transition-colors duration-[var(--dur-fast)]",
                        active
                          ? "text-ink"
                          : "text-ink-secondary hover:text-ink",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`${groupId}-offer`}
                          checked={active}
                          onChange={() => setKind(value)}
                          className="h-4 w-4 accent-[var(--accent)]"
                        />
                        <span className="t-body-sm">{offerTitles[value]}</span>
                      </span>
                      <span className="t-price">{formatMoney(item.price)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : offer ? (
            <div className="flex items-baseline gap-4">
              <span className="t-price text-[1.25rem]">
                {formatMoney(offer.price)}
              </span>
              <span className="t-label text-ink-muted">
                {offerTitles[offer.kind]}
              </span>
            </div>
          ) : null}

          {offer?.compareAtPrice ? (
            <p className="t-caption mt-3 line-through">
              {formatMoney(offer.compareAtPrice)}
            </p>
          ) : null}

          {offer?.kind === "rental" ? (
            <p className="t-caption mt-4">
              Срок — {offer.rentalPeriodDays} дн.
              {offer.deposit ? ` · залог ${formatMoney(offer.deposit)}` : ""}
            </p>
          ) : null}
        </div>

        {/* Размеры — только если они у изделия есть */}
        {sized.length > 0 ? (
          <fieldset className="mt-7 border-t border-hairline pt-6">
            <legend className="t-label float-left w-full pb-4 text-ink-muted">
              Размер
            </legend>
            <div className="clear-both flex flex-wrap gap-2">
              {sized.map((item) => {
                const active = item.id === variant?.id;
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "t-label inline-flex h-11 min-w-[3.25rem] cursor-pointer items-center justify-center rounded-xs border px-3",
                      "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
                      "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]",
                      active
                        ? "border-accent text-ink-accent"
                        : "border-hairline text-ink-secondary hover:border-strong hover:text-ink",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${groupId}-size`}
                      checked={active}
                      onChange={() => setVariantId(item.id)}
                      className="sr-only"
                    />
                    {item.size}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {variant ? (
          <p className="t-caption mt-5">
            {availabilityLabels[variant.availability]}
            {variant.sku ? ` · ${variant.sku}` : ""}
          </p>
        ) : null}

        {/* Действия */}
        <div ref={ctaRef} className="mt-7 flex items-center gap-3">
          <Button onClick={submit} disabled={soldOut} fullWidth>
            {ctaLabel}
          </Button>
          <FavoriteButton
            productId={product.id}
            productTitle={product.title}
            className="shrink-0 border border-hairline"
          />
        </div>

        <p className="t-caption mt-4 min-h-[1.2em]" aria-live="polite">
          {inCart ? "Образ в корзине" : ""}
        </p>

        {product.description ? (
          <p className="t-caption mt-7 border-t border-hairline pt-6">
            {product.description}
          </p>
        ) : null}
      </div>

      {/* Липкая панель телефона */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-page/95 backdrop-blur-[8px] lg:hidden",
          "transition-[transform,opacity] duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
          stuck
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0",
        )}
      >
        <div className="flex items-center gap-3 px-[var(--gutter)] py-3">
          <span className="min-w-0 flex-1">
            <span className="t-label block truncate text-ink-muted">
              {product.title}
            </span>
            {offer ? (
              <span className="t-price mt-1 block">
                {formatMoney(offer.price)}
              </span>
            ) : null}
          </span>
          <Button onClick={submit} disabled={soldOut} className="shrink-0">
            {soldOut ? "Нет в наличии" : flash ? "Добавлено" : "В корзину"}
          </Button>
        </div>
      </div>
    </>
  );
}
