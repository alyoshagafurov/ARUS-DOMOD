import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { OrnamentField } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { catalog } from "@/lib/catalog";
import { contact, site, socialLinks } from "@/lib/config/site";
import { photo } from "@/lib/photos";

export const metadata = {
  title: "О ARUS DOMOD",
  description: `${site.tagline}. ${site.positioning}. ${site.city}.`,
};

/**
 * Страница о доме. Здесь только подтверждённое: строки из логотипа и
 * профиля, город, контакты, разделы каталога. Истории основания, годов
 * работы, мастеров и наград нет — клиент их не передавал, а придумывать
 * биографию бренда нельзя.
 */
export default async function AboutPage() {
  const categories = await catalog().listCategories();

  return (
    <>
      <Section surface="muted" className="overflow-hidden pt-[calc(var(--header-h)+2rem)]">
        <OrnamentField motif="damask" />
        <Container className="relative">
          <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-[var(--gutter)]">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="t-label-wide text-ink-accent">О ARUS DOMOD</p>
                <h1 className="t-display-2 mt-5 text-balance">Для самых красивых невест</h1>
                <span aria-hidden="true" className="hoshiya-line mt-7 max-w-[6rem]" />
                <p className="t-lead mt-7 max-w-[36ch]">{site.tagline}. {site.positioning}.</p>
                <p className="t-body-sm mt-4 text-ink-secondary">{site.city}</p>
              </Reveal>
            </div>
            <Reveal className="mt-10 lg:col-span-7 lg:col-start-6 lg:mt-0 lg:-mr-[var(--gutter)]" delay={80}>
              <div className="relative">
                <Media
                  image={photo("heritage-tajik-bride-editorial", "Невеста в свадебном образе ARUS DOMOD")}
                  ratio="auto"
                  zoomOnHover={false}
                  sizes="(min-width: 1024px) 58vw, 92vw"
                  className="h-[46svh] min-h-[300px] rounded-none lg:h-[64svh] lg:min-h-[440px]"
                />
                <span aria-hidden="true" data-open="right" className="toqcha -bottom-3 -left-3 -top-3 right-10 sm:-bottom-4 sm:-left-4 sm:-top-4 sm:right-16" />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <div className="lg:grid lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <Reveal className="lg:col-span-4">
              <h2 className="t-h2">Что здесь есть</h2>
              <p className="t-body-sm mt-4 max-w-[34ch] text-ink-secondary">
                Образы можно купить или взять напрокат. Прокат оформляется в магазине.
              </p>
            </Reveal>
            <Reveal className="mt-8 lg:col-span-8 lg:mt-0" delay={80}>
              <ul className="flex flex-col border-t border-hairline">
                {categories.map((c) => (
                  <li key={c.slug} className="border-b border-hairline">
                    <Link href={`/catalog/${c.slug}`} className="tap-row flex items-baseline justify-between gap-6 py-4 hover:text-ink-accent">
                      <span className="t-h3">{c.title}</span>
                      {c.titleTg ? <span className="t-label text-ink-muted">{c.titleTg}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section surface="muted" edge="top">
        <Container width="narrow">
          <div className="grid gap-10 md:grid-cols-3">
            <Reveal>
              <h2 className="t-label text-ink-accent">Покупка</h2>
              <p className="t-body-sm mt-3 text-ink-secondary">Заказ с сайта, подтверждение администратором, оплата после подтверждения.</p>
              <Link href="/delivery" className="t-label motion-underline mt-4 inline-block">Как это работает</Link>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="t-label text-ink-accent">Прокат</h2>
              <p className="t-body-sm mt-3 text-ink-secondary">До 3 дней, от 100 сомони, залог. Оформляется в магазине.</p>
              <Link href="/rental" className="t-label motion-underline mt-4 inline-block">Условия проката</Link>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="t-label text-ink-accent">Связаться</h2>
              <p className="t-body-sm mt-3 text-ink-secondary">
                {contact.phoneName} · {contact.phoneDisplay}<br />
                {contact.phoneSecondaryName} · {contact.phoneSecondaryDisplay}
              </p>
              <p className="mt-4 flex flex-wrap gap-4">
                {socialLinks.map((s) => (
                  <a key={s.href} href={s.href} target="_blank" rel="noreferrer noopener" className="t-label motion-underline">{s.label}</a>
                ))}
              </p>
            </Reveal>
          </div>
          <div className="mt-12">
            <Button href="/catalog" size="lg">Смотреть образы</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
