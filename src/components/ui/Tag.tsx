import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type TagTone = "neutral" | "accent" | "gold" | "outline";
type TagShape = "square" | "pill";

const toneClass: Record<TagTone, string> = {
  neutral: "bg-invert text-ink-invert",
  accent: "bg-accent text-accent-contrast",
  // Золото светлое на любой поверхности, поэтому текст на нём всегда тёмный —
  // это единственное место, где цвет берётся из сырой палитры, а не из семантики.
  gold: "bg-gold text-[var(--ink-900)]",
  outline: "border border-strong text-ink",
};

interface TagProps {
  children: ReactNode;
  tone?: TagTone;
  /** square — плашки на карточках; pill — только фильтры каталога */
  shape?: TagShape;
  className?: string;
}

export function Tag({
  children,
  tone = "neutral",
  shape = "square",
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        "t-label inline-flex items-center px-2.5 py-1.5",
        shape === "pill" ? "rounded-pill px-4" : "rounded-xs",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
