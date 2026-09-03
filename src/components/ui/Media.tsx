import Image from "next/image";

import type { OrnamentMotif } from "@/components/ornament/Ornament";
import { HoverFrame } from "@/components/ui/HoverFrame";
import {
  FabricPlate,
  type PlateTone,
  type PlateVariant,
} from "@/components/ui/FabricPlate";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/types/catalog";

type MediaRatio =
  "portrait" | "editorial" | "wide" | "square" | "tall" | "auto";
type MediaRadius = "card" | "block" | "sm" | "none";

const radiusClass: Record<MediaRadius, string> = {
  card: "rounded-[var(--radius-card)]",
  block: "rounded-[var(--radius-block)]",
  sm: "rounded-sm",
  none: "rounded-none",
};

const ratioClass: Record<MediaRatio, string> = {
  portrait: "aspect-[var(--ratio-portrait)]",
  editorial: "aspect-[var(--ratio-editorial)]",
  wide: "aspect-[var(--ratio-wide)]",
  square: "aspect-[var(--ratio-square)]",
  tall: "aspect-[2/3]",
  auto: "",
};

interface MediaProps {
  image?: ProductImage | null;
  /**
   * Второй кадр, проявляющийся при наведении на родителя с классом `group`.
   * Пока фотографий нет, его роль играет крупный план ткани.
   */
  secondary?: ProductImage | null;
  ratio?: MediaRatio;
  /** Обязателен всегда, кроме одиночных hero-изображений во всю ширину */
  sizes?: string;
  priority?: boolean;
  /** Медленный наезд при наведении на карточку-родителя с классом `group` */
  zoomOnHover?: boolean;
  /** Включает второй слой (фото или крупный план ткани) на hover */
  hoverReveal?: boolean;
  /**
   * Классы для самого кадра — прежде всего точка обрезки
   * (`object-[68%_center] lg:object-[72%_center]`). Нужна там, где модель
   * стоит не по центру: без неё object-cover срезает именно её. Классом, а не
   * инлайн-стилем, чтобы телефон и десктоп могли кадрировать по-разному.
   */
  imageClassName?: string;
  /** Из чего выводится тон тканой плиты, если фотографии ещё нет */
  seed?: string;
  tone?: PlateTone;
  plateVariant?: PlateVariant;
  /** Мотив жаккарда плиты — меняется от блока к блоку */
  plateMotif?: OrnamentMotif;
  /** Скругление кадра: карточка по умолчанию, блок — для крупных полотен */
  radius?: MediaRadius;
  className?: string;
}

/**
 * Единая обработка изображений ARUS DOMOD.
 *
 * Правила: портретный кадр 3:4 по умолчанию (одежда), радиус карточки —
 * кадр лежит на поверхности как предмет; при отсутствии фото место занимает тканая плита,
 * а не серый прямоугольник; `sizes` обязателен для настоящих фотографий.
 */
export function Media({
  image,
  secondary,
  ratio = "portrait",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  priority = false,
  zoomOnHover = true,
  hoverReveal = false,
  imageClassName,
  seed,
  tone,
  plateVariant = "look",
  plateMotif = "chorkhona",
  radius = "card",
  className,
}: MediaProps) {
  const showSecondLayer = hoverReveal && (secondary || !image);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-muted",
        radiusClass[radius],
        ratioClass[ratio],
        className,
      )}
    >
      <div className={cn("absolute inset-0", zoomOnHover && "motion-zoom")}>
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes={sizes}
            priority={priority}
            placeholder={image.blurDataURL ? "blur" : "empty"}
            blurDataURL={image.blurDataURL}
            className={cn("object-cover", imageClassName)}
          />
        ) : (
          <FabricPlate
            seed={seed}
            tone={tone}
            variant={plateVariant}
            jacquard={plateMotif}
          />
        )}
      </div>

      {/*
        Второй кадр — тот, что проступает при наведении. Он вынесен в
        HoverFrame: там устройство спрашивают напрямую, есть ли курсор, и на
        телефоне кадр не рендерится вовсе. Почему ни `hidden`, ни <picture>,
        ни хитрый `sizes` этого не дают — расписано в самом HoverFrame.

        Тканая плита остаётся всем: она рисуется CSS и в сеть не ходит.
      */}
      {showSecondLayer ? (
        /*
         * Два слоя, а не один: проявление и наезд не могут жить на одном
         * элементе. `.motion-zoom` объявляет transition сокращённой формой,
         * та сбрасывает transition-property до одного transform — и
         * `transition-opacity`, стоящий рядом, переставал действовать.
         * Второй кадр возникал рывком вместо растворения.
         */
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity",
            "duration-[var(--dur-slow)] ease-[var(--ease-quiet)]",
            "group-hover:opacity-100 group-focus-within:opacity-100",
          )}
        >
          <div className={cn("absolute inset-0", zoomOnHover && "motion-zoom")}>
            {secondary ? (
              <HoverFrame image={secondary} sizes={sizes} />
            ) : (
              <FabricPlate seed={seed} tone={tone} variant="detail" />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
