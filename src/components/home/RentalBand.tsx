import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { OrnamentField } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { contact, rental } from "@/lib/config/site";
import { formatMoney } from "@/lib/format";
import { whatsappLink } from "@/lib/orders/whatsapp";

const inquiry = whatsappLink(
  contact.phone,
  "Здравствуйте! Хочу узнать о прокате свадебного образа: условия и наличие.",
);

/**
 * Прокат — отдельный поток, и на главной он стоит отдельной полосой:
 * покупка и прокат не должны читаться как две кнопки одного действия.
 * Цифры — от клиента; ничего сверх них.
 */
export function RentalBand() {
  return (
    <Section surface="muted" className="overflow-hidden">
      <OrnamentField motif="damask" />
      <Container className="relative">
        <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-[var(--gutter)]">
          <Reveal className="lg:col-span-7">
            <p className="t-label text-ink-accent">Прокат</p>
            <h2 className="t-display-2 mt-5 max-w-[12ch] text-balance">
              Образ на один день
            </h2>
            <span
              aria-hidden="true"
              className="hoshiya-line mt-7 max-w-[6rem]"
            />
            <ul className="t-body mt-7 grid max-w-[40rem] gap-x-8 gap-y-3 sm:grid-cols-2">
              <li>до {rental.maxDays} дней</li>
              <li>
                от{" "}
                {formatMoney({
                  amount: rental.priceFromMinor,
                  currency: "TJS",
                })}
              </li>
              <li>залог: {rental.depositKinds.join(" / ")}</li>
              <li>оформление в магазине</li>
            </ul>
          </Reveal>
          <Reveal
            className="mt-10 lg:col-span-4 lg:col-start-9 lg:mt-0"
            delay={100}
          >
            <p className="t-body-sm max-w-[32ch] text-ink-secondary">
              Цена проката указана в карточке каждого образа. Через сайт прокат
              не оформляется — напишите, и мы договоримся о примерке.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={inquiry} external>
                Узнать о прокате
              </Button>
              <Link
                href="/rental"
                className="tap-row text-ink-secondary hover:text-ink"
              >
                <span className="t-label motion-underline">Условия</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
