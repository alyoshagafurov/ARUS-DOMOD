import { BrandStatement } from "@/components/home/BrandStatement";
import { CategoryNavigation } from "@/components/home/CategoryNavigation";
import { ClosingInvitation } from "@/components/home/ClosingInvitation";
import { CollectionIntro } from "@/components/home/CollectionIntro";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { HeritageStory } from "@/components/home/HeritageStory";
import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { RentalBand } from "@/components/home/RentalBand";
import { SocialProof } from "@/components/home/SocialProof";
import { catalog } from "@/lib/catalog";

/**
 * Главная — журнальный разворот, внутри которого стоит магазин.
 *
 * Последовательность ролей, а не череда одинаковых прямоугольников:
 *
 *   БРЕНД      hero на поле логотипа — имя, функция, действие
 *   РАЗВОРОТ   крупный план ткани: материал и мастерство вблизи
 *   РАЗДЕЛЫ    плотный ряд категорий
 *   КОЛЛЕКЦИЯ  витрина образов
 *   НАСЛЕДИЕ   кадр торжества, уходящий за край экрана
 *   ПРОКАТ     отдельная полоса: прокат — не второй пункт покупки
 *   КАК КУПИТЬ пять шагов и получение
 *   ТИШИНА     архивный текстиль — единственная светлая пауза страницы
 *   СЕТЬ       профиль и ссылки, без поддельной ленты
 *   ДЕЙСТВИЕ   финальный кадр пары и одна кнопка
 *
 * Меняется не только содержимое: у каждой роли своя плотность, свой масштаб
 * и своя поверхность. Средой служит бирюза логотипа, светлое появляется
 * ровно один раз — на текстильном полотне, — чтобы пауза читалась как пауза.
 * Светлой эту секцию делает не прихоть ритма, а сам кадр: архивная ткань
 * почти вся кремовая, и тёмный текст на ней единственно возможен.
 *
 * Секции больше не подшиваются тканой лентой: границу держит золотая
 * волосяная линия, а орнамент ушёл в тональный грунт полей.
 *
 * Данные берутся только через catalog() — ни один компонент ниже не знает,
 * что за ним сейчас стоят демонстрационные записи.
 */
export default async function HomePage() {
  const repository = catalog();

  const [featured, categories, collections] = await Promise.all([
    repository.listFeatured(),
    repository.listCategories(),
    repository.listCollections(),
  ]);

  const categoryLabels = Object.fromEntries(
    categories.map((category) => [category.slug, category.title]),
  );

  return (
    <>
      <HomeHero />
      <CollectionIntro />
      <CategoryNavigation categories={categories} />

      <FeaturedCollection
        products={featured}
        categoryLabels={categoryLabels}
        collection={collections[0]}
      />

      <HeritageStory />
      <RentalBand />
      <HowItWorks />
      <BrandStatement />
      <SocialProof />
      <ClosingInvitation />
    </>
  );
}
