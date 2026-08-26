import Image from "next/image";

import type { OrnamentMotif } from "@/components/ornament/Ornament";
import {
  FabricPlate,
  type PlateTone,
  type PlateVariant,
} from "@/components/ui/FabricPlate";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/types/catalog";

type MediaRatio =
  "portrait" | "editorial" | "wide" | "square" | "tall" | "auto";

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
  className?: string;
}

/**
 * Единая обработка изображений ARUS DOMOD.
 *
 * Правила: портретный кадр 3:4 по умолчанию (одежда), радиус 2px — ткань
 * режут, а не скругляют; при отсутствии фото место занимает тканая плита,
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
  className,
}: MediaProps) {
  const showSecondLayer = hoverReveal && (secondary || !image);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xs bg-muted",
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

      {showSecondLayer ? (
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity",
            "duration-[var(--dur-slow)] ease-[var(--ease-quiet)]",
            "group-hover:opacity-100 group-focus-within:opacity-100",
            zoomOnHover && "motion-zoom",
          )}
        >
          {secondary ? (
            <Image
              src={secondary.url}
              alt={secondary.alt}
              fill
              sizes={sizes}
              className="object-cover"
            />
          ) : (
            <FabricPlate seed={seed} tone={tone} variant="detail" />
          )}
        </div>
      ) : null}
    </div>
  );
}
