import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
type ButtonSize = "sm" | "md" | "lg";

/**
 * Кнопки ARUS DOMOD прямоугольные (радиус 2px). Скруглённые «капсулы»
 * используются только для фильтров-чипов — см. <Tag shape="pill">.
 *
 * `inverse` — светлая кнопка на чёрной секции: главный CTA в hero.
 */
const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-contrast border border-transparent hover:bg-accent-hover",
  secondary:
    "bg-transparent text-ink border border-strong hover:border-accent hover:text-ink-accent",
  ghost:
    "bg-transparent text-ink border border-transparent hover:text-ink-accent",
  inverse:
    "bg-invert text-ink-invert border border-transparent hover:opacity-90",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 text-[0.6875rem]",
  md: "h-12 text-[0.75rem]",
  lg: "h-14 text-[0.8125rem]",
};

/**
 * Поля вынесены из размера отдельно: у ghost их нет, а два конфликтующих
 * px-* одного веса разрешаются порядком в сгенерированном CSS, а не порядком
 * в атрибуте class — «px-0 после px-7» ничего не гарантирует.
 */
const paddingClass: Record<ButtonSize, string> = {
  sm: "px-4",
  md: "px-7",
  lg: "px-9",
};

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  /** Если задан — рендерится next/link вместо <button> */
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  href,
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const classes = cn(
    "t-label inline-flex items-center justify-center gap-2 rounded-xs",
    "transition-[background-color,color,border-color,opacity]",
    "duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
    "disabled:pointer-events-none disabled:opacity-45",
    variantClass[variant],
    sizeClass[size],
    variant === "ghost" ? "px-0" : paddingClass[size],
    fullWidth && "w-full",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
    </button>
  );
}
