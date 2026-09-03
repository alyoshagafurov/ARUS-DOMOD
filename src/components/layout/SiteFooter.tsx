import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import {
  contact,
  footerNav,
  isDemoData,
  site,
  socialLinks,
  type NavLink,
} from "@/lib/config/site";
import { navLabel } from "@/lib/i18n/labels";
import { getDictionary } from "@/lib/i18n/server";

function FooterLink({
  link,
  className,
  label,
}: {
  link: NavLink;
  className: string;
  label: string;
}) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
      >
        <span className="t-body-sm motion-underline">{label}</span>
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      <span className="t-body-sm motion-underline">{label}</span>
    </Link>
  );
}

/**
 * Подвал — последний айвон и финальное высказывание бренда.
 *
 * Глубокая ниша с арочным верхом поднимается из белого двора; в ней —
 * фраза дома, навигация и контакты, а под ними имя ARUS DOMOD во всю
 * ширину, срезанное нижним краем: имя больше страницы. Здесь только
 * подтверждённые данные: телефоны, город, два аккаунта. Адреса и часов
 * работы клиент не передавал — их нет.
 */
export async function SiteFooter() {
  const t = await getDictionary();
  const year = new Date().getFullYear();
  const linkClass = "tap-row text-ink-secondary hover:text-ink";

  return (
    <footer className="relative mt-auto pt-[var(--space-section-y)]">
      <Aivan
        surface="night"
        pad="none"
        arch
        ornament="corner"
        ornamentOrigin={[0, 100]}
        className="rounded-b-none"
      >
        <Container className="relative pb-6 pt-[var(--space-block-y)] lg:pt-[var(--space-section-y)]">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
            <div className="lg:col-span-5">
              <Logo variant="full" className="w-[10rem]" />
              <p className="t-display-2 mt-8 max-w-[14ch] text-balance">
                {t.common.tagline}
              </p>
              <p className="t-body-sm mt-5 text-ink-secondary">
                {t.common.positioning} · {t.common.city}
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6 lg:pt-3">
              {footerNav.map((column) => (
                <nav
                  key={column.title}
                  aria-label={
                    column.title === "Дом"
                      ? t.footer.house
                      : t.footer.collection
                  }
                >
                  <h2 className="t-label text-ink-accent">
                    {column.title === "Дом"
                      ? t.footer.house
                      : t.footer.collection}
                  </h2>
                  <ul className="mt-4 flex flex-col lg:mt-6 lg:gap-3">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <FooterLink
                          link={link}
                          className={linkClass}
                          label={navLabel(link, t)}
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}

              <div>
                <h2 className="t-label text-ink-accent">{t.footer.contacts}</h2>
                <ul className="mt-4 flex flex-col lg:mt-6 lg:gap-3">
                  {[
                    [contact.phone, contact.phoneDisplay, contact.phoneName],
                    [
                      contact.phoneSecondary,
                      contact.phoneSecondaryDisplay,
                      contact.phoneSecondaryName,
                    ],
                  ].map(([phone, display, name]) => (
                    <li key={phone}>
                      <a
                        href={`tel:${phone}`}
                        className="tap-row text-ink hover:text-ink-accent"
                      >
                        <span className="t-body-sm motion-underline">
                          {display}
                        </span>
                        <span className="t-caption ml-2">{name}</span>
                      </a>
                    </li>
                  ))}
                  <li className="tap-row t-body-sm text-ink-secondary">
                    {t.common.city}
                  </li>
                  {socialLinks.map((link) => (
                    <li key={link.href}>
                      <FooterLink
                        link={link}
                        className={linkClass}
                        label={link.label}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-20">
            <p className="t-caption">
              © {year} {site.name} · {t.common.city}
            </p>
            <p className="t-caption">
              {isDemoData ? t.footer.demo : site.role}
            </p>
          </div>
        </Container>

        {/* Имя дома больше страницы: нижний край его срезает */}
        <p
          aria-hidden="true"
          className="t-giant -mb-[0.16em] mt-6 whitespace-nowrap pl-[var(--gutter)] text-[var(--cream)] opacity-[0.94] lg:mt-2"
        >
          {site.name}
        </p>
      </Aivan>
    </footer>
  );
}
