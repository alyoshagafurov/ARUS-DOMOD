"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  /** Задержка каскада в мс — для последовательного появления карточек */
  delay?: number;
  /** Доля элемента в вьюпорте, после которой запускается появление */
  threshold?: number;
  as?: "div" | "section" | "li" | "article";
  className?: string;
}

/**
 * Единственный примитив появления при скролле в проекте.
 *
 * Правила движения ARUS DOMOD: одно направление (снизу вверх), без пружин и
 * отскоков, длительность --dur-slow. `prefers-reduced-motion` отключает
 * анимацию в base.css, дублировать проверку здесь не нужно.
 *
 * Состояние живёт в data-атрибуте, а не в useState: показ элемента —
 * одноразовый эффект над DOM, перерисовка React для этого не нужна.
 */
export function Reveal({
  children,
  delay = 0,
  threshold = 0.15,
  as: Tag = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reveal = () => node.setAttribute("data-revealed", "true");

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref as never}
      data-revealed="false"
      className={cn("motion-reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
