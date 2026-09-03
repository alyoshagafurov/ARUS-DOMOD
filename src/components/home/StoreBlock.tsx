import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { contact, socialLinks } from "@/lib/config/site";
import { getDictionary } from "@/lib/i18n/server";
import { whatsappLink } from "@/lib/orders/whatsapp";

/**
 * Магазин — айвон с двумя телефонами-карточками.
 *
 * Здесь только то, что подтвердил клиент: город, два номера с именами и
 * два аккаунта. Адреса, часов работы и карты нет — вместо выдуманной точки
 * на карте честная фраза «уточняйте по телефону». Номера набраны антиквой
 * крупно: на витрине это главный способ связаться.
 */
export async function StoreBlock() {
  const t = await getDictionary();
  const phones = [
    {
      phone: contact.phone,
      display: contact.phoneDisplay,
      name: contact.phoneName,
      role: t.pages.contactsRole1,
    },
    {
      phone: contact.phoneSecondary,
      display: contact.phoneSecondaryDisplay,
      name: contact.phoneSecondaryName,
      role: t.pages.contactsRole2,
    },
  ];

  return (
    <Section id="store" rhythm="block">
      <Container>
        <Aivan
          surface="green"
          pad="block"
          clip={false}
          ornament="corner"
          ornamentOrigin={[100, 0]}
          className="grid gap-10 lg:grid-cols-12 lg:gap-x-[var(--gutter)]"
        >
          <Reveal className="lg:col-span-5">
            <p className="t-label text-ink-accent">{t.home.storeLabel}</p>
            <h2 className="t-display-2 mt-5 max-w-[10ch] text-balance">
              {t.home.storeTitle}
            </h2>
            <p className="t-lead mt-6 max-w-[36ch]">{t.home.storeLead}</p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group t-label inline-flex h-11 items-center gap-2 rounded-pill border border-strong px-5 text-ink transition-[border-color,background-color] duration-[var(--dur-fast)] hover:border-accent hover:bg-accent-quiet"
                  >
                    {link.label}
                    <ArrowIcon className="motion-arrow h-[0.9em] w-[0.9em] -rotate-45" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:gap-6">
            {phones.map((item, index) => (
              <Reveal
                key={item.phone}
                delay={index * 110}
                className={cn(index === 1 && "sm:mt-10 lg:-mb-16")}
              >
                <div
                  data-surface="day"
                  className="card card--float lift flex h-full flex-col gap-5 p-6 lg:p-8"
                >
                  <p className="t-label text-gold-ink">
                    {item.name} · {item.role}
                  </p>
                  <a href={`tel:${item.phone}`} className="tap-row w-fit">
                    <span className="t-h1 motion-underline tabular-nums">
                      {item.display}
                    </span>
                  </a>
                  <div className="mt-auto pt-2">
                    <Button
                      href={whatsappLink(item.phone, t.pages.writeHello)}
                      external
                      arrow
                      variant={index === 0 ? "primary" : "secondary"}
                    >
                      {t.pages.writeWhatsApp}
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Aivan>
      </Container>
    </Section>
  );
}
