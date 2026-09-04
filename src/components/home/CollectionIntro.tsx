import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Media } from "@/components/ui/Media";
import { getDictionary } from "@/lib/i18n/server";
import { photo } from "@/lib/photos";

/**
 * Манифест — белая пауза после айвона.
 *
 * Одна фраза дома антиквой во всю ширину, справа — короткий текст, слева —
 * маленький плавающий кадр ткани, который едет по прокрутке медленнее
 * страницы. Без фона и без рамки: белое здесь и есть композиция.
 */
export async function CollectionIntro() {
  const t = await getDictionary();
  return (
    <Section rhythm="block" className="pt-0">
      <Container>
        <div className="grid grid-cols-12 items-end gap-x-[var(--gutter)] gap-y-10">
          <Reveal className="col-span-12 lg:col-span-9">
            <h2 className="t-display-2 max-w-[16ch] text-balance">
              {t.editorial.traditionTitle}
            </h2>
          </Reveal>

          <Reveal
            delay={120}
            className="col-span-6 col-start-1 sm:col-span-4 lg:col-span-3 lg:col-start-1 lg:row-start-2"
          >
            <div className="motion-drift" style={{ "--drift": "4%" } as never}>
              <Media
                image={photo("textile-detail-couture", t.alts.intro)}
                ratio="square"
                radius="card"
                zoomOnHover={false}
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="shadow-card"
              />
            </div>
          </Reveal>

          <Reveal
            delay={200}
            className="col-span-12 sm:col-span-8 lg:col-span-6 lg:col-start-5 lg:row-start-2 lg:self-center"
          >
            <p className="t-lead t-measure">{t.editorial.traditionLead}</p>
            <p className="t-caption mt-5">{t.editorial.traditionNote}</p>
          </Reveal>
        </div>

        <span
          aria-hidden="true"
          className="hoshiya-seam mt-[var(--space-block-y)]"
        />
      </Container>
    </Section>
  );
}
