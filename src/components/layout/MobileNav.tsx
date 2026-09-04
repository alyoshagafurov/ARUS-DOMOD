"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { OrnamentField } from "@/components/ornament/Ornament";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { contact, primaryNav, utilityNav } from "@/lib/config/site";
import { useDictionary } from "@/lib/i18n/client";
import { navLabel } from "@/lib/i18n/labels";


/**
 * Мобильная навигация — глубокая ниша на весь экран.
 *
 * Пункты набраны антиквой во всю ширину с золотыми номерами: меню на
 * телефоне — не список, а оглавление дома. Внизу — язык и телефон.
 *
 * Панель рендерится порталом в <body>: у шапки есть backdrop-filter, а он
 * создаёт containing block для position: fixed. Фокус уходит в панель и
 * возвращается на кнопку меню при закрытии.
 */
export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const t = useDictionary();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const { style } = document.body;
    const previous = style.overflow;
    style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  const panel = (
    <div
      ref={panelRef}
      data-surface="night"
      role="dialog"
      aria-modal="true"
      aria-label={t.misc.navigation}
      className="motion-fade fixed inset-0 z-50 flex flex-col overflow-hidden lg:hidden"
    >
      <OrnamentField
        motif="damask"
        strength="strong"
        className="ornament--fade"
        style={{ "--fade-x": "100%", "--fade-y": "100%" } as never}
      />

      <div className="relative flex h-[var(--header-h)] shrink-0 items-center justify-between px-[var(--gutter)]">
        <Logo variant="wordmark" className="text-[0.9rem]" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t.nav.closeMenu}
          className="tap-icon -mr-2 inline-flex h-11 w-11 items-center justify-center text-[1rem]"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="relative flex flex-1 flex-col overflow-y-auto px-[var(--gutter)] pb-8 pt-6">
        <ul className="flex flex-col">
          {primaryNav.map((link) => (
            <li key={link.href} className="border-b border-hairline">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex min-h-16 items-baseline gap-4 py-3"
              >
                <span className="t-display-2 text-[clamp(2rem,9vw,3rem)]">
                  {navLabel(link, t)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          {utilityNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="tap-row text-ink-secondary hover:text-ink"
            >
              <span className="t-label motion-underline">
                {navLabel(link, t)}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-10">
          <LanguageSwitcher className="-ml-2" />
          <a
            href={`tel:${contact.phone}`}
            className="tap-row text-ink hover:text-ink-accent"
          >
            <span className="t-h3 motion-underline">
              {contact.phoneDisplay}
            </span>
          </a>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.nav.openMenu}
        aria-expanded={open}
        className={cn(
          "tap-icon inline-flex h-11 w-11 shrink-0 items-center justify-center text-[1rem] lg:hidden",
          className,
        )}
      >
        <MenuIcon />
      </button>

      {open ? createPortal(panel, document.body) : null}
    </>
  );
}
