import { indexNowKey } from "@/lib/seo/indexnow";

export const dynamic = "force-dynamic";

/**
 * Запасной адрес ключа IndexNow.
 *
 * Основной — `/<ключ>.txt` из `public/`: его имя равно самому ключу, как
 * требует протокол, и именно он уходит в поле keyLocation. Этот маршрут
 * остаётся, потому что прежний ключ был зарегистрирован по нему: пусть
 * поисковик, который помнит старый адрес, получает действующий ключ.
 */
export function GET() {
  return new Response(indexNowKey(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
