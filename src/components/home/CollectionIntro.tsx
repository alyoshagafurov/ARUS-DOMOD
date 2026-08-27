import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { OrnamentField } from "@/components/ornament/Ornament";
import { Media } from "@/components/ui/Media";
import { photo } from "@/lib/photos";

/**
 * Разворот о материале — первый после hero, и первая смена поверхности:
 * с поля логотипа страница уходит на глубокую бирюзу.
 *
 * Это не карточка с картинкой, а редакционный крупный план. Кадр занимает
 * семь колонок из двенадцати, уходит за левый край окна и выше границы
 * ниши — так, как смотрят на ткань вблизи: вышивку, нить, плотность.
 * Товаров здесь нет ни одного, и это намеренно.
 *
 * Тоқча разомкнута влево: кадр выходит за неё и за экран одновременно.
 */
export function CollectionIntro() {
  return (
    <Section surface="night" className="overflow-hidden">
      <OrnamentField motif="damask" />

      <Container className="relative">
        <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-[var(--gutter)]">
          {/* --- КРУПНЫЙ ПЛАН ------------------------------------------- */}
          <Reveal className="lg:col-span-7 lg:-ml-[var(--gutter)]">
            <div className="relative">
              <Media
                image={photo(
                  "textile-detail-couture",
                  "Крупный план свадебного наряда ARUS DOMOD",
                )}
                ratio="auto"
                zoomOnHover={false}
                sizes="(min-width: 1024px) 58vw, 92vw"
                className="h-[46svh] min-h-[300px] rounded-none lg:h-[68svh] lg:min-h-[460px]"
              />
              <span
                aria-hidden="true"
                data-open="left"
                className="toqcha -bottom-3 -right-3 -top-3 left-10 sm:-bottom-4 sm:-right-4 sm:-top-4 sm:left-16"
              />
            </div>
          </Reveal>

          {/* --- СЛОВО --------------------------------------------------- */}
          <div className="pt-[var(--space-silence)] lg:col-span-4 lg:col-start-9 lg:pt-0">
            <Reveal>
              <p className="t-label text-ink-accent">Дом ARUS DOMOD</p>
              <h2 className="t-h1 mt-6 max-w-[16ch] text-balance">
                Традиция, переосмысленная для сегодня.
              </h2>
            </Reveal>

            <Reveal delay={90}>
              <span
                aria-hidden="true"
                className="hoshiya-line mt-8 max-w-[5rem]"
              />
              <p className="t-lead t-measure mt-8">
                Каждый выход снят целиком: видно посадку, длину и то, как вещь
                ведёт себя в движении.
              </p>
              <p className="t-body-sm mt-5 max-w-[38ch] text-ink-secondary">
                Описания изделий появятся здесь вместе с данными бренда.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
