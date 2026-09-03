"use client";

import { useDictionary } from "@/lib/i18n/client";

/**
 * Как происходит оплата.
 *
 * Сайт денег не принимает. После отправки заказа администратор связывается
 * с клиентом, подтверждает наличие и стоимость, сообщает реквизиты — и
 * клиент переводит деньги напрямую. Этот блок объясняет процесс словами
 * клиента, ничего не обещая сверх него.
 *
 * Компонент клиентский, потому что живёт внутри клиентской формы
 * оформления: серверный словарь (next/headers) в клиентский граф попасть
 * не может.
 *
 * Это же место — шов для будущего Alif: когда появятся доступы, здесь
 * встанет форма провайдера, а заказ к тому моменту уже будет сохранён
 * (см. /api/orders). Вокруг блока ничего менять не придётся.
 */
export function PaymentPlaceholder() {
  const t = useDictionary();
  const steps = t.checkout.paymentSteps;

  return (
    <section
      aria-labelledby="payment-title"
      className="border-t border-hairline pt-7"
    >
      <h2 id="payment-title" className="t-label text-ink-muted">
        {t.checkout.payment}
      </h2>

      <ol className="mt-5 flex flex-col">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex gap-4 border-b border-hairline py-4 first:border-t"
          >
            <span className="t-num w-8 shrink-0 text-[1.25rem] text-gold-ink">
              0{index + 1}
            </span>
            <span className="t-body-sm text-ink-secondary">{step}</span>
          </li>
        ))}
      </ol>

      <p className="t-caption mt-4">{t.checkout.paymentNote}</p>
    </section>
  );
}
