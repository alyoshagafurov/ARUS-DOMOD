import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n/server";

/** Путь заказа — по процессу, описанному клиентом. Без сроков и обещаний. */
export async function HowItWorksSteps() {
  const { steps } = await getDictionary();
  return (
    <ol className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((s, i) => (
        <li key={s.title} className="bg-page p-5">
          <span className="t-price text-ink-accent">0{i + 1}</span>
          <h3 className="t-h3 mt-3">{s.title}</h3>
          <p className="t-caption mt-2">{s.note}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * Как купить. Пять шагов — как решётка с золотыми швами: не пять карточек,
 * а одно поле, разделённое волосяными линиями.
 */
export async function HowItWorks() {
  const t = await getDictionary();
  return (
    <Section edge="top">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="t-label text-ink-accent">{t.home.howLabel}</p>
            <h2 className="t-h1 mt-4 max-w-[16ch] text-balance">
              {t.home.howTitle}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <Link
              href="/delivery"
              className="t-label motion-underline text-ink-secondary"
            >
              {t.nav.delivery}
            </Link>
          </Reveal>
        </div>
        <Reveal className="mt-10" delay={120}>
          <HowItWorksSteps />
        </Reveal>
      </Container>
    </Section>
  );
}
