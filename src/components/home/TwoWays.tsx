import type { CSSProperties } from "react";

import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import { contact, rental } from "@/lib/config/site";
import { formatMoney } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/orders/whatsapp";
import { photo } from "@/lib/photos";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Два пути — покупка и прокат — и они намеренно не похожи.
 *
 * Покупка — зелёный айвон с движением: схема пути заказа, где золотая
 * линия прорастает через пять узлов при появлении блока. Прокат — белая
 * плавающая карточка с золотыми углами и спокойным списком условий:
 * договор в магазине, залог, три дня. Пользователь видит разницу до того,
 * как прочитал слова.
 */
export async function TwoWays() {
  const t = await getDictionary();
  const inquiry = whatsappLink(contact.phone, t.rental.inquiry);
  const priceFrom = formatMoney({
    amount: rental.priceFromMinor,
    currency: "TJS",
  });
  const terms: [string, string][] = [
    [t.rental.term, t.rental.days(rental.maxDays)],
    [t.rental.price, `${t.rental.from} ${priceFrom}`],
    [t.rental.deposit, t.rental.depositKindsText],
    [t.rental.registration, t.rental.registrationValue],
    [t.rental.deliveryRow, t.rental.deliveryValue],
    [t.rental.depositReturnRow, t.rental.depositReturnValue],
  ];

  return (
    <Section id="ways">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-x-[var(--gutter)]">
          {/* ---- ПОКУПКА ---- */}
          <Reveal className="lg:col-span-7">
            <Aivan
              surface="green"
              pad="block"
              ornament="corner"
              ornamentOrigin={[0, 100]}
            >
              <p className="t-label text-ink-accent">{t.product.purchase}</p>
              <h2 className="t-display-2 mt-5 max-w-[12ch] text-balance">
                {t.home.buyTitle}
              </h2>
              <p className="t-lead mt-5 max-w-[38ch]">{t.home.buyLead}</p>

              {/* Схема пути заказа: линия прорастает через узлы */}
              <ol className="relative mt-12 grid gap-7 sm:grid-cols-5 sm:gap-4">
                <span
                  aria-hidden="true"
                  className="motion-line motion-line--y absolute bottom-3 left-[0.4rem] top-2 w-px bg-gold/60 sm:hidden"
                />
                <span
                  aria-hidden="true"
                  className="motion-line absolute left-0 right-[20%] top-[0.42rem] hidden h-px bg-gold/60 sm:block"
                />
                {t.home.flow.map((step, index) => {
                  const last = index === t.home.flow.length - 1;
                  return (
                    <li
                      key={step}
                      className="relative flex items-start gap-4 sm:flex-col sm:gap-5"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rotate-45 border border-gold sm:mt-0",
                          last ? "bg-gold" : "bg-page",
                        )}
                      />
                      <span className="flex flex-col gap-1.5">
                        <span className="t-num text-[1.5rem] text-gold-ink">
                          {pad(index + 1)}
                        </span>
                        <span className="t-body-sm max-w-[14ch] text-ink-secondary">
                          {step}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-14">
                <Button href="/catalog" arrow>
                  {t.pages.seeLooks}
                </Button>
                <Button href="/delivery" variant="ghost">
                  {t.nav.delivery}
                </Button>
              </div>
            </Aivan>
          </Reveal>

          {/* ---- ПРОКАТ ---- */}
          <Reveal delay={140} className="lg:col-span-5 lg:mt-24">
            <div
              data-surface="day"
              className="card card--float gold-corners relative p-[var(--block-pad)]"
              style={
                {
                  "--corner-inset": "0.9rem",
                  "--corner-size": "1.5rem",
                } as CSSProperties
              }
            >
              {/* Кадр ткани лежит на углу карточки — второй слой */}
              <div className="absolute -right-3 -top-8 hidden w-28 rotate-3 lg:block">
                <Media
                  image={photo("textile-detail-couture", t.alts.textile)}
                  ratio="square"
                  radius="card"
                  zoomOnHover={false}
                  sizes="7rem"
                  className="shadow-card"
                />
              </div>

              <p className="t-label text-gold-ink">{t.product.rental}</p>
              <h2 className="t-h1 mt-5 max-w-[12ch] text-balance">
                {t.home.rentTitle}
              </h2>
              <p className="t-body-sm mt-4 text-ink-secondary">
                {t.home.rentLead}
              </p>

              <dl className="mt-8 flex flex-col">
                {terms.map(([term, value]) => (
                  <div
                    key={term}
                    className="flex items-baseline justify-between gap-6 border-t border-hairline py-3.5"
                  >
                    <dt className="t-label text-ink-muted">{term}</dt>
                    <dd className="t-body-sm text-right">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href={inquiry} external>
                  {t.home.rentalCta}
                </Button>
                <Button href="/rental" variant="ghost" arrow>
                  {t.home.rentalTerms}
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
