"use client";

import { HeartIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useIsFavorite, useToggleFavorite } from "@/lib/favorites";

interface FavoriteButtonProps {
  productId: string;
  productTitle: string;
  className?: string;
}

/**
 * Кнопка «в избранное».
 *
 * Состояние берётся из общего хранилища сессии, поэтому переживает
 * перестройку сетки каталога при фильтрации. Размер 44×44 — минимальная
 * комфортная цель для пальца, поэтому кнопка одинакова на всех экранах:
 * на витрине она нужна с телефона не меньше, чем с мыши.
 */
export function FavoriteButton({
  productId,
  productTitle,
  className,
}: FavoriteButtonProps) {
  const active = useIsFavorite(productId);
  const toggle = useToggleFavorite(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={
        active
          ? `Убрать «${productTitle}» из избранного`
          : `Добавить «${productTitle}» в избранное`
      }
      onClick={toggle}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-xs text-[0.95rem]",
        // Плашка непрозрачная: полупрозрачная поверх светлой съёмки
        // размывалась в бледный квадрат и читалась как недоделка.
        "bg-page text-ink",
        "transition-[color,background-color,opacity]",
        "duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
        "hover:text-ink-accent",
        active && "text-ink-accent",
        className,
      )}
    >
      <HeartIcon
        className={cn("h-[1.15em] w-[1.15em]", active && "fill-current")}
      />
    </button>
  );
}
