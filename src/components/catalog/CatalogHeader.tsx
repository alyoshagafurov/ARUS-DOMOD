import { Container } from "@/components/layout/Container";
import { Media } from "@/components/ui/Media";
import { photo } from "@/lib/photos";
import type { Collection } from "@/types/catalog";

interface CatalogHeaderProps {
  collection?: Collection;
  /** Заголовок раздела, если открыта конкретная категория */
  categoryTitle?: string;
  categoryTitleTg?: string;
}

/**
 * Ввод в коллекцию, а не заголовок страницы.
 *
 * Блок намеренно невысокий: каталог — это место, куда приходят смотреть вещи,
 * и баннер во весь экран здесь только мешает. Крупный план ткани справа держит
 * связь с главной, но не отбирает место у сетки.
 *
 * Отступ под шапку тут НЕ задаётся: на страницах без тёмного hero его уже
 * даёт распорка внутри <SiteHeader>, и второй такой отступ оставлял бы
 * над заголовком пустой экран.
 */
export function CatalogHeader({
  collection,
  categoryTitle,
  categoryTitleTg,
}: CatalogHeaderProps) {
  const eyebrow = collection?.title ?? "Коллекция 01";

  return (
    <Container className="pb-12 pt-6 lg:pb-16 lg:pt-10">
      <div className="grid items-end gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="t-label text-ink-muted">{eyebrow} · ARUS DOMOD</p>
          <h1 className="t-display-2 mt-6 max-w-[16ch] text-balance">
            {categoryTitle ?? "Наследие в новом силуэте"}
          </h1>
          {categoryTitleTg ? (
            <p className="t-label-wide mt-5 text-ink-muted">
              {categoryTitleTg}
            </p>
          ) : null}
          <p className="t-lead t-measure mt-7">
            Съёмка сезона целиком: платья, украшения, аксессуары и парные
            образы. Каждый образ доступен к покупке, часть — в прокат.
          </p>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <Media
            image={photo(
              "textile-detail-couture",
              "Фрагмент кадра из коллекции ARUS DOMOD",
            )}
            ratio="square"
            zoomOnHover={false}
            sizes="(min-width: 1024px) 30vw, 55vw"
          />
        </div>
      </div>
    </Container>
  );
}
