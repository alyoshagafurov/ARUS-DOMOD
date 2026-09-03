import Link from "next/link";
import type { CSSProperties } from "react";

import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { Media } from "@/components/ui/Media";
import { rental } from "@/lib/config/site";
import { formatMoney } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { photo } from "@/lib/photos";

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

interface HomeHeroProps {
  /** Сколько образов в коллекции — настоящее число из базы */
  lookCount: number;
}

/**
 * Первый экран — айвон на белом дворе.
 *
 * Это не «текст слева, фото справа»: на дворе стоит зелёный объём с арочным
 * верхом, имя дома набрано больше объёма и упирается в его край, а кадр
 * невесты стоит в нише и ВЫХОДИТ из айвона вниз, на белое, — как шлейф на
 * логотипе пересекает венок. На кадре лежит плавающая карточка с условиями
 * проката: главный факт бизнеса виден в первую секунду.
 *
 * На телефоне это вертикальная сцена в том же порядке: имя → слово → кадр,
 * кадр так же свешивается за нижний край блока.
 */
export async function HomeHero({ lookCount }: HomeHeroProps) {
  const t = await getDictionary();
  const priceFrom = formatMoney({
    amount: rental.priceFromMinor,
    currency: "TJS",
  });

  return (
    <section className="relative pt-[calc(var(--header-h)+0.75rem)]">
      <Container>
        <Aivan
          surface="green"
          pad="none"
          arch
          clip={false}
          ornament="corner"
          ornamentOrigin={[0, 0]}
          className="mb-16 lg:mb-24"
        >
          <div className="relative grid grid-cols-12 gap-x-[var(--gutter)] px-[var(--block-pad)] pb-0 pt-[calc(var(--block-pad)+1.5rem)] lg:min-h-[min(82svh,820px)] lg:pb-[var(--block-pad)]">
            {/* Рейка: вертикальная подпись вдоль левого края (широкий экран) */}
            <p
              className="motion-enter t-label-wide t-vertical hidden self-end pb-2 text-ink-accent lg:col-span-1 lg:block"
              style={delay(500)}
            >
              {t.common.positioning} · {t.common.city}
            </p>

            {/* Слово */}
            <div className="col-span-12 flex flex-col justify-end lg:col-span-6 lg:col-start-2">
              <p
                className="motion-enter t-label flex items-center gap-3 text-ink-accent"
                style={delay(60)}
              >
                <span className="t-num text-[1.35rem] text-gold-ink">01</span>
                <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
                {t.misc.catalogLabel} · {t.home.facts.looks(lookCount)}
              </p>

              <h1
                className="motion-enter t-display-1 mt-6 -ml-[0.04em] lg:mt-8"
                style={delay(140)}
              >
                ARUS
                <br />
                DOMOD
              </h1>

              <p
                className="motion-enter t-lead mt-6 max-w-[30ch] lg:mt-8"
                style={delay(260)}
              >
                {t.home.heroLine} {t.home.heroSub}
              </p>

              <div
                className="motion-enter mt-8 flex flex-wrap gap-3 lg:mt-10"
                style={delay(360)}
              >
                <Button href="/catalog" size="lg" arrow>
                  {t.home.heroCta}
                </Button>
                <Button href="/rental" variant="secondary" size="lg">
                  {t.nav.rental}
                </Button>
              </div>
            </div>

            {/* Кадр в нише: выходит за нижний край айвона на белый двор */}
            <div className="relative col-span-12 mt-10 lg:col-span-4 lg:col-start-9 lg:-mr-[calc(var(--block-pad)*0.5)] lg:mt-0 lg:self-end">
              <div className="motion-veil relative -mb-12 lg:-mb-24 lg:translate-y-4">
                <span
                  aria-hidden="true"
                  data-open="bottom"
                  className="toqcha -inset-x-3 -top-3 bottom-8 lg:-inset-x-4 lg:-top-4"
                />
                <Media
                  image={photo("hero-tajik-royal-bride", t.alts.hero)}
                  ratio="portrait"
                  radius="card"
                  priority
                  zoomOnHover={false}
                  imageClassName="object-[78%_36%]"
                  sizes="(min-width: 1024px) 34vw, 92vw"
                  className="shadow-float"
                />

                {/* Плавающая карточка: условия проката — факт, а не слоган */}
                <Link
                  href="/rental"
                  className="card card--float lift group absolute -left-3 bottom-7 flex max-w-[15rem] items-center gap-4 p-4 sm:-left-6 lg:-left-10"
                  data-surface="day"
                >
                  <span className="flex flex-col gap-1">
                    <span className="t-label text-gold-ink">
                      {t.nav.rental}
                    </span>
                    <span className="t-h3">
                      {t.rental.days(rental.maxDays)} · {t.rental.from}{" "}
                      {priceFrom}
                    </span>
                    <span className="t-caption">{t.rental.inStoreShort}</span>
                  </span>
                  <ArrowIcon className="motion-arrow h-[1em] w-[1em] shrink-0 text-ink-accent" />
                </Link>
              </div>
            </div>
          </div>
        </Aivan>
      </Container>
    </section>
  );
}
