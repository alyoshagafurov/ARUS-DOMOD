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
 * Первый экран — тоқча посреди двора.
 *
 * Композиция осевая: всё стоит по центру, как портал айвона стоит по оси
 * двора. Порядок один на всех экранах — кадр, имя дома, обещание,
 * действие, — и меняется только пропорция купола: на телефоне высокий, на
 * широком экране пологий свод. Двух раскладок нет намеренно: они заставили
 * бы браузер решать, какой кадр грузить, уже после разбора CSS.
 *
 * За кадром стоит ПУСТАЯ золотая дуга, смещённая вверх и наружу. Это сама
 * ниша: портал в таджикском дворе всегда двойной — арка проёма и арка
 * обрамления. Она же даёт композиции глубину без единого лишнего пикселя
 * изображения и без тени, которой ночью всё равно не видно.
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
          <div className="relative flex flex-col items-center px-[var(--block-pad)] pb-[var(--block-pad)] pt-[calc(var(--block-pad)+0.5rem)] text-center">
            {/* --- КУПОЛ -------------------------------------------------
                Кадр и пустая дуга ниши вокруг него. */}
            {/*
              Размер задаётся ШИРИНОЙ, а не высотой.

              Раньше стояло `w-fit` у родителя и `h-… w-auto` у кадра: ширина
              выводилась из высоты через aspect-ratio. Chrome так умеет,
              Safari — нет: он считает fit-content без учёта пропорции, и
              портал схлопывался в полоску, а фотография исчезала. Ширина —
              направление, поддержанное везде; экран учтён третьим членом
              min(): при 4:5 высоте 44svh соответствует ширина 35svh.
            */}
            <div className="relative w-[min(88vw,26rem)] lg:w-[min(26rem,35svh)]">
              {/* Обрамляющая дуга: та же геометрия, смещённая наружу */}
              <span
                aria-hidden="true"
                className="arch-outline pointer-events-none absolute -inset-x-4 -top-5 bottom-6 sm:-inset-x-6 sm:-top-7"
              />
              <div className="motion-unveil relative">
                <Media
                  image={photo("hero-tajik-royal-bride", t.alts.hero)}
                  ratio="auto"
                  radius="arch"
                  priority
                  zoomOnHover={false}
                  imageClassName="object-[68%_22%]"
                  sizes="(min-width: 640px) 26rem, 88vw"
                  className="aspect-[4/5]"
                />
              </div>
            </div>

            {/* --- СЛОВО -------------------------------------------------- */}
            <h1
              className="motion-enter t-display-1 mt-8 lg:mt-10"
              style={delay(120)}
            >
              ARUS DOMOD
            </h1>

            <p
              className="motion-enter t-lead mt-5 max-w-[38ch] text-balance"
              style={delay(260)}
            >
              {t.home.heroLine} {t.home.heroSub}
            </p>

            <div
              className="motion-enter mt-8 flex flex-wrap justify-center gap-3"
              style={delay(360)}
            >
              <Button href="/catalog" size="lg" arrow>
                {t.home.heroCta}
              </Button>
              <Button href="/rental" variant="secondary" size="lg">
                {t.nav.rental}
              </Button>
            </div>

            {/* Факты под кнопками: настоящее число образов и условия проката */}
            <div
              className="motion-enter mt-9 w-full max-w-[42rem] border-t border-hairline pt-4"
              style={delay(460)}
            >
              <Link
                href="/rental"
                className="tap-row group justify-center gap-x-3"
              >
                <span className="t-body-sm">
                  <span className="t-label mr-2 text-ink-accent">
                    {t.nav.rental}
                  </span>
                  {t.rental.days(rental.maxDays)} · {t.rental.from} {priceFrom}{" "}
                  · {t.rental.inStoreShort}
                </span>
                <ArrowIcon className="motion-arrow h-[0.9em] w-[0.9em] shrink-0 translate-y-[0.1em] text-ink-accent" />
              </Link>
              <p className="t-caption mt-2">
                {t.home.facts.looks(lookCount)} · {t.common.positioning} ·{" "}
                {t.common.city}
              </p>
            </div>
          </div>
        </Aivan>
      </Container>
    </section>
  );
}
