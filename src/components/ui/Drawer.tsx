"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Панель поверх страницы: снизу на телефоне, справа на широком экране.
 *
 * Рендерится порталом в <body>: у шапки есть backdrop-filter, а он создаёт
 * containing block для position: fixed — внутри шапки inset-0 схлопнулся бы
 * до её высоты.
 *
 * Ловушка фокуса, Escape и блокировка прокрутки обязательны: без них панель
 * недоступна с клавиатуры, а фон уезжает под пальцем на телефоне.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

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
        aria-label="Закрыть панель"
        onClick={onClose}
        className="motion-fade absolute inset-0 h-full w-full cursor-default bg-[rgba(16,13,11,0.5)]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "motion-drawer absolute inset-x-0 bottom-0 flex max-h-[86svh] flex-col bg-page",
          "lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[26rem]",
        )}
      >
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-hairline px-6">
          <h2 className="t-label">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-[1rem] text-ink-secondary hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">{children}</div>

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
