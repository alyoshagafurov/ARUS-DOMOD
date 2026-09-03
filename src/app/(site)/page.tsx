import { CategoryNavigation } from "@/components/home/CategoryNavigation";
import { ClosingInvitation } from "@/components/home/ClosingInvitation";
import { CollectionIntro } from "@/components/home/CollectionIntro";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { HeritageStory } from "@/components/home/HeritageStory";
import { HomeHero } from "@/components/home/HomeHero";
import { StoreBlock } from "@/components/home/StoreBlock";
import { TwoWays } from "@/components/home/TwoWays";
import { catalog } from "@/lib/catalog";
import { categoryTitle } from "@/lib/i18n/labels";
import { getLocale } from "@/lib/i18n/server";

/**
 * Главная — путь по двору дома.
 *
 *   АЙВОН      первый экран: имя больше объёма, кадр выходит на белое
 *   МАНИФЕСТ   белая пауза: фраза дома и маленький кадр ткани
 *   РАЗДЕЛЫ    редакционная навигация: большая плитка, лесенка, номера
 *   ПОДБОРКА   зелёный айвон с рейкой белых карточек-предметов
 *   ДВА ПУТИ   покупка (движение) и прокат (покой) — намеренно разные
 *   НАСЛЕДИЕ   кадр и айвон внахлёст, настоящие цифры дома
 *   МАГАЗИН    Душанбе, два телефона-карточки, соцсети
 *   ФИНАЛ      широкий кадр пары с плавающей карточкой и одной кнопкой
 *
 * Белое между блоками — часть композиции: у каждого объёма своя тень,
 * своя высота и свой сдвиг, поэтому страница читается как путь, а не как
 * стопка одинаковых прямоугольников.
 */
export default async function HomePage() {
  const repository = catalog();

  const [featured, categories, collections, firstPage] = await Promise.all([
    repository.listFeatured(),
    repository.listCategories(),
    repository.listCollections(),
    repository.listProducts({ pageSize: 1 }),
  ]);

  const locale = await getLocale();
  const categoryLabels = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      categoryTitle(category, locale),
    ]),
  );

  return (
    <>
      <HomeHero lookCount={firstPage.total} />
      <CollectionIntro />
      <CategoryNavigation categories={categories} />
      <FeaturedCollection
        products={featured}
        categoryLabels={categoryLabels}
        collection={collections[0]}
      />
      <TwoWays />
      <HeritageStory
        lookCount={firstPage.total}
        sectionCount={categories.length}
      />
      <StoreBlock />
      <ClosingInvitation />
    </>
  );
}
