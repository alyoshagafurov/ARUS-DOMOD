import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { OrnamentField } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { site } from "@/lib/config/site";
import { photo } from "@/lib/photos";

/**
 * Финал: кадр пары справа, приглашение слева, одна кнопка.
 *
 * Затемняющей подложки здесь больше нет. Раньше кадр лежал во всю ширину, а
 * поверх него — градиент плотностью 0.88, иначе текст не читался. Теперь
 * фотография занимает собственную нишу справа, текст стоит на чистой
 * бирюзе слева, и служебное затемнение стало не нужно вовсе.
 *
 * Композиция замыкает страницу на hero: там кадр тоже справа и тоже уходит
 * за край, только ниша разомкнута в другую сторону.
 */
export function ClosingInvitation() {
  return (
    <section
      data-surface="night"
      className="relative isolate overflow-hidden py-[var(--space-section-y)]"
    >
      <OrnamentField motif="damask" />

      <span
        aria-hidden="true"
        className="hoshiya-line absolute inset-x-0 top-0"
      />

      <Container className="relative">
        <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-[var(--gutter)]">
          <Reveal className="lg:col-span-5">
            <p className="t-label text-ink-accent">
              {site.name} · {site.city}
            </p>
            <h2 className="t-display-2 mt-7 max-w-[14ch] text-balance">
              Найдите образ для своего дня.
            </h2>
            <span
              aria-hidden="true"
              className="hoshiya-line mt-8 max-w-[6rem]"
            />
            <p className="t-lead mt-8 max-w-[34ch]">
              Продажа и прокат в национальном стиле.
            </p>
            <div className="mt-10">
              <Button href="/catalog" size="lg">
                Открыть коллекцию
              </Button>
            </div>
          </Reveal>

          <Reveal
            className="mt-[var(--space-silence)] lg:col-span-7 lg:col-start-6 lg:mt-0 lg:-mr-[var(--gutter)]"
            delay={100}
          >
            <div className="relative">
              <Media
                image={photo(
                  "final-tajik-bridal-editorial",
                  "Жених и невеста в светлых свадебных образах ARUS DOMOD",
                )}
                ratio="auto"
                zoomOnHover={false}
                sizes="(min-width: 1024px) 58vw, 92vw"
                /*
                 * Пара стоит в правой половине кадра (невеста ≈x1000,
                 * жених ≈x1330 из 1600). В нише на телефоне видно 616px
                 * исходника, на широком экране 1141 — обе точки посчитаны
                 * по коробке, а не подобраны, иначе в кадр не попадает
                 * никто.
                 */
                imageClassName="object-[86%_center] lg:object-[92%_center]"
                className="h-[44svh] min-h-[280px] rounded-none lg:h-[62svh] lg:min-h-[420px]"
              />
              <span
                aria-hidden="true"
                data-open="right"
                className="toqcha -bottom-3 -left-3 -top-3 right-10 sm:-bottom-4 sm:-left-4 sm:-top-4 sm:right-16"
              />
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Нижнего шва здесь нет намеренно: его роль берёт кайма подвала,
          иначе две каймы встали бы вплотную друг к другу. */}
    </section>
  );
}
