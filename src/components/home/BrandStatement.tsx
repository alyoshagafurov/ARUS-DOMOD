import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n/server";
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
 * блок начинался вплотную. Воздуха здесь больше, чем у соседей, — это
 * полоса тишины перед финалом, и она обязана дышать.
 *
 * По краю полотна идёт замкнутая ҳошия — единственное место на странице,
 * где кайма не разомкнута: тоқча обрамляет кадр, а здесь кадром служит вся
 * секция целиком, как поле под знаком в логотипе.
 *
 * Поверхность здесь светлая, и это решает не вкус, а сама фотография:
 * архивный текстиль почти весь кремовый, поэтому светлый текст на нём
 * пропадал. На day-поверхности заголовок становится глубокой бирюзой
 * (15.03:1 к кремовому полю кадра), а акцентная строка — бирюзой логотипа
 * (9.36:1). Золотом её набрать нельзя: на светлом оно даёт 2.18:1.
 *
 * Это единственная светлая пауза на всей главной.
 *
 * Ширина строки подобрана под пустое поле кадра: шире — и текст заезжает
 * на ковровый орнамент справа, где тёмная краска съедает контраст.
 *
 * Ни одного элемента к секции не добавлено: кнопок, подписей и второго
 * изображения здесь по-прежнему нет.
 */
export async function BrandStatement() {
  const t = await getDictionary();
  return (
    <section
      data-surface="day"
      className="relative isolate flex min-h-[72svh] items-center overflow-hidden
        py-[calc(var(--space-section-y)*1.6)] lg:min-h-[82svh]"
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

      {/* Замкнутая кайма по краю полотна — пропорция снята с логотипа */}
      <span aria-hidden="true" className="hoshiya-frame" />

      <Container width="narrow" className="relative">
        <Reveal>
          <p className="t-display-2 max-w-[11ch]">
            {t.editorial.textileTitle}
            <br />
            <span className="text-ink-accent">{t.editorial.textileAccent}</span>
          </p>
        </Reveal>

        <Reveal delay={120}>
          <span
            aria-hidden="true"
            className="hoshiya-line mt-12 max-w-[9rem]"
            data-strength="strong"
          />
        </Reveal>
      </Container>
    </section>
  );
}
