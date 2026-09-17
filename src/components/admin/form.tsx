import type { ReactNode } from "react";

/**
 * Примитивы форм админки. Нативные элементы, минимум стилей: рабочее место
 * должно быть предсказуемым, а не выразительным. Все они серверные —
 * состояние держит браузер.
 */
export const input =
  "mt-2 h-11 w-full rounded-md border border-strong bg-raised px-3 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:border-accent focus:shadow-raise";

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
      className="mt-2 w-full resize-y rounded-md border border-strong bg-raised p-3 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:border-accent focus:shadow-raise"
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

/**
 * Поле из нескольких кнопок: размеры, цвета. Не <label> — метка вокруг
 * ряда кнопок перенаправляла бы нажатие на подпись в первую кнопку.
 * `min-w-0` снимает у fieldset ширину по содержимому, иначе длинный ряд
 * выдавливает сетку формы за край экрана.
 */
export function Group({
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
    <fieldset className={className ? `min-w-0 ${className}` : "min-w-0"}>
      <legend className="t-body-sm">{label}</legend>
      {hint ? <p className="t-caption mt-1">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

/* -------------------------------------------------------------------------
   Отметка свежего заказа и пустые состояния.
   ------------------------------------------------------------------------- */

/** Сколько заказ считается новым */
export const FRESH_MS = 24 * 60 * 60 * 1000;

/**
 * Отметка «Новый» у заказа младше суток.
 *
 * Статусов вручную в админке нет: владельцу некогда переключать их у
 * каждой заявки. Свежесть выводится из времени — ничего нажимать не надо,
 * а отметка гаснет сама. Точка дублирует золото формой: на солнце цвета
 * одного мало.
 */
export function FreshMark({ createdAt, now }: { createdAt: string; now: number }) {
  if (now - new Date(createdAt).getTime() > FRESH_MS) return null;
  return (
    <span className="t-label inline-flex items-center gap-2 whitespace-nowrap rounded-pill border border-gold px-3 py-1.5 text-gold-ink">
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-pill bg-gold" />
      Новый
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
