import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Media } from "@/components/ui/Media";
import { photo } from "@/lib/photos";

/**
 * Переход между кампанией и магазином. Здесь нет ни одного товара —
 * только воздух, одно утверждение и один крупный план ткани.
 */
export function CollectionIntro() {
  return (
    <Section>
      <Container>
        <div className="grid gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="t-label text-ink-muted">Дом ARUS DOMOD</p>
          </Reveal>

          <Reveal className="lg:col-span-8 lg:col-start-5" delay={80}>
            <h2 className="t-h1 max-w-[18ch]">
              Традиция, переосмысленная для сегодня.
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-[var(--gutter)] gap-y-12 lg:mt-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-4 lg:col-start-5" delay={40}>
            <p className="t-lead t-measure">
              Коллекция собрана как единый сезон: каждый выход снят целиком,
              чтобы было видно посадку, длину и то, как вещь ведёт себя в
              движении.
            </p>
            <p className="t-body-sm mt-6 max-w-[42ch] text-ink-secondary">
              Описания изделий появятся здесь вместе с данными бренда.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-3 lg:col-start-10" delay={140}>
            <Media
              image={photo(
                "textile-detail-couture",
                "Крупный план свадебного наряда ARUS DOMOD",
              )}
              ratio="square"
              zoomOnHover={false}
              sizes="(min-width: 1024px) 22vw, 60vw"
            />
            <p className="t-caption mt-4">Фрагмент кадра коллекции</p>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
