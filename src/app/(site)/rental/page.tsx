import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { OrnamentField } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { contact, rental } from "@/lib/config/site";
import { formatMoney } from "@/lib/format";
import { whatsappLink } from "@/lib/orders/whatsapp";

export const metadata = {
  title: "Прокат",
  description: `Прокат свадебных образов ARUS DOMOD: до ${rental.maxDays} дней, от ${rental.priceFromMinor / 100} сомони, залог. Оформляется в магазине.`,
};

const inquiry = whatsappLink(
  contact.phone,
  "Здравствуйте! Хочу узнать о прокате свадебного образа: условия и наличие.",
);

/**
 * Условия проката — дословно от клиента. Прокат через сайт не оформляется:
 * страница объясняет условия и ведёт в WhatsApp или в магазин.
 */
export default function RentalPage() {
  const terms = [
    ["Срок", `до ${rental.maxDays} дней`],
    ["Стоимость", `от ${formatMoney({ amount: rental.priceFromMinor, currency: "TJS" })}`],
    ["Залог", rental.depositKinds.join(" / ")],
    ["Возврат залога", "после возврата образа в сохранности"],
    ["Оформление", "только в магазине"],
    ["Доставка", "на прокат не распространяется"],
  ] as const;

  return (
    <>
      <Section surface="muted" className="overflow-hidden pt-[calc(var(--header-h)+2rem)]">
        <OrnamentField motif="damask" />
        <Container width="narrow" className="relative">
          <Reveal>
            <p className="t-label-wide text-ink-accent">Прокат</p>
            <h1 className="t-display-2 mt-5 max-w-[14ch] text-balance">Образ на день свадьбы — без покупки</h1>
            <span aria-hidden="true" className="hoshiya-line mt-7 max-w-[6rem]" />
            <p className="t-lead mt-7 max-w-[40ch]">
              Цена проката указана в карточке каждого образа. Договор заключается в магазине — через сайт прокат не оформляется.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <div className="lg:grid lg:grid-cols-12 lg:gap-[var(--gutter)]">
            <Reveal className="lg:col-span-7">
              <h2 className="t-h2">Условия</h2>
              <dl className="mt-6 flex flex-col border-t border-hairline">
                {terms.map(([k, v]) => (
                  <div key={k} className="grid gap-1 border-b border-hairline py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                    <dt className="t-label text-ink-muted">{k}</dt>
                    <dd className="t-body">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal className="mt-10 lg:col-span-4 lg:col-start-9 lg:mt-0" delay={80}>
              <div data-surface="green" className="relative border border-hairline p-6">
                <p className="t-label text-ink-accent">Как взять напрокат</p>
                <ol className="t-body-sm mt-4 flex flex-col gap-3 text-ink-secondary">
                  <li>1. Выберите образ в коллекции и посмотрите цену проката.</li>
                  <li>2. Напишите в WhatsApp — уточним наличие на вашу дату.</li>
                  <li>3. Приходите в магазин: примерка, договор, залог.</li>
                  <li>4. Верните образ в срок — залог вернётся вам.</li>
                </ol>
                <div className="mt-6 flex flex-col gap-3">
                  <Button href={inquiry} external>Узнать о прокате</Button>
                  <Button href="/catalog" variant="secondary">Смотреть образы</Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
