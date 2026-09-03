import { Container } from "@/components/layout/Container";
import { OrnamentBand } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/i18n/server";

/**
 * Образа с таким адресом нет. Не пустой экран и не системная ошибка —
 * та же типографика и та же кайма, что на остальных страницах.
 */
export default async function ProductNotFound() {
  const t = await getDictionary();
  return (
    <Container className="flex flex-col items-center py-32 text-center lg:py-48">
      <OrnamentBand motif="mavj" height={10} className="max-w-[10rem]" />
      <h1 className="t-h1 mt-10 max-w-[16ch] text-balance">
        {t.meta.notFound}
      </h1>
      <p className="t-lead mt-6 max-w-[40ch]">{t.misc.notFoundHint}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button href="/catalog">{t.misc.backToCollection}</Button>
        <Button href="/" variant="secondary">
          {t.misc.toHome}
        </Button>
      </div>
    </Container>
  );
}
