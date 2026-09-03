import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/admin/form";
import { contact } from "@/lib/config/site";
import { formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders/labels";
import { getOrder } from "@/lib/orders/store";
import { ORDER_STATUSES } from "@/lib/orders/types";
import { formatOrderMessage, whatsappLink } from "@/lib/orders/whatsapp";

import { setOrderStatus } from "../actions";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
  });
const fmtDay = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

export default async function AdminOrderPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  const message = formatOrderMessage(order);

  return (
    <>
      <p className="t-label text-ink-muted">
        <Link href="/admin/orders" className="motion-underline">
          Заказы
        </Link>{" "}
        / {order.id}
      </p>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="t-h1">Заказ {order.id}</h1>
        <span className="t-caption">{fmtDate(order.createdAt)}</span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          <section className="border-t border-hairline pt-6">
            <h2 className="t-label text-ink-muted">Клиент</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="t-caption">Имя</dt>
                <dd className="t-body">{order.customer.name}</dd>
              </div>
              <div>
                <dt className="t-caption">Телефон</dt>
                <dd className="t-body">
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="motion-underline"
                  >
                    {order.customer.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="t-caption">Получение</dt>
                <dd className="t-body">
                  {order.delivery.method === "courier"
                    ? "Доставка"
                    : "Самовывоз"}
                </dd>
              </div>
              {order.delivery.address ? (
                <div>
                  <dt className="t-caption">Адрес</dt>
                  <dd className="t-body">{order.delivery.address}</dd>
                </div>
              ) : null}
              {order.weddingDate ? (
                <div>
                  <dt className="t-caption">Дата свадьбы</dt>
                  <dd className="t-body">{fmtDay(order.weddingDate)}</dd>
                </div>
              ) : null}
            </dl>
            {order.comment ? (
              <p className="t-body-sm mt-4 border-l-2 border-accent pl-4 text-ink-secondary">
                {order.comment}
              </p>
            ) : null}
          </section>

          <section className="border-t border-hairline pt-6">
            <h2 className="t-label text-ink-muted">Товары</h2>
            <ul className="mt-4 flex flex-col border-t border-hairline">
              {order.lines.map((l, i) => (
                <li
                  key={i}
                  className="grid gap-1 border-b border-hairline py-3 sm:grid-cols-[1fr_5rem_7rem] sm:items-baseline sm:gap-4"
                >
                  <span className="min-w-0">
                    <Link
                      href={`/product/${l.slug}`}
                      className="t-body-sm motion-underline"
                    >
                      {l.title}
                    </Link>
                    <span className="t-caption block">
                      {l.article ?? ""}
                      {l.size ? ` · размер ${l.size}` : ""}
                      {l.color ? ` · ${l.color}` : ""}
                    </span>
                  </span>
                  <span className="t-caption tabular-nums">
                    {l.quantity} × {formatMoney(l.unitPrice)}
                  </span>
                  <span className="t-price sm:text-right">
                    {formatMoney(l.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <dt className="t-body-sm text-ink-secondary">Товары</dt>
                <dd className="t-price">{formatMoney(order.totals.goods)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="t-body-sm text-ink-secondary">Доставка</dt>
                <dd className="t-price">
                  {order.totals.delivery
                    ? formatMoney(order.totals.delivery)
                    : "уточняется"}
                </dd>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2">
                <dt className="t-label">Итого</dt>
                <dd className="t-price text-[1.0625rem]">
                  {formatMoney(order.totals.grand)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="border-t border-hairline pt-6">
            <h2 className="t-label text-ink-muted">Текст для WhatsApp</h2>
            <pre className="t-body-sm mt-4 max-h-96 overflow-auto whitespace-pre-wrap border border-hairline bg-raised p-4 text-ink-secondary">
              {message}
            </pre>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                href={whatsappLink(contact.phone, message)}
                external
                variant="secondary"
                size="sm"
              >
                Открыть в WhatsApp · {contact.phoneName}
              </Button>
              <Button
                href={whatsappLink(contact.phoneSecondary, message)}
                external
                variant="ghost"
                size="sm"
              >
                {contact.phoneSecondaryName}
              </Button>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <form action={setOrderStatus} className="border border-hairline p-5">
            <input type="hidden" name="id" value={order.id} />
            <label className="block">
              <span className="t-label text-ink-muted">Статус</span>
              <Select
                name="status"
                defaultValue={order.status}
                options={ORDER_STATUSES.map((s) => ({
                  value: s,
                  label: ORDER_STATUS_LABELS[s],
                }))}
              />
            </label>
            <Button type="submit" fullWidth className="mt-4">
              Сохранить статус
            </Button>
            <p className="t-caption mt-3">
              Обновлён: {fmtDate(order.updatedAt)}
            </p>
          </form>
        </aside>
      </div>
    </>
  );
}
