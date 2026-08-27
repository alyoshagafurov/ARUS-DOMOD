import type { ReactNode } from "react";

import type { OrnamentMotif } from "@/components/ornament/Ornament";
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
   * Поверхность секции. Средой служит бирюза логотипа, поэтому:
   * `night` — глубокая бирюза (значение по умолчанию), `muted` — поле
   * логотипа на ступень светлее, `day` — редкая светлая пауза.
   * Значение проставляет data-surface, от которого зависят ВСЕ
   * семантические токены внутри.
   */
  surface?: SectionSurface;
  rhythm?: SectionRhythm;
  /** Золотая волосяная кайма по краям секции — приём «ҳошия» */
  edge?: SectionEdge;
  /**
   * @deprecated Мотив краю больше не нужен: границу держит линия, а не
   * тканая лента. Проп оставлен, чтобы страницы вне текущей фазы
   * собирались без правок.
   */
  edgeMotif?: OrnamentMotif;
  id?: string;
  className?: string;
}

export function Section({
  children,
  surface = "night",
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
      className={cn("relative isolate w-full", rhythmClass[rhythm], className)}
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
