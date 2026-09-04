"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { OrnamentMotif } from "@/components/ornament/Ornament";
import type { PlateTone } from "@/components/ui/FabricPlate";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import { useDictionary } from "@/lib/i18n/client";
import { discountPercent, formatMoney, getPrimaryOffer } from "@/lib/format";
import type { OfferKind, Product } from "@/types/catalog";

type CardRatio = "portrait" | "editorial" | "tall" | "square";

interface ProductCardProps {
  product: Product;
  /**
   * Человеческое имя категории. Карточка не показывает `categorySlug`:
   * слуг — технический идентификатор, а не подпись для покупателя.
   */
  categoryLabel?: string;
  /** Что показывать ценой по умолчанию: покупку или прокат */
  preferredOffer?: OfferKind;
  /**
   * Слот для кнопки «в избранное». Карточка намеренно ничего не знает про
   * состояние избранного — интерактив приносит фаза Favorites.
   */
  action?: ReactNode;
  /** Пропорция кадра: редакционная сетка меняет её от карточки к карточке */
  ratio?: CardRatio;
  /** Тон тканой плиты. Задаётся явно там, где важен цветовой ритм полосы. */
  tone?: PlateTone;
  /** Мотив жаккарда плиты */
  plateMotif?: OrnamentMotif;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

/**
 * Карточка товара — опора каталога, подборок и избранного.
 *
 * Карточки здесь нет намеренно. Кадр стоит на холсте под тоқча — куполом
 * ниши — и держит композицию собственным силуэтом. Белая подложка с тенью
 * вокруг кадра, который и сам уже прямоугольник со скруглением, давала три
 * вложенные поверхности подряд: это самый заметный признак интерфейса,
 * собранного из готовых блоков, а не нарисованного.
 *
 * Плашки состояния сняты с фотографии и переехали под неё, в строку с
 * ценой: «продано» — факт о товаре, а не наклейка на снимке. Наверху кадра
 * их держать всё равно нельзя — там дуга купола.
 *
 * Ссылка растянута через ::after на всю карточку, поэтому `action` не
 * вкладывается в <a> и остаётся доступен с клавиатуры. Взаимодействие одно
 * и составное: кадр наезжает, проступает второй план, дуга обводится
 * золотой нитью, подчёркивание названия прорастает.
 */
export function ProductCard({
  product,
  categoryLabel,
  preferredOffer = "purchase",
  action,
  ratio = "portrait",
  tone,
  plateMotif,
  priority = false,
  sizes,
  className,
}: ProductCardProps) {
  const t = useDictionary();
  const offer = getPrimaryOffer(product, preferredOffer);
  const rental = product.offers.find((item) => item.kind === "rental");
  const purchase = product.offers.find((item) => item.kind === "purchase");
  const showRentalLine = rental && offer?.kind !== "rental";
  const discount = offer ? discountPercent(offer) : null;
  // Плашка выводится из предложений, а не хранится в данных: «только прокат»
  // — это факт о наборе offers, и дублировать его руками негде.
  const rentalOnly = Boolean(rental && !purchase);
  const soldOut = product.variants.every((v) => v.availability === "sold_out");
  const cover = product.images[0] ?? null;
  const second = product.images[1] ?? null;

  return (
    <article
      className={cn("group relative flex flex-col", className)}
      data-sold={soldOut ? "true" : undefined}
    >
      {/* Кадр под куполом. Обрезка и радиус — на самом <Media>, отдельного
          обрезающего слоя нет: он был бы второй поверхностью вокруг первой. */}
      <div className="lift relative">
        <Media
          image={cover}
          secondary={second}
          ratio={ratio}
          radius="arch"
          sizes={sizes}
          priority={priority}
          hoverReveal
          seed={product.slug}
          tone={tone}
          plateMotif={plateMotif}
          className={cn(
            "arch-hoshiya [&::after]:border-transparent",
            "[&::after]:transition-colors [&::after]:duration-[var(--dur-base)]",
            "group-hover:[&::after]:border-[var(--hoshiya-color-strong)]",
            soldOut && "opacity-70",
          )}
        />

        {/* Избранное — у основания купола, где кромка прямая */}
        {action ? (
          <div className="absolute bottom-3 right-3 z-10">{action}</div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        <h3 className="t-h3">
          <Link
            href={`/product/${product.slug}`}
            className="motion-underline after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </Link>
        </h3>

        {categoryLabel ? (
          <span className="t-caption">{categoryLabel}</span>
        ) : null}

        {offer ? (
          <p className="t-price mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span>{formatMoney(offer.price)}</span>
            {offer.compareAtPrice ? (
              <span className="t-caption line-through">
                {formatMoney(offer.compareAtPrice)}
              </span>
            ) : null}
            {discount ? (
              <span className="t-label text-gold-ink">−{discount}%</span>
            ) : null}
          </p>
        ) : null}

        {/* Состояние — строкой, а не наклейкой поверх фотографии */}
        {soldOut || rentalOnly || product.badges?.length ? (
          <p className="t-caption flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-accent">
            {soldOut ? <span>{t.product.availability.sold_out}</span> : null}
            {rentalOnly ? (
              <span>{t.product.availability.rental_only}</span>
            ) : null}
            {product.badges?.map((badge) => (
              <span key={badge.label}>{badge.label}</span>
            ))}
          </p>
        ) : null}

        {showRentalLine && rental ? (
          <p className="t-caption">
            {t.product.rental} — {formatMoney(rental.price)}
            {rental.rentalPeriodDays
              ? t.misc.rentalPer(rental.rentalPeriodDays)
              : ""}
          </p>
        ) : null}
      </div>
    </article>
  );
}
