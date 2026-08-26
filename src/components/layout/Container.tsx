import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ContainerWidth = "wide" | "narrow" | "text" | "full";

const widthClass: Record<ContainerWidth, string> = {
  wide: "max-w-[var(--container-max)]",
  narrow: "max-w-[var(--container-narrow)]",
  text: "max-w-[var(--container-text)]",
  full: "max-w-none",
};

interface ContainerProps {
  children: ReactNode;
  width?: ContainerWidth;
  as?: ElementType;
  className?: string;
}

/**
 * Единственный источник горизонтальных полей. Значение --gutter текучее
 * (20px → 48px), поэтому ручные px-* в разметке не нужны и запрещены.
 */
export function Container({
  children,
  width = "wide",
  as: Tag = "div",
  className,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-[var(--gutter)]",
        widthClass[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
