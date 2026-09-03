import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n/server";
import type { OrnamentMotif } from "@/components/ornament/Ornament";
import type { PlateTone } from "@/components/ui/FabricPlate";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/catalog";

/**
 * Плитки разного размера и пропорции: разделы — это навигация разворота,
 * а не ряд одинаковых кнопок. Тон плиты используется только как запасной
 * вариант, если у раздела ещё нет фотографии.
 *
 * На мобильном раскладка своя, а не «то же самое в одну колонку»: две плитки
 * в ряд, первая и последняя — во всю ширину. В одну колонку каждая плитка
 * занимала целый экран, и раздел превращался в ленту текстуры.
 * Пропорции внутри мобильного ряда совпадают, чтобы подписи не рвались по
 * высоте.
 */
const tiles: {
  cell: string;
  ratio: "editorial" | "tall" | "portrait";
  tone: PlateTone;
  motif: OrnamentMotif;
  sizes: string;
}[] = [
  {
    cell: "col-span-2 sm:col-span-3 lg:col-span-5",
    ratio: "editorial",
    tone: "madder",
    motif: "chorkhona",
    sizes: "(min-width: 1024px) 40vw, 50vw",
  },
  {
    cell: "sm:col-span-3 lg:col-span-3",
    ratio: "tall",
    tone: "ink",
    motif: "gul",
    sizes: "(min-width: 1024px) 24vw, 50vw",
  },
  {
    cell: "sm:col-span-3 lg:col-span-4",
    ratio: "tall",
    tone: "nil",
    motif: "mavj",
    sizes: "(min-width: 1024px) 32vw, 50vw",
  },
  {
    cell: "sm:col-span-3 lg:col-span-4",
    ratio: "portrait",
    tone: "sabz",
    motif: "chorkhona",
    sizes: "(min-width: 1024px) 32vw, 50vw",
  },
  {
    cell: "sm:col-span-3 lg:col-span-3",
    ratio: "portrait",
    tone: "ink",
    motif: "mavj",
    sizes: "(min-width: 1024px) 24vw, 50vw",
  },
  {
    cell: "col-span-2 sm:col-span-3 lg:col-span-5",
    ratio: "editorial",
    tone: "madder",
    motif: "gul",
    sizes: "(min-width: 1024px) 40vw, 50vw",
  },
];

interface CategoryNavigationProps {
  categories: Category[];
}

export async function CategoryNavigation({
  categories,
}: CategoryNavigationProps) {
  const t = await getDictionary();
  if (categories.length === 0) return null;

  return (
    <Section surface="muted">
      <Container>
        <p className="t-label text-ink-muted">{t.home.sectionsLabel}</p>
        <h2 className="t-h1 mt-4 max-w-[16ch]">{t.home.sectionsTitle}</h2>

        <ul className="mt-14 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-12 sm:grid-cols-6 lg:mt-20 lg:grid-cols-12">
          {categories.slice(0, tiles.length).map((category, index) => {
            const tile = tiles[index];
            return (
              <Reveal
                as="li"
                key={category.id}
                delay={(index % 3) * 80}
                className={tile.cell}
              >
                <Link
                  href={`/catalog/${category.slug}`}
                  className="group block focus:outline-none"
                >
                  <div className="relative overflow-hidden rounded-xs">
                    <Media
                      image={category.image}
                      ratio={tile.ratio}
                      tone={tile.tone}
                      plateMotif={tile.motif}
                      sizes={tile.sizes}
                    />

                    {/* Таджикское имя проступает поверх ткани при наведении */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute inset-0 flex items-end p-5",
                        // Подложка появляется вместе с надписью, а не висит
                        // на кадре постоянно: съёмка светлая, и без неё
                        // таджикское имя на ней не читается.
                        "bg-[rgba(16,13,11,0.44)]",
                        "translate-y-2 opacity-0 transition-[transform,opacity]",
                        "duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
                        "group-hover:translate-y-0 group-hover:opacity-100",
                        "group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
                      )}
                    >
                      <span className="t-h2 text-[var(--shir-50)]">
                        {category.titleTg}
                      </span>
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <h3 className="t-h3">{category.title}</h3>
                    <span className="t-label text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Акцентная линия вырастает от левого края — единственный
                      цветной отклик на всей плитке */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-3 block h-px w-full origin-left scale-x-0 bg-accent",
                      "transition-transform duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
                      "group-hover:scale-x-100 group-focus-visible:scale-x-100",
                    )}
                  />
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
