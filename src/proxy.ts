import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_COOKIE,
  sessionSecret,
  verifySessionToken,
} from "@/lib/admin/session";
import {
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  LOCALE_PARAM,
} from "@/lib/i18n/locales";

/**
 * Вход в приложение: язык из адреса и защита админки.
 *
 * `?lang=tg` переносится в заголовок запроса — сервер отрисует страницу на
 * этом языке — и заодно в куку: человек, пришедший из поиска по
 * таджикской ссылке, остаётся на таджикском, переходя по сайту.
 *
 * В админке проверяется только подпись куки — базы здесь нет и быть не
 * должно. Страницы без сессии уходят на вход, API-запросы получают 401.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminPath) return withUrlLocale(request);
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

function withUrlLocale(request: NextRequest) {
  // Регистр не важен: `?lang=TG` — тот же таджикский
  const lang = request.nextUrl.searchParams.get(LOCALE_PARAM)?.toLowerCase();

  // Заголовок языка ставит только proxy. Пришедший снаружи удаляется:
  // сервер читает его раньше проверки на бота, и подделанный заголовок
  // обошёл бы правило «бот по основному адресу получает русскую версию».
  const headers = new Headers(request.headers);
  headers.delete(LOCALE_HEADER);
  if (!isLocale(lang)) return NextResponse.next({ request: { headers } });

  headers.set(LOCALE_HEADER, lang);
  const response = NextResponse.next({ request: { headers } });
  response.cookies.set(LOCALE_COOKIE, lang, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  // Всё, кроме статики: кадры, шрифты и сборка языка не имеют
  matcher: [
    "/((?!_next/static|_next/image|photo/|brand/|uploads/|favicon.ico|icon.png).*)",
  ],
};
