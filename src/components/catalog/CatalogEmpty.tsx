"use client";

import { Button } from "@/components/ui/Button";
import { useDictionary } from "@/lib/i18n/client";

interface CatalogEmptyProps {
  onReset: () => void;
}

/**
 * Пустая выдача. Не белый экран и не иллюстрация на пол-страницы —
 * одна фраза, одна кайма и выход из тупика.
 */
export function CatalogEmpty({ onReset }: CatalogEmptyProps) {
  const t = useDictionary();
  return (
    <div className="flex flex-col items-center py-28 text-center lg:py-40">
      <span aria-hidden="true" className="hoshiya-seam max-w-[10rem]" />
      <p className="t-h2 mt-10 max-w-[18ch] text-balance">{t.catalog.empty}</p>
      <p className="t-body-sm mt-5 max-w-[38ch] text-ink-secondary">
        {t.catalog.emptyHint}
      </p>
      <Button onClick={onReset} variant="secondary" className="mt-9">
        {t.catalog.resetAll}
      </Button>
    </div>
  );
}
