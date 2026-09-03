/**
 * Сессия администратора — подписанная кука без базы и без библиотек.
 *
 * Токен: `<истекает>.<подпись>`, подпись — HMAC-SHA256 от срока действия на
 * секрете из окружения. Проверка не требует ничего, кроме секрета, поэтому
 * работает и в proxy (где нет базы), и в серверных компонентах.
 *
 * Только Web Crypto: proxy может исполняться в edge-рантайме, где node:crypto
 * недоступен, а Web Crypto есть везде.
 */
export const ADMIN_COOKIE = "arus_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function toBase64Url(buffer: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(buffer))
    binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(
    await crypto.subtle.sign("HMAC", key, encoder.encode(data)),
  );
}

/** Сравнение за постоянное время: длина подписи не должна выдавать себя */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(secret: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${expires}.${await hmac(secret, String(expires))}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<boolean> {
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || !signature) return false;
  if (expires < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, await hmac(secret, String(expires)));
}

export function sessionSecret(): string | null {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    null
  );
}
