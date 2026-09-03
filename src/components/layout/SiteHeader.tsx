"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { BagIcon, HeartIcon, SearchIcon } from "@/components/ui/icons";
import { useCartCount } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { primaryNav, site } from "@/lib/config/site";
import { useFavoriteCount } from "@/lib/favorites";
import { useDictionary } from "@/lib/i18n/client";
import { navLabel } from "@/lib/i18n/labels";

/* display не задаётся: у `hidden` и `inline-flex` одинаковый вес, и победит
   тот, что позже в сгенерированном CSS. Каждое использование объявляет свой. */
const iconBox = "tap-icon h-11 w-11 shrink-0 items-center justify-center";

const badgeClass =
  "absolute right-1 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-pill bg-gold-bright px-1 text-[0.5625rem] font-semibold leading-none tabular-nums text-[var(--firuza-950)]";

/**
 * Шапка «САҲН».
 *
 * На белом дворе шапка прозрачна и невесома: знак слева, иконки справа, а
 * посередине — капсула навигации, единственный зелёный предмет шапки. Она
 * рифмуется с айвонами ниже: та же глубокая зелень, тот же кремовый текст.
 *
 * После прокрутки полоса садится на белое со стеклом и тонкой тенью, снизу
 * проступает золотая волосяная линия. Состояние в React: переключается
 * не только фон, но и высота тени.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const t = useDictionary();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = useCartCount();
  const favoriteCount = useFavoriteCount();
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const home = pathname === "/";

  useEffect(() => {
    let frame = 0;
    const apply = () => {
      frame = 0;
      setScrolled((previous) => {
        const next = window.scrollY > 16;
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        data-surface="day"
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow]",
          "duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
          scrolled
            ? "bg-white/88 shadow-raise backdrop-blur-[10px]"
            : "bg-transparent",
        )}
      >
        <div className="relative mx-auto flex h-[var(--header-h)] w-full max-w-[var(--container-max)] items-center gap-2 px-[var(--gutter)] sm:gap-4">
          <Link
            href="/"
            aria-label={`${site.name} — ${t.nav.home}`}
            className="flex h-11 shrink-0 items-center text-[0.85rem] xs:text-[0.95rem] sm:text-[1.05rem]"
          >
            <Logo variant="lockup" />
          </Link>

          {/* Капсула навигации. w-max обязателен: у абсолютного блока с
              left-1/2 ширина обрезана правой половиной шапки. */}
          <nav
            aria-label={t.nav.catalog}
            className="absolute left-1/2 hidden w-max -translate-x-1/2 lg:block"
          >
            <ul
              data-surface="night"
              className="flex items-center gap-0.5 rounded-pill bg-page p-1 shadow-raise"
            >
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "t-label inline-flex h-9 items-center whitespace-nowrap rounded-pill px-4",
                      "transition-[background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-quiet)]",
                      isActive(link.href)
                        ? "bg-white/12 text-ink"
                        : "text-ink-secondary hover:bg-white/8 hover:text-ink",
                    )}
                  >
                    {navLabel(link, t)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center text-[1rem]">
            <LanguageSwitcher className="mr-2 hidden lg:flex" />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t.nav.openSearch}
              aria-expanded={searchOpen}
              className={cn("inline-flex", iconBox)}
            >
              <SearchIcon />
            </button>
            <Link
              href="/favorites"
              aria-label={
                favoriteCount > 0
                  ? `${t.nav.favorites}, ${favoriteCount}`
                  : t.nav.favorites
              }
              className={cn(iconBox, "relative inline-flex")}
            >
              <HeartIcon />
              {favoriteCount > 0 ? (
                <span aria-hidden="true" className={badgeClass}>
                  {favoriteCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={
                cartCount > 0 ? `${t.nav.cart}, ${cartCount}` : t.nav.cart
              }
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
              className={cn("relative inline-flex", iconBox)}
            >
              <BagIcon />
              {cartCount > 0 ? (
                <span aria-hidden="true" className={badgeClass}>
                  {cartCount}
                </span>
              ) : null}
            </button>
            <MobileNav className="-mr-2" />
          </div>
        </div>

        <span
          aria-hidden="true"
          className={cn(
            "hoshiya-line absolute inset-x-0 bottom-0 transition-opacity",
            "duration-[var(--dur-base)] ease-[var(--ease-quiet)]",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
      </header>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <CartDrawer open={cartOpen} onClose={closeCart} />

      {/* Главная сама отсчитывает высоту шапки внутри своего первого экрана */}
      {home ? null : (
        <div aria-hidden="true" className="h-[calc(var(--header-h)+1rem)]" />
      )}
    </>
  );
}
