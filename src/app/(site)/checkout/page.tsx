import { getDictionary } from "@/lib/i18n/server";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.meta.checkout };
}

export default function CheckoutPage() {
  return <CheckoutView />;
}
