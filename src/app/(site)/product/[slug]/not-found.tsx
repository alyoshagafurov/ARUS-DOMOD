import { Container } from "@/components/layout/Container";
import { OrnamentBand } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";

/**
 * Образа с таким адресом нет. Не пустой экран и не системная ошибка —
 * та же типографика и та же кайма, что на остальных страницах.
 */
export default function ProductNotFound() {
  return (
    <Container className="flex flex-col items-center py-32 text-center lg:py-48">
      <OrnamentBand motif="mavj" height={10} className="max-w-[10rem]" />
      <h1 className="t-h1 mt-10 max-w-[16ch] text-balance">Образ не найден</h1>
      <p className="t-lead mt-6 max-w-[40ch]">
        Возможно, он больше не в коллекции или адрес набран с ошибкой.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button href="/catalog">Вернуться в коллекцию</Button>
        <Button href="/" variant="secondary">
          На главную
        </Button>
      </div>
    </Container>
  );
}
