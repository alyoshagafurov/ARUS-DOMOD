import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { site, socialLinks } from "@/lib/config/site";

/**
 * Соцсети. Ленты Instagram здесь нет: для встраивания нужен API-токен
 * Meta, которого нет, а подделывать ленту статичными кадрами нельзя.
 * Вместо этого — имя профиля и прямые ссылки.
 */
export function SocialProof() {
  return (
    <Section rhythm="block" edge="top">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
          <Reveal>
            <p className="t-label text-ink-accent">Мы в сети</p>
            <p className="t-h2 mt-3">@{site.handle}</p>
          </Reveal>
          <Reveal delay={60}>
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
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
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
