"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ArrowIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/types/catalog";

interface ProductViewerProps {
  images: ProductImage[];
  /** Кадр, с которого открыли просмотр */
  startIndex: number;
  open: boolean;
  onClose: () => void;
  title: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Полноэкранный просмотр кадров.
 *
 * Лента — нативный scroll-snap, а не карусель на JS: свайп на телефоне,
 * колесо и трекпад на десктопе работают сами, а стрелки и клавиатура просто
 * прокручивают её к нужному кадру. Активный индекс выводится наблюдателем
 * пересечений, поэтому источник правды один — реальное положение ленты.
 *
 * Кадр вписывается целиком (`object-contain`): в просмотре нельзя обрезать
 * изделие ради красивой рамки.
 */
export function ProductViewer({
  images,
  startIndex,
  open,
  onClose,
  title,
}: ProductViewerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(startIndex);

  // При повторном открытии счётчик обязан показывать тот кадр, с которого
  // открыли, ещё до того как отработает наблюдатель прокрутки.
  const [openedAt, setOpenedAt] = useState(startIndex);
  if (open && openedAt !== startIndex) {
    setOpenedAt(startIndex);
    setIndex(startIndex);
  }

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(images.length - 1, next));
    // Плавную прокрутку глушим там же, где и остальную анимацию:
    // для вестибулярной чувствительности она из самых неприятных.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    slideRefs.current[clamped]?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  /**
   * Открытие: блокировка прокрутки, фокус и переход на нужный кадр.
   * Зависимости намеренно НЕ включают текущий индекс — иначе эффект
   * перезапускался бы на каждое перелистывание и возвращал ленту к
   * стартовому кадру, отменяя нажатие стрелки.
   */
  useEffect(() => {
    if (!open) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    style.overflow = "hidden";

    slideRefs.current[startIndex]?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "start",
    });
    panelRef.current?.focus();

    return () => {
      style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, startIndex]);

  /** Клавиатура: Escape, стрелки и ловушка фокуса */
  useEffect(() => {
    if (!open) return;

    const focusable = () =>
      panelRef.current
        ? [
            ...panelRef.current.querySelectorAll<HTMLElement>(
              "button:not([disabled])",
            ),
          ]
        : [];

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // goTo стабилен по смыслу: он только листает ленту по рефам
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, onClose]);

  /**
   * Активный кадр выводится из позиции прокрутки ленты.
   *
   * Наблюдатель пересечений тут был бы изящнее, но он не доставляет события,
   * пока вкладка не на виду, и счётчик молча застревал бы. Позиция прокрутки
   * — данные, которые есть всегда.
   */
  useEffect(() => {
    const strip = stripRef.current;
    if (!open || !strip || images.length < 2) return;

    const sync = () => {
      const width = strip.clientWidth;
      if (!width) return;
      const next = Math.round(strip.scrollLeft / width);
      setIndex((current) => (current === next ? current : next));
    };

    strip.addEventListener("scroll", sync, { passive: true });
    sync();
    return () => strip.removeEventListener("scroll", sync);
  }, [open, images.length]);

  if (!open) return null;

  const many = images.length > 1;

  return createPortal(
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — просмотр фотографий`}
      data-surface="night"
      className="motion-fade fixed inset-0 z-50 flex flex-col bg-page outline-none"
    >
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-[var(--gutter)]">
        <p
          className="t-label tabular-nums text-ink-secondary"
          aria-live="polite"
        >
          {many ? `${pad(index + 1)} / ${pad(images.length)}` : title}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть просмотр"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-[1rem] text-ink-secondary hover:text-ink"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={stripRef}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, position) => (
            <div
              key={image.url}
              ref={(node) => {
                slideRefs.current[position] = node;
              }}
              className="relative h-full w-full shrink-0 snap-start"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="100vw"
                placeholder={image.blurDataURL ? "blur" : "empty"}
                blurDataURL={image.blurDataURL}
                className="object-contain"
                priority={position === startIndex}
              />
            </div>
          ))}
        </div>

        {many ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Предыдущий кадр"
              className={cn(
                "absolute left-[var(--gutter)] top-1/2 hidden h-12 w-12 -translate-y-1/2",
                "items-center justify-center rounded-xs bg-page/80 text-ink",
                "transition-opacity duration-[var(--dur-fast)] disabled:opacity-30 lg:flex",
              )}
            >
              <ArrowIcon className="h-[1.1em] w-[1.1em] rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === images.length - 1}
              aria-label="Следующий кадр"
              className={cn(
                "absolute right-[var(--gutter)] top-1/2 hidden h-12 w-12 -translate-y-1/2",
                "items-center justify-center rounded-xs bg-page/80 text-ink",
                "transition-opacity duration-[var(--dur-fast)] disabled:opacity-30 lg:flex",
              )}
            >
              <ArrowIcon className="h-[1.1em] w-[1.1em]" />
            </button>
          </>
        ) : null}
      </div>

      {many ? (
        <div className="flex shrink-0 items-center justify-center gap-3 px-[var(--gutter)] py-6">
          {images.map((image, position) => (
            <button
              key={image.url}
              type="button"
              onClick={() => goTo(position)}
              aria-label={`Кадр ${position + 1}`}
              aria-current={position === index ? "true" : undefined}
              className={cn(
                "relative h-16 w-12 overflow-hidden rounded-xs border transition-colors",
                "duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
                position === index
                  ? "border-accent"
                  : "border-hairline opacity-60",
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
