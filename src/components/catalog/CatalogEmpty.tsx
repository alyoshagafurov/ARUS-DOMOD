"use client";

import { Button } from "@/components/ui/Button";
import { useDictionary } from "@/lib/i18n/client";

interface CatalogEmptyProps {
  onReset: () => void;
  /** Человек ставил условия — значит есть что снимать */
  filtered: boolean;
}

/**
 * Пустая выдача. Не белый экран и не иллюстрация на пол-страницы —
 * одна фраза, одна кайма и выход из тупика.
 *
 * Состояния два, и путать их нельзя. Промах поиска — человек сузил
 * условия, и ему предлагают их снять. Пустой раздел — он ничего не
 * выбирал, снимать нечего, и кнопка «Сбросить всё» не делала бы ничего:
 * раздел задан адресом страницы, а не фильтром. Там выход — весь каталог.
 */
export function CatalogEmpty({ onReset, filtered }: CatalogEmptyProps) {
  const t = useDictionary();
  return (
    <div className="flex flex-col items-center py-28 text-center lg:py-40">
      <span aria-hidden="true" className="hoshiya-seam max-w-[10rem]" />
      <p className="t-h2 mt-10 max-w-[18ch] text-balance">
        {filtered ? t.catalog.empty : t.catalog.emptySection}
      </p>
      <p className="t-body-sm mt-5 max-w-[38ch] text-ink-secondary">
        {filtered ? t.catalog.emptyHint : t.catalog.emptySectionHint}
      </p>
      {filtered ? (
        <Button onClick={onReset} variant="secondary" className="mt-9">
          {t.catalog.resetAll}
        </Button>
      ) : (
        <Button href="/catalog" variant="secondary" className="mt-9">
          {t.catalog.allLooks}
        </Button>
      )}
    </div>
  );
}
