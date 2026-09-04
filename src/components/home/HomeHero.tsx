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
 * Первый экран — айвон на белом дворе, и в нём тоқча: купол ниши.
 *
 * Композиций две, разметка одна. Так и должно быть: два набора узлов
 * заставили бы браузер декодировать скрытый кадр заодно с видимым, а
 * телефон — платить за десктопную сцену трафиком.
 *
 * ТЕЛЕФОН. Кадр венчает нишу: он стоит первым, под собственным куполом,
 * и занимает верхнюю половину экрана — у дома моды первый экран телефона
 * обязан начинаться с одежды, а не с двух кнопок под заголовком. Имя дома
 * идёт под кадром, на чистой бирюзе. Слово поверх фотографии не кладётся
 * ни при какой завесе: под ним оказалась бы вышивка, и строка потеряла бы
 * контраст ровно там, где кадр интереснее всего.
 *
 * ШИРОКИЙ ЭКРАН. Кадр отделяется в правую колонку, встаёт под собственным
 * куполом и выходит за нижний край айвона на белое — как шлейф на знаке
 * пересекает венок. Имя дома уходит влево и набрано крупнее объёма.
 *
 * Кикера над заголовком нет: имя дома держит первый экран само. Настоящее
 * число образов и условия проката стоят под кнопками — как факты, а не как
 * надпись, которой заголовок оправдывается.
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
          <div className="relative grid grid-cols-12 gap-x-[var(--gutter)] px-[var(--block-pad)] pb-[var(--block-pad)] pt-[var(--block-pad)] lg:min-h-[min(82svh,820px)] lg:pt-[calc(var(--block-pad)+1rem)]">
            {/* --- КАДР -------------------------------------------------
                Телефон: первый ряд, купол венчает нишу.
                Широкий экран: правая колонка, свешивается за нижнюю кромку. */}
            <div className="order-1 col-span-12 lg:order-2 lg:col-span-4 lg:col-start-9 lg:-mr-[calc(var(--block-pad)*0.5)] lg:self-end">
              <div className="motion-unveil relative lg:-mb-24 lg:translate-y-4">
                <Media
                  image={photo("hero-tajik-royal-bride", t.alts.hero)}
                  ratio="auto"
                  radius="arch"
                  priority
                  zoomOnHover={false}
                  imageClassName="object-[68%_22%] lg:object-[78%_36%]"
                  sizes="(min-width: 1024px) 34vw, 92vw"
                  className="h-[46svh] min-h-[300px] lg:aspect-[var(--ratio-portrait)] lg:h-auto lg:min-h-0 lg:shadow-float"
                />
              </div>
            </div>

            {/* --- СЛОВО ------------------------------------------------ */}
            <div className="order-2 col-span-12 mt-8 flex flex-col justify-end lg:order-1 lg:col-span-7 lg:col-start-1 lg:mt-0 lg:justify-center">
              <h1
                className="motion-enter t-display-1 -ml-[0.04em]"
                style={delay(120)}
              >
                ARUS
                <br />
                DOMOD
              </h1>

              <p
                className="motion-enter t-lead mt-5 max-w-[30ch] lg:mt-8"
                style={delay(260)}
              >
                {t.home.heroLine} {t.home.heroSub}
              </p>

              <div
                className="motion-enter mt-7 flex flex-wrap gap-3 lg:mt-10"
                style={delay(360)}
              >
                <Button href="/catalog" size="lg" arrow>
                  {t.home.heroCta}
                </Button>
                <Button href="/rental" variant="secondary" size="lg">
                  {t.nav.rental}
                </Button>
              </div>

              {/* Факты под кнопками: настоящее число образов и условия
                  проката. Строка на золотой нити — не карточка поверх кадра. */}
              <div
                className="motion-enter mt-8 border-t border-hairline pt-4 lg:mt-10"
                style={delay(460)}
              >
                <Link href="/rental" className="tap-row group gap-x-3">
                  <span className="t-body-sm">
                    <span className="t-label mr-2 text-ink-accent">
                      {t.nav.rental}
                    </span>
                    {t.rental.days(rental.maxDays)} · {t.rental.from}{" "}
                    {priceFrom} · {t.rental.inStoreShort}
                  </span>
                  <ArrowIcon className="motion-arrow h-[0.9em] w-[0.9em] shrink-0 translate-y-[0.1em] text-ink-accent" />
                </Link>
                <p className="t-caption mt-2">
                  {t.home.facts.looks(lookCount)} · {t.common.positioning} ·{" "}
                  {t.common.city}
                </p>
              </div>
            </div>
          </div>
        </Aivan>
      </Container>
    </section>
  );
}
