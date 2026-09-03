"use client";

import { useEffect, useId, useRef, useState } from "react";

import { FavoriteButton } from "@/components/product/FavoriteButton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useAddToCart, useCartHas } from "@/lib/cart";
import { contact, rental as rentalTerms } from "@/lib/config/site";
import { formatMoney } from "@/lib/format";
import { whatsappLink } from "@/lib/orders/whatsapp";
import type { Product } from "@/types/catalog";

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
 * Панель предложения: ПОКУПКА и ПРОКАТ — два разных действия, а не два
 * пункта одного переключателя.
 *
 * Покупка идёт в корзину и дальше в заказ. Прокат через сайт не оформляется
 * вовсе — только в магазине, — поэтому у него нет ни корзины, ни размера,
 * ни количества: цена, условия и одна кнопка «Узнать о прокате», которая
 * открывает WhatsApp с готовым вопросом. Смешать эти две ветки в один
 * переключатель значило бы обещать онлайн-прокат, которого нет.
 *
 * Ничего не рисуется «на всякий случай»: нет покупки — нет блока покупки;
 * нет размеров — нет ряда размеров. Пустой селектор врёт о товаре не меньше,
 * чем выдуманная характеристика.
 */
export function ProductPurchase({ product }: ProductPurchaseProps) {
  const groupId = useId();
  const ctaRef = useRef<HTMLDivElement>(null);
  const addToCart = useAddToCart();

  const purchase = product.offers.find((offer) => offer.kind === "purchase");
  const rental = product.offers.find((offer) => offer.kind === "rental");

  const sized = product.variants.filter((variant) => variant.size);
  const [variantId, setVariantId] = useState(
    sized.length > 0 ? sized[0].id : product.variants[0]?.id,
  );
  const variant =
    product.variants.find((item) => item.id === variantId) ??
    product.variants[0];

  const soldOut = product.variants.every((v) => v.availability === "sold_out");
  const inCart = useCartHas(product.id, variant?.id, "purchase");
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

  const submit = () => {
    if (soldOut || !purchase) return;
    addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      variantId: variant?.id,
      size: variant?.size,
      offerKind: "purchase",
    });
    setFlash((value) => value + 1);
  };

  const buyLabel = soldOut
    ? "Нет в наличии"
    : flash
      ? "Добавлено"
      : "Добавить в корзину";

  /* Вопрос о прокате — от лица клиента, без утверждений о товаре */
  const rentalInquiry = whatsappLink(
    contact.phone,
    `Здравствуйте! Интересует прокат: ${product.title}` +
      (product.article ? ` (арт. ${product.article})` : "") +
      ". Подскажите, пожалуйста, наличие и условия.",
  );

  return (
    <>
      <div className="flex flex-col">
        <p className="t-label text-ink-muted">
          ARUS DOMOD{product.article ? ` · ${product.article}` : ""}
        </p>
        <h1 className="t-h1 mt-3">{product.title}</h1>

        {/* ---------- ПОКУПКА ------------------------------------------ */}
        {purchase ? (
          <section
            aria-labelledby={`${groupId}-buy`}
            className="mt-8 border-t border-hairline pt-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 id={`${groupId}-buy`} className="t-label text-ink-accent">
                Покупка
              </h2>
              <p className="flex items-baseline gap-3">
                <span className="t-price text-[1.25rem]">
                  {formatMoney(purchase.price)}
                </span>
                {purchase.compareAtPrice ? (
                  <span className="t-caption line-through">
                    {formatMoney(purchase.compareAtPrice)}
                  </span>
                ) : null}
              </p>
            </div>

            {/* Размеры — только если они у изделия есть */}
            {sized.length > 0 ? (
              <fieldset className="mt-6">
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
                {variant.colorName ? ` · ${variant.colorName}` : ""}
              </p>
            ) : null}

            <div ref={ctaRef} className="mt-6 flex items-center gap-3">
              <Button onClick={submit} disabled={soldOut} fullWidth>
                {buyLabel}
              </Button>
              <FavoriteButton
                productId={product.id}
                productTitle={product.title}
                className="shrink-0 border border-hairline"
              />
            </div>

            <p className="t-caption mt-3 min-h-[1.2em]" aria-live="polite">
              {inCart ? "Образ в корзине" : ""}
            </p>
          </section>
        ) : null}

        {/* ---------- ПРОКАТ ------------------------------------------- */}
        {rental ? (
          <section
            aria-labelledby={`${groupId}-rent`}
            data-surface="green"
            className="mt-8 border border-hairline p-5"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 id={`${groupId}-rent`} className="t-label text-ink-accent">
                Прокат
              </h2>
              <p className="t-price text-[1.125rem]">
                {formatMoney(rental.price)}
                <span className="t-caption ml-2 font-normal">
                  до {rentalTerms.maxDays} дней
                </span>
              </p>
            </div>

            <ul className="t-body-sm mt-4 flex flex-col gap-2 text-ink-secondary">
              <li>Оформляется непосредственно в магазине.</li>
              <li>Срок — до {rentalTerms.maxDays} дней.</li>
              <li>Залог: {rentalTerms.depositKinds.join(" / ")}.</li>
              <li>Залог возвращается после возврата образа в сохранности.</li>
              <li>Доставка на прокат не распространяется.</li>
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button href={rentalInquiry} external variant="secondary">
                Узнать о прокате
              </Button>
              {!purchase ? (
                <FavoriteButton
                  productId={product.id}
                  productTitle={product.title}
                  className="shrink-0 border border-hairline"
                />
              ) : null}
            </div>
          </section>
        ) : null}

        {product.description ? (
          <p className="t-caption mt-7 border-t border-hairline pt-6">
            {product.description}
          </p>
        ) : null}
      </div>

      {/* Липкая панель телефона: покупка — в корзину, прокат — в WhatsApp */}
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
            {(purchase ?? rental) ? (
              <span className="t-price mt-1 block">
                {formatMoney((purchase ?? rental)!.price)}
              </span>
            ) : null}
          </span>
          {purchase ? (
            <Button onClick={submit} disabled={soldOut} className="shrink-0">
              {soldOut ? "Нет в наличии" : flash ? "Добавлено" : "В корзину"}
            </Button>
          ) : rental ? (
            <Button href={rentalInquiry} external className="shrink-0">
              О прокате
            </Button>
          ) : null}
        </div>
      </div>
    </>
  );
}
