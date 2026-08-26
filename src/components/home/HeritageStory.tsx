import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Media } from "@/components/ui/Media";
import { photo } from "@/lib/photos";

/** Три слова, ради которых на витрине вообще нужна таджикская типографика */
const pillars = [
  { tg: "Мерос", ru: "Наследие", note: "Основа визуального языка" },
  { tg: "Ҳунар", ru: "Ремесло", note: "Работа, которую видно вблизи" },
  { tg: "Зебоӣ", ru: "Красота", note: "Силуэт сегодняшнего дня" },
];

/**
 * Редакционный разворот о культуре свадьбы. Кадр уходит за левый край
 * экрана, текст стоит правой колонкой — противоположно hero, чтобы страница
 * не читалась как чередование одинаковых блоков.
 *
 * Орнамент здесь ровно один — кайма чорхона по краям секции. Третьего
 * декоративного элемента у блока быть не должно.
 */
const heritageImage = photo(
  "heritage-tajik-bride-editorial",
  "Невеста в свадебном образе ARUS DOMOD на торжестве",
);

export function HeritageStory() {
  return (
    <Section surface="night" edge="both" edgeMotif="chorkhona">
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
      </div>

      <Container className="relative">
        <div className="lg:grid lg:grid-cols-12">
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="t-label text-ink-secondary">Мерос · наследие</p>
              <h2 className="t-display-2 mt-7 text-balance">
                Свадьба, которую помнят поколения
              </h2>
            </Reveal>

            {/* На мобильном кадр встаёт в поток, а не исчезает */}
            <Reveal className="mt-10 lg:hidden" delay={60}>
              <Media
                image={heritageImage}
                ratio="editorial"
                zoomOnHover={false}
                /* Кадр внутри Container и живёт только до lg: 100vw просил бы
                   ступень на размер больше, чем нужно. */
                sizes="(min-width: 640px) 90vw, 88vw"
              />
            </Reveal>

            <Reveal delay={100}>
              <p className="t-lead t-measure mt-9">
                Мы не реконструируем обряд и не пересказываем его историю. Наша
                работа — показать образ так, как его видят в день свадьбы:
                целиком, в движении и при своём свете.
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
