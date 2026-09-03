import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
type ButtonSize = "sm" | "md" | "lg";

/**
 * Кнопки «САҲН»: компактный радиус 14px (не капсула), подъём на 2px при
 * наведении и тень, которая отвечает на него. Цвет — из поверхности:
 * на белом дворе кнопка зелёная, внутри айвона — кремовая с тёмным текстом.
 * Золото кнопкой не бывает нигде.
 */
const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-contrast border border-transparent shadow-raise hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-card",
  secondary:
    "bg-transparent text-ink border border-strong hover:border-accent hover:bg-accent-quiet hover:-translate-y-0.5",
  ghost:
    "bg-transparent text-ink border border-transparent hover:text-ink-accent",
  inverse:
    "bg-invert text-ink-invert border border-transparent shadow-raise hover:-translate-y-0.5 hover:shadow-card",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-10 text-[0.625rem]",
  md: "h-12 text-[0.6875rem]",
  lg: "h-14 text-[0.75rem]",
};

/* Поля отдельно от размера: у ghost их нет, а два px-* одного веса
   разрешаются порядком в CSS, а не в атрибуте class. */
const paddingClass: Record<ButtonSize, string> = {
  sm: "px-4",
  md: "px-6",
  lg: "px-8",
};

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Стрелка справа, уходящая вперёд при наведении */
  arrow?: boolean;
  className?: string;
  href?: string;
  /** Внешний адрес (WhatsApp, соцсети): обычная <a> в новой вкладке */
  external?: boolean;
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
  arrow = false,
  className,
  href,
  external = false,
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const classes = cn(
    "group t-label inline-flex items-center justify-center gap-2.5 rounded-md",
    "transition-[background-color,color,border-color,opacity,transform,box-shadow]",
    "duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
    "disabled:pointer-events-none disabled:opacity-45",
    variantClass[variant],
    sizeClass[size],
    variant === "ghost" ? "px-0" : paddingClass[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <>
      {children}
      {arrow ? (
        <ArrowIcon className="motion-arrow h-[1.1em] w-[1.1em] shrink-0" />
      ) : null}
    </>
  );

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  // onClick и у ссылки: панели закрываются по переходу
  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
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
      {content}
    </button>
  );
}
