import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_COOKIE,
  sessionSecret,
  verifySessionToken,
} from "@/lib/admin/session";

/**
 * Защита админки на входе в приложение.
 *
 * Проверяется только подпись куки — базы здесь нет и быть не должно.
 * Страницы без сессии уходят на вход, API-запросы получают 401: редирект
 * для fetch бессмыслен.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const secret = sessionSecret();
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authorised =
    Boolean(secret && token) && (await verifySessionToken(token!, secret!));
  if (authorised) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const login = request.nextUrl.clone();
  login.pathname = "/admin/login";
  login.search = "";
  if (pathname !== "/admin") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
