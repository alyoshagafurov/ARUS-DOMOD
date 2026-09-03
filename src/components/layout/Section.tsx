import type { ReactNode } from "react";

import type { OrnamentMotif } from "@/components/ornament/Ornament";
import { cn } from "@/lib/cn";

type SectionSurface = "day" | "night" | "green" | "muted";
type SectionRhythm = "section" | "block" | "flush";
type SectionEdge = "none" | "top" | "bottom" | "both";

const rhythmClass: Record<SectionRhythm, string> = {
  section: "py-[var(--space-section-y)]",
  block: "py-[var(--space-block-y)]",
  flush: "py-0",
};

interface SectionProps {
  children: ReactNode;
  /**
   * Поверхность полосы. Двор белый, поэтому по умолчанию `day`; сплошная
   * зелёная полоса (`green`) применяется редко — объём дают айвоны внутри.
   * `muted` оставлен для страниц вне текущей фазы и ведёт на `green`.
   */
  surface?: SectionSurface;
  rhythm?: SectionRhythm;
  /** Золотая волосяная линия по краю полосы */
  edge?: SectionEdge;
  /** @deprecated мотив краю не нужен; проп сохранён ради старых вызовов */
  edgeMotif?: OrnamentMotif;
  id?: string;
  className?: string;
}

export function Section({
  children,
  surface = "day",
  rhythm = "section",
  edge = "none",
  id,
  className,
}: SectionProps) {
  const showTop = edge === "top" || edge === "both";
  const showBottom = edge === "bottom" || edge === "both";

  return (
    <section
      id={id}
      data-surface={surface === "muted" ? "green" : surface}
      className={cn("relative w-full", rhythmClass[rhythm], className)}
    >
      {showTop ? (
        <span
          aria-hidden="true"
          className="hoshiya-line absolute inset-x-0 top-0"
        />
      ) : null}
      {children}
      {showBottom ? (
        <span
          aria-hidden="true"
          className="hoshiya-line absolute inset-x-0 bottom-0"
        />
      ) : null}
    </section>
  );
}
