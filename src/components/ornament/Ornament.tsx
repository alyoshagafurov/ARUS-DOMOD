import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

export type OrnamentMotif = "chorkhona" | "dandona" | "mavj" | "gul";
export type OrnamentStrength = "quiet" | "strong" | "full";

interface OrnamentBaseProps {
  motif?: OrnamentMotif;
  strength?: OrnamentStrength;
  /** Размер тайла; по умолчанию — собственный масштаб мотива */
  tile?: number;
  className?: string;
  style?: CSSProperties;
}

interface OrnamentBandProps extends OrnamentBaseProps {
  /** Толщина каймы в px */
  height?: number;
}

/**
 * Горизонтальная кайма. Основной структурный приём проекта: секции не просто
 * ставятся друг на друга, а «подшиваются» тканой каймой.
 */
export function OrnamentBand({
  motif = "dandona",
  strength = "quiet",
  height = 12,
  tile,
  className,
  style,
}: OrnamentBandProps) {
  return (
    <span
      aria-hidden="true"
      data-strength={strength}
      className={cn("ornament ornament--band", `ornament--${motif}`, className)}
      style={
        {
          "--ornament-band-h": `${height}px`,
          ...(tile ? { "--ornament-size": `auto ${tile}px` } : null),
          ...style,
        } as CSSProperties
      }
    />
  );
}

/** Вертикальная кайма для краевых акцентов на широких экранах */
export function OrnamentRail({
  motif = "chorkhona",
  strength = "quiet",
  height = 12,
  tile,
  className,
  style,
}: OrnamentBandProps) {
  return (
    <span
      aria-hidden="true"
      data-strength={strength}
      className={cn("ornament ornament--rail", `ornament--${motif}`, className)}
      style={
        {
          "--ornament-band-h": `${height}px`,
          ...(tile ? { "--ornament-size": `${tile}px auto` } : null),
          ...style,
        } as CSSProperties
      }
    />
  );
}

/**
 * Заливка области мотивом. Родитель обязан быть `relative`.
 * Назначение: подложка плейсхолдеров изображений и пустых состояний —
 * не декоративный фон под текстом.
 */
export function OrnamentField({
  motif = "chorkhona",
  strength = "quiet",
  tile,
  className,
  style,
}: OrnamentBaseProps) {
  return (
    <span
      aria-hidden="true"
      data-strength={strength}
      className={cn(
        "ornament ornament--field",
        `ornament--${motif}`,
        className,
      )}
      style={
        {
          ...(tile ? { "--ornament-size": `${tile}px ${tile}px` } : null),
          ...style,
        } as CSSProperties
      }
    />
  );
}
