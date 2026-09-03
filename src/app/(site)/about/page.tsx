import Link from "next/link";

import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { categoryTitle } from "@/lib/i18n/labels";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { catalog } from "@/lib/catalog";
import { contact, socialLinks } from "@/lib/config/site";
import { photo } from "@/lib/photos";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.meta.about, description: t.meta.siteDescription };
}

/**
 * Страница о доме. Здесь только подтверждённое: строки из логотипа и
 * профиля, город, контакты, разделы каталога. Истории основания, годов
 * работы, мастеров и наград нет — клиент их не передавал, а придумывать
 * биографию бренда нельзя.
 */
export default async function AboutPage() {
  const locale = await getLocale();
  const [categories, t] = await Promise.all([
    catalog().listCategories(),
    getDictionary(),
  ]);

  return (
    <>
      <Section rhythm="block">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-[var(--gutter)]">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="t-label-wide text-gold-ink">
                  {t.pages.aboutLabel}
                </p>
                <h1 className="t-display-2 mt-5 text-balance">
                  {t.pages.aboutTitle}
                </h1>
                <span
                  aria-hidden="true"
                  className="hoshiya-line mt-7 max-w-[6rem]"
                />
                <p className="t-lead mt-7 max-w-[36ch]">
                  {t.common.tagline}. {t.common.positioning}.
                </p>
                <p className="t-body-sm mt-4 text-ink-secondary">
                  {t.common.city}
                </p>
              </Reveal>
            </div>
            <Reveal
              className="mt-10 lg:col-span-7 lg:col-start-6 lg:mt-0 lg:-mr-[var(--gutter)]"
              delay={80}
            >
              <div
                className="motion-drift relative"
                style={{ "--drift": "4%" } as never}
              >
                <Media
                  image={photo("heritage-tajik-bride-editorial", t.alts.hero)}
                  ratio="auto"
                  radius="block"
                  zoomOnHover={false}
                  sizes="(min-width: 1024px) 58vw, 92vw"
                  className="h-[46svh] min-h-[300px] shadow-float lg:h-[64svh] lg:min-h-[440px]"
                />
                <span
                  aria-hidden="true"
                  data-open="right"
                  className="toqcha -bottom-3 -left-3 -top-3 right-10 sm:-bottom-4 sm:-left-4 sm:-top-4 sm:right-16"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <div className="lg:grid lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <Reveal className="lg:col-span-4">
              <h2 className="t-h2">{t.pages.aboutWhat}</h2>
              <p className="t-body-sm mt-4 max-w-[34ch] text-ink-secondary">
                {t.pages.aboutWhatNote}
              </p>
            </Reveal>
            <Reveal className="mt-8 lg:col-span-8 lg:mt-0" delay={80}>
              <ul className="flex flex-col border-t border-hairline">
                {categories.map((c) => (
                  <li key={c.slug} className="border-b border-hairline">
                    <Link
                      href={`/catalog/${c.slug}`}
                      className="tap-row flex items-baseline justify-between gap-6 py-4 hover:text-ink-accent"
                    >
                      <span className="t-h3">{categoryTitle(c, locale)}</span>
                      {(locale === "tg" ? c.title : c.titleTg) ? (
                        <span className="t-label text-ink-muted">
                          {locale === "tg" ? c.title : c.titleTg}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section rhythm="block">
        <Container>
          <Aivan
            surface="green"
            pad="block"
            ornament="corner"
            ornamentOrigin={[100, 100]}
          >
            <div className="grid gap-10 md:grid-cols-3">
              <Reveal>
                <h2 className="t-label text-ink-accent">{t.pages.aboutBuy}</h2>
                <p className="t-body-sm mt-3 text-ink-secondary">
                  {t.pages.aboutBuyNote}
                </p>
                <Link
                  href="/delivery"
                  className="tap-row text-ink hover:text-ink-accent"
                >
                  <span className="t-label motion-underline">
                    {t.pages.aboutBuyLink}
                  </span>
                </Link>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="t-label text-ink-accent">{t.pages.aboutRent}</h2>
                <p className="t-body-sm mt-3 text-ink-secondary">
                  {t.pages.aboutRentNote}
                </p>
                <Link
                  href="/rental"
                  className="tap-row text-ink hover:text-ink-accent"
                >
                  <span className="t-label motion-underline">
                    {t.pages.aboutRentLink}
                  </span>
                </Link>
              </Reveal>
              <Reveal delay={120}>
                <h2 className="t-label text-ink-accent">
                  {t.pages.aboutContact}
                </h2>
                <p className="t-body-sm mt-3 text-ink-secondary">
                  {contact.phoneName} · {contact.phoneDisplay}
                  <br />
                  {contact.phoneSecondaryName} · {contact.phoneSecondaryDisplay}
                </p>
                <p className="mt-3 flex flex-wrap gap-x-6">
                  {socialLinks.map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="tap-row hover:text-ink-accent"
                    >
                      <span className="t-label motion-underline">
                        {s.label}
                      </span>
                    </a>
                  ))}
                </p>
              </Reveal>
            </div>
            <div className="mt-12">
              <Button href="/catalog" size="lg" arrow>
                {t.pages.seeLooks}
              </Button>
            </div>
          </Aivan>
        </Container>
      </Section>
    </>
  );
}
