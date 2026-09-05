import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { Media } from "@/components/ui/Media";
import { categoryTitle } from "@/lib/i18n/labels";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { hasPhoto, photo, type PhotoSlug } from "@/lib/photos";
import type { Category } from "@/types/catalog";

/**
 * Раскладка плиток на 12 колонках. Первая — большая и высокая, остальные
 * стоят лесенкой: сдвиги по вертикали делают ряд разворотом, а не сеткой.
 *
 * В сетке стоят ТОЛЬКО разделы со съёмкой. Раздел без кадра занимал такую
 * же плитку, и на экране появлялся пустой зелёный квадрат размером с
 * фотографию — он обещал изображение, которого нет. Такие разделы уходят
 * строкой под сетку: место, которое они занимают, соответствует тому, что
 * у них есть.
 */
const tiles: {
  cell: string;
  ratio: "tall" | "portrait" | "square";
  sizes: string;
}[] = [
  {
    cell: "col-span-2 lg:col-span-6 lg:row-span-2",
    ratio: "tall",
    sizes: "(min-width: 1024px) 46vw, 92vw",
  },
  {
    cell: "lg:col-span-3",
    ratio: "portrait",
    sizes: "(min-width: 1024px) 22vw, 45vw",
  },
  {
    cell: "lg:col-span-3 lg:mt-14",
    ratio: "portrait",
    sizes: "(min-width: 1024px) 22vw, 45vw",
  },
  {
    cell: "lg:col-span-3 lg:-mt-6",
    ratio: "square",
    sizes: "(min-width: 1024px) 22vw, 45vw",
  },
  {
    cell: "lg:col-span-3 lg:mt-8",
    ratio: "square",
    sizes: "(min-width: 1024px) 22vw, 45vw",
  },
  {
    cell: "lg:col-span-4",
    ratio: "portrait",
    sizes: "(min-width: 1024px) 30vw, 45vw",
  },
  {
    cell: "lg:col-span-4 lg:mt-12",
    ratio: "portrait",
    sizes: "(min-width: 1024px) 30vw, 45vw",
  },
];

interface CategoryNavigationProps {
  categories: Category[];
}

export async function CategoryNavigation({
  categories,
}: CategoryNavigationProps) {
  const t = await getDictionary();
  const locale = await getLocale();
  if (categories.length === 0) return null;

  // Слаг кадра считается вместе с фильтром: hasPhoto — типовой сторож, и
  // только так сужение PhotoSlug доживает до вызова photo() ниже.
  const withPhoto = categories
    .map((category) => ({ category, slug: `cat-${category.slug}` }))
    .filter((item): item is { category: Category; slug: PhotoSlug } =>
      hasPhoto(item.slug),
    )
    .slice(0, tiles.length);
  const withoutPhoto = categories.filter((c) => !hasPhoto(`cat-${c.slug}`));

  return (
    <Section id="sections">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <Reveal>
            <h2 className="t-h1 max-w-[14ch] text-balance">
              {t.home.sectionsTitle}
            </h2>
          </Reveal>
          {/* «Вся коллекция» — действие, а не раздел, поэтому кнопка рядом с
              заголовком, а не плитка размером с фотографию в конце сетки. */}
          <Reveal delay={100} className="flex items-center gap-5">
            <p className="t-caption tabular-nums">
              {t.home.facts.sections(categories.length)}
            </p>
            <Button href="/catalog" variant="secondary" arrow>
              {t.home.allCollection}
            </Button>
          </Reveal>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:mt-14 lg:grid-cols-12 lg:gap-y-8">
          {withPhoto.map(({ category, slug }, index) => {
            const tile = tiles[index];
            const title = categoryTitle(category, locale);
            const secondary =
              locale === "tg" ? category.title : category.titleTg;

            return (
              <Reveal
                as="li"
                key={category.id}
                delay={(index % 3) * 80}
                className={tile.cell}
              >
                <Link
                  href={`/catalog/${category.slug}`}
                  className="group block"
                >
                  {/* Кадр под куполом ниши. Подпись стоит ПОД ним на холсте:
                      белая карточка, наполовину лежащая на фотографии, давала
                      вторую поверхность поверх первой и закрывала подол. */}
                  <Media
                    image={photo(slug, title)}
                    ratio={tile.ratio}
                    radius="arch"
                    sizes={tile.sizes}
                    priority={index === 0}
                    className="lift arch-hoshiya [&::after]:border-transparent [&::after]:transition-colors [&::after]:duration-[var(--dur-base)] group-hover:[&::after]:border-[var(--hoshiya-color-strong)]"
                  />

                  <span className="mt-4 flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="t-h3 motion-underline self-start">
                        {title}
                      </span>
                      {secondary ? (
                        <span className="t-caption">{secondary}</span>
                      ) : null}
                    </span>
                    <ArrowIcon className="motion-arrow h-[1em] w-[1em] shrink-0 translate-y-[0.1em] text-ink-accent" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>

        {/* Разделы без съёмки — строкой, а не плиткой: пустой зелёный
            квадрат размером с фотографию обещал бы кадр, которого нет. */}
        {withoutPhoto.length > 0 ? (
          <Reveal delay={120}>
            <ul className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-1 border-t border-hairline pt-5 lg:mt-16">
              {withoutPhoto.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/catalog/${category.slug}`}
                    className="tap-row group gap-2 text-ink-secondary hover:text-ink"
                  >
                    <span className="t-h3 motion-underline">
                      {categoryTitle(category, locale)}
                    </span>
                    <ArrowIcon className="motion-arrow h-[0.8em] w-[0.8em] shrink-0 text-ink-accent" />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </Container>
    </Section>
  );
}
