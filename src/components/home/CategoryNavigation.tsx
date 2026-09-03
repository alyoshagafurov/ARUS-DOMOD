import Link from "next/link";
import type { CSSProperties } from "react";

import { Aivan } from "@/components/layout/Aivan";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/ui/icons";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import { categoryTitle } from "@/lib/i18n/labels";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { hasPhoto, photo } from "@/lib/photos";
import type { Category } from "@/types/catalog";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Раскладка семи плиток на 12 колонках. Первая — большая и высокая,
 * остальные стоят лесенкой: сдвиги по вертикали делают ряд разворотом,
 * а не сеткой. Плитка без съёмки становится типографической — зелёным
 * объёмом с номером — и это не заглушка, а смена ритма.
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

  const shown = categories.slice(0, tiles.length);
  const lastTile = tiles[Math.min(shown.length, tiles.length - 1)];

  return (
    <Section id="sections">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <Reveal>
            <p className="t-label text-gold-ink">{t.home.sectionsLabel}</p>
            <h2 className="t-h1 mt-4 max-w-[14ch] text-balance">
              {t.home.sectionsTitle}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="t-caption tabular-nums">
              {t.home.facts.sections(categories.length)}
            </p>
          </Reveal>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:mt-14 lg:grid-cols-12 lg:gap-y-8">
          {shown.map((category, index) => {
            const tile = tiles[index];
            const slug = `cat-${category.slug}`;
            const title = categoryTitle(category, locale);
            const secondary =
              locale === "tg" ? category.title : category.titleTg;
            const number = pad(index + 1);

            if (!hasPhoto(slug)) {
              return (
                <Reveal
                  as="li"
                  key={category.id}
                  delay={(index % 3) * 80}
                  className={cn(tile.cell)}
                >
                  <Link
                    href={`/catalog/${category.slug}`}
                    className="group block h-full"
                  >
                    <Aivan
                      surface="green"
                      pad="tight"
                      ornament="corner"
                      ornamentOrigin={[100, 100]}
                      className="lift flex aspect-[var(--ratio-square)] flex-col justify-between"
                    >
                      <span className="t-num text-[clamp(3rem,7vw,5rem)] text-gold-ink">
                        {number}
                      </span>
                      <span className="flex items-end justify-between gap-3">
                        <span className="flex flex-col gap-1">
                          <span className="t-h2">{title}</span>
                          {secondary ? (
                            <span className="t-caption">{secondary}</span>
                          ) : null}
                        </span>
                        <ArrowIcon className="motion-arrow h-[1.2em] w-[1.2em] shrink-0 text-ink-accent" />
                      </span>
                    </Aivan>
                  </Link>
                </Reveal>
              );
            }

            return (
              <Reveal
                as="li"
                key={category.id}
                delay={(index % 3) * 80}
                className={tile.cell}
              >
                <Link
                  href={`/catalog/${category.slug}`}
                  className="group relative block"
                >
                  <Media
                    image={photo(slug, title)}
                    ratio={tile.ratio}
                    radius="card"
                    sizes={tile.sizes}
                    priority={index === 0}
                    className="lift shadow-card"
                  />

                  {/* Подпись — белая карточка, наполовину лежащая на кадре */}
                  <span
                    data-surface="day"
                    className="card card--float absolute -bottom-5 left-4 flex max-w-[calc(100%-2rem)] items-center gap-3 px-4 py-3 lg:left-6"
                  >
                    <span className="t-num text-[1.5rem] text-gold-ink">
                      {number}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="t-h3 truncate">{title}</span>
                      {secondary ? (
                        <span className="t-caption truncate">{secondary}</span>
                      ) : null}
                    </span>
                    <ArrowIcon className="motion-arrow ml-1 h-[1em] w-[1em] shrink-0 text-ink-accent" />
                  </span>
                </Link>
              </Reveal>
            );
          })}

          {/* Восьмая плитка — вся коллекция целиком */}
          <Reveal
            as="li"
            delay={200}
            className={cn(
              "col-span-2 lg:col-span-4",
              shown.length >= tiles.length ? "lg:mt-12" : lastTile.cell,
            )}
          >
            <Link href="/catalog" className="group block h-full">
              <Aivan
                surface="night"
                pad="tight"
                ornament="corner"
                ornamentOrigin={[0, 100]}
                className="lift flex min-h-[12rem] flex-col justify-between lg:aspect-[var(--ratio-portrait)]"
                style={{ "--corner-size": "1.5rem" } as CSSProperties}
              >
                <span className="t-label text-ink-accent">
                  {t.misc.catalogLabel}
                </span>
                <span className="flex items-end justify-between gap-3">
                  <span className="t-display-2 max-w-[8ch] text-balance">
                    {t.home.allCollection}
                  </span>
                  <ArrowIcon className="motion-arrow h-[1.4em] w-[1.4em] shrink-0 text-ink-accent" />
                </span>
              </Aivan>
            </Link>
          </Reveal>
        </ul>
      </Container>
    </Section>
  );
}
