import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata = {
  title: "Оформление заказа",
  description:
    "Оформление заказа ARUS DOMOD: оставьте контакты — администратор подтвердит состав и стоимость.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
