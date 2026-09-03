"use client";

import { HeartIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useDictionary } from "@/lib/i18n/client";
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
  const t = useDictionary();
  const active = useIsFavorite(productId);
  const toggle = useToggleFavorite(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={
        active
          ? t.misc.favoriteRemove(productTitle)
          : t.misc.favoriteAdd(productTitle)
      }
      onClick={toggle}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-pill text-[0.95rem] shadow-raise",
        // Плашка непрозрачная: полупрозрачная поверх светлой съёмки
        // размывалась в бледный квадрат и читалась как недоделка.
        "bg-white text-[var(--firuza-950)]",
        "transition-[color,background-color,opacity,transform]",
        "duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
        "hover:-translate-y-0.5 hover:text-[var(--firuza-800)]",
        active && "text-[var(--firuza-800)]",
        className,
      )}
    >
      <HeartIcon
        className={cn("h-[1.15em] w-[1.15em]", active && "fill-current")}
      />
    </button>
  );
}
