import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_COOKIE,
  createSessionToken,
  SESSION_TTL_SECONDS,
  sessionSecret,
  verifySessionToken,
} from "@/lib/admin/session";

/**
 * Вход в админку — по паролю из окружения.
 *
 * Один администратор, один пароль, без базы пользователей: ровно то, что
 * нужно магазину с одним владельцем. Пароль не хранится нигде, кроме
 * ADMIN_PASSWORD; если переменная не задана, админка недоступна вовсе —
 * а не открыта с пустым паролем.
 */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  // timingSafeEqual требует равной длины; разная длина — уже не совпадение,
  // но сравнить всё равно надо, чтобы не выдавать длину временем ответа
  return a.length === b.length
    ? timingSafeEqual(a, b)
    : timingSafeEqual(b, b) && false;
}

export async function startSession(): Promise<void> {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD не задан");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createSessionToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(token) && verifySessionToken(token!, secret);
}

/** Для серверных компонентов админки: нет сессии — на страницу входа */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
