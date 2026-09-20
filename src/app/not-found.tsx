import { Container } from "@/components/layout/Container";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/i18n/server";

/**
 * Адрес не подошёл ни одному маршруту.
 *
 * Эта страница лежит в корне, а не в группе витрины: группа отвечает
 * только за свои маршруты, а совсем неизвестный адрес до неё не доходит —
 * и человек получал системный экран Next по-английски, без шапки и без
 * единой ссылки назад. Шапка и подвал подключены здесь же, чтобы страница
 * выглядела частью магазина, а не сбоем.
 */
export default async function NotFound() {
  const t = await getDictionary();
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container className="flex flex-col items-center py-32 text-center lg:py-48">
          <span aria-hidden="true" className="hoshiya-seam max-w-[10rem]" />
          <h1 className="t-h1 mt-10 max-w-[16ch] text-balance">
            {t.misc.pageNotFound}
          </h1>
          <p className="t-lead mt-6 max-w-[40ch]">{t.misc.pageNotFoundHint}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/catalog">{t.misc.backToCollection}</Button>
            <Button href="/" variant="secondary">
              {t.misc.toHome}
            </Button>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
