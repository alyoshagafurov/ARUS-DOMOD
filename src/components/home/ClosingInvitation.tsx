import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { getDictionary } from "@/lib/i18n/server";
import { photo } from "@/lib/photos";

/**
 * Финальный кадр кампании: широкий разворот пары, а поверх него — белая
 * плавающая карточка с одной фразой и одной кнопкой. Кадр едет по
 * прокрутке внутри скруглённого объёма; затемнений нет — текст лежит не
 * на фотографии, а на своей карточке.
 */
export async function ClosingInvitation() {
  const t = await getDictionary();
  return (
    <Section rhythm="block">
      <Container>
        <Reveal>
          <Aivan surface="night" pad="none" className="relative">
            <div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-[21/9]">
              <div
                className="motion-drift absolute -inset-y-[8%] inset-x-0"
                style={{ "--drift": "-6%" } as never}
              >
                <Media
                  image={photo("final-tajik-bridal-editorial", t.alts.closing)}
                  ratio="auto"
                  radius="none"
                  zoomOnHover={false}
                  imageClassName="object-[50%_30%]"
                  sizes="(min-width: 1440px) 1440px, 100vw"
                  className="h-full"
                />
              </div>

              <div
                data-surface="day"
                className="card card--float absolute inset-x-4 bottom-4 flex flex-col gap-5 p-6 sm:inset-x-auto sm:left-[var(--block-pad)] sm:bottom-[var(--block-pad)] sm:max-w-[26rem] lg:p-8"
              >
                <p className="t-label text-gold-ink">{t.misc.catalogLabel}</p>
                <h2 className="t-h1 text-balance">{t.home.closingTitle}</h2>
                <div>
                  <Button href="/catalog" arrow>
                    {t.home.closingCta}
                  </Button>
                </div>
              </div>
            </div>
          </Aivan>
        </Reveal>
      </Container>
    </Section>
  );
}
