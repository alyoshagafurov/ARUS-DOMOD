"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { OrnamentMotif } from "@/components/ornament/Ornament";
import type { PlateTone } from "@/components/ui/FabricPlate";
import { ArrowIcon } from "@/components/ui/icons";
import { Media } from "@/components/ui/Media";
import { Tag } from "@/components/ui/Tag";
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
  /**
   * Карточка как предмет на поверхности: белая подложка с тенью вокруг
   * кадра и подписи. Включается внутри зелёных айвонов; на белом дворе
   * поднимается сам кадр.
   */
  framed?: boolean;
  className?: string;
}

/**
 * Базовая карточка товара — опора каталога, подборок и избранного.
 *
 * Ссылка растянута через ::after на всю карточку, поэтому `action` и подсказка
 * «Смотреть» не вкладываются в <a> и остаются доступны с клавиатуры.
 *
 * Взаимодействие ровно одно и составное: кадр медленно наезжает, под ним
 * проступает крупный план ткани, снизу выезжает подсказка. Всё — на transform
 * и opacity, всё глушится prefers-reduced-motion.
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
  framed = false,
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
      data-surface={framed ? "day" : undefined}
      className={cn(
        "group relative flex flex-col",
        framed ? "card lift p-3 pb-4" : "lift rounded-[var(--radius-card)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          framed
            ? "rounded-[calc(var(--radius-card)-0.5rem)]"
            : "rounded-[var(--radius-card)] shadow-card",
        )}
      >
        <Media
          image={cover}
          secondary={second}
          ratio={ratio}
          radius={framed ? "sm" : "card"}
          sizes={sizes}
          priority={priority}
          hoverReveal
          seed={product.slug}
          tone={tone}
          plateMotif={plateMotif}
        />

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <Tag tone="neutral">{t.product.availability.sold_out}</Tag>
          ) : null}
          {discount ? <Tag tone="accent">−{discount}%</Tag> : null}
          {rentalOnly ? (
            <Tag tone="gold">{t.product.availability.rental_only}</Tag>
          ) : null}
          {product.badges?.map((badge) => (
            <Tag key={badge.label} tone={badge.tone}>
              {badge.label}
            </Tag>
          ))}
        </div>

        {action ? (
          <div className="absolute right-3 top-3 z-10">{action}</div>
        ) : null}

        {/* Подсказка проявляется только на устройствах с курсором — на тач-экране
            карточка и так открывается касанием, лишняя полоса там не нужна. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute bottom-3 left-3 hidden items-center gap-3",
            "rounded-pill bg-white px-4 py-2.5 text-[var(--firuza-950)] shadow-raise lg:flex",
            "translate-y-3 opacity-0 transition-[transform,opacity]",
            "duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
            "group-hover:translate-y-0 group-hover:opacity-100",
            "group-focus-within:translate-y-0 group-focus-within:opacity-100",
          )}
        >
          <span className="t-label">{t.product.view}</span>
          <ArrowIcon className="h-[0.9em] w-[0.9em]" />
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col gap-1 pt-3", framed && "px-1")}>
        {categoryLabel ? (
          <span className="t-label text-ink-muted">{categoryLabel}</span>
        ) : null}

        <h3 className="t-h3">
          <Link
            href={`/product/${product.slug}`}
            className="motion-underline after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </Link>
        </h3>

        {offer ? (
          <p className="t-price mt-0.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span>{formatMoney(offer.price)}</span>
            {offer.compareAtPrice ? (
              <span className="t-caption line-through">
                {formatMoney(offer.compareAtPrice)}
              </span>
            ) : null}
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
