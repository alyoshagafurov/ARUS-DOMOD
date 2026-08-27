import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

/**
 * Живых мотивов в системе «ФИРӮЗА» два, и оба растительные — как орнамент
 * логотипа: `damask` (грунт крупных полей) и `gul` (розетка сюзане).
 *
 * `chorkhona`, `dandona` и `mavj` — геометрия чакана из прежней визуальной
 * системы. Она снята: навязывать её поверх бирюзово-золотого знака значит
 * воспроизводить расхождение, из-за которого та версия не была принята.
 * Имена оставлены в типе только затем, чтобы страницы вне текущей фазы
 * (каталог, корзина, оформление, избранное) продолжали собираться; в CSS
 * все три ведут на дамаск, поэтому в вывод геометрия уже не попадает.
 * Удаляются вместе с переработкой этих страниц.
 */
export type OrnamentMotif = "damask" | "gul" | "chorkhona" | "dandona" | "mavj";
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
 * Горизонтальная полоса дамаска.
 *
 * Структурным приёмом она быть перестала: секции подшивает золотая
 * волосяная линия (.hoshiya-line), а дамаск остался тональным грунтом.
 */
export function OrnamentBand({
  motif = "damask",
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
  motif = "damask",
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
  motif = "damask",
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
