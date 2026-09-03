import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { Media } from "@/components/ui/Media";
import { LOCALES } from "@/lib/i18n";
import { rental } from "@/lib/config/site";
import { getDictionary } from "@/lib/i18n/server";
import { photo } from "@/lib/photos";

interface HeritageStoryProps {
  lookCount: number;
  sectionCount: number;
}

/**
 * История дома — кадр и айвон внахлёст.
 *
 * Квадратный кадр торжества стоит слева и едет по прокрутке медленнее
 * страницы; зелёный айвон справа сдвинут вниз и заходит под кадр. Два слоя,
 * два ритма — так читается глубина, а не «фото и текст рядом».
 *
 * Цифры внизу настоящие: образы и разделы — из базы, дни проката — из
 * условий клиента, языки — из словаря. Выдуманных «лет на рынке» здесь нет.
 */
export async function HeritageStory({
  lookCount,
  sectionCount,
}: HeritageStoryProps) {
  const t = await getDictionary();
  const facts: [number, string][] = [
    [lookCount, t.home.facts.looks(lookCount).replace(/^\d+\s*/, "")],
    [sectionCount, t.home.facts.sections(sectionCount).replace(/^\d+\s*/, "")],
    [rental.maxDays, t.home.facts.days(rental.maxDays).replace(/^\d+\s*/, "")],
    [
      LOCALES.length,
      t.home.facts.languages(LOCALES.length).replace(/^\d+\s*/, ""),
    ],
  ];

  return (
    <Section id="heritage">
      <Container>
        <div className="relative lg:grid lg:grid-cols-12 lg:items-start">
          <Reveal className="relative z-10 lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:pt-10">
            <div
              className="motion-drift relative"
              style={{ "--drift": "5%" } as never}
            >
              <span
                aria-hidden="true"
                data-open="right"
                className="toqcha -inset-y-4 -left-4 right-10"
              />
              <Media
                image={photo("heritage-tajik-bride-editorial", t.alts.heritage)}
                ratio="square"
                radius="block"
                zoomOnHover={false}
                sizes="(min-width: 1024px) 46vw, 92vw"
                className="shadow-float"
              />
            </div>
          </Reveal>

          <Aivan
            surface="green"
            pad="block"
            ornament="corner"
            ornamentOrigin={[100, 100]}
            className="-mt-12 lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:mt-28 lg:pl-[calc(var(--block-pad)+9%)]"
          >
            <Reveal className="pt-8 lg:pt-0">
              <p className="t-label text-ink-accent">
                {t.editorial.heritageLabel}
              </p>
              <h2 className="t-display-2 mt-6 max-w-[12ch] text-balance">
                {t.editorial.heritageTitle}
              </h2>
              <p className="t-lead mt-6 max-w-[42ch]">
                {t.editorial.heritageLead}
              </p>
            </Reveal>

            <Reveal delay={120} className="mt-10 lg:mt-14">
              <span aria-hidden="true" className="hoshiya-line" />
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
                {facts.map(([value, label]) => (
                  <div key={label} className="flex flex-col gap-2">
                    <dt className="t-caption order-2">{label}</dt>
                    <dd className="t-num order-1 text-[clamp(2.5rem,5vw,4rem)] text-gold-ink">
                      <CountUp value={value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </Aivan>
        </div>
      </Container>
    </Section>
  );
}
