import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { OrnamentBand } from "@/components/ornament/Ornament";
import { Media } from "@/components/ui/Media";
import { photo } from "@/lib/photos";

/**
 * Пауза перед финалом.
 *
 * Композиция прежняя — утверждение бренда влево и одна кайма. Изменился
 * только грунт: вместо ровного bone под текстом лежит архивная текстильная
 * графика. Кадр выбран за широкое пустое поле, поэтому подложек под текст
 * не потребовалось: он ложится прямо на «ткань».
 *
 * Секция держит собственную высоту и центрирует содержимое по вертикали:
 * узкой полосой она читалась не как раздел, а как разделитель, и следующий
 * блок начинался вплотную.
 *
 * Ширина строки подобрана под пустое поле кадра: шире — и текст заезжает
 * на ковровый орнамент справа, где тёмная краска съедает контраст.
 *
 * Ни одного элемента к секции не добавлено: кнопок, подписей и второго
 * изображения здесь по-прежнему нет.
 */
export function BrandStatement() {
  return (
    <section
      className="relative isolate flex min-h-[64svh] items-center overflow-hidden
        py-[calc(var(--space-section-y)*1.4)] lg:min-h-[72svh]"
    >
      {/* Кадр в отдельной обёртке: у <Media> в базе свой `relative`, и две
          утилиты position одного веса разрешаются порядком в CSS. */}
      <div className="absolute inset-0">
        <Media
          image={photo(
            "tajik-textile-archive-cover",
            "Фрагменты таджикского свадебного текстиля",
          )}
          ratio="auto"
          zoomOnHover={false}
          sizes="100vw"
          // Пустое поле кадра — слева. На телефоне видна лишь узкая
          // полоса, поэтому держимся левого края, иначе текст ляжет
          // на ковровый орнамент.
          imageClassName="object-left lg:object-center"
          className="h-full rounded-none"
        />
      </div>

      <Container width="narrow" className="relative">
        <Reveal>
          <p className="t-display-2 max-w-[11ch]">
            Таджикская традиция.
            <br />
            <span className="text-ink-accent">Современный силуэт.</span>
          </p>
        </Reveal>

        <Reveal delay={120}>
          <OrnamentBand
            motif="mavj"
            height={12}
            className="mt-12 max-w-[14rem]"
          />
        </Reveal>
      </Container>
    </section>
  );
}
