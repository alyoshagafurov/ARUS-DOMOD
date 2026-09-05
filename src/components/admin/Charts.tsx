import type { ReactNode } from "react";

import { StatusChip } from "@/components/admin/form";
import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/lib/orders/types";

/* -------------------------------------------------------------------------
   Диаграммы обзора.

   Данные настоящие: считаются из заказов в базе. Выдуманных чисел в проекте
   не бывает — пустой период показывает нули, а не «примерный» график.

   Одна серия — один цвет. Красить столбец темнее там, где он выше, нельзя:
   это второй раз кодирует длину, которую столбец уже показал, и сжигает
   единственный свободный канал. Цвет проверен на контраст к поверхности
   (≥3:1) в обеих темах: днём глубокая зелень, ночью ступень светлее —
   дневная на ночном дворе не отделяется. Ночная схема выбрана и измерена,
   а не получена переворотом дневной.

   Золото столбцом не бывает: в системе оно нить, цифра и кромка, но
   никогда не заливка.

   Числами диаграмма не засыпается: подпись стоит только у наибольшего
   столбца, остальное несут ось и всплывающая подсказка. Под каждой
   диаграммой лежит таблица — она и есть доступная версия, поэтому сам
   рисунок скрыт от скринридера.
   ------------------------------------------------------------------------- */

export interface Bucket {
  /** Короткая подпись под столбцом — «5.09» */
  label: string;
  /** Полная подпись для подсказки и таблицы — «5 сентября» */
  full: string;
  value: number;
}

function Figure({
  title,
  note,
  children,
  table,
}: {
  title: string;
  note?: string;
  children: ReactNode;
  table: ReactNode;
}) {
  return (
    <figure className="flex h-full flex-col rounded-[var(--radius-card)] border border-hairline p-5">
      <figcaption className="flex items-baseline justify-between gap-4">
        <h3 className="t-label text-ink-secondary">{title}</h3>
        {note ? <span className="t-caption tabular-nums">{note}</span> : null}
      </figcaption>

      <div className="mb-4">{children}</div>

      <details className="mt-auto border-t border-hairline pt-3">
        <summary className="t-caption cursor-pointer select-none hover:text-ink">
          Показать числа
        </summary>
        {table}
      </details>
    </figure>
  );
}

/**
 * Столбцы по дням — те, что растут снизу вверх.
 *
 * Высота считается от максимума периода, а не от общего числа заказов:
 * иначе при пяти заказах все столбцы легли бы в линию у основания.
 * У нулевого дня остаётся видимая засечка — «ноль» и «нет данных» должны
 * отличаться друг от друга.
 */
export function ColumnChart({
  title,
  buckets,
  unit,
}: {
  title: string;
  buckets: Bucket[];
  unit: string;
}) {
  const max = Math.max(1, ...buckets.map((b) => b.value));
  const total = buckets.reduce((sum, b) => sum + b.value, 0);
  const peak = buckets.reduce(
    (a, b) => (b.value > a.value ? b : a),
    buckets[0],
  );

  return (
    <Figure
      title={title}
      note={`${total} ${unit}`}
      table={
        <table className="t-caption mt-3 w-full">
          <thead>
            <tr className="text-ink-muted">
              <th className="py-1 text-left font-normal">День</th>
              <th className="py-1 text-right font-normal">Заказов</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((b) => (
              <tr key={b.full} className="border-t border-hairline">
                <td className="py-1">{b.full}</td>
                <td className="py-1 text-right tabular-nums">{b.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      {/* Высота задана вместе с полосой подписей: если отмерить только
          площадь графика, ось не помещается и карточка обзаводится
          собственной прокруткой. */}
      <div aria-hidden="true" className="mt-5">
        <div className="flex h-36 items-end gap-[2px]">
          {buckets.map((b) => (
            <div
              key={b.full}
              className="group relative flex h-full flex-1 items-end justify-center"
            >
              <span
                data-chart-bar=""
                className={cn(
                  "w-full max-w-6 rounded-t-[4px]",
                  "transition-opacity duration-[var(--dur-fast)]",
                  "group-hover:opacity-80",
                )}
                style={{
                  height:
                    b.value === 0
                      ? "2px"
                      : `${Math.max((b.value / max) * 100, 6)}%`,
                  opacity: b.value === 0 ? 0.3 : 1,
                }}
              />

              {/* Подсказка встаёт над столбцом и не толкает соседей */}
              <span
                className={cn(
                  "t-caption pointer-events-none absolute bottom-full left-1/2 z-10 mb-2",
                  "-translate-x-1/2 whitespace-nowrap rounded-sm border border-hairline",
                  "bg-raised px-2 py-1 text-ink opacity-0 shadow-raise",
                  "transition-opacity duration-[var(--dur-fast)] group-hover:opacity-100",
                )}
              >
                {b.full} · {b.value}
              </span>
            </div>
          ))}
        </div>

        {/* Основание — сплошная волосяная линия, не пунктир */}
        <div className="mt-1 h-px bg-hairline" />

        <div className="mt-2 flex gap-[2px]">
          {buckets.map((b, i) => (
            <span
              key={b.full}
              className="t-caption flex-1 text-center text-[0.6875rem] tabular-nums"
            >
              {/* Каждая вторая: четырнадцать дат подряд слипаются в кашу */}
              {i % 2 === 0 ? b.label : " "}
            </span>
          ))}
        </div>

        {/* Единственная прямая подпись — пик периода */}
        {peak && peak.value > 0 ? (
          <p className="t-caption mt-3">
            Максимум: {peak.full} — {peak.value}
          </p>
        ) : null}
      </div>
    </Figure>
  );
}

/**
 * Разбивка по статусам — горизонтальные полосы.
 *
 * Полосы одного цвета намеренно: статусы не порядковая шкала, и разные
 * тона выдали бы длину за категорию. Цвет статуса несёт плашка рядом, где
 * он всегда стоит вместе с подписью: цветом одним статус не сообщается.
 */
export function StatusChart({
  title,
  rows,
}: {
  title: string;
  rows: { status: OrderStatus; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <Figure
      title={title}
      note={`${total} всего`}
      table={
        <table className="t-caption mt-3 w-full">
          <tbody>
            {rows.map((r) => (
              <tr key={r.status} className="border-t border-hairline">
                <td className="py-1">
                  <StatusChip status={r.status} />
                </td>
                <td className="py-1 text-right tabular-nums">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ul className="mt-5 flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.status} className="flex items-center gap-3">
            <span className="w-[13.5rem] shrink-0">
              <StatusChip status={r.status} />
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span
                aria-hidden="true"
                data-chart-bar=""
                className="h-2.5 min-w-[2px] rounded-r-[4px]"
                style={{
                  width: `${(r.value / max) * 100}%`,
                  opacity: r.value === 0 ? 0.3 : 1,
                }}
              />
              <span className="t-caption shrink-0 tabular-nums">{r.value}</span>
            </span>
          </li>
        ))}
      </ul>
    </Figure>
  );
}
