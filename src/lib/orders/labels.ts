import type { OrderStatus } from "@/lib/orders/types";

/** Человеческие имена статусов — в том порядке, в каком заказ по ним идёт */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новый",
  confirming: "На подтверждении",
  confirmed: "Подтверждён",
  awaiting_payment: "Ожидает оплаты",
  paid: "Оплачен",
  in_delivery: "Передан в доставку",
  delivered: "Доставлен",
  completed: "Завершён",
  cancelled: "Отменён",
};
