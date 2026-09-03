import { getDictionary } from "@/lib/i18n/server";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.meta.favorites, robots: { index: false, follow: false } };
}

export default function FavoritesPage() {
  return <FavoritesView />;
}
