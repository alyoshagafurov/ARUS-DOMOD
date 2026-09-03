import { getDictionary } from "@/lib/i18n/server";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.meta.favorites };
}

export default function FavoritesPage() {
  return <FavoritesView />;
}
