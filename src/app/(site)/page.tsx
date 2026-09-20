import { CategoryNavigation } from "@/components/home/CategoryNavigation";
import { ClosingInvitation } from "@/components/home/ClosingInvitation";
import { CollectionIntro } from "@/components/home/CollectionIntro";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { HeritageStory } from "@/components/home/HeritageStory";
import { HomeHero } from "@/components/home/HomeHero";
import { StoreBlock } from "@/components/home/StoreBlock";
import { TwoWays } from "@/components/home/TwoWays";
import { HomeFaq } from "@/components/home/HomeFaq";
import { catalog } from "@/lib/catalog";
import { categoryTitle } from "@/lib/i18n/labels";
import { getLocale } from "@/lib/i18n/server";
import { seoCopy } from "@/lib/seo/copy";
import { seoMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const { home } = seoCopy[await getLocale()];
  return seoMetadata({
    path: "/",
    title: home.title,
    description: home.description,
    absoluteTitle: true,
  });
}

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

  const [featured, allCategories, collections, allProducts] = await Promise.all([
    repository.listFeatured(),
    repository.listCategories(),
    repository.listCollections(),
    repository.listProducts({ pageSize: 1000 }),
  ]);

  // Раздел без единого образа на главную не выходит и в счёт не идёт:
  // плитка вела бы на страницу «ничего не нашлось», а цифра обещала бы
  // больше, чем есть в каталоге. Так же считает блок вопросов-ответов.
  const filled = new Set(allProducts.items.map((p) => p.categorySlug));
  const categories = allCategories.filter((c) => filled.has(c.slug));

  const locale = await getLocale();
  const categoryLabels = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      categoryTitle(category, locale),
    ]),
  );

  return (
    <>
      <HomeHero lookCount={allProducts.total} />
      <CollectionIntro />
      <CategoryNavigation categories={categories} />
      <FeaturedCollection
        products={featured}
        categoryLabels={categoryLabels}
        collection={collections[0]}
      />
      <TwoWays />
      <HeritageStory
        lookCount={allProducts.total}
        sectionCount={categories.length}
      />
      <StoreBlock />
      <HomeFaq />
      <ClosingInvitation />
    </>
  );
}
