"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { ProductImage } from "@/types/catalog";

/**
 * Поле кадров товара: загрузка, порядок, удаление.
 *
 * Список живёт в состоянии и уходит в форму скрытым полем JSON — сама
 * форма остаётся нативной и отправляется server action'ом. Загрузка идёт
 * отдельным запросом в /api/admin/upload, чтобы файл не ждал сохранения
 * всей карточки.
 *
 * Alt берётся от названия товара: подпись к кадру — это описание изделия,
 * а его у нас нет, и придумывать нельзя.
 */
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
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
        setImages((prev) => [
          ...prev,
          { url: data.url!, width: data.width!, height: data.height!, alt },
        ]);
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      {images.length ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.url} className="relative border border-hairline">
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
                  onClick={() => setImages((p) => p.filter((_, k) => k !== i))}
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
              {i === 0 ? (
                <span className="t-label absolute left-1 top-1 bg-page px-1.5 py-1 text-ink-accent">
                  Главный
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="t-caption">Кадров пока нет.</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="t-label inline-flex h-11 cursor-pointer items-center border border-strong px-4 hover:border-accent">
          {busy ? "Загружаем…" : "Загрузить кадр"}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy || images.length >= max}
            onChange={(e) => upload(e.target.files)}
            className="sr-only"
          />
        </label>
        <span className="t-caption">
          JPEG, PNG или WebP до 8 МБ · до {max} кадров · первый — главный
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
