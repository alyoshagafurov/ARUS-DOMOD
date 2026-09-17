import { indexNowKey } from "@/lib/seo/indexnow";

export const dynamic = "force-dynamic";

/** Ключ IndexNow — по нему поисковик проверяет, что оповещение от владельца */
export function GET() {
  const key = indexNowKey();
  return key
    ? new Response(key, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      })
    : new Response("Not found", { status: 404 });
}
