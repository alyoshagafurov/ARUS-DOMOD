"use client";

import { CloseIcon } from "@/components/ui/icons";

export interface ActiveFilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  chips: ActiveFilterChip[];
  onReset: () => void;
}

/**
 * Выбранные условия. Капсула здесь оправдана: это снимаемая метка,
 * а не кнопка — форма прямо говорит, что её можно убрать.
 */
export function ActiveFilters({ chips, onReset }: ActiveFiltersProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-6">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Убрать условие: ${chip.label}`}
          className="t-label inline-flex min-h-11 items-center gap-2 rounded-pill border
            border-strong py-2 pl-4 pr-3 text-ink transition-colors duration-[var(--dur-fast)]
            hover:border-accent hover:text-ink-accent"
        >
          {chip.label}
          <CloseIcon aria-hidden="true" className="h-[0.8em] w-[0.8em]" />
        </button>
      ))}

      <button
        type="button"
        onClick={onReset}
        className="t-label motion-underline ml-2 inline-flex min-h-11 items-center py-2
          text-ink-muted hover:text-ink"
      >
        Сбросить всё
      </button>
    </div>
  );
}
