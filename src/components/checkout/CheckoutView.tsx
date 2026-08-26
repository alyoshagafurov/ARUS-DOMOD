"use client";

import { useState, type FormEvent } from "react";

import { CartSummary } from "@/components/cart/CartSummary";
import {
  useCartProducts,
  type CartTotals,
} from "@/components/cart/useCartProducts";
import { PaymentPlaceholder } from "@/components/checkout/PaymentPlaceholder";
import { Container } from "@/components/layout/Container";
import { OrnamentBand } from "@/components/ornament/Ornament";
import { Button } from "@/components/ui/Button";
import { clearCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

type Delivery = "pickup" | "courier";

const field =
  "mt-2 h-12 w-full border border-hairline bg-transparent px-4 text-ink outline-none transition-colors duration-[var(--dur-fast)] focus:border-accent";

/**
 * Оформление заказа — прототип.
 *
 * Никакого бэкенда, платежа и создания заказа здесь нет: форма проверяется
 * средствами браузера и показывает состояние «принято» без номера заказа,
 * потому что придумывать номер, похожий на настоящий, нельзя.
 *
 * Поля — нативные. Самодельные контролы пришлось бы заново учить клавиатуре,
 * скринридеру и автозаполнению телефона, а они это умеют сами.
 */
export function CheckoutView() {
  const { ready, totals } = useCartProducts();
  const [delivery, setDelivery] = useState<Delivery>("pickup");
  const [done, setDone] = useState<CartTotals | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDone(totals);
    clearCart();
  };

  if (done) {
    return (
      <Container className="flex flex-col items-center py-24 text-center lg:py-32">
        <OrnamentBand motif="chorkhona" height={12} className="max-w-[9rem]" />
        <h1 className="t-h1 mt-9 max-w-[18ch] text-balance">Спасибо</h1>
        <p className="t-lead mt-5 max-w-[40ch]">
          Ваш заказ принят. Мы свяжемся с вами, чтобы подтвердить состав и
          сроки.
        </p>
        <p className="t-caption mt-7 max-w-[46ch]">
          Это демонстрационный прототип: заказ никуда не отправлен, оплата не
          проводилась, номер заказа не присваивается — приём заявок появится
          вместе с бэкендом.
        </p>
        {done.grandTotal ? (
          <p className="t-price mt-8 text-[1.0625rem]">
            {done.items} образа · {formatMoney(done.grandTotal)}
          </p>
        ) : null}
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="/catalog">Вернуться в коллекцию</Button>
          <Button href="/" variant="secondary">
            На главную
          </Button>
        </div>
      </Container>
    );
  }

  if (ready && totals.items === 0) {
    return (
      <Container className="flex flex-col items-center py-24 text-center lg:py-32">
        <OrnamentBand motif="mavj" height={10} className="max-w-[9rem]" />
        <h1 className="t-h1 mt-9">Корзина пуста</h1>
        <p className="t-body-sm mt-4 max-w-[38ch] text-ink-secondary">
          Оформлять пока нечего — выберите образы в коллекции.
        </p>
        <Button href="/catalog" className="mt-8">
          Смотреть коллекцию
        </Button>
      </Container>
    );
  }

  return (
    <Container className="pb-[var(--space-section-y)] pt-4 lg:pt-8">
      <h1 className="t-h1">Оформление</h1>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-x-[var(--gutter)] gap-y-12 lg:mt-10 lg:grid-cols-12"
      >
        <div className="flex flex-col gap-9 lg:col-span-7">
          <section aria-labelledby="contact-title">
            <h2 id="contact-title" className="t-label text-ink-muted">
              Контактные данные
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="t-body-sm">Имя</span>
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className={field}
                />
              </label>

              <label className="block">
                <span className="t-body-sm">Телефон</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+992"
                  aria-describedby="phone-hint"
                  className={field}
                />
                <span id="phone-hint" className="t-caption mt-2 block">
                  Для подтверждения заказа
                </span>
              </label>
            </div>
          </section>

          <fieldset className="border-t border-hairline pt-7">
            <legend className="t-label float-left w-full pb-4 text-ink-muted">
              Получение
            </legend>
            <div className="clear-both flex flex-col">
              {(
                [
                  ["pickup", "Самовывоз", "Забрать заказ на месте"],
                  [
                    "courier",
                    "Доставка",
                    "Условия согласуем при подтверждении",
                  ],
                ] as const
              ).map(([value, label, note]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-start gap-3 border-b border-hairline py-4"
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={value}
                    checked={delivery === value}
                    onChange={() => setDelivery(value)}
                    className="mt-1 h-4 w-4 accent-[var(--accent)]"
                  />
                  <span>
                    <span className="t-body-sm block">{label}</span>
                    <span className="t-caption mt-1 block">{note}</span>
                  </span>
                </label>
              ))}
            </div>

            {delivery === "courier" ? (
              <label className="mt-5 block">
                <span className="t-body-sm">Адрес доставки</span>
                <input
                  name="address"
                  type="text"
                  required
                  autoComplete="street-address"
                  className={field}
                />
              </label>
            ) : null}
          </fieldset>

          <label className="block border-t border-hairline pt-7">
            <span className="t-label text-ink-muted">Комментарий к заказу</span>
            <textarea
              name="comment"
              rows={4}
              className="mt-4 w-full resize-y border border-hairline bg-transparent p-4 text-ink outline-none transition-colors duration-[var(--dur-fast)] focus:border-accent"
            />
          </label>

          <PaymentPlaceholder />
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <h2 className="t-label text-ink-muted">Состав заказа</h2>

            <ul className="mt-5 flex flex-col border-t border-hairline">
              {[...totals.purchase, ...totals.rental].map(
                ({ line, product, offer, total }) => (
                  <li
                    key={line.id}
                    className="flex items-baseline justify-between gap-4 border-b border-hairline py-3"
                  >
                    <span className="min-w-0">
                      <span className="t-body-sm block truncate">
                        {product.title}
                        {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                      </span>
                      <span className="t-caption">
                        {offer.kind === "rental" ? "Прокат" : "Покупка"}
                        {line.size ? ` · размер ${line.size}` : ""}
                      </span>
                    </span>
                    <span className="t-price shrink-0">
                      {formatMoney(total)}
                    </span>
                  </li>
                ),
              )}
            </ul>

            <div className="mt-5">
              <CartSummary totals={totals} />
            </div>

            <Button type="submit" fullWidth className="mt-7">
              Оформить заказ
            </Button>
            <p className="t-caption mt-4">
              Нажимая кнопку, вы оставляете заявку — оплата на сайте пока не
              проводится.
            </p>
          </div>
        </div>
      </form>
    </Container>
  );
}
