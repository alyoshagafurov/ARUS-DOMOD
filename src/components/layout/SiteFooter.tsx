import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/layout/Container";
import { OrnamentBand } from "@/components/ornament/Ornament";
import { getDictionary } from "@/lib/i18n/server";
import { navLabel } from "@/lib/i18n/labels";
import {
  contact,
  footerNav,
  isDemoData,
  site,
  socialLinks,
  type NavLink,
} from "@/lib/config/site";

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
 * Подвал — часть бренда, а не технический хвост.
 *
 * Здесь стоит официальный лок-ап целиком и только подтверждённые контакты:
 * телефон, город и два аккаунта. Адреса, часов работы и перечня услуг тут
 * нет, потому что этих данных клиент не передавал.
 */
export async function SiteFooter() {
  const t = await getDictionary();
  const year = new Date().getFullYear();
  // Роль текста переехала на внутренний span: строка отвечает за зону
  // нажатия, span — за подчёркивание, которое обязано остаться под текстом.
  const linkClass = "tap-row text-ink-secondary hover:text-ink";

  return (
    <footer data-surface="night" className="relative mt-auto overflow-hidden">
      <OrnamentBand
        motif="chorkhona"
        height={16}
        strength="strong"
        className="absolute inset-x-0 top-0"
      />

      <Container className="pb-10 pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <Logo variant="full" className="w-[12rem]" />
            <p className="t-lead t-measure mt-6 max-w-sm">{t.common.tagline}</p>
            <p className="t-body-sm mt-3 text-ink-secondary">
              {t.common.positioning}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerNav.map((column) => (
              <nav
                key={column.title}
                aria-label={
                  column.title === "Дом" ? t.footer.house : t.footer.collection
                }
              >
                <h2 className="t-label text-ink-muted">
                  {column.title === "Дом"
                    ? t.footer.house
                    : t.footer.collection}
                </h2>
                <ul className="mt-3 flex flex-col lg:mt-5 lg:gap-3">
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
              <h2 className="t-label text-ink-muted">{t.footer.contacts}</h2>
              <ul className="mt-3 flex flex-col lg:mt-5 lg:gap-3">
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="tap-row text-ink hover:text-ink-accent"
                  >
                    <span className="t-body-sm motion-underline">
                      {contact.phoneDisplay}
                    </span>
                  </a>
                </li>
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

        {/* Крупное имя дома вместо технического хвоста */}
        <p
          aria-hidden="true"
          className="mt-20 font-display text-[clamp(1.75rem,7vw,5rem)] leading-none tracking-[0.16em] text-ink-muted"
        >
          {site.name}
        </p>

        <div className="mt-10 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-caption">
            © {year} {site.name} · {t.common.city}
          </p>
          <p className="t-caption">{isDemoData ? t.footer.demo : site.role}</p>
        </div>
      </Container>
    </footer>
  );
}
