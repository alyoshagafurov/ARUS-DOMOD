import Link from "next/link";
import { DeleteButton, SubmitButton } from "@/components/admin/pending";
import { notFound } from "next/navigation";

import { ImageField } from "@/components/admin/ImageField";
import { Field, Section, Text, TextArea } from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { catalog } from "@/lib/catalog";

import { deleteCategoryAction, saveCategoryAction } from "../actions";

const ERRORS: Record<string, string> = {
  title: "Укажите название",
  slug: "Такой адрес уже занят",
  used: "В категории есть товары — сначала перенесите их",
};

export default async function AdminCategoryEditPage({
  params,
  searchParams,
}: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const isNew = id === "new";
  const categories = await catalog().listCategories();
  const category = isNew ? null : categories.find((c) => c.id === id);
  if (!isNew && !category) notFound();
  const error = typeof query.error === "string" ? ERRORS[query.error] : null;

  return (
    <>
      <p className="t-label text-ink-muted">
        <Link href="/admin/categories" className="motion-underline">
          Категории
        </Link>{" "}
        / {isNew ? "новая" : category!.title}
      </p>
      <h1 className="t-h1 mt-3">
        {isNew ? "Новая категория" : category!.title}
      </h1>
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
        action={saveCategoryAction}
        className="mt-8 flex max-w-[44rem] flex-col gap-8"
      >
        {category ? (
          <input type="hidden" name="id" value={category.id} />
        ) : null}
        <Section title="Название">
          <Field label="Название">
            <Text name="title" defaultValue={category?.title} required />
          </Field>
          <Field label="На таджикском">
            <Text name="titleTg" defaultValue={category?.titleTg} />
          </Field>
          <Field label="На английском">
            <Text name="titleEn" defaultValue={category?.titleEn} />
          </Field>
          <Field label="Адрес" hint="Латиницей; пусто — из названия">
            <Text name="slug" defaultValue={category?.slug} />
          </Field>
          <Field label="Порядок">
            <Text
              name="order"
              type="number"
              min={1}
              defaultValue={category?.order ?? categories.length + 1}
            />
          </Field>
          <Field label="Описание" className="sm:col-span-2">
            <TextArea
              name="description"
              defaultValue={category?.description}
              rows={3}
            />
          </Field>
        </Section>
        <section className="border-t border-hairline pt-6">
          <h2 className="t-label text-ink-muted">Кадр раздела</h2>
          <div className="mt-4">
            <ImageField
              name="image"
              initial={category?.image ? [category.image] : []}
              alt={category?.title ?? "Раздел"}
              max={1}
            />
          </div>
        </section>
        <div className="flex flex-wrap gap-3 border-t border-hairline pt-6">
          <SubmitButton pendingLabel="Сохраняю…">Сохранить</SubmitButton>
          <Button href="/admin/categories" variant="ghost">
            Отмена
          </Button>
        </div>
      </form>

      {category ? (
        <form
          action={deleteCategoryAction}
          className="mt-10 border-t border-hairline pt-6"
        >
          <input type="hidden" name="id" value={category.id} />
          <DeleteButton
            label="Удалить раздел"
            confirmText={`Удалить раздел «${category?.title ?? "раздел"}»? Товары в нём останутся без раздела.`}
          />
        </form>
      ) : null}
    </>
  );
}
