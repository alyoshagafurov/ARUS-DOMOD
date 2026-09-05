import type { CSSProperties } from "react";

import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { getDictionary } from "@/lib/i18n/server";
import { photo } from "@/lib/photos";

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

interface HomeHeroProps {
  /** Сколько образов в коллекции — настоящее число из базы */
  lookCount: number;
}

/**
 * Первый экран — встреча.
 *
 * Человек, открывший сайт, за одну секунду должен увидеть три вещи: знак
 * дома (он в шапке), обещание и одежду. Поэтому кадр здесь не предмет в
 * нише, а СРЕДА: он заполняет весь айвон, а слово стоит на нём по оси.
 *
 * Завеса — не «затемнение фото», а тот же цвет, что и стены айвона.
 * Фотография уходит под зелень двора и становится его глубиной; текст
 * лежит на однородном поле и читается при любом кадре. Это принципиально:
 * на съёмке есть и светлый песок, и тёмный бархат, и без завесы строка
 * теряла бы контраст ровно там, где кадр интереснее всего.
 *
 * Два начертания работают вместе: обещание набрано витринной антиквой,
 * пояснение — рабочей гарнитурой. Разный голос отделяет то, что человек
 * почувствует, от того, что ему нужно знать.
 *
 * Заголовок говорит о пользе, а не о сайте. «Каталог образов для покупки
 * и проката» описывал витрину; невеста приходит не за каталогом.
 *
 * Кнопка одна. Вторая («Прокат») уводила в сторону раньше, чем человек
 * успел посмотреть хоть один образ, — прокат ждёт его отдельной секцией
 * ниже и отдельной страницей.
 */
export async function HomeHero({ lookCount }: HomeHeroProps) {
  const t = await getDictionary();

  return (
    <section className="relative pt-[calc(var(--header-h)+0.75rem)]">
      <Container>
        <Aivan
          surface="green"
          pad="none"
          arch
          ornament="corner"
          ornamentOrigin={[0, 0]}
          className="relative isolate mb-16 overflow-hidden lg:mb-24"
        >
          {/* --- КАДР: среда, а не предмет ------------------------------- */}
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <Media
              image={photo("hero-tajik-royal-bride", t.alts.hero)}
              ratio="auto"
              radius="none"
              priority
              zoomOnHover={false}
              imageClassName="object-[68%_16%] lg:object-[70%_20%]"
              sizes="100vw"
              className="h-full"
            />

            {/*
              Завеса работает ТОЛЬКО внизу, под словом.

              Сначала я закрыл кадр ровной зелёной пеленой, потом пятном в
              центре — оба раза текст читался, но платье превращалось в
              плоское зелёное пятно. На сайте дома моды это потеря дороже
              выигрыша: человек пришёл смотреть одежду.

              Поэтому верхние две трети снимка не тронуты вовсе — лицо,
              вышивка и цвет бархата видны как есть, — а плотность растёт
              только к низу, где стоит слово. Цвет завесы — стены айвона,
              чёрного нет ни грамма: он выбелил бы бирюзу.
            */}
            <span className="absolute inset-0 bg-gradient-to-t from-[var(--firuza-900)] from-[18%] via-[var(--firuza-900)]/72 via-[46%] to-transparent to-[72%]" />
            {/* Тонкая ровная дымка сверху — только чтобы шапка не спорила
                со светлой архитектурой на снимке */}
            <span className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--firuza-900)]/55 to-transparent" />
          </div>

          {/* --- СЛОВО --------------------------------------------------- */}
          <div className="relative flex min-h-[76svh] flex-col items-center justify-end px-[var(--block-pad)] pb-[var(--block-pad)] pt-[calc(var(--block-pad)+2rem)] text-center lg:min-h-[min(86svh,900px)]">
            <h1
              className="motion-enter t-display-2 max-w-[16ch] text-balance"
              style={delay(120)}
            >
              {t.home.heroLine}
            </h1>

            {/* Рабочая гарнитура против витринной антиквы заголовка */}
            <p
              className="motion-enter t-lead mt-5 max-w-[42ch] text-balance font-sans text-ink-primary lg:mt-6"
              style={delay(260)}
            >
              {t.home.heroSub}
            </p>

            <div className="motion-enter mt-8 lg:mt-10" style={delay(380)}>
              <Button href="/catalog" size="lg" arrow>
                {t.home.heroCta}
              </Button>
            </div>

            {/* Настоящее число из базы — тихой строкой под действием */}
            <p className="motion-enter t-caption mt-6" style={delay(480)}>
              {t.home.facts.looks(lookCount)} · {t.common.positioning}
            </p>
          </div>
        </Aivan>
      </Container>
    </section>
  );
}
