import type { ReactNode } from "react";

import {
  OrnamentBand,
  type OrnamentMotif,
} from "@/components/ornament/Ornament";
import { cn } from "@/lib/cn";

type SectionSurface = "day" | "night" | "muted";
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
   * Поверхность секции. Чередование day/night — не тёмная тема, а ритм:
   * так же чередуются полосы атласа. Значение проставляет data-surface,
   * от которого зависят ВСЕ семантические токены внутри.
   */
  surface?: SectionSurface;
  rhythm?: SectionRhythm;
  /** Тканая кайма по краям секции — фирменный приём «ҳошия» */
  edge?: SectionEdge;
  edgeMotif?: OrnamentMotif;
  id?: string;
  className?: string;
}

export function Section({
  children,
  surface = "day",
  rhythm = "section",
  edge = "none",
  edgeMotif = "dandona",
  id,
  className,
}: SectionProps) {
  const showTop = edge === "top" || edge === "both";
  const showBottom = edge === "bottom" || edge === "both";

  return (
    <section
      id={id}
      data-surface={surface === "muted" ? "day" : surface}
      className={cn(
        "relative isolate w-full",
        surface === "muted" && "bg-muted",
        rhythmClass[rhythm],
        className,
      )}
    >
      {showTop ? (
        <OrnamentBand
          motif={edgeMotif}
          height={10}
          className="absolute inset-x-0 top-0"
        />
      ) : null}

      {children}

      {showBottom ? (
        <OrnamentBand
          motif={edgeMotif}
          height={10}
          className="absolute inset-x-0 bottom-0 rotate-180"
        />
      ) : null}
    </section>
  );
}
