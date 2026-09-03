import type { ReactNode } from "react";

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
