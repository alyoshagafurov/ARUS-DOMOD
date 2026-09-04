import { Container } from "@/components/layout/Container";
import { getDictionary } from "@/lib/i18n/server";
import { Media } from "@/components/ui/Media";
import { photo } from "@/lib/photos";

interface CatalogHeaderProps {
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
export async function CatalogHeader({
  categoryTitle,
  categoryTitleTg,
}: CatalogHeaderProps) {
  const t = await getDictionary();

  return (
    <Container className="pb-12 pt-6 lg:pb-16 lg:pt-10">
      <div className="grid items-end gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="t-display-2 max-w-[16ch] text-balance">
            {categoryTitle ?? t.misc.catalogTitle}
          </h1>
          {categoryTitleTg ? (
            <p className="t-label-wide mt-5 text-ink-muted">
              {categoryTitleTg}
            </p>
          ) : null}
          <p className="t-lead t-measure mt-7">{t.misc.catalogLead}</p>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <Media
            image={photo("textile-detail-couture", t.alts.catalogDetail)}
            ratio="square"
            zoomOnHover={false}
            sizes="(min-width: 1024px) 30vw, 55vw"
          />
        </div>
      </div>
    </Container>
  );
}
