import type { CSSProperties } from "react";

import { OrnamentBand } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { photo } from "@/lib/photos";
import type { Collection } from "@/types/catalog";

interface HomeHeroProps {
  collection?: Collection;
}

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

/**
 * Первый экран — кампания, а не баннер.
 *
 * Кадр ткани занимает больше половины ширины, уходит за правый край и вверх
 * под шапку: сетка намеренно нарушена. Текст стоит узкой колонкой на свободном
 * поле слева и не спорит с изображением за внимание.
 *
 * Разделение включается только с 1280px. Ниже текстовой колонке физически
 * не хватает места рядом с кадром — на 1024 заголовок начинал заезжать на
 * ткань, поэтому там композиция перестраивается в вертикальный разворот:
 * кадр во всю ширину сверху, текст под ним. Это не «сжатый десктоп».
 */
export function HomeHero({ collection }: HomeHeroProps) {
  const number = collection?.title ?? "Коллекция 01";

  return (
    <section
      data-surface="night"
      className="relative isolate overflow-hidden xl:min-h-[100svh]"
    >
      {/* Кадр: на мобильном — сверху во всю ширину, на десктопе — правое поле */}
      <div className="motion-veil relative h-[62svh] min-h-[380px] w-full xl:absolute xl:inset-y-0 xl:right-0 xl:h-full xl:w-[56%]">
        <Media
          image={photo(
            "hero-tajik-royal-bride",
            "Невеста в свадебном образе ARUS DOMOD",
          )}
          ratio="auto"
          priority
          zoomOnHover={false}
          // Модель стоит в правой части кадра. На телефоне кадр во всю
          // ширину и обрезка мягче, на десктопе колонка узкая — сдвиг сильнее.
          imageClassName="object-[64%_center] lg:object-[72%_center]"
          sizes="(min-width: 1280px) 56vw, 100vw"
          className="h-full rounded-none"
        />

        {/* Подложка под шапкой: на светлом участке кадра пункты меню
            и иконки иначе не читаются. Служебная, не декоративная. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(16,13,11,0.72) 0%, rgba(16,13,11,0.38) 45%, transparent 100%)",
          }}
        />
      </div>

      {/* Волосяной шов между текстовым полем и кадром */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-[44%] hidden w-px bg-hairline xl:block"
      />

      <div className="relative mx-auto flex w-full max-w-[var(--container-max)] flex-col justify-center px-[var(--gutter)] pb-20 pt-14 xl:min-h-[100svh] xl:pb-32 xl:pt-[calc(var(--header-h)+5rem)]">
        {/* Вертикальный лейбл по левой кромке — как кромка ткани */}
        <span
          aria-hidden="true"
          className="t-label-wide absolute left-2 top-1/2 hidden -translate-y-1/2 rotate-180 text-ink-muted [writing-mode:vertical-rl] 2xl:block"
        >
          {number} — 2026
        </span>

        <div className="max-w-[34rem] xl:max-w-[28rem] 2xl:max-w-[34rem]">
          <p
            className="motion-enter t-label text-ink-secondary"
            style={delay(80)}
          >
            ARUS DOMOD · {number}
          </p>

          <h1
            className="motion-enter t-display-2 mt-7 text-balance"
            style={delay(160)}
          >
            Наследие,
            <br />
            которое надевают
          </h1>

          <p
            className="motion-enter t-lead mt-8 max-w-[36ch]"
            style={delay(260)}
          >
            Королевские наряды для невест и женихов. Продажа и прокат в
            национальном стиле.
          </p>

          <div
            className="motion-enter mt-11 flex flex-wrap items-center gap-3"
            style={delay(340)}
          >
            <Button href="/catalog" variant="inverse" size="lg">
              Смотреть коллекцию
            </Button>
            <Button href="/about" variant="secondary" size="lg">
              О бренде
            </Button>
          </div>

          <p
            className="motion-enter t-caption mt-14 flex items-center gap-4"
            style={delay(440)}
          >
            <span className="h-px w-10 bg-strong" aria-hidden="true" />
            Коллекция 01 · съёмка сезона
          </p>
        </div>
      </div>

      {/* Ҳошия закрывает первый экран и передаёт страницу дальше */}
      <OrnamentBand
        motif="dandona"
        height={12}
        className="absolute inset-x-0 bottom-0 rotate-180"
      />
    </section>
  );
}
