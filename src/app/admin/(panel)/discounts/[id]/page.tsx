import Link from "next/link";
import { notFound } from "next/navigation";

import { DiscountFields } from "@/components/admin/DiscountFields";
import { DeleteButton, SubmitButton } from "@/components/admin/pending";
import { Button } from "@/components/ui/Button";
import { catalog } from "@/lib/catalog";
import { addDays, shopDay } from "@/lib/catalog/discounts";
import { getDiscount, readCatalog } from "@/lib/db/catalog-store";

import { deleteDiscountAction, saveDiscountAction } from "../actions";

const ERRORS: Record<string, string> = {
  percent: "Укажите скидку от 1 до 90%",
  targets: "Выберите хотя бы одну категорию или один товар",
  dates: "Проверьте даты: конец не может быть раньше начала",
};

/** Время запроса: даты по умолчанию считаются от сегодняшнего дня */
const requestTime = () => Date.now();

export default async function AdminDiscountPage({
  params,
  searchParams,
}: PageProps<"/admin/discounts/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const isNew = id === "new";
  const discount = isNew ? null : getDiscount(id);
  if (!isNew && !discount) notFound();

  // Цены — основные, прямо из базы: предпросмотр считает скидку от них,
  // а не от цены, которую уже снизила другая действующая скидка
  const { products } = readCatalog();
  const categories = await catalog().listCategories();
  const today = shopDay(requestTime());
  const error = typeof query.error === "string" ? ERRORS[query.error] : null;

  return (
    <>
      <p className="t-label text-ink-muted">
        <Link href="/admin/discounts" className="motion-underline">
          Скидки
        </Link>{" "}
        / {isNew ? "новая" : `${discount!.percent}%`}
      </p>
      <h1 className="t-h1 mt-3">
        {isNew ? "Новая скидка" : `Скидка ${discount!.percent}%`}
      </h1>
      {discount?.demo ? (
        <p className="t-caption mt-2">
          Демонстрационная скидка. Удалите её или сохраните со своими
          настройками.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="t-body-sm mt-3 text-danger">
          {error}
        </p>
      ) : null}

      <form
        action={saveDiscountAction}
        className="mt-8 flex max-w-[52rem] flex-col gap-8"
      >
        {discount ? <input type="hidden" name="id" value={discount.id} /> : null}

        <DiscountFields
          products={products.map((p) => ({
            id: p.id,
            title: p.title,
            article: p.article,
            categorySlug: p.categorySlug,
            image: p.images[0]?.url,
            price:
              p.offers.find((o) => o.kind === "purchase")?.price.amount ?? null,
          }))}
          categories={categories.map((c) => ({ slug: c.slug, title: c.title }))}
          initial={{
            percent: discount?.percent ?? 10,
            scope: discount?.scope ?? "products",
            categorySlugs: discount?.categorySlugs ?? [],
            productIds: discount?.productIds ?? [],
          }}
          from={discount ? shopDay(discount.startsAt) : today}
          to={discount ? shopDay(discount.endsAt) : addDays(today, 7)}
        />

        <div className="flex flex-wrap gap-3 border-t border-hairline pt-6">
          <SubmitButton pendingLabel="Сохраняю…">Сохранить скидку</SubmitButton>
          <Button href="/admin/discounts" variant="ghost">
            Отмена
          </Button>
        </div>
      </form>

      {discount ? (
        <form
          action={deleteDiscountAction}
          className="mt-10 border-t border-hairline pt-6"
        >
          <input type="hidden" name="id" value={discount.id} />
          <DeleteButton
            label="Удалить скидку"
            confirmText={`Удалить скидку ${discount.percent}%? Цены сразу вернутся к обычным.`}
          />
        </form>
      ) : null}
    </>
  );
}
