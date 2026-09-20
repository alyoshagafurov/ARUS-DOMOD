import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/i18n/server";

/**
 * Неизвестный адрес на витрине.
 *
 * Без этой страницы Next отдавал свою: чёрный экран, английская строка
 * «404 — This page could not be found», ни шапки, ни единой ссылки назад.
 * Человек, набравший адрес с опечаткой, упирался в тупик и уходил.
 */
export default async function SiteNotFound() {
  const t = await getDictionary();
  return (
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
  );
}
