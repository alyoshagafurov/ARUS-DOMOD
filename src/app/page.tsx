import { BrandStatement } from "@/components/home/BrandStatement";
import { CategoryNavigation } from "@/components/home/CategoryNavigation";
import { ClosingInvitation } from "@/components/home/ClosingInvitation";
import { CollectionIntro } from "@/components/home/CollectionIntro";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { HeritageStory } from "@/components/home/HeritageStory";
import { HomeHero } from "@/components/home/HomeHero";
import { Divider } from "@/components/ui/Divider";
import { catalog } from "@/lib/catalog";

/**
 * Главная — журнальный разворот, внутри которого стоит магазин.
 *
 * Ритм поверхностей: ночь (кампания) → день (история дома) → день (витрина)
 * → ночь (наследие) → приглушённый день (разделы) → день (пауза) → ночь
 * (приглашение и подвал). Каждая смена поверхности подшита ҳошия.
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
      <HomeHero collection={collections[0]} />
      <CollectionIntro />

      <Divider variant="ornament" motif="mavj" />

      <FeaturedCollection
        products={featured}
        categoryLabels={categoryLabels}
        collection={collections[0]}
      />

      <HeritageStory />
      <CategoryNavigation categories={categories} />
      <BrandStatement />
      <ClosingInvitation />
    </>
  );
}
