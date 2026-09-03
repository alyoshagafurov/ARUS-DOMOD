import type { CSSProperties, ElementType, ReactNode } from "react";

import { OrnamentField } from "@/components/ornament/Ornament";
import { cn } from "@/lib/cn";

type AivanSurface = "green" | "night" | "day";
type AivanPad = "none" | "block" | "tight";

const padClass: Record<AivanPad, string> = {
  none: "",
  block: "p-[var(--block-pad)]",
  tight: "p-[calc(var(--block-pad)*0.6)]",
};

interface AivanProps {
  children: ReactNode;
  /** Поверхность объёма: айвон зелёный, ниша глубокая, остров белый */
  surface?: AivanSurface;
  /** Внутренние поля; `none` — когда кадр должен лечь встык к краю */
  pad?: AivanPad;
  /** Арочный верх — силуэт айвона, а не карточки */
  arch?: boolean;
  /**
   * Обрезать содержимое по скруглению. Выключается там, где кадр или
   * карточка намеренно выходят за границу блока на белый двор.
   */
  clip?: boolean;
  /** Дамаск в углу блока: грунт, растворяющийся к центру */
  ornament?: "none" | "corner" | "field";
  /** Угол, из которого растёт дамаск: `x y` в процентах */
  ornamentOrigin?: [number, number];
  as?: ElementType;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Айвон — зелёный объём на белом дворе.
 *
 * Это не «секция с фоном»: у блока трёхслойная тень, падающая на белое,
 * внутренняя кромка (блик сверху, тень у пола), собственный радиус и
 * своя поверхность, внутри которой переключаются все семантические
 * токены. Композиция внутри — дело секции: айвон только даёт объём.
 */
export function Aivan({
  children,
  surface = "green",
  pad = "block",
  arch = false,
  clip = true,
  ornament = "none",
  ornamentOrigin = [100, 0],
  as: Tag = "div",
  id,
  className,
  style,
}: AivanProps) {
  return (
    <Tag
      id={id}
      data-surface={surface}
      className={cn(
        "aivan",
        arch && "aivan--arch",
        clip && "overflow-hidden",
        padClass[pad],
        className,
      )}
      style={style}
    >
      {ornament !== "none" ? (
        <OrnamentField
          motif="damask"
          strength={ornament === "field" ? "quiet" : "strong"}
          className={cn(
            "-z-10 rounded-[inherit]",
            ornament === "corner" && "ornament--fade",
          )}
          style={
            {
              "--fade-x": `${ornamentOrigin[0]}%`,
              "--fade-y": `${ornamentOrigin[1]}%`,
            } as CSSProperties
          }
        />
      ) : null}
      {children}
    </Tag>
  );
}
