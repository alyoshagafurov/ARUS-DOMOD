import { OrnamentBand } from "@/components/ornament/Ornament";

/**
 * Место будущей онлайн-оплаты.
 *
 * Никакого обращения к Alif здесь нет и быть не должно: ни ключей, ни
 * запросов, ни имитации ответа. Блок описывает выбранный способ и честно
 * говорит, что интеграции пока нет.
 *
 * Когда появятся доступы, подключение сведётся к замене этого компонента
 * на форму провайдера — вокруг него ничего менять не придётся: состав заказа
 * и итог живут в корзине, а не здесь.
 */
export function PaymentPlaceholder() {
  return (
    <section
      aria-labelledby="payment-title"
      className="border-t border-hairline pt-7"
    >
      <h2 id="payment-title" className="t-label text-ink-muted">
        Оплата
      </h2>

      <div className="mt-5 border border-hairline p-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="t-h3">Онлайн-оплата</p>
          <p className="t-label text-ink-muted">Alif</p>
        </div>
        <OrnamentBand motif="mavj" height={8} className="mt-4 max-w-[6rem]" />
        <p className="t-caption mt-4">
          Интеграция будет подключена после предоставления API. Сейчас оплата на
          сайте не проводится.
        </p>
      </div>
    </section>
  );
}
