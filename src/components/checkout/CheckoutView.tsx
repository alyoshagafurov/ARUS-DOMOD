"use client";

import { useState, type FormEvent } from "react";

import { CartSummary } from "@/components/cart/CartSummary";
import {
  useCartProducts,
  type CartTotals,
} from "@/components/cart/useCartProducts";
import { PaymentPlaceholder } from "@/components/checkout/PaymentPlaceholder";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { clearCart } from "@/lib/cart";
import { contact } from "@/lib/config/site";
import { formatMoney } from "@/lib/format";
import { useDictionary, useLocale } from "@/lib/i18n/client";
import type { Order } from "@/lib/orders/types";

type Delivery = "pickup" | "courier";

interface OrderResponse {
  order: Order;
  whatsapp: { primary: string; secondary: string | null };
  message: string;
}

const field =
  "mt-2 h-12 w-full rounded-md border border-strong bg-white px-4 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-quiet)] placeholder:text-ink-muted focus:border-accent focus:shadow-raise";

/** Сегодняшняя дата в формате input[type=date] — раньше неё свадьбы не бывает */
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Оформление заказа.
 *
 * Форма отправляет черновик в /api/orders; сервер сам собирает цены и
 * названия из каталога, присваивает номер и сохраняет заказ. В ответ
 * приходит ссылка на WhatsApp администратора с готовым текстом — клиент
 * открывает её одним касанием.
 *
 * В заказ входят только покупки. Прокат оформляется в магазине, поэтому
 * строки проката из корзины в черновик не попадают, а форма об этом
 * говорит прямо.
 *
 * Поля — нативные. Самодельные контролы пришлось бы заново учить клавиатуре,
 * скринридеру и автозаполнению телефона, а они это умеют сами.
 */
export function CheckoutView() {
  const t = useDictionary();
  const locale = useLocale();
  const { ready, totals } = useCartProducts();
  const [delivery, setDelivery] = useState<Delivery>("pickup");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const draft = {
      customer: {
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
      },
      delivery: {
        method: delivery,
        address: String(form.get("address") ?? ""),
      },
      weddingDate: String(form.get("weddingDate") ?? ""),
      comment: String(form.get("comment") ?? ""),
      locale,
      lines: totals.purchase.map(({ line }) => ({
        productId: line.productId,
        variantId: line.variantId,
        offerKind: "purchase",
        quantity: line.quantity,
      })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await response.json()) as OrderResponse & {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? t.checkout.genericError);
        return;
      }
      setResult(data);
      clearCart();
    } catch {
      setError(t.checkout.networkError);
    } finally {
      setPending(false);
    }
  };

  const copyMessage = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // буфер недоступен — текст всё равно виден на экране
    }
  };

  /* ---------- Заказ принят ---------------------------------------------- */
  if (result) {
    const { order } = result;
    return (
      <Container width="narrow" className="py-8 lg:py-12">
        <div
          data-surface="green"
          className="aivan mx-auto max-w-[44rem] overflow-hidden p-[var(--block-pad)]"
        >
          <p className="t-label flex items-center gap-3 text-ink-accent">
            <span className="t-num text-[1.5rem] text-gold-ink">
              {order.id.replace(/\D/g, "")}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
            {t.checkout.order} {order.id}
          </p>
          <h1 className="t-display-2 mt-5 text-balance">
            {t.checkout.accepted}
          </h1>
          <p className="t-lead mt-6 max-w-[40ch]">{t.checkout.acceptedLead}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={result.whatsapp.primary} external size="lg">
              {t.checkout.sendWhatsApp} · {contact.phoneName}
            </Button>
            {result.whatsapp.secondary ? (
              <Button
                href={result.whatsapp.secondary}
                external
                variant="secondary"
                size="lg"
              >
                {contact.phoneSecondaryName}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[44rem]">
          <dl className="flex flex-col border-t border-hairline">
            {order.lines.map((line) => (
              <div
                key={`${line.productId}-${line.size ?? ""}`}
                className="flex items-baseline justify-between gap-4 border-b border-hairline py-3"
              >
                <dt className="min-w-0">
                  <span className="t-body-sm block">
                    {line.title}
                    {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                  </span>
                  <span className="t-caption">
                    {line.article ? `${line.article}` : ""}
                    {line.size
                      ? ` · ${t.product.size.toLowerCase()} ${line.size}`
                      : ""}
                  </span>
                </dt>
                <dd className="t-price shrink-0">
                  {formatMoney(line.lineTotal)}
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 py-4">
              <dt className="t-label">{t.cart.total}</dt>
              <dd className="t-price text-[1.0625rem]">
                {formatMoney(order.totals.grand)}
              </dd>
            </div>
          </dl>

          <details className="mt-6 rounded-[var(--radius-card)] border border-hairline">
            <summary className="tap-row cursor-pointer px-4 text-ink-secondary">
              <span className="t-label">{t.checkout.orderText}</span>
            </summary>
            <pre className="t-body-sm max-h-80 overflow-auto whitespace-pre-wrap px-4 pb-4 text-ink-secondary">
              {result.message}
            </pre>
            <div className="px-4 pb-4">
              <Button variant="secondary" size="sm" onClick={copyMessage}>
                {copied ? t.checkout.copied : t.checkout.copy}
              </Button>
            </div>
          </details>

          <p className="t-caption mt-8">{t.checkout.acceptedNote(order.id)}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/catalog" variant="secondary">
              {t.checkout.backToCatalog}
            </Button>
            <Button href="/" variant="ghost">
              {t.checkout.toHome}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  /* ---------- Пусто ------------------------------------------------------ */
  if (ready && totals.purchase.length === 0) {
    return (
      <Container className="flex flex-col items-center py-24 text-center lg:py-32">
        <span aria-hidden="true" className="hoshiya-line max-w-[6rem]" />
        <h1 className="t-h1 mt-9">
          {totals.rental.length ? t.checkout.noPurchases : t.cart.empty}
        </h1>
        <p className="t-body-sm mt-4 max-w-[40ch] text-ink-secondary">
          {totals.rental.length ? t.checkout.noPurchasesHint : t.cart.emptyHint}
        </p>
        <Button href="/catalog" className="mt-8">
          {t.cart.browse}
        </Button>
      </Container>
    );
  }

  /* ---------- Форма ------------------------------------------------------ */
  return (
    <Container className="pb-[var(--space-section-y)] pt-4 lg:pt-8">
      <h1 className="t-h1">{t.checkout.title}</h1>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-x-[var(--gutter)] gap-y-12 lg:mt-10 lg:grid-cols-12"
      >
        <div className="flex flex-col gap-9 lg:col-span-7">
          <section aria-labelledby="contact-title">
            <h2 id="contact-title" className="t-label text-ink-muted">
              {t.checkout.contact}
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="t-body-sm">{t.checkout.name}</span>
                <input
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  className={field}
                />
              </label>

              <label className="block">
                <span className="t-body-sm">{t.checkout.phone}</span>
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
                  {t.checkout.phoneHint}
                </span>
              </label>

              <label className="block sm:col-span-2">
                <span className="t-body-sm">{t.checkout.weddingDate}</span>
                <input
                  name="weddingDate"
                  type="date"
                  min={today()}
                  className={field}
                />
                <span className="t-caption mt-2 block">
                  {t.checkout.weddingHint}
                </span>
              </label>
            </div>
          </section>

          <fieldset className="border-t border-hairline pt-7">
            <legend className="t-label float-left w-full pb-4 text-ink-muted">
              {t.checkout.receive}
            </legend>
            <div className="clear-both flex flex-col">
              {(
                [
                  ["pickup", t.checkout.pickup, t.checkout.pickupNote],
                  ["courier", t.checkout.courier, t.checkout.courierNote],
                ] as [Delivery, string, string][]
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
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
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
                <span className="t-body-sm">{t.checkout.address}</span>
                <input
                  name="address"
                  type="text"
                  required
                  minLength={4}
                  autoComplete="street-address"
                  className={field}
                />
              </label>
            ) : null}
          </fieldset>

          <label className="block border-t border-hairline pt-7">
            <span className="t-label text-ink-muted">{t.checkout.comment}</span>
            <textarea
              name="comment"
              rows={4}
              maxLength={1000}
              className="mt-4 w-full resize-y rounded-md border border-strong bg-white p-4 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:border-accent focus:shadow-raise"
            />
          </label>

          <PaymentPlaceholder />
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <div
            data-surface="day"
            className="card card--float p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:p-8"
          >
            <h2 className="t-label text-gold-ink">{t.checkout.summary}</h2>

            <ul className="mt-5 flex flex-col border-t border-hairline">
              {totals.purchase.map(({ line, product, total }) => (
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
                      {product.article ?? ""}
                      {line.size
                        ? ` · ${t.product.size.toLowerCase()} ${line.size}`
                        : ""}
                    </span>
                  </span>
                  <span className="t-price shrink-0">{formatMoney(total)}</span>
                </li>
              ))}
            </ul>

            {totals.rental.length ? (
              <p className="t-caption mt-4 rounded-md border border-hairline p-3">
                {t.cart.rentalExcluded(totals.rental.length)}
              </p>
            ) : null}

            <div className="mt-5">
              <CartSummary
                totals={
                  {
                    ...totals,
                    rental: [],
                    rentalSum: null,
                    depositSum: null,
                    grandTotal: totals.purchaseSum,
                    items: totals.purchase.reduce(
                      (n, { line }) => n + line.quantity,
                      0,
                    ),
                  } satisfies CartTotals
                }
              />
            </div>

            {error ? (
              <p
                role="alert"
                className="t-body-sm mt-5 rounded-md border border-danger px-4 py-3 text-danger"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth className="mt-7" disabled={pending}>
              {pending ? t.checkout.submitting : t.checkout.submit}
            </Button>
            <p className="t-caption mt-4">{t.checkout.submitNote}</p>
          </div>
        </div>
      </form>
    </Container>
  );
}
