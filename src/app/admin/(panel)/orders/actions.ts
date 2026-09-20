"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { removeOrder } from "@/lib/orders/store";

/**
 * Убрать заявку из списка.
 *
 * Единственное действие в разделе заявок: статусов здесь нет, отвечать
 * владелец идёт в телефон, а в админке заявка нужна, чтобы её прочитать.
 * Но ошибочные и тестовые заказы убирать было нечем — список копился
 * навсегда. Номер убранной заявки повторно не выдаётся.
 */
export async function deleteOrderAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  removeOrder(id);
  revalidatePath("/admin/orders");
  redirect("/admin/orders?deleted=1");
}
