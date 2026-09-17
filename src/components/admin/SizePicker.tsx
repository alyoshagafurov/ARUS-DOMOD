"use client";

import { useId, useState, type KeyboardEvent } from "react";

import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { compareSizes } from "@/lib/catalog/variants";

/** Больше никто не вписывает: «46» — да, абзац текста — нет */
const MAX_LENGTH = 10;

/**
 * Размеры нажатием.
 *
 * Раньше это была строка «38, 40, 42»: запятую забывали, пробел ставили
 * не там, и «38 40» сохранялся одним размером. Теперь размер — кнопка:
 * нажал — выбран, нажал ещё раз — снят. Нужного нет — вписал число и
 * нажал галочку (или Enter): размер встаёт в ряд уже выбранным. После
 * сохранения он попадает в каталог и появится среди вариантов у
 * следующего товара — отдельного справочника размеров вести не нужно.
 *
 * Enter в поле перехвачен: иначе браузер отправил бы всю форму товара
 * посреди ввода.
 */
export function SizePicker({
  name,
  initial,
  options,
}: {
  name: string;
  initial: string[];
  options: string[];
}) {
  const inputId = useId();
  const [selected, setSelected] = useState<string[]>(initial);
  const [known, setKnown] = useState<string[]>(() =>
    [...new Set([...options, ...initial])].sort(compareSizes),
  );
  const [draft, setDraft] = useState("");

  const toggle = (size: string) =>
    setSelected((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size].sort(compareSizes),
    );

  const add = () => {
    // «46 48» и «46,48» — тоже два размера: человек не обязан знать формат
    const typed = draft
      .split(/[\s,;/]+/)
      .map((s) => s.trim().slice(0, MAX_LENGTH))
      .filter(Boolean);
    if (typed.length === 0) return;
    setKnown((prev) => [...new Set([...prev, ...typed])].sort(compareSizes));
    setSelected((prev) => [...new Set([...prev, ...typed])].sort(compareSizes));
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    add();
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(selected)} />

      <ul className="flex flex-wrap gap-2">
        {known.map((size) => {
          const active = selected.includes(size);
          return (
            <li key={size}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => toggle(size)}
                className={cn(
                  "t-label inline-flex h-11 min-w-[3.25rem] items-center justify-center rounded-pill border px-4 tabular-nums",
                  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
                  active
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-strong text-ink-secondary hover:border-accent hover:text-ink",
                )}
              >
                {size}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex max-w-[18rem] items-center gap-2">
        <label htmlFor={inputId} className="sr-only">
          Свой размер
        </label>
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          inputMode="numeric"
          enterKeyHint="done"
          autoComplete="off"
          placeholder="Свой размер: 46"
          className="h-11 min-w-0 flex-1 rounded-md border border-strong bg-raised px-3 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:border-accent focus:shadow-raise"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          aria-label="Добавить размер"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-contrast transition-opacity duration-[var(--dur-fast)] hover:bg-accent-hover disabled:opacity-40"
        >
          <CheckIcon />
        </button>
      </div>

      <p className="t-caption mt-2">
        {selected.length
          ? `Выбрано: ${selected.join(" · ")}`
          : "Размеры не выбраны — на сайте их выбора не будет."}
      </p>
    </div>
  );
}
