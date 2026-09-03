"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { OrnamentBand } from "@/components/ornament/Ornament";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { Media } from "@/components/ui/Media";
import { catalog } from "@/lib/catalog/client";
import { formatMoney, getPrimaryOffer } from "@/lib/format";
import type { Category, Product } from "@/types/catalog";

const RESULT_LIMIT = 6;
const DEBOUNCE_MS = 220;

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  /** Каталог передаёт свой список; шапка — нет, и тогда он подгружается сам */
  categories?: Category[];
  /**
   * Если передан — запрос применяется прямо в открытом каталоге.
   * Иначе поиск уводит на /catalog?q=…
   */
  onApply?: (query: string) => void;
}

/**
 * Поиск по коллекции.
 *
 * Отдельной страницы поиска нет намеренно: она всегда выпадает из языка
 * бренда. Оверлей открывается поверх текущего экрана, отдаёт первые
 * совпадения сразу и уводит в каталог только если их больше, чем помещается.
 */
export function SearchOverlay({
  open,
  onClose,
  categories: provided,
  onApply,
}: SearchOverlayProps) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  /**
   * Выдача хранится вместе с запросом, который её породил. Так «идёт ли
   * загрузка» и «нашлось ли что-нибудь» выводятся из состояния, а не
   * держатся отдельными флагами, которые пришлось бы сбрасывать вручную.
   */
  const [data, setData] = useState<{
    term: string;
    items: Product[];
    total: number;
  }>({ term: "", items: [], total: 0 });
  const [loaded, setLoaded] = useState<Category[]>([]);
  const categories = provided ?? loaded;

  // Блокировка прокрутки и Escape
  useEffect(() => {
    if (!open) return;
    const { style } = document.body;
    const previous = style.overflow;
    style.overflow = "hidden";
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || provided) return;
    let cancelled = false;
    catalog()
      .listCategories()
      .then((list) => {
        if (!cancelled) setLoaded(list);
      });
    return () => {
      cancelled = true;
    };
  }, [open, provided]);

  // Задержка перед запросом: без неё выдача дёргается на каждой букве
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term]);

  const searching = debounced.length >= 2;

  useEffect(() => {
    if (!open || debounced.length < 2) return;
    let cancelled = false;

    catalog()
      .listProducts({ search: debounced, pageSize: RESULT_LIMIT })
      .then((page) => {
        if (!cancelled) {
          setData({ term: debounced, items: page.items, total: page.total });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  if (!open) return null;

  // Прошлые совпадения остаются на экране, пока летит новый запрос —
  // список не должен мигать пустотой на каждой букве.
  const results = searching ? data.items : [];
  const total = searching ? data.total : 0;
  const settled = data.term === debounced;

  const submit = () => {
    const query = term.trim();
    if (!query) return;
    if (onApply) {
      onApply(query);
      onClose();
      return;
    }
    router.push(`/catalog?q=${encodeURIComponent(query)}`);
    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Поиск по коллекции"
      className="motion-fade fixed inset-0 z-50 flex flex-col bg-page"
    >
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-end px-[var(--gutter)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть поиск"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-[1rem] text-ink-secondary hover:text-ink"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-[var(--container-narrow)] flex-1 flex-col overflow-y-auto px-[var(--gutter)] pb-16">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="shrink-0"
        >
          <label htmlFor={inputId} className="t-label text-ink-muted">
            Поиск по коллекции
          </label>
          <div className="mt-5 flex items-center gap-4 border-b border-strong pb-4">
            <SearchIcon
              aria-hidden="true"
              className="h-[1.2em] w-[1.2em] shrink-0 text-ink-muted"
            />
            <input
              id={inputId}
              ref={inputRef}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              type="search"
              autoComplete="off"
              placeholder="Образ, раздел или артикул"
              className="t-h2 h-11 w-full bg-transparent outline-none placeholder:text-ink-muted"
            />
          </div>
        </form>

        {!searching ? (
          <div className="mt-14">
            <p className="t-label text-ink-muted">Разделы</p>
            <ul className="mt-6 flex flex-col">
              {categories.map((category) => (
                <li key={category.slug} className="border-b border-hairline">
                  <Link
                    href={`/catalog/${category.slug}`}
                    onClick={onClose}
                    className="flex items-baseline justify-between gap-6 py-5"
                  >
                    <span className="t-h3">{category.title}</span>
                    <span className="t-label text-ink-muted">
                      {category.titleTg}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-12">
            <OrnamentBand motif="mavj" height={8} className="max-w-[7rem]" />

            {results.length === 0 ? (
              settled ? (
                <p className="t-lead mt-8">
                  По запросу «{debounced}» ничего не нашлось.
                </p>
              ) : null
            ) : (
              <>
                <p className="t-label mt-8 text-ink-muted">
                  Найдено:{" "}
                  <span className="tabular-nums text-ink">{total}</span>
                </p>

                <ul className="mt-7 grid gap-x-[var(--gutter)] gap-y-8 sm:grid-cols-2">
                  {results.map((product) => {
                    const offer = getPrimaryOffer(product);
                    return (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={onClose}
                          className="group flex items-center gap-5"
                        >
                          <span className="w-20 shrink-0">
                            <Media
                              image={product.images[0]}
                              ratio="portrait"
                              sizes="80px"
                              seed={product.slug}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="t-h3 block truncate">
                              {product.title}
                            </span>
                            {offer ? (
                              <span className="t-price mt-1.5 block text-ink-secondary">
                                {formatMoney(offer.price)}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {total > results.length ? (
                  <button
                    type="button"
                    onClick={submit}
                    className="tap-row mt-8 w-fit text-ink-accent"
                  >
                    <span className="t-label motion-underline">
                      Показать все {total}
                    </span>
                  </button>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
