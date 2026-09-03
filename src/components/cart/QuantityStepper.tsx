"use client";

import { cn } from "@/lib/cn";
import { useDictionary } from "@/lib/i18n/client";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  label: string;
}

/**
 * Количество. Кнопки 44×44 — это минимальная цель для пальца, поэтому
 * на телефоне и на десктопе шаг одинаковый.
 */
export function QuantityStepper({
  value,
  onChange,
  label,
}: QuantityStepperProps) {
  const t = useDictionary();
  const button =
    "inline-flex h-11 w-11 items-center justify-center text-ink-secondary transition-colors duration-[var(--dur-fast)] hover:text-ink disabled:opacity-35 disabled:hover:text-ink-secondary";

  return (
    <div className="inline-flex items-center border border-hairline">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={t.misc.decrease(label)}
        className={button}
      >
        <span aria-hidden="true">−</span>
      </button>
      <span
        aria-live="polite"
        className={cn("t-price w-8 text-center tabular-nums")}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={t.misc.increase(label)}
        className={button}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
