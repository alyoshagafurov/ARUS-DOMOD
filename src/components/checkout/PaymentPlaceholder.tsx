import { contact } from "@/lib/config/site";

/**
 * Как происходит оплата.
 *
 * Сайт денег не принимает. После отправки заказа администратор связывается
 * с клиентом, подтверждает наличие и стоимость, сообщает реквизиты — и
 * клиент переводит деньги напрямую. Этот блок объясняет процесс словами
 * клиента, ничего не обещая сверх него.
 *
 * Это же место — шов для будущего Alif: когда появятся доступы, здесь
 * встанет форма провайдера, а заказ к тому моменту уже будет сохранён
 * (см. /api/orders). Вокруг блока ничего менять не придётся.
 */
export function PaymentPlaceholder() {
  const steps = [
    "Вы отправляете заказ — он сохраняется и уходит администратору в WhatsApp.",
    `${contact.phoneName} связывается с вами, подтверждает наличие и стоимость.`,
    "Вы получаете реквизиты и оплачиваете напрямую администратору.",
    "Заказ передаётся в доставку или ждёт вас в магазине.",
  ];

  return (
    <section
      aria-labelledby="payment-title"
      className="border-t border-hairline pt-7"
    >
      <h2 id="payment-title" className="t-label text-ink-muted">
        Оплата
      </h2>

      <ol className="mt-5 flex flex-col">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex gap-4 border-b border-hairline py-4 first:border-t"
          >
            <span className="t-price w-6 shrink-0 text-ink-accent">
              {index + 1}
            </span>
            <span className="t-body-sm text-ink-secondary">{step}</span>
          </li>
        ))}
      </ol>

      <p className="t-caption mt-4">
        Онлайн-оплата на сайте не проводится. Стоимость доставки согласуется
        отдельно.
      </p>
    </section>
  );
}
