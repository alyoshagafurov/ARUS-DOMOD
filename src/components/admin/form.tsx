import type { ReactNode } from "react";

import { ORDER_STATUS_LABELS } from "@/lib/orders/labels";
import type { OrderStatus } from "@/lib/orders/types";

/**
 * Примитивы форм админки. Нативные элементы, минимум стилей: рабочее место
 * должно быть предсказуемым, а не выразительным. Все они серверные —
 * состояние держит браузер.
 */
export const input =
  "mt-2 h-11 w-full rounded-md border border-strong bg-white px-3 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:border-accent focus:shadow-raise";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className ? `block ${className}` : "block"}>
      <span className="t-body-sm">{label}</span>
      {children}
      {hint ? <span className="t-caption mt-1.5 block">{hint}</span> : null}
    </label>
  );
}

export function Text({
  name,
  defaultValue,
  required,
  placeholder,
  type = "text",
  step,
  min,
}: {
  name: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "number" | "date";
  step?: string;
  min?: string | number;
}) {
  return (
    <input
      name={name}
      type={type}
      defaultValue={defaultValue}
      required={required}
      placeholder={placeholder}
      step={step}
      min={min}
      inputMode={type === "number" ? "decimal" : undefined}
      className={input}
    />
  );
}

export function Select({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select name={name} defaultValue={defaultValue} className={`${input} pr-8`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TextArea({
  name,
  defaultValue,
  rows = 4,
}: {
  name: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <textarea
      name={name}
      defaultValue={defaultValue}
      rows={rows}
      className="mt-2 w-full resize-y rounded-md border border-strong bg-white p-3 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:border-accent focus:shadow-raise"
    />
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-hairline pt-6">
      <h2 className="t-label text-ink-muted">{title}</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   Статус заказа и пустые состояния — то, ради чего в админку заходят.
   ------------------------------------------------------------------------- */

/**
 * Статус заказа плашкой, а не строкой текста.
 *
 * В списке из сорока заказов статус — единственное, что сканируют глазами,
 * и девять одинаковых серых слов различаются только чтением. Цвет здесь
 * не украшение, а рабочая группировка: требует внимания / в работе /
 * деньги получены / закрыт / отменён. Точка дублирует цвет формой —
 * при дальтонизме и на солнце цвета одного мало.
 */
const statusTone: Record<OrderStatus, string> = {
  new: "border-gold text-gold-ink",
  confirming: "border-strong text-ink-secondary",
  confirmed: "border-strong text-ink-secondary",
  // Красный здесь по делу: пока деньги не пришли, заказ не двигается.
  // --state-warning (#c08a2c) для текста не годится — 3.0:1 на белом.
  awaiting_payment: "border-danger text-danger",
  paid: "border-success text-success",
  in_delivery: "border-success text-success",
  delivered: "border-success text-success",
  completed: "border-hairline text-ink-muted",
  cancelled: "border-hairline text-ink-muted line-through",
};

const statusDot: Record<OrderStatus, string> = {
  new: "bg-gold",
  confirming: "bg-ink-muted",
  confirmed: "bg-ink-muted",
  awaiting_payment: "bg-danger",
  paid: "bg-success",
  in_delivery: "bg-success",
  delivered: "bg-success",
  completed: "bg-ink-muted",
  cancelled: "bg-ink-muted",
};

export function StatusChip({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`t-label inline-flex items-center gap-2 whitespace-nowrap rounded-pill border px-3 py-1.5 ${statusTone[status]}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-pill ${statusDot[status]}`}
      />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Пустое состояние, которое учит интерфейсу.
 *
 * «Заказов нет» — это отчёт, а не помощь: владелец и так видит, что список
 * пуст. Экран без данных обязан сказать, откуда данные берутся и что можно
 * сделать прямо сейчас; для магазина, который только запустили, это первое,
 * что он вообще увидит в панели.
 */
export function Empty({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-strong px-6 py-14 text-center">
      <p className="t-h3">{title}</p>
      <p className="t-body-sm mx-auto mt-3 max-w-[42ch] text-ink-secondary">
        {hint}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
