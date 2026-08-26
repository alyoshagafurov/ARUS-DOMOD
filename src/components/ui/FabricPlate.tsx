import type { CSSProperties } from "react";

import type { OrnamentMotif } from "@/components/ornament/Ornament";
import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------
   Тканая плита — то, что стоит в кадре, пока нет фотосъёмки.

   Это не «плейсхолдер», а сознательный визуальный слой: полосы атласа,
   вышивка чакан и розетки сюзане, собранные из уже существующих мотивов
   орнамента. Никаких серых прямоугольников и мягких градиентов: все переходы
   цвета — жёсткие, как стык нитей в ткани.

   Плита — единственное (кроме <Tag>) место, где берутся сырые ступени
   палитры: ткань буквально состоит из этих красителей. Здесь же —
   единственное место с мягким светом: он изображает студийную подсветку
   будущего кадра, а не украшает интерфейс.

   Каймы ҳошия на плите НЕТ намеренно. Кайма — язык границ секции; если
   повесить её ещё и на каждую плитку, на экране окажется десяток орнаментов
   и ткань превратится в обои. На плите работает только само переплетение.

   Когда придут фотографии, они заполнят `product.images`, и <Media> перестанет
   рисовать плиту сам — композиция страницы при этом не меняется.
   ------------------------------------------------------------------------- */

export type PlateTone = "madder" | "ink" | "nil" | "sabz" | "zar" | "bone";
export type PlateVariant = "look" | "detail";

interface PlateColors {
  ground: string;
  band: string;
  deep: string;
  light: string;
  thread: string;
}

const tones: Record<PlateTone, PlateColors> = {
  madder: {
    ground: "var(--madder-800)",
    band: "var(--madder-700)",
    deep: "var(--madder-900)",
    light: "var(--zar-300)",
    thread: "var(--bone-100)",
  },
  ink: {
    ground: "var(--ink-800)",
    band: "var(--ink-700)",
    deep: "var(--ink-900)",
    light: "var(--madder-700)",
    thread: "var(--bone-100)",
  },
  nil: {
    ground: "var(--nil-800)",
    band: "var(--nil-600)",
    deep: "var(--nil-900)",
    light: "var(--zar-500)",
    thread: "var(--bone-100)",
  },
  sabz: {
    ground: "var(--sabz-700)",
    band: "var(--sabz-500)",
    deep: "var(--ink-700)",
    light: "var(--zar-300)",
    thread: "var(--bone-100)",
  },
  zar: {
    ground: "var(--zar-600)",
    band: "var(--zar-500)",
    deep: "var(--zar-700)",
    light: "var(--ink-900)",
    thread: "var(--ink-900)",
  },
  bone: {
    ground: "var(--bone-200)",
    band: "var(--bone-300)",
    deep: "var(--bone-400)",
    light: "var(--madder-700)",
    thread: "var(--madder-700)",
  },
};

const toneOrder: PlateTone[] = ["madder", "ink", "nil", "bone", "sabz", "zar"];

type StripeStep = [role: keyof PlateColors, width: number];

/**
 * Раппорт абрового шёлка. Поля намеренно широкие: настоящий абр — это
 * несколько крупных пятен цвета и один-два узких акцента, а не частая
 * полоска. Частая полоска на экране читается штрих-кодом.
 */
const atlasRapport: StripeStep[] = [
  ["ground", 132],
  ["band", 64],
  ["deep", 26],
  ["band", 18],
  ["ground", 88],
  ["light", 5],
  ["deep", 74],
  ["band", 34],
];

function stripes(colors: PlateColors, steps: StripeStep[]): string {
  let cursor = 0;
  const stops = steps.map(([role, width]) => {
    const from = cursor;
    cursor += width;
    return `${colors[role]} ${from}px ${cursor}px`;
  });
  return `repeating-linear-gradient(90deg, ${stops.join(", ")})`;
}

/**
 * Переплетение нитей — на пределе различимости, иначе даёт муар.
 * На светлом полотне те же линии заметнее, поэтому оно тише вдвое.
 */
const weaveTexture =
  "repeating-linear-gradient(0deg, rgba(0,0,0,0.09) 0px 1px, transparent 1px 3px)";
const weaveTexturePale =
  "repeating-linear-gradient(0deg, rgba(0,0,0,0.045) 0px 1px, transparent 1px 3px)";

/**
 * Раппорт жаккарда. Мотив меняется от плиты к плите: если весь экран выткан
 * одной чорхоной, витрина становится однообразной, сколько бы цветов в ней
 * ни было.
 */
const jacquardScale: Record<OrnamentMotif, number> = {
  chorkhona: 60,
  gul: 68,
  mavj: 40,
  dandona: 44,
};

/**
 * Растушёвка абра. Весь смысл техники абрбандӣ в том, что краска затекает
 * и границы рисунка размыты; жёсткие стыки полос сразу читаются как CSS.
 * Слой намеренно сдвинут по фазе относительно раппорта, чтобы размытие не
 * совпадало со швами.
 */
const abrFeather =
  "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0.20) 52px, rgba(0,0,0,0) 108px, rgba(255,255,255,0.09) 176px, rgba(0,0,0,0) 244px, rgba(0,0,0,0.16) 322px, rgba(0,0,0,0) 402px)";

/** Студийный свет: ключ сверху, тень у пола. Заменяет освещение кадра. */
const keyLight =
  "radial-gradient(118% 86% at 50% 16%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 40%, transparent 68%)";
const keyLightPale =
  "radial-gradient(118% 86% at 50% 16%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.08) 40%, transparent 68%)";
const floorShadow =
  "linear-gradient(to top, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.10) 20%, transparent 46%)";
const floorShadowPale =
  "linear-gradient(to top, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.04) 20%, transparent 46%)";

function hash(seed: string): number {
  let value = 0;
  for (let i = 0; i < seed.length; i += 1) {
    value = (value * 31 + seed.charCodeAt(i)) % 100003;
  }
  return value;
}

export function plateToneFor(seed: string): PlateTone {
  return toneOrder[hash(seed) % toneOrder.length];
}

interface FabricPlateProps {
  /** Из него выводится тон, если он не задан явно */
  seed?: string;
  tone?: PlateTone;
  /**
   * look — гладкое полотно с жаккардовым раппортом;
   * detail — крупный план ткани: широкие поля абра.
   */
  variant?: PlateVariant;
  /** Мотив жаккарда для варианта look */
  jacquard?: OrnamentMotif;
  className?: string;
}

export function FabricPlate({
  seed = "arus",
  tone,
  variant = "look",
  jacquard = "chorkhona",
  className,
}: FabricPlateProps) {
  const key = tone ?? plateToneFor(seed);
  const colors = tones[key];
  const isPale = key === "bone" || key === "zar";

  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: colors.ground }}
    >
      {variant === "detail" ? (
        /* Крупный план ткани: широкие поля абра плюс растушёвка краёв */
        <>
          <span
            className="absolute inset-0"
            style={{ backgroundImage: stripes(colors, atlasRapport) }}
          />
          <span
            className="absolute inset-0"
            style={{ backgroundImage: abrFeather }}
          />
        </>
      ) : (
        /* Вещь на фоне: гладкое полотно с тихим жаккардовым раппортом */
        <span
          className={`ornament ornament--field ornament--${jacquard}`}
          style={
            {
              "--ornament-size": `${jacquardScale[jacquard]}px ${jacquardScale[jacquard]}px`,
              color: colors.thread,
              opacity: isPale ? 0.15 : 0.11,
            } as CSSProperties
          }
        />
      )}

      <span
        className="absolute inset-0"
        style={{ backgroundImage: isPale ? weaveTexturePale : weaveTexture }}
      />

      <span
        className="absolute inset-0"
        style={{ backgroundImage: isPale ? keyLightPale : keyLight }}
      />
      <span
        className="absolute inset-0"
        style={{ backgroundImage: isPale ? floorShadowPale : floorShadow }}
      />
    </div>
  );
}
