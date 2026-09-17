"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { ProductImage } from "@/types/catalog";

/**
 * Кадры: загрузка, порядок, удаление.
 *
 * `ImageList` — управляемый список: состояние держит тот, кто его вызвал.
 * Так один и тот же загрузчик служит и общим кадрам образа, и кадрам
 * отдельного цвета в `ColorPicker`. `ImageField` — та же лента со своим
 * состоянием и скрытым полем JSON: форма остаётся нативной и уходит
 * server action'ом. Загрузка идёт отдельным запросом в /api/admin/upload,
 * чтобы файл не ждал сохранения всей карточки.
 *
 * Alt берётся от названия товара: подпись к кадру — это описание изделия,
 * а его у нас нет, и придумывать нельзя.
 */
export function ImageList({
  images,
  onChange,
  alt,
  max = 8,
  color,
  uploadLabel = "Загрузить кадр",
  emptyLabel = "Кадров пока нет.",
}: {
  images: ProductImage[];
  onChange: (next: ProductImage[]) => void;
  alt: string;
  max?: number;
  /** Кадры цвета помечаются его именем */
  color?: string;
  uploadLabel?: string;
  emptyLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    // Список копится локально: onChange с устаревшим `images` на каждом
    // файле терял бы все загрузки, кроме последней.
    let next = images;
    try {
      for (const file of Array.from(files).slice(0, max - images.length)) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body,
        });
        const data = (await response.json()) as {
          url?: string;
          width?: number;
          height?: number;
          error?: string;
        };
        if (!response.ok || !data.url) {
          setError(data.error ?? "Не удалось загрузить");
          break;
        }
        next = [
          ...next,
          {
            url: data.url,
            width: data.width!,
            height: data.height!,
            alt,
            ...(color ? { color } : null),
          },
        ];
        onChange(next);
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      {images.length ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <li
              key={img.url}
              className="relative overflow-hidden rounded-md border border-hairline"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="flex justify-between p-1">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label="Раньше"
                  className="tap-icon h-9 w-9 disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, k) => k !== i))}
                  aria-label="Удалить кадр"
                  className="tap-icon h-9 w-9 text-danger"
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === images.length - 1}
                  aria-label="Позже"
                  className="tap-icon h-9 w-9 disabled:opacity-30"
                >
                  →
                </button>
              </div>
              {i === 0 && !color ? (
                <span className="t-label absolute left-1 top-1 rounded-sm bg-page px-1.5 py-1 text-ink-accent">
                  Главный
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="t-caption">{emptyLabel}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="t-label inline-flex h-11 cursor-pointer items-center rounded-md border border-strong px-4 hover:border-accent has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
          {busy ? "Загружаем…" : uploadLabel}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={max > 1}
            disabled={busy || images.length >= max}
            onChange={(e) => upload(e.target.files)}
            className="sr-only"
          />
        </label>
        <span className="t-caption">
          JPEG, PNG или WebP до 8 МБ · до {max}{" "}
          {max === 1 ? "кадра" : "кадров"}
        </span>
      </div>
      {error ? (
        <p role="alert" className="t-caption mt-2 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ImageField({
  name,
  initial,
  alt,
  max = 8,
}: {
  name: string;
  initial: ProductImage[];
  alt: string;
  max?: number;
}) {
  const [images, setImages] = useState<ProductImage[]>(initial);

  return (
    <>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <ImageList images={images} onChange={setImages} alt={alt} max={max} />
    </>
  );
}
