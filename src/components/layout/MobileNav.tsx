"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Logo } from "@/components/brand/Logo";
import { OrnamentBand } from "@/components/ornament/Ornament";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { primaryNav, utilityNav } from "@/lib/config/site";

/**
 * Мобильная навигация. Панель на всю высоту в ночной поверхности —
 * тот же приём чередования, что и в секциях страницы.
 *
 * Панель рендерится порталом в <body> намеренно: у шапки есть backdrop-filter,
 * а он создаёт containing block для position: fixed, из-за чего inset-0 внутри
 * шапки схлопывается до её собственной высоты. Портал — единственный способ
 * оставить и размытие шапки, и полноэкранное меню.
 */
export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const { style } = document.body;
    const previous = style.overflow;
    style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const panel = (
    <div
      data-surface="night"
      role="dialog"
      aria-modal="true"
      aria-label="Навигация"
      className="fixed inset-0 z-50 flex flex-col lg:hidden"
    >
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-[var(--gutter)]">
        <Logo variant="wordmark" className="text-[0.9rem]" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Закрыть меню"
          className="tap-icon -mr-2 inline-flex h-11 w-11 items-center justify-center text-[1rem]"
        >
          <CloseIcon />
        </button>
      </div>

      <OrnamentBand motif="dandona" height={10} className="shrink-0" />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-[var(--gutter)] pb-12 pt-10">
        {primaryNav.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="t-h2 flex min-h-11 items-center py-2"
          >
            {link.label}
          </Link>
        ))}

        <span className="mt-auto flex flex-col border-t border-hairline pt-6">
          {utilityNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="tap-row text-ink-secondary"
            >
              <span className="t-label motion-underline">{link.label}</span>
            </Link>
          ))}
        </span>
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть меню"
        aria-expanded={open}
        className={cn(
          "tap-icon inline-flex h-11 w-11 shrink-0 items-center justify-center text-[1rem] lg:hidden",
          className,
        )}
      >
        <MenuIcon />
      </button>

      {/* open становится true только по клику, то есть уже на клиенте —
          проверка на монтирование не нужна */}
      {open ? createPortal(panel, document.body) : null}
    </>
  );
}
