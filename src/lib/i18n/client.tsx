"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  dictionaries,
  DEFAULT_LOCALE,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Словарь в клиентском компоненте. Сами словари статичны и попадают в бандл. */
export function useDictionary(): Dictionary {
  return dictionaries[useContext(LocaleContext)];
}
