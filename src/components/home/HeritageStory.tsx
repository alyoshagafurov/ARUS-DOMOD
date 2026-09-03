import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n/server";
import { Media } from "@/components/ui/Media";
import { photo } from "@/lib/photos";

/**
 * Редакционный разворот о культуре свадьбы. Кадр уходит за левый край
 * экрана, текст стоит правой колонкой — противоположно hero, чтобы страница
 * не читалась как чередование одинаковых блоков.
 *
 * Поверхность — поле логотипа: между двумя глубокими соседями секция
 * приподнимается, и разворот получает собственный вес.
 *
 * Декоративных элементов здесь два, и оба структурные: волосяная кайма по
 * краям секции и разомкнутая тоқча вокруг кадра. Тканых лент нет — их роль
 * забрала золотая линия.
 */
export async function HeritageStory() {
  const t = await getDictionary();
  const heritageImage = photo(
    "heritage-tajik-bride-editorial",
    t.alts.heritage,
  );
  const pillars = t.editorial.pillars;
  return (
    <Section surface="muted" edge="both" className="overflow-hidden">
      {/*
        Кадр во всю высоту секции, вне контейнера — сетка нарушена намеренно.

        Точку обрезки тут не задаём, и это проверено счётом, а не на глаз:
        исходник квадратный (1254×1254), невеста занимает x 230–1010, а в
        левую панель попадает 907px исходника из 1254. При центрированной
        обрезке окно это 174–1081 — фигура целиком внутри. То же и на
        телефоне, где кадр встаёт в поток пропорцией 4:5.
      */}
      <div className="absolute inset-y-0 left-0 hidden w-[42%] lg:block">
        <Media
          image={heritageImage}
          ratio="auto"
          zoomOnHover={false}
          sizes="42vw"
          className="h-full rounded-none"
        />
        {/* Ниша разомкнута влево — туда кадр и уходит за край окна */}
        <span
          aria-hidden="true"
          data-open="left"
          className="toqcha inset-y-10 left-0 right-8"
        />
      </div>

      <Container className="relative">
        <div className="lg:grid lg:grid-cols-12">
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="t-label text-ink-secondary">
                {t.editorial.heritageLabel}
              </p>
              <h2 className="t-display-2 mt-7 text-balance">
                {t.editorial.heritageTitle}
              </h2>
            </Reveal>

            {/* На мобильном кадр встаёт в поток, а не исчезает */}
            <Reveal className="mt-10 lg:hidden" delay={60}>
              <div className="relative">
                <Media
                  image={heritageImage}
                  ratio="editorial"
                  zoomOnHover={false}
                  /* Кадр внутри Container и живёт только до lg: 100vw просил
                     бы ступень на размер больше, чем нужно. */
                  sizes="(min-width: 640px) 90vw, 88vw"
                />
                {/* На узкой колонке ниша разрывается вниз: боковой разрыв
                    там просто не читается. */}
                <span
                  aria-hidden="true"
                  data-open="bottom"
                  className="toqcha -left-3 -right-3 -top-3 bottom-10"
                />
              </div>
            </Reveal>

            <Reveal delay={100}>
              <p className="t-lead t-measure mt-9">
                {t.editorial.heritageLead}
              </p>
            </Reveal>

            <Reveal delay={160}>
              <ul className="mt-14 flex flex-col border-t border-hairline">
                {pillars.map((item) => (
                  <li
                    key={item.tg}
                    className="flex flex-col gap-1 border-b border-hairline py-6 sm:flex-row sm:items-baseline sm:gap-8"
                  >
                    <span className="t-h2 w-40 shrink-0">{item.tg}</span>
                    <span className="t-label text-ink-muted">{item.ru}</span>
                    <span className="t-body-sm text-ink-secondary sm:ml-auto sm:text-right">
                      {item.note}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
