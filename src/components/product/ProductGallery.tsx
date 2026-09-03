"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDictionary } from "@/lib/i18n/client";

import { ProductViewer } from "@/components/product/ProductViewer";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/types/catalog";

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Кадры изделия.
 *
 * Раскладка одна на все экраны, меняется только направление: на телефоне это
 * горизонтальная лента со snap-прокруткой, на широком экране — стопка, где
 * второй кадр уходит вправо более узкой колонкой, как врезка на развороте.
 *
 * Раньше здесь было два блока — один для телефона, второй для десктопа, — и
 * браузер держал в памяти по два <img> на каждый кадр, декодируя скрытый
 * заодно с видимым. `display: none` от декодирования не спасает, поэтому
 * дубликат убран совсем: контейнер один, переключаются flex-direction и
 * ширины дочерних элементов.
 */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const t = useDictionary();
  const stripRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);

  const closeViewer = useCallback(() => setViewer(null), []);

  /** Счётчик ленты выводится из позиции прокрутки — работает и без наблюдателей */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || images.length < 2) return;

    const sync = () => {
      // На широком экране лента становится стопкой и не прокручивается
      if (strip.scrollWidth <= strip.clientWidth) return;
      const slide = slideRefs.current[0];
      const step = slide ? slide.offsetWidth + 12 : strip.clientWidth;
      if (!step) return;
      const next = Math.min(
        images.length - 1,
        Math.round(strip.scrollLeft / step),
      );
      setIndex((current) => (current === next ? current : next));
    };

    strip.addEventListener("scroll", sync, { passive: true });
    sync();
    return () => strip.removeEventListener("scroll", sync);
  }, [images.length]);

  return (
    <>
      <div
        ref={stripRef}
        className={cn(
          "-mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)]",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "lg:mx-0 lg:snap-none lg:flex-col lg:gap-[var(--gutter)] lg:overflow-x-visible lg:px-0",
        )}
      >
        {images.map((image, position) => (
          <div
            key={image.url}
            ref={(node) => {
              slideRefs.current[position] = node;
            }}
            className={cn(
              "w-[88%] shrink-0 snap-start xs:w-[78%] lg:shrink",
              position === 0 ? "lg:w-full" : "lg:-mt-16 lg:w-[72%] lg:self-end",
            )}
          >
            <button
              type="button"
              onClick={() => setViewer(position)}
              aria-label={t.product.openFrame(position + 1)}
              className="group lift block w-full cursor-zoom-in rounded-[var(--radius-card)] text-left"
            >
              <Media
                image={image}
                ratio="editorial"
                radius="card"
                priority={position === 0}
                sizes="(min-width: 1024px) 52vw, 88vw"
                className="shadow-card"
              />
            </button>

            {position > 0 ? (
              <p className="t-label mt-4 hidden items-center gap-3 text-ink-muted lg:flex">
                <span className="t-num text-[1.25rem] text-gold-ink">
                  {pad(position + 1)}
                </span>
                {t.product.detail}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <p
          className="t-label mt-4 tabular-nums text-ink-muted lg:hidden"
          aria-live="polite"
        >
          {pad(index + 1)} / {pad(images.length)}
        </p>
      ) : null}

      <ProductViewer
        images={images}
        startIndex={viewer ?? 0}
        open={viewer !== null}
        onClose={closeViewer}
        title={title}
      />
    </>
  );
}
