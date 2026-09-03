import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n/server";
import { Button } from "@/components/ui/Button";
import { HowItWorksSteps } from "@/components/home/HowItWorks";
import { contact } from "@/lib/config/site";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.meta.delivery, description: t.meta.siteDescription };
}

/**
 * Получение заказа. Ни зон, ни сроков, ни тарифов — их клиент не
 * передавал: стоимость доставки согласуется отдельно при подтверждении.
 */
export default async function DeliveryPage() {
  const t = await getDictionary();
  return (
    <>
      <Section rhythm="block">
        <Container width="narrow">
          <Reveal>
            <p className="t-label-wide text-gold-ink">
              {t.pages.deliveryLabel}
            </p>
            <h1 className="t-display-2 mt-5 max-w-[14ch] text-balance">
              {t.pages.deliveryTitle}
            </h1>
            <span
              aria-hidden="true"
              className="hoshiya-line mt-7 max-w-[6rem]"
            />
            <p className="t-lead mt-7 max-w-[40ch]">{t.pages.deliveryLead}</p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <Reveal>
            <h2 className="t-h2">{t.pages.deliveryHow}</h2>
          </Reveal>
          <div className="mt-8">
            <HowItWorksSteps />
          </div>
        </Container>
      </Section>

      <Section rhythm="block">
        <Container width="narrow">
          <Aivan
            surface="green"
            pad="block"
            ornament="corner"
            ornamentOrigin={[100, 100]}
          >
            <div className="grid gap-10 md:grid-cols-2">
              <Reveal>
                <h2 className="t-h3">{t.pages.pickup}</h2>
                <p className="t-body-sm mt-3 text-ink-secondary">
                  {t.pages.pickupNote}
                </p>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="t-h3">{t.pages.courier}</h2>
                <p className="t-body-sm mt-3 text-ink-secondary">
                  {t.pages.courierNote}
                </p>
                <p className="t-caption mt-3">{t.pages.courierRental}</p>
              </Reveal>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/catalog" size="lg">
                {t.pages.seeLooks}
              </Button>
              <Button
                href={`tel:${contact.phone}`}
                external
                variant="secondary"
                size="lg"
              >
                {contact.phoneDisplay}
              </Button>
            </div>
          </Aivan>
        </Container>
      </Section>
    </>
  );
}
