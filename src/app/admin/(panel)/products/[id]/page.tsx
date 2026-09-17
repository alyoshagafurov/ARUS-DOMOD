import Link from "next/link";
import { notFound } from "next/navigation";

import { ColorPicker, type SelectedColor } from "@/components/admin/ColorPicker";
import {
  Field,
  Group,
  Section,
  Select,
  Text,
  TextArea,
} from "@/components/admin/form";
import { ImageField } from "@/components/admin/ImageField";
import { DeleteButton, SubmitButton } from "@/components/admin/pending";
import { SizePicker } from "@/components/admin/SizePicker";
import { Button } from "@/components/ui/Button";
import { catalog } from "@/lib/catalog";
import {
  COLOR_PRESETS,
  SIZE_PRESETS,
  compareSizes,
  productColors,
  productSizes,
} from "@/lib/catalog/variants";
import { readCatalog } from "@/lib/db/catalog-store";

import { deleteProductAction, saveProductAction } from "../actions";

const ERRORS: Record<string, string> = {
  title: "Укажите название",
  price: "Укажите цену покупки или проката",
};

const toMajor = (minor?: number) => (minor ? String(minor / 100) : "");

/**
 * Карточка товара.
 *
 * Здесь только то, что владелец знает и хочет вписать сам: название,
 * раздел, описание, цены, наличие, размеры, цвета и фото. Артикул и
 * адрес страницы сайт присваивает сам — человеку они ничего не дают,
 * а ошибка в адресе ломала сохранение. Срок проката и залог в карточку
 * не пишутся: их обсуждают в магазине лично.
 */
export default async function AdminProductEditPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const isNew = id === "new";
  // Товары — прямо из базы, без скидок. Через catalog() сюда пришла бы
  // сниженная цена, и «Сохранить» записал бы её как обычную.
  const { products: items, featuredSlugs } = readCatalog();
  const categories = await catalog().listCategories();
  const product = isNew ? null : items.find((p) => p.id === id);
  if (!isNew && !product) notFound();

  const buy = product?.offers.find((o) => o.kind === "purchase");
  const rent = product?.offers.find((o) => o.kind === "rental");

  // Варианты выбора — заготовки плюс всё, что уже встречается в каталоге:
  // размер или цвет, вписанный у одного товара, сам появится у следующего.
  const sizeOptions = [
    ...new Set([...SIZE_PRESETS, ...items.flatMap(productSizes)]),
  ].sort(compareSizes);
  const colorOptions = [...COLOR_PRESETS, ...items.flatMap(productColors)];

  const initialColors: SelectedColor[] = product
    ? productColors(product).map((color) => ({
        ...color,
        images: product.images.filter((image) => image.color === color.name),
      }))
    : [];
  const commonImages = product?.images.filter((image) => !image.color) ?? [];
  const title = product?.title ?? "Товар ARUS DOMOD";
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
      <p className="t-caption mt-2">
        {product?.article
          ? `Артикул ${product.article} · присвоен автоматически`
          : "Артикул и адрес страницы сайт присвоит сам после сохранения."}
      </p>
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

        <Section title="Основное">
          <Field label="Название">
            <Text name="title" defaultValue={product?.title} required />
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
          <Field label="Описание" className="sm:col-span-2">
            <TextArea name="description" defaultValue={product?.description} />
          </Field>
        </Section>

        <Section title="Цены">
          <Field label="Цена, сомони" hint="Пусто — образ не продаётся">
            <Text
              name="purchase"
              type="number"
              step="0.01"
              min={0}
              defaultValue={toMajor(buy?.price.amount)}
            />
          </Field>
          <Field
            label="Цена проката, сомони"
            hint="Пусто — прокат недоступен. Срок и залог обсуждаются в магазине"
          >
            <Text
              name="rental"
              type="number"
              step="0.01"
              min={0}
              defaultValue={toMajor(rent?.price.amount)}
            />
          </Field>
        </Section>

        <Section title="Наличие и размеры">
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
          <label className="flex min-h-11 items-center gap-3 self-end sm:pb-0.5">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={
                product ? featuredSlugs.includes(product.slug) : false
              }
              className="h-5 w-5 accent-[var(--accent)]"
            />
            <span className="t-body-sm">Показывать на главной</span>
          </label>
          <Group
            label="Размеры"
            hint="Нажмите на размер, чтобы выбрать или снять. Нужного нет — впишите число и нажмите галочку."
            className="sm:col-span-2"
          >
            <SizePicker
              name="sizes"
              initial={product ? productSizes(product) : []}
              options={sizeOptions}
            />
          </Group>
        </Section>

        <section className="border-t border-hairline pt-6">
          <h2 className="t-label text-ink-muted">Цвета</h2>
          <p className="t-caption mt-2 max-w-[60ch]">
            Выберите цвета, в которых есть образ. К каждому цвету можно
            загрузить свои фото — на сайте они покажутся, когда покупатель
            выберет этот цвет.
          </p>
          <div className="mt-4">
            <ColorPicker
              name="colors"
              initial={initialColors}
              options={colorOptions}
              alt={title}
            />
          </div>
        </section>

        <section className="border-t border-hairline pt-6">
          <h2 className="t-label text-ink-muted">Кадры</h2>
          <p className="t-caption mt-2 max-w-[60ch]">
            Общие фото образа. Первое — главное: его видно в каталоге и на
            главной.
          </p>
          <div className="mt-4">
            <ImageField name="images" initial={commonImages} alt={title} />
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-hairline pt-6">
          <SubmitButton pendingLabel="Сохраняю…">Сохранить</SubmitButton>
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
          <DeleteButton
            label="Удалить товар"
            confirmText={`Удалить «${product.title}» без возможности вернуть?`}
          />
        </form>
      ) : null}
    </>
  );
}
