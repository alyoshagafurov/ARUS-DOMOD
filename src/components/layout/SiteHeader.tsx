"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { SearchOverlay } from "@/components/search/SearchOverlay";

import { Logo } from "@/components/brand/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { BagIcon, HeartIcon, SearchIcon } from "@/components/ui/icons";
import { useCartCount } from "@/lib/cart";
import { useFavoriteCount } from "@/lib/favorites";
import { cn } from "@/lib/cn";
import { primaryNav, site } from "@/lib/config/site";

/**
 * Маршруты, у которых первый экран тёмный и шапка ложится прямо на него.
 * Список, а не проверка «это главная»: следующим страницам с тёмным hero
 * достаточно добавить сюда строку.
 */
const OVERLAY_ROUTES = new Set(["/"]);

/* display здесь НЕ задаётся: у `hidden` и `inline-flex` одинаковый вес, и
   победит тот, что стоит позже в сгенерированном CSS, а не в атрибуте class.
   Поэтому каждое использование объявляет свой display явно. */
/*
 * Зона нажатия иконок шапки — 44px на всех экранах.
 *
 * Иконка внутри остаётся мелкой: у дома моды в шапке не может стоять ряд
 * квадратов. Растёт только область касания, а нажимаемость показывает
 * .tap-icon — тихая подложка при наведении и удержании.
 */
const iconBox = "tap-icon h-11 w-11 shrink-0 items-center justify-center";

/**
 * Шапка сайта.
 *
 * Два состояния, и оба бирюзовые. Наверху страницы с полем логотипа шапка
 * прозрачна и растворяется в нём: цвет тот же, отдельной полосы нет. После
 * прокрутки уезжает вверх на высоту бегущей строки (чистый transform, без
 * анимации высоты), садится на глубокую бирюзу и подшивается золотой
 * волосяной линией. Тени нет ни в одном состоянии.
 *
 * Светлой шапка не становится никогда: кремовая полоса посреди бирюзового
 * сайта читается как чужой элемент, а знак в ней перестаёт быть частью
 * страницы.
 *
 * Состояние держится в React, а не в data-атрибуте: вместе с фоном обязана
 * переключиться и поверхность (data-surface), от которой зависит цвет текста,
 * а это уже нельзя сделать мимо рендера. Обработчик throttled через rAF и
 * пишет состояние только при фактической смене, поэтому за всю прокрутку
 * страницы происходит один-два ре-рендера.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const overlay = OVERLAY_ROUTES.has(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartCount();
  const favoriteCount = useFavoriteCount();
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    let frame = 0;
    const apply = () => {
      frame = 0;
      setScrolled((previous) => {
        const next = window.scrollY > 24;
        return next === previous ? previous : next;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const compact = scrolled;
  /* Прозрачная шапка лежит на поле логотипа, поэтому и поверхность у неё
     та же: иначе иконки и пункты меню считали бы себя на другом фоне. */
  const barSurface = overlay && !compact ? "green" : "night";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40",
          "transition-transform duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
          compact && "-translate-y-8",
        )}
      >
        <div
          data-surface="night"
          className="flex h-8 items-center overflow-hidden"
        >
          <p className="t-label-wide w-full text-center text-[0.625rem] text-ink-secondary">
            Покупка и прокат · {site.city}
          </p>
        </div>

        <div
          data-surface={barSurface}
          className={cn(
            "relative transition-colors duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
            overlay && !compact
              ? "bg-transparent"
              : "bg-page/94 backdrop-blur-[8px]",
          )}
        >
          <div className="mx-auto flex h-[var(--header-h)] w-full max-w-[var(--container-max)] items-center gap-2 bg-transparent px-[var(--gutter)] sm:gap-6">
            <Link
              href="/"
              aria-label={`${site.name} — главная`}
              className="flex h-11 shrink-0 items-center text-[0.85rem] xs:text-[0.95rem] sm:text-[1.05rem]"
            >
              <Logo variant="lockup" />
            </Link>

            <nav
              aria-label="Основная навигация"
              /* w-max обязателен: у абсолютного блока с left-1/2 ширина
                 контейнера обрезана правой половиной шапки, и без него
                 последний пункт переносится на вторую строку. */
              className="absolute left-1/2 hidden w-max -translate-x-1/2 items-center gap-6 whitespace-nowrap lg:flex xl:gap-8"
            >
              {primaryNav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="tap-row text-ink-secondary hover:text-ink"
                >
                  <span className="t-label motion-underline">{link.label}</span>
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center text-[1rem]">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Открыть поиск"
                aria-expanded={searchOpen}
                className={cn("inline-flex", iconBox)}
              >
                <SearchIcon />
              </button>
              <Link
                href="/favorites"
                aria-label={
                  favoriteCount > 0
                    ? `Избранное, ${favoriteCount} шт.`
                    : "Избранное"
                }
                className={cn(iconBox, "relative inline-flex")}
              >
                <HeartIcon />
                {favoriteCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-1 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[0.5625rem] font-semibold leading-none tabular-nums text-accent-contrast"
                  >
                    {favoriteCount}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/cart"
                aria-label={
                  cartCount > 0 ? `Корзина, ${cartCount} шт.` : "Корзина"
                }
                className={cn("relative inline-flex", iconBox)}
              >
                <BagIcon />
                {cartCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute right-1 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[0.5625rem] font-semibold leading-none tabular-nums text-accent-contrast"
                  >
                    {cartCount}
                  </span>
                ) : null}
              </Link>
              <MobileNav className="-mr-2" />
            </div>
          </div>

          {/* Золотая волосяная линия — вместо тени и вместо тканой ленты.
              Проявляется только в прокрученном состоянии. */}
          <span
            aria-hidden="true"
            className={cn(
              "hoshiya-line absolute inset-x-0 bottom-0 transition-opacity",
              "duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
              compact ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />

      {/* Страницы без тёмного hero не должны уезжать под шапку */}
      {overlay ? null : (
        <div aria-hidden="true" className="h-[calc(var(--header-h)+2rem)]" />
      )}
    </>
  );
}
