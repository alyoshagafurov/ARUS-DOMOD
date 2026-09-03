"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useDictionary } from "@/lib/i18n/client";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Панель поверх страницы: лист снизу на телефоне, плавающая карточка справа
 * на широком экране — с отступом от края и собственной тенью, а не полоса
 * от верха до низа.
 *
 * Рендерится порталом в <body>: у шапки есть backdrop-filter, и внутри неё
 * inset-0 схлопнулся бы до её высоты. Ловушка фокуса, Escape, блокировка
 * прокрутки и возврат фокуса — обязательны.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const t = useDictionary();

  useEffect(() => {
    if (!open) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    style.overflow = "hidden";

    const panel = panelRef.current;
    const focusable = () =>
      panel
        ? [
            ...panel.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ].filter((el) => !el.hasAttribute("disabled"))
        : [];

    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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
    return () => {
      style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t.common.close}
        onClick={onClose}
        className="motion-fade absolute inset-0 h-full w-full cursor-default bg-[rgba(3,33,31,0.42)] backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-surface="day"
        className={cn(
          "motion-drawer absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col",
          "rounded-t-[var(--radius-block)] bg-page shadow-overlay",
          "lg:inset-x-auto lg:inset-y-4 lg:right-4 lg:max-h-none lg:w-[27rem]",
          "lg:rounded-[var(--radius-block)]",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6">
          <h2 className="t-label">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="tap-icon -mr-2 inline-flex h-11 w-11 items-center justify-center text-[1rem] text-ink-secondary hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>
        <span aria-hidden="true" className="hoshiya-line mx-6 w-auto" />

        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-hairline px-6 py-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
