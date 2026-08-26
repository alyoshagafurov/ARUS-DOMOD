"use client";

import { useCallback, useSyncExternalStore } from "react";

import { readStored, writeStored } from "@/lib/storage";

/**
 * Избранное на время сессии.
 *
 * Хранилище общее и живёт вне React намеренно: каталог перестраивает сетку
 * при каждом изменении фильтра, карточки размонтируются, и локальное
 * состояние кнопки терялось бы на глазах у пользователя.
 *
 * Список переживает перезагрузку: он лежит в localStorage. Восстановление
 * идёт НЕ во время рендера, а при первой подписке — то есть уже после
 * гидратации. Иначе сервер отдал бы пустой список, клиент при первом рендере
 * — восстановленный, и React сообщил бы о расхождении разметки.
 */
const STORAGE_KEY = "arus.favorites.v1";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const ids = new Set<string>();
const listeners = new Set<() => void>();

/**
 * Снимок пересобирается только при изменении: useSyncExternalStore сравнивает
 * ссылки, и новый массив на каждый вызов увёл бы React в бесконечный рендер.
 */
let snapshot: string[] = [];
const EMPTY: string[] = [];

function emit(): void {
  snapshot = [...ids];
  writeStored(STORAGE_KEY, snapshot);
  for (const listener of listeners) listener();
}

let hydrated = false;

/** Вызывается при первой подписке — это уже после гидратации разметки */
function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  const stored = readStored(STORAGE_KEY, isStringArray);
  if (!stored?.length) return;
  for (const id of stored) ids.add(id);
  snapshot = [...ids];
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  hydrate();
  return () => {
    listeners.delete(listener);
  };
}

export function toggleFavorite(id: string): void {
  if (ids.has(id)) ids.delete(id);
  else ids.add(id);
  emit();
}

export function useIsFavorite(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ids.has(id),
    // На сервере избранного нет: снимок обязан быть стабильным,
    // иначе React ругается на несовпадение при гидратации.
    () => false,
  );
}

export function useFavoriteIds(): string[] {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}

export function useFavoriteCount(): number {
  return useSyncExternalStore(
    subscribe,
    () => ids.size,
    () => 0,
  );
}

export function useToggleFavorite(id: string): () => void {
  return useCallback(() => toggleFavorite(id), [id]);
}
