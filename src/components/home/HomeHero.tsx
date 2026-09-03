import type { CSSProperties } from "react";

import { Container } from "@/components/layout/Container";
import { OrnamentField } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";

import { getDictionary } from "@/lib/i18n/server";
import { photo } from "@/lib/photos";

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

/**
 * Первый экран — логотип, увеличенный до размера окна.
 *
 * Порядок разложен прямо со знака: поле бирюзы → кадр в нише → полоса
 * тишины → имя дома → чем он занимается. В логотипе между знаком и словом
 * лежит 11% высоты пустоты; здесь она такая же и служит композицией, а не
 * отступом.
 *
 * Кадр живёт в ТОҚЧА — нише из золотой волосяной линии, РАЗОМКНУТОЙ с одной
 * стороны: рамка смещена наружу сверху и слева, а справа её нет вовсе, и
 * фотография уходит за границу. Это прямая цитата венка со знака — он тоже
 * открыт, и шлейф невесты пересекает его край.
 *
 * Затемняющих подложек здесь нет ни одной. Текст не лежит поверх кадра, а
 * стоит рядом на чистой бирюзе; шапка тоже не заезжает на фотографию —
 * секция начинается ниже её высоты, поэтому градиент ради читаемости
 * не потребовался.
 *
 * На телефоне это не сжатый десктоп: композиция вертикальная и идёт ровно в
 * порядке логотипа. На широком экране колонки расходятся, кадр встаёт справа
 * и продолжается за край окна.
 */
export async function HomeHero() {
  const t = await getDictionary();
  return (
    <section
      data-surface="green"
      className="relative isolate overflow-hidden pb-[var(--space-section-y)] pt-[calc(var(--header-h)+1rem)] lg:pt-[calc(var(--header-h)+3rem)]"
    >
      {/* Растительный дамаск — грунт поля, а не рисунок поверх него */}
      <OrnamentField motif="damask" />

      <Container className="relative">
        <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-[var(--gutter)]">
          {/* --- КАДР В НИШЕ ---------------------------------------------
              На телефоне идёт первым: у логотипа знак тоже стоит над словом,
              и фотография остаётся главным содержанием первого экрана. */}
          <div className="order-1 lg:order-2 lg:col-span-7 lg:col-start-6 lg:-mr-[var(--gutter)]">
            <div className="motion-veil relative">
              <Media
                image={photo(
                  "hero-tajik-royal-bride",
                  "Невеста в свадебном образе ARUS DOMOD",
                )}
                ratio="auto"
                priority
                zoomOnHover={false}
                /* Невеста занимает правые две трети кадра (в исходнике
                   1334×1179 её фигура это x 580–1290), поэтому
                   центрированный object-cover резал бы её пополам. Точка
                   обрезки сохранена с проверенной версии. */
                imageClassName="object-[80%_40%] xl:object-[78%_center]"
                sizes="(min-width: 1024px) 58vw, 92vw"
                className="h-[40svh] min-h-[280px] rounded-none lg:h-[74svh] lg:min-h-[520px]"
              />

              {/* Тоқча: рамка вынесена НАРУЖУ кадра с трёх сторон — только
                  так волосяная линия видна на бирюзе, а не теряется в
                  фотографии. Справа её нет вовсе: туда кадр и уходит. */}
              <span
                aria-hidden="true"
                data-open="right"
                className="toqcha -bottom-3 -left-3 -top-3 right-10 sm:-bottom-4 sm:-left-4 sm:-top-4 sm:right-16"
              />
            </div>
          </div>

          {/* --- СЛОВО ---------------------------------------------------- */}
          <div className="order-2 pt-6 lg:order-1 lg:col-span-5 lg:pt-0">
            <p
              className="motion-enter t-label-wide text-ink-accent"
              style={delay(60)}
            >
              {t.common.tagline}
            </p>

            <h1
              className="motion-enter t-display-1 mt-4 leading-[0.94] tracking-[0.02em] lg:mt-5"
              style={delay(140)}
            >
              ARUS <br />
              DOMOD
            </h1>

            {/* Волосяная линия вместо отбивки: единственный разделитель системы */}
            <span
              aria-hidden="true"
              className="motion-enter hoshiya-line mt-5 max-w-[7rem] lg:mt-7 lg:max-w-[calc(100%+var(--gutter))]"
              style={delay(200)}
            />

            <p
              className="motion-enter t-h3 mt-5 font-sans font-medium tracking-normal lg:mt-7"
              style={delay(240)}
            >
              {t.home.heroLine}
            </p>

            <p
              className="motion-enter t-lead mt-3 max-w-[34ch]"
              style={delay(300)}
            >
              {t.home.heroSub}
            </p>

            <div className="motion-enter mt-7 lg:mt-9" style={delay(380)}>
              <Button href="/catalog" size="lg">
                {t.home.heroCta}
              </Button>
            </div>

            <p
              className="motion-enter t-caption mt-8 flex items-center gap-3"
              style={delay(460)}
            >
              <span aria-hidden="true" className="h-px w-8 bg-strong" />
              {t.common.positioning} · {t.common.city}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
