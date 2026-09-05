"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------
   Клиентские примитивы админки.

   Всё здесь существует ради одного: владелец должен видеть, что система
   услышала нажатие. Серверное действие уходит на диск и возвращается через
   revalidate — без индикатора это «я нажал, ничего не произошло, нажму ещё
   раз», а второе нажатие создаёт вторую запись.

   Витринная <Button> сюда не годится: она умеет вести себя, но не умеет
   ждать, а рабочее место без состояния ожидания неполно.
   ------------------------------------------------------------------------- */

const base =
  "t-label inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 " +
  "transition-[background-color,color,border-color,opacity] duration-[var(--dur-fast)] " +
  "ease-[var(--ease-quiet)] disabled:cursor-progress disabled:opacity-60";

const tones = {
  primary: "bg-accent text-accent-contrast hover:bg-accent-hover",
  secondary: "border border-strong text-ink hover:border-accent",
  danger: "border border-hairline text-danger hover:border-danger",
} as const;

/**
 * Кнопка отправки формы. Пока действие идёт, она сообщает об этом словом,
 * а не крутящимся кружком: в форме на десяток полей спиннер посреди кнопки
 * читается как «сломалось», а «Сохраняю…» — как «идёт работа».
 */
export function SubmitButton({
  children,
  pendingLabel,
  tone = "primary",
  fullWidth,
  className,
}: {
  children: ReactNode;
  pendingLabel: string;
  tone?: keyof typeof tones;
  fullWidth?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(base, tones[tone], fullWidth && "w-full", className)}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * Удаление. Спрашивает подтверждение и называет, что именно исчезнет:
 * «Удалить?» без имени объекта — это ловушка, а не вопрос.
 *
 * Подтверждение нативное: ради одного разрушительного шага собственное
 * модальное окно не окупается, а нативное работает раньше гидратации.
 */
export function DeleteButton({
  label,
  confirmText,
  pendingLabel = "Удаляю…",
}: {
  label: string;
  confirmText: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
      className={cn(base, tones.danger)}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * Навигация админки с активным разделом.
 *
 * Без неё владелец не видит, где находится: четыре одинаковые ссылки в
 * колонке — самая частая потеря ориентации в панелях. Активный пункт
 * отмечен подложкой, золотой нитью слева и `aria-current`: одного цвета
 * не хватает ни скринридеру, ни экрану на ярком свету.
 */
export function AdminNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <ul className="flex gap-1 lg:flex-col">
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-11 items-center rounded-md px-3",
                "transition-[background-color,color] duration-[var(--dur-fast)]",
                // Фон брался из белого гвоздём, а текст — из токена: ночью
                // кремовая надпись ложилась на белую плашку и исчезала.
                // accent-quiet — единственный тон, который читается на обеих
                // темах: зелёная дымка днём, светлая ночью.
                active
                  ? "bg-accent-quiet text-ink shadow-raise"
                  : "text-ink-secondary hover:bg-accent-quiet hover:text-ink",
              )}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-2 left-0 w-[2px] rounded-pill bg-gold"
                />
              ) : null}
              <span className="t-label">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
