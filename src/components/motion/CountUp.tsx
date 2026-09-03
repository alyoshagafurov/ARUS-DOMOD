"use client";

import { useEffect, useRef } from "react";

interface CountUpProps {
  value: number;
  /** Длительность в мс; медленно и без отскока */
  duration?: number;
  className?: string;
}

/**
 * Число, которое досчитывается до значения, когда попадает в экран.
 *
 * Только для настоящих чисел (образов в базе, разделов, дней проката) —
 * витрина не выдумывает цифр, поэтому и анимировать здесь можно лишь то,
 * что есть в данных. Разметка с сервера сразу содержит итог: без JS и при
 * prefers-reduced-motion число просто стоит. Анимация пишет в DOM
 * напрямую — состояние React для одноразового эффекта не нужно.
 */
export function CountUp({ value, duration = 1400, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    node.textContent = "0";

    const run = () => {
      const start = performance.now();
      const ease = (x: number) => 1 - Math.pow(1 - x, 3);
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        node.textContent = String(Math.round(ease(progress) * value));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      node.textContent = String(value);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
