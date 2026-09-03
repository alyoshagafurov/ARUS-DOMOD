import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { HowItWorksSteps } from "@/components/home/HowItWorks";
import { contact, site } from "@/lib/config/site";

export const metadata = {
  title: "Доставка и получение",
  description: "Как оформить заказ ARUS DOMOD: подтверждение, оплата, доставка или самовывоз в Душанбе.",
};

/**
 * Получение заказа. Ни зон, ни сроков, ни тарифов — их клиент не
 * передавал: стоимость доставки согласуется отдельно при подтверждении.
 */
export default function DeliveryPage() {
  return (
    <>
      <Section surface="muted" className="pt-[calc(var(--header-h)+2rem)]">
        <Container width="narrow">
          <Reveal>
            <p className="t-label-wide text-ink-accent">Доставка и получение</p>
            <h1 className="t-display-2 mt-5 max-w-[14ch] text-balance">От заказа до примерки</h1>
            <span aria-hidden="true" className="hoshiya-line mt-7 max-w-[6rem]" />
            <p className="t-lead mt-7 max-w-[40ch]">
              Сайт не принимает оплату. Вы отправляете заказ, администратор подтверждает состав и стоимость, дальше — оплата и получение.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <Reveal>
            <h2 className="t-h2">Как это работает</h2>
          </Reveal>
          <div className="mt-8">
            <HowItWorksSteps />
          </div>
        </Container>
      </Section>

      <Section surface="muted" edge="top">
        <Container width="narrow">
          <div className="grid gap-10 md:grid-cols-2">
            <Reveal>
              <h2 className="t-h3">Самовывоз</h2>
              <p className="t-body-sm mt-3 text-ink-secondary">
                Заберите заказ в магазине в {site.city}. Администратор согласует время при подтверждении.
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="t-h3">Доставка</h2>
              <p className="t-body-sm mt-3 text-ink-secondary">
                Укажите адрес в заказе. Стоимость доставки согласуется отдельно и в сумму заказа на сайте не входит.
              </p>
              <p className="t-caption mt-3">Прокат доставкой не отправляется — только в магазине.</p>
            </Reveal>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/catalog" size="lg">Смотреть образы</Button>
            <Button href={`tel:${contact.phone}`} external variant="secondary" size="lg">
              {contact.phoneDisplay}
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
