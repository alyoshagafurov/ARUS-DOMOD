import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n/server";
import { OrnamentField } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { contact, rental } from "@/lib/config/site";
import { formatMoney } from "@/lib/format";
import { whatsappLink } from "@/lib/orders/whatsapp";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.meta.rental, description: t.meta.siteDescription };
}

/**
 * Условия проката — дословно от клиента. Прокат через сайт не оформляется:
 * страница объясняет условия и ведёт в WhatsApp или в магазин.
 */
export default async function RentalPage() {
  const t = await getDictionary();
  const inquiry = whatsappLink(contact.phone, t.rental.inquiry);
  const terms: [string, string][] = [
    [t.rental.term, t.rental.days(rental.maxDays)],
    [
      t.rental.price,
      `${t.rental.from} ${formatMoney({ amount: rental.priceFromMinor, currency: "TJS" })}`,
    ],
    [t.rental.deposit, rental.depositKinds.join(" / ")],
    [t.rental.depositReturnRow, t.rental.depositReturnValue],
    [t.rental.registration, t.rental.registrationValue],
    [t.rental.deliveryRow, t.rental.deliveryValue],
  ];

  return (
    <>
      <Section
        surface="muted"
        className="overflow-hidden pt-[calc(var(--header-h)+2rem)]"
      >
        <OrnamentField motif="damask" />
        <Container width="narrow" className="relative">
          <Reveal>
            <p className="t-label-wide text-ink-accent">{t.nav.rental}</p>
            <h1 className="t-display-2 mt-5 max-w-[14ch] text-balance">
              {t.pages.rentalTitle}
            </h1>
            <span
              aria-hidden="true"
              className="hoshiya-line mt-7 max-w-[6rem]"
            />
            <p className="t-lead mt-7 max-w-[40ch]">{t.pages.rentalLead}</p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <div className="lg:grid lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <Reveal className="lg:col-span-7">
              <h2 className="t-h2">{t.pages.rentalTerms}</h2>
              <dl className="mt-6 flex flex-col border-t border-hairline">
                {terms.map(([k, v]) => (
                  <div
                    key={k}
                    className="grid gap-1 border-b border-hairline py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                  >
                    <dt className="t-label text-ink-muted">{k}</dt>
                    <dd className="t-body">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal
              className="mt-10 lg:col-span-4 lg:col-start-9 lg:mt-0"
              delay={80}
            >
              <div
                data-surface="green"
                className="relative border border-hairline p-6"
              >
                <p className="t-label text-ink-accent">{t.pages.rentalHow}</p>
                <ol className="t-body-sm mt-4 flex flex-col gap-3 text-ink-secondary">
                  {t.pages.rentalSteps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <div className="mt-6 flex flex-col gap-3">
                  <Button href={inquiry} external>
                    {t.rental.ask}
                  </Button>
                  <Button href="/catalog" variant="secondary">
                    {t.pages.seeLooks}
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
