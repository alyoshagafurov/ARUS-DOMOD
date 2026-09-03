import Link from "next/link";
import { notFound } from "next/navigation";

import { ImageField } from "@/components/admin/ImageField";
import {
  Field,
  Section,
  Select,
  Text,
  TextArea,
} from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { catalog } from "@/lib/catalog";
import { readCatalog } from "@/lib/db/catalog-store";

import { deleteProductAction, saveProductAction } from "../actions";

const ERRORS: Record<string, string> = {
  title: "Укажите название",
  slug: "Такой адрес уже занят другим товаром",
  price: "Укажите цену покупки или проката",
};

const toMajor = (minor?: number) => (minor ? String(minor / 100) : "");

export default async function AdminProductEditPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const isNew = id === "new";
  const [{ items }, categories] = await Promise.all([
    catalog().listProducts({ pageSize: 1000 }),
    catalog().listCategories(),
  ]);
  const product = isNew ? null : items.find((p) => p.id === id);
  if (!isNew && !product) notFound();
  const { featuredSlugs } = readCatalog();

  const buy = product?.offers.find((o) => o.kind === "purchase");
  const rent = product?.offers.find((o) => o.kind === "rental");
  const sizes = [
    ...new Set(product?.variants.map((v) => v.size).filter(Boolean)),
  ].join(", ");
  const colors = [
    ...new Set(product?.variants.map((v) => v.colorName).filter(Boolean)),
  ].join(", ");
  const error = typeof query.error === "string" ? ERRORS[query.error] : null;

  return (
    <>
      <p className="t-label text-ink-muted">
        <Link href="/admin/products" className="motion-underline">
          Товары
        </Link>{" "}
        / {isNew ? "новый" : product!.title}
      </p>
      <h1 className="t-h1 mt-3">{isNew ? "Новый товар" : product!.title}</h1>
      {query.saved ? (
        <p role="status" className="t-body-sm mt-3 text-success">
          Сохранено
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="t-body-sm mt-3 text-danger">
          {error}
        </p>
      ) : null}

      <form
        action={saveProductAction}
        className="mt-8 flex max-w-[52rem] flex-col gap-8"
      >
        {product ? <input type="hidden" name="id" value={product.id} /> : null}

        <Section title="Название">
          <Field label="Название" className="sm:col-span-2">
            <Text name="title" defaultValue={product?.title} required />
          </Field>
          <Field label="Артикул" hint="Например AD-022">
            <Text
              name="article"
              defaultValue={product?.article}
              placeholder="AD-"
            />
          </Field>
          <Field
            label="Адрес страницы"
            hint="Латиницей; пусто — из артикула или названия"
          >
            <Text name="slug" defaultValue={product?.slug} />
          </Field>
          <Field label="Категория">
            <Select
              name="categorySlug"
              defaultValue={product?.categorySlug ?? categories[0]?.slug}
              options={categories.map((c) => ({
                value: c.slug,
                label: c.title,
              }))}
            />
          </Field>
          <Field label="Подзаголовок">
            <Text name="subtitle" defaultValue={product?.subtitle} />
          </Field>
          <Field label="Описание" className="sm:col-span-2">
            <TextArea name="description" defaultValue={product?.description} />
          </Field>
        </Section>

        <Section title="Покупка">
          <Field label="Цена, сомони" hint="Пусто — товар не продаётся">
            <Text
              name="purchase"
              type="number"
              step="0.01"
              min={0}
              defaultValue={toMajor(buy?.price.amount)}
            />
          </Field>
          <Field
            label="Старая цена, сомони"
            hint="Для перечёркивания при скидке"
          >
            <Text
              name="compareAt"
              type="number"
              step="0.01"
              min={0}
              defaultValue={toMajor(buy?.compareAtPrice?.amount)}
            />
          </Field>
        </Section>

        <Section title="Прокат">
          <Field label="Цена проката, сомони" hint="Пусто — прокат недоступен">
            <Text
              name="rental"
              type="number"
              step="0.01"
              min={0}
              defaultValue={toMajor(rent?.price.amount)}
            />
          </Field>
          <Field label="Срок, дней" hint="Не больше 3">
            <Text
              name="rentalDays"
              type="number"
              min={1}
              defaultValue={rent?.rentalPeriodDays ?? 3}
            />
          </Field>
          <Field label="Залог, сомони">
            <Text
              name="deposit"
              type="number"
              step="0.01"
              min={0}
              defaultValue={toMajor(rent?.deposit?.amount)}
            />
          </Field>
        </Section>

        <Section title="Наличие и варианты">
          <Field label="Наличие">
            <Select
              name="availability"
              defaultValue={product?.variants[0]?.availability ?? "in_stock"}
              options={[
                { value: "in_stock", label: "В наличии" },
                { value: "made_to_order", label: "Под заказ" },
                { value: "rental_only", label: "Только прокат" },
                { value: "sold_out", label: "Продано" },
              ]}
            />
          </Field>
          <Field label="Размеры" hint="Через запятую: 38, 40, 42">
            <Text name="sizes" defaultValue={sizes} />
          </Field>
          <Field label="Цвета" hint="Через запятую; пусто — без выбора цвета">
            <Text name="colors" defaultValue={colors} />
          </Field>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={
                product ? featuredSlugs.includes(product.slug) : false
              }
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span className="t-body-sm">Показывать на главной</span>
          </label>
        </Section>

        <section className="border-t border-hairline pt-6">
          <h2 className="t-label text-ink-muted">Кадры</h2>
          <div className="mt-4">
            <ImageField
              name="images"
              initial={product?.images ?? []}
              alt={product?.title ?? "Товар ARUS DOMOD"}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-hairline pt-6">
          <Button type="submit">Сохранить</Button>
          <Button href="/admin/products" variant="ghost">
            Отмена
          </Button>
        </div>
      </form>

      {product ? (
        <form
          action={deleteProductAction}
          className="mt-10 border-t border-hairline pt-6"
        >
          <input type="hidden" name="id" value={product.id} />
          <Button type="submit" variant="ghost" className="text-danger">
            Удалить товар
          </Button>
        </form>
      ) : null}
    </>
  );
}
