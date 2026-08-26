"use client";

import { useCallback, useSyncExternalStore } from "react";

import { readStored, writeStored } from "@/lib/storage";
import type { OfferKind } from "@/types/catalog";

/**
 * Корзина на время сессии.
 *
 * Строка хранит только идентификаторы: товар, вариант, тип предложения и
 * количество. Ни цены, ни названия, ни картинки здесь нет — их страница
 * корзины берёт из репозитория по slug. Так у данных о товаре остаётся один
 * источник, и корзина не разъезжается с каталогом.
 *
 * Корзина переживает перезагрузку: она лежит в localStorage. Восстановление
 * идёт НЕ во время рендера, а при первой подписке — то есть уже после
 * гидратации. Иначе сервер отдал бы пустую корзину, клиент при первом рендере
 * — восстановленную, и React сообщил бы о расхождении разметки.
 *
 * Устройство повторяет `favorites.ts` намеренно: когда появится настоящее
 * хранилище, обе подсистемы меняются одинаково и предсказуемо.
 */
export interface CartLine {
  /** Ключ строки: товар + вариант + тип предложения */
  id: string;
  productId: string;
  slug: string;
  title: string;
  variantId?: string;
  size?: string;
  offerKind: OfferKind;
  quantity: number;
}

const STORAGE_KEY = "arus.cart.v1";

/**
 * Данные из хранилища проверяются по форме: там может лежать что угодно —
 * запись старой версии, чужой ключ, повреждённый JSON. Непрошедшее молча
 * отбрасывается, витрина от этого не страдает.
 */
function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.id === "string" &&
    typeof line.productId === "string" &&
    typeof line.slug === "string" &&
    typeof line.title === "string" &&
    (line.offerKind === "purchase" || line.offerKind === "rental") &&
    typeof line.quantity === "number" &&
    line.quantity >= 1
  );
}

const isCartLines = (value: unknown): value is CartLine[] =>
  Array.isArray(value) && value.every(isCartLine);

const lines = new Map<string, CartLine>();
const listeners = new Set<() => void>();

/**
 * Снимок пересобирается только при изменении: useSyncExternalStore сравнивает
 * ссылки, и новый массив на каждый вызов уводил бы React в бесконечный рендер.
 */
let snapshot: CartLine[] = [];

function emit(): void {
  snapshot = [...lines.values()];
  writeStored(STORAGE_KEY, snapshot);
  for (const listener of listeners) listener();
}

let hydrated = false;

/** Вызывается при первой подписке — это уже после гидратации разметки */
function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  const stored = readStored(STORAGE_KEY, isCartLines);
  if (!stored?.length) return;
  for (const line of stored) lines.set(line.id, line);
  snapshot = [...lines.values()];
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  hydrate();
  return () => {
    listeners.delete(listener);
  };
}

const EMPTY: CartLine[] = [];

export function addToCart(line: Omit<CartLine, "id" | "quantity">): void {
  const id = [line.productId, line.variantId ?? "os", line.offerKind].join(":");
  const existing = lines.get(id);
  lines.set(id, {
    ...line,
    id,
    quantity: existing ? existing.quantity + 1 : 1,
  });
  emit();
}

/** Меньше единицы количество не опускается: для этого есть удаление */
export function setQuantity(id: string, quantity: number): void {
  const line = lines.get(id);
  if (!line) return;
  lines.set(id, { ...line, quantity: Math.max(1, Math.round(quantity)) });
  emit();
}

export function removeLine(id: string): void {
  if (lines.delete(id)) emit();
}

export function clearCart(): void {
  if (lines.size === 0) return;
  lines.clear();
  emit();
}

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}

export function useCartCount(): number {
  return useSyncExternalStore(
    subscribe,
    () => snapshot.reduce((sum, line) => sum + line.quantity, 0),
    () => 0,
  );
}

/** Есть ли уже такая позиция — карточке нужно для состояния кнопки */
export function useCartHas(
  productId: string,
  variantId: string | undefined,
  offerKind: OfferKind,
): boolean {
  const id = [productId, variantId ?? "os", offerKind].join(":");
  return useSyncExternalStore(
    subscribe,
    () => lines.has(id),
    () => false,
  );
}

export function useAddToCart(): (line: Omit<CartLine, "id" | "quantity">) => void {
  return useCallback((line) => addToCart(line), []);
}
