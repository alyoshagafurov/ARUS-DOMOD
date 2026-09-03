import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { OrnamentField } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { contact, site, socialLinks } from "@/lib/config/site";
import { whatsappLink } from "@/lib/orders/whatsapp";

export const metadata = {
  title: "Контакты",
  description: `ARUS DOMOD, ${site.city}: ${contact.phoneDisplay}, ${contact.phoneSecondaryDisplay}.`,
};

const people = [
  { name: contact.phoneName, phone: contact.phone, display: contact.phoneDisplay, role: "заказы и прокат" },
  { name: contact.phoneSecondaryName, phone: contact.phoneSecondary, display: contact.phoneSecondaryDisplay, role: "дополнительный номер" },
];

/** Только подтверждённое: два номера, город, соцсети. Адреса и часов нет. */
export default function ContactsPage() {
  return (
    <>
      <Section surface="muted" className="overflow-hidden pt-[calc(var(--header-h)+2rem)]">
        <OrnamentField motif="damask" />
        <Container width="narrow" className="relative">
          <Reveal>
            <p className="t-label-wide text-ink-accent">Контакты</p>
            <h1 className="t-display-2 mt-5">Напишите нам</h1>
            <span aria-hidden="true" className="hoshiya-line mt-7 max-w-[6rem]" />
            <p className="t-lead mt-7 max-w-[36ch]">{site.name} · {site.city}</p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <ul className="grid gap-6 md:grid-cols-2">
            {people.map((p, i) => (
              <Reveal key={p.phone} delay={i * 60}>
                <li className="relative border border-hairline p-6">
                  <p className="t-label text-ink-accent">{p.name}</p>
                  <p className="t-caption mt-1">{p.role}</p>
                  <a href={`tel:${p.phone}`} className="t-h2 motion-underline mt-4 inline-block">{p.display}</a>
                  <div className="mt-5">
                    <Button href={whatsappLink(p.phone, "Здравствуйте! Пишу с сайта ARUS DOMOD.")} external variant="secondary" size="sm">
                      Написать в WhatsApp
                    </Button>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-12" delay={120}>
            <h2 className="t-label text-ink-muted">Мы в сети</h2>
            <ul className="mt-4 flex flex-wrap gap-6">
              {socialLinks.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noreferrer noopener" className="tap-row hover:text-ink-accent">
                    <span className="t-h3 motion-underline">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="t-caption mt-6">Прокат оформляется в магазине — напишите, и мы договоримся о времени.</p>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
