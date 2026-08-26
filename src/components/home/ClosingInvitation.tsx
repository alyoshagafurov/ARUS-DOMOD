import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { OrnamentBand } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { site } from "@/lib/config/site";
import { photo } from "@/lib/photos";

/**
 * Финальный шов страницы: ткань во всю ширину, приглашение и одна кнопка.
 * Ҳошия сверху и снизу закрывает композицию так же, как открыл её hero.
 */
export function ClosingInvitation() {
  return (
    <section
      data-surface="night"
      className="relative isolate overflow-hidden py-[var(--space-section-y)]"
    >
      {/* Кадр кладётся в отдельную обёртку, а не через absolute на самой
          <Media>: у неё в базе свой `relative`, и две утилиты position
          одного веса разрешаются порядком в CSS, а не в атрибуте class. */}
      <div className="absolute inset-0">
        <Media
          image={photo(
            "final-tajik-bridal-editorial",
            "Жених и невеста в светлых свадебных образах ARUS DOMOD",
          )}
          ratio="auto"
          zoomOnHover={false}
          sizes="100vw"
          className="h-full rounded-none"
        />
      </div>
      {/* Плоская подложка ради читаемости текста — не градиент */}
      {/* Подложка служебная: слева, где лежит текст, она плотнее, справа
          уступает место паре. Не декоративная виньетка. */}
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(16,13,11,0.88) 0%, rgba(16,13,11,0.72) 42%, rgba(16,13,11,0.34) 100%)",
        }}
      />

      <OrnamentBand
        motif="chorkhona"
        height={14}
        className="absolute inset-x-0 top-0"
        strength="strong"
      />

      <Container className="relative">
        <Reveal className="max-w-[46rem]">
          <p className="t-label text-ink-secondary">
            {site.name} · {site.city}
          </p>
          <h2 className="t-display-2 mt-7 max-w-[16ch] text-balance">
            Найдите образ для своего дня.
          </h2>
          <p className="t-lead mt-8 max-w-[38ch]">
            Продажа и прокат в национальном стиле.
          </p>
          <div className="mt-11 flex flex-wrap gap-3">
            <Button href="/catalog" variant="inverse" size="lg">
              Открыть коллекцию
            </Button>
            <Button href="/contacts" variant="secondary" size="lg">
              Связаться с нами
            </Button>
          </div>
        </Reveal>
      </Container>

      {/* Нижнего шва здесь нет намеренно: его роль берёт кайма подвала,
          иначе две каймы встали бы вплотную друг к другу. */}
    </section>
  );
}
