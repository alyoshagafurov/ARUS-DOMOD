"use server";

import { redirect } from "next/navigation";

import { checkPassword, endSession, startSession } from "@/lib/admin/auth";

/** Разрешаем возврат только внутрь админки — открытый редирект не нужен */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  if (!checkPassword(password)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }
  await startSession();
  redirect(next);
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
