import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n/server";
import { Button } from "@/components/ui/Button";
import { contact, site, socialLinks } from "@/lib/config/site";
import { whatsappLink } from "@/lib/orders/whatsapp";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.meta.contacts, description: t.meta.siteDescription };
}

/** Только подтверждённое: два номера, город, соцсети. Адреса и часов нет. */
export default async function ContactsPage() {
  const t = await getDictionary();
  const people = [
    {
      name: contact.phoneName,
      phone: contact.phone,
      display: contact.phoneDisplay,
      role: t.pages.contactsRole1,
    },
    {
      name: contact.phoneSecondaryName,
      phone: contact.phoneSecondary,
      display: contact.phoneSecondaryDisplay,
      role: t.pages.contactsRole2,
    },
  ];
  return (
    <>
      <Section rhythm="block">
        <Container width="narrow">
          <Reveal>
            <p className="t-label-wide text-gold-ink">{t.nav.contacts}</p>
            <h1 className="t-display-2 mt-5">{t.pages.contactsTitle}</h1>
            <span
              aria-hidden="true"
              className="hoshiya-line mt-7 max-w-[6rem]"
            />
            <p className="t-lead mt-7 max-w-[36ch]">
              {site.name} · {t.common.city}
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <ul className="grid gap-6 md:grid-cols-2">
            {people.map((p, i) => (
              <Reveal key={p.phone} delay={i * 60}>
                <li className="card card--float lift relative p-6 lg:p-8">
                  <p className="t-label text-gold-ink">{p.name}</p>
                  <p className="t-caption mt-1">{p.role}</p>
                  <a href={`tel:${p.phone}`} className="tap-row mt-3 w-fit">
                    <span className="t-h2 motion-underline">{p.display}</span>
                  </a>
                  <div className="mt-5">
                    <Button
                      href={whatsappLink(p.phone, t.pages.writeHello)}
                      external
                      variant="secondary"
                    >
                      {t.pages.writeWhatsApp}
                    </Button>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-12" delay={120}>
            <h2 className="t-label text-ink-muted">{t.pages.online}</h2>
            <ul className="mt-4 flex flex-wrap gap-6">
              {socialLinks.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="tap-row hover:text-ink-accent"
                  >
                    <span className="t-h3 motion-underline">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="t-caption mt-6">{t.pages.contactsNote}</p>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
