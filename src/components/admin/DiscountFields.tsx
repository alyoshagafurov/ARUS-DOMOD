"use client";

import Image from "next/image";
import { useId, useMemo, useState, type KeyboardEvent } from "react";

import { Field, Section, Text } from "@/components/admin/form";
import { cn } from "@/lib/cn";
import {
  MAX_PERCENT,
  MIN_PERCENT,
  discountedAmount,
} from "@/lib/catalog/discounts";
import { formatMoney, pluralRu } from "@/lib/format";
import type { DiscountScope, Money } from "@/types/catalog";

/** Товар для формы — только то, что нужно для выбора и предпросмотра */
export interface DiscountProduct {
  id: string;
  title: string;
  article?: string;
  categorySlug: string;
  image?: string;
  /** Основная цена покупки; null — образ только для проката */
  price: number | null;
}

const PRESETS = [5, 10, 15, 20, 25, 30, 40, 50];

const SCOPES: { value: DiscountScope; label: string }[] = [
  { value: "all", label: "Все товары" },
  { value: "categories", label: "По категориям" },
  { value: "products", label: "Выбрать товары" },
];

const GOODS = ["товар", "товара", "товаров"] as const;

const money = (amount: number): Money => ({ amount, currency: "TJS" });

const chip = (active: boolean) =>
  cn(
    "t-label inline-flex h-11 items-center justify-center gap-2 rounded-pill border px-4 tabular-nums",
    "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-quiet)] disabled:opacity-40",
    active
      ? "border-accent bg-accent text-accent-contrast"
      : "border-strong text-ink-secondary hover:border-accent hover:text-ink",
  );

const field =
  "h-11 rounded-md border border-strong bg-raised px-3 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:border-accent focus:shadow-raise";

/**
 * Поля скидки: какие товары, сколько процентов, на какой срок.
 *
 * Выбор идёт так, как о скидке говорят вслух: «на всё», «на украшения»,
 * «вот на эти три образа». Под списком товаров сразу видна новая цена,
 * а внизу — итог: на сколько товаров ляжет скидка. Ошибка («ничего не
 * выбрано») показывается до нажатия «Сохранить», а не после.
 *
 * Состояние живёт здесь и уходит в форму скрытыми полями: сама форма
 * остаётся нативной и отправляется server action'ом.
 */
export function DiscountFields({
  products,
  categories,
  initial,
  from,
  to,
}: {
  products: DiscountProduct[];
  categories: { slug: string; title: string }[];
  initial: {
    percent: number;
    scope: DiscountScope;
    categorySlugs: string[];
    productIds: string[];
  };
  from: string;
  to: string;
}) {
  const searchId = useId();
  const percentId = useId();
  const [percent, setPercent] = useState(initial.percent);
  const [scope, setScope] = useState<DiscountScope>(initial.scope);
  const [categorySlugs, setCategorySlugs] = useState(initial.categorySlugs);
  const [productIds, setProductIds] = useState(initial.productIds);
  const [query, setQuery] = useState("");

  const catTitle = useMemo(
    () => new Map(categories.map((c) => [c.slug, c.title])),
    [categories],
  );
  const sellable = useMemo(
    () => products.filter((p) => p.price !== null),
    [products],
  );
  const perCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of sellable) {
      counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);
    }
    return counts;
  }, [sellable]);

  const validPercent = percent >= MIN_PERCENT && percent <= MAX_PERCENT;
  const targets =
    scope === "all"
      ? sellable.length
      : scope === "categories"
        ? sellable.filter((p) => categorySlugs.includes(p.categorySlug)).length
        : sellable.filter((p) => productIds.includes(p.id)).length;

  const needle = query.trim().toLocaleLowerCase("ru");
  const found = needle
    ? products.filter((p) =>
        [p.title, p.article ?? "", catTitle.get(p.categorySlug) ?? ""]
          .join(" ")
          .toLocaleLowerCase("ru")
          .includes(needle),
      )
    : products;

  const toggle = (
    set: (update: (prev: string[]) => string[]) => void,
    value: string,
  ) =>
    set((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  // Enter в поиске искал бы, а не отправлял всю форму скидки
  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") event.preventDefault();
  };

  return (
    <>
      <input type="hidden" name="scope" value={scope} />
      <input
        type="hidden"
        name="categorySlugs"
        value={JSON.stringify(scope === "categories" ? categorySlugs : [])}
      />
      <input
        type="hidden"
        name="productIds"
        value={JSON.stringify(scope === "products" ? productIds : [])}
      />

      <section className="border-t border-hairline pt-6">
        <h2 className="t-label text-ink-muted">На какие товары</h2>
        <p className="t-caption mt-2 max-w-[60ch]">
          Скидка снижает цену покупки. Образы только для проката её не
          получают — прокат обсуждается в магазине.
        </p>
        <div
          role="group"
          aria-label="На какие товары"
          className="mt-4 flex flex-wrap gap-2"
        >
          {SCOPES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={scope === option.value}
              onClick={() => setScope(option.value)}
              className={chip(scope === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {scope === "categories" ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => {
              const count = perCategory.get(category.slug) ?? 0;
              const active = categorySlugs.includes(category.slug);
              return (
                <li key={category.slug}>
                  <button
                    type="button"
                    aria-pressed={active}
                    disabled={count === 0 && !active}
                    onClick={() => toggle(setCategorySlugs, category.slug)}
                    className={chip(active)}
                  >
                    {category.title}
                    <span className="opacity-70">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {scope === "products" ? (
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <label htmlFor={searchId} className="sr-only">
                Найти товар
              </label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onSearchKey}
                placeholder="Найти по названию или артикулу"
                className={cn(field, "w-full sm:w-[20rem]")}
              />
              <button
                type="button"
                onClick={() =>
                  setProductIds((prev) => [
                    ...new Set([
                      ...prev,
                      ...found.filter((p) => p.price !== null).map((p) => p.id),
                    ]),
                  ])
                }
                className="tap-row t-label text-ink-secondary hover:text-ink"
              >
                {needle ? "Отметить найденные" : "Отметить все"}
              </button>
              <button
                type="button"
                onClick={() => setProductIds([])}
                disabled={productIds.length === 0}
                className="tap-row t-label text-ink-muted hover:text-danger disabled:opacity-40"
              >
                Снять все
              </button>
            </div>

            <ul className="mt-3 max-h-[30rem] overflow-y-auto rounded-md border border-hairline">
              {found.map((p) => {
                const active = productIds.includes(p.id);
                const rentalOnly = p.price === null;
                return (
                  <li
                    key={p.id}
                    className="border-b border-hairline last:border-b-0"
                  >
                    <label
                      className={cn(
                        "flex min-h-14 items-center gap-3 px-3 py-2",
                        rentalOnly
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:bg-muted",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        disabled={rentalOnly}
                        onChange={() => toggle(setProductIds, p.id)}
                        className="h-5 w-5 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="relative aspect-[3/4] w-9 shrink-0 overflow-hidden rounded-sm bg-muted">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="t-body-sm block truncate">
                          {p.title}
                        </span>
                        <span className="t-caption block truncate">
                          {p.article ? `${p.article} · ` : ""}
                          {catTitle.get(p.categorySlug) ?? p.categorySlug}
                        </span>
                      </span>
                      <span className="t-caption shrink-0 text-right tabular-nums">
                        {p.price === null ? (
                          "только прокат"
                        ) : active && validPercent ? (
                          <>
                            <span className="line-through">
                              {formatMoney(money(p.price))}
                            </span>
                            <span className="t-price block text-danger">
                              {formatMoney(
                                money(discountedAmount(p.price, percent)),
                              )}
                            </span>
                          </>
                        ) : (
                          formatMoney(money(p.price))
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
              {found.length === 0 ? (
                <li className="t-caption px-3 py-8 text-center">
                  Ничего не найдено
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="border-t border-hairline pt-6">
        <h2 className="t-label text-ink-muted">Размер скидки</h2>
        <div
          role="group"
          aria-label="Размер скидки"
          className="mt-4 flex flex-wrap gap-2"
        >
          {PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={percent === value}
              onClick={() => setPercent(value)}
              className={chip(percent === value)}
            >
              {value}%
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor={percentId} className="t-body-sm">
            Свой процент
          </label>
          <input
            id={percentId}
            name="percent"
            type="number"
            inputMode="numeric"
            min={MIN_PERCENT}
            max={MAX_PERCENT}
            step={1}
            required
            value={percent || ""}
            onChange={(event) =>
              setPercent(Math.round(Number(event.target.value)))
            }
            className={cn(field, "w-24 tabular-nums")}
          />
          <span className="t-body-sm">%</span>
        </div>
      </section>

      <Section title="Срок">
        <Field label="Начало" hint="Скидка включится в начале этого дня">
          <Text name="from" type="date" defaultValue={from} required />
        </Field>
        <Field
          label="Конец"
          hint="И выключится в конце этого дня, по времени Душанбе"
        >
          <Text name="to" type="date" defaultValue={to} required />
        </Field>
      </Section>

      <p
        role="status"
        className={cn(
          "t-body-sm rounded-md border px-4 py-3",
          validPercent && targets > 0
            ? "border-hairline text-ink-secondary"
            : "border-danger text-danger",
        )}
      >
        {!validPercent
          ? `Укажите скидку от ${MIN_PERCENT} до ${MAX_PERCENT}%.`
          : targets === 0
            ? "Не выбрано ни одного товара — сохранить не получится."
            : `Скидка ${percent}% ляжет на ${targets} ${pluralRu(targets, GOODS)}.`}
      </p>
    </>
  );
}
