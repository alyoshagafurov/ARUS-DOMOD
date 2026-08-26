"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

import type { ProductImage } from "@/types/catalog";

/**
 * Второй кадр карточки — тот, что проступает при наведении.
 *
 * Он существует только там, где есть курсор. На тач-экране наведения не
 * бывает, и до этой правки телефон скачивал ровно вдвое больше фотографий,
 * чем мог показать: двенадцать карточек каталога — двадцать четыре кадра,
 * из которых двенадцать никто никогда не увидит. Замер на проде: 143 КБ и
 * двенадцать запросов впустую.
 *
 * Почему не проще:
 *
 * - `hidden` не помогает. Chrome грузит ленивую картинку внутри display:none
 *   всё равно — проверено замером, кадры уходили в сеть при нулевой коробке.
 * - `<picture>` с `<source media>` помогает, но только в серверной разметке.
 *   На главной он работает (ноль лишних запросов), а каталог рендерится на
 *   клиенте: React выставляет `srcset` у `<img>` раньше, чем прикрепит
 *   `<source>`, браузер успевает начать загрузку, и приём срабатывает уже
 *   после запроса.
 * - `sizes` с мелкой ступенью не работает: Next фильтрует srcset по долям
 *   `vw` из самой строки, и объявленный 1px в набор ступеней не попадает.
 *
 * Остаётся спросить само устройство. `useSyncExternalStore` здесь по той же
 * причине, что в корзине и избранном: снимок читается прямо из
 * `matchMedia`, состояние не дублируется в React, и `setState` внутри
 * эффекта не появляется. Серверный снимок — `false`: разметка уезжает без
 * второго кадра, поэтому из HTML каталога заодно уходят двенадцать
 * base64-заглушек размытия.
 */
const POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(POINTER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(POINTER_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

function useHasPointer() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function HoverFrame({
  image,
  sizes,
}: {
  image: ProductImage;
  sizes?: string;
}) {
  const hasPointer = useHasPointer();
  if (!hasPointer) return null;

  return (
    <Image
      src={image.url}
      alt={image.alt}
      fill
      sizes={sizes}
      className="object-cover"
    />
  );
}
