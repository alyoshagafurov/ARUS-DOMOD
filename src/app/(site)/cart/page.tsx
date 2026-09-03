import { getDictionary } from "@/lib/i18n/server";
import { CartView } from "@/components/cart/CartView";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.meta.cart };
}

export default function CartPage() {
  return <CartView />;
}
