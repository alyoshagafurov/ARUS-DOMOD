"use client";

import { useId, useState, type KeyboardEvent } from "react";

import { ImageList } from "@/components/admin/ImageField";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { colorKey, type ColorOption } from "@/lib/catalog/variants";
import type { ProductImage } from "@/types/catalog";

export interface SelectedColor extends ColorOption {
  images: ProductImage[];
}

const MAX_NAME = 32;
const PHOTOS_PER_COLOR = 6;

/** Кружок-образец. Цвет без образца рисуется пунктиром, а не серым:
 *  серый кружок врал бы, что изделие серое. */
function Swatch({ hex, className }: { hex?: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block shrink-0 rounded-pill",
        hex ? "border border-strong" : "border border-dashed border-strong",
        className,
      )}
      style={hex ? { backgroundColor: hex } : undefined}
    />
  );
}

/**
 * Цвета образа и фото каждого цвета.
 *
 * Цвет выбирается нажатием на образец. Нужного нет — вписывается имя,
 * по желанию оттенок, и галочка. У каждого выбранного цвета своя лента
 * фото: на сайте, когда покупатель выберет цвет, галерея покажет сначала
 * его снимки. Своих фото нет — остаются общие кадры образа.
 *
 * Оттенок своего цвета необязателен и пишется, только если его тронули:
 * у `<input type="color">` всегда есть значение, и без этой проверки
 * каждый вписанный цвет получил бы чёрный кружок.
 */
export function ColorPicker({
  name,
  initial,
  options,
  alt,
}: {
  name: string;
  initial: SelectedColor[];
  options: ColorOption[];
  alt: string;
}) {
  const nameId = useId();
  const hexId = useId();
  const [colors, setColors] = useState<SelectedColor[]>(initial);
  const [palette, setPalette] = useState<ColorOption[]>(() => {
    const seen = new Set<string>();
    return [...options, ...initial].filter((option) => {
      const key = colorKey(option.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });
  const [draft, setDraft] = useState("");
  const [hex, setHex] = useState<string | null>(null);

  const isSelected = (option: ColorOption) =>
    colors.some((c) => colorKey(c.name) === colorKey(option.name));

  const select = (option: ColorOption) =>
    setColors((prev) => [...prev, { ...option, images: [] }]);

  const remove = (option: ColorOption) => {
    const current = colors.find(
      (c) => colorKey(c.name) === colorKey(option.name),
    );
    if (
      current?.images.length &&
      !window.confirm(
        `Убрать цвет «${current.name}» вместе с его фото (${current.images.length})?`,
      )
    ) {
      return;
    }
    setColors((prev) =>
      prev.filter((c) => colorKey(c.name) !== colorKey(option.name)),
    );
  };

  const add = () => {
    const typed = draft.trim().replace(/\s+/g, " ").slice(0, MAX_NAME);
    if (!typed) return;
    // «красный» из поля — это «Красный» из палитры, а не второй цвет
    const known = palette.find((p) => colorKey(p.name) === colorKey(typed));
    const option: ColorOption = known ?? {
      name: typed.charAt(0).toLocaleUpperCase("ru") + typed.slice(1),
      ...(hex ? { hex } : null),
    };
    if (!known) setPalette((prev) => [...prev, option]);
    if (!isSelected(option)) select(option);
    setDraft("");
    setHex(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    add();
  };

  const setImages = (colorName: string, images: ProductImage[]) =>
    setColors((prev) =>
      prev.map((c) => (c.name === colorName ? { ...c, images } : c)),
    );

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(colors)} />

      <ul className="flex flex-wrap gap-2">
        {palette.map((option) => {
          const active = isSelected(option);
          return (
            <li key={option.name}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => (active ? remove(option) : select(option))}
                className={cn(
                  "t-body-sm inline-flex h-11 items-center gap-2 rounded-pill border pl-2.5 pr-4",
                  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
                  active
                    ? "border-accent bg-accent-quiet text-ink shadow-raise"
                    : "border-hairline text-ink-secondary hover:border-strong hover:text-ink",
                )}
              >
                <Swatch hex={option.hex} className="h-6 w-6" />
                {option.name}
                {active ? <CheckIcon className="h-4 w-4 text-ink-accent" /> : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex max-w-[26rem] items-center gap-2">
        <label htmlFor={nameId} className="sr-only">
          Свой цвет
        </label>
        <input
          id={nameId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          enterKeyHint="done"
          autoComplete="off"
          maxLength={MAX_NAME}
          placeholder="Свой цвет: персиковый"
          className="h-11 min-w-0 flex-1 rounded-md border border-strong bg-raised px-3 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:border-accent focus:shadow-raise"
        />
        <label
          htmlFor={hexId}
          title="Оттенок, необязательно"
          className="relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-strong hover:border-accent"
        >
          <span className="sr-only">Оттенок, необязательно</span>
          <Swatch hex={hex ?? undefined} className="h-6 w-6" />
          <input
            id={hexId}
            type="color"
            value={hex ?? "#c9a04e"}
            onChange={(event) => setHex(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          aria-label="Добавить цвет"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-contrast transition-opacity duration-[var(--dur-fast)] hover:bg-accent-hover disabled:opacity-40"
        >
          <CheckIcon />
        </button>
      </div>

      {colors.length === 0 ? (
        <p className="t-caption mt-2">
          Цвета не выбраны — на сайте выбора цвета не будет.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col border-t border-hairline">
          {colors.map((color) => (
            <li
              key={color.name}
              className="flex flex-col gap-4 border-b border-hairline py-5"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-3">
                  <Swatch hex={color.hex} className="h-7 w-7" />
                  <span className="t-body">{color.name}</span>
                  <span className="t-caption">
                    {color.images.length
                      ? `${color.images.length} фото`
                      : "без своих фото"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(color)}
                  className="tap-row t-label text-ink-muted hover:text-danger"
                >
                  Убрать
                </button>
              </div>
              <ImageList
                images={color.images}
                onChange={(next) => setImages(color.name, next)}
                alt={`${alt} — ${color.name}`}
                color={color.name}
                max={PHOTOS_PER_COLOR}
                uploadLabel="Фото этого цвета"
                emptyLabel="Своих фото нет — на сайте покажутся общие кадры."
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
