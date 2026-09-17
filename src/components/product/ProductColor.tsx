"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Выбранный цвет образа — общий для галереи и панели покупки.
 *
 * На странице они соседи в серверной разметке: галерея слева, цена справа.
 * Выбор цвета живёт в панели, а менять кадры должна галерея, поэтому
 * состояние поднято в провайдер над обеими колонками. Страница остаётся
 * серверной — клиентский здесь только сам провайдер.
 */
interface ProductColorState {
  color: string | undefined;
  setColor: (color: string) => void;
}

const ProductColorContext = createContext<ProductColorState>({
  color: undefined,
  setColor: () => {},
});

export function ProductColorProvider({
  initial,
  children,
}: {
  /** Первый цвет образа; у образа без цветов — нет */
  initial: string | undefined;
  children: ReactNode;
}) {
  const [color, setColor] = useState(initial);
  const value = useMemo(() => ({ color, setColor }), [color]);
  return (
    <ProductColorContext.Provider value={value}>
      {children}
    </ProductColorContext.Provider>
  );
}

export const useProductColor = () => useContext(ProductColorContext);
