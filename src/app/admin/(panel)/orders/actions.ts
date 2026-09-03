"use server";

import { revalidatePath } from "next/cache";

import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/types";
import { updateOrderStatus } from "@/lib/orders/store";

export async function setOrderStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!id || !ORDER_STATUSES.includes(status)) return;
  updateOrderStatus(id, status);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
