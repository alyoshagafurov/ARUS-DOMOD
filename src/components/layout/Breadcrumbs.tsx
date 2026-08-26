import Link from "next/link";

import { cn } from "@/lib/cn";

export interface Crumb {
  href?: string;
  label: string;
}

/**
 * Спокойная навигация над заголовком. Отдельной полосы под неё не выделяем:
 * это подпись, а не панель.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Хлебные крошки" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="t-caption text-ink-muted">
                /
              </span>
            ) : null}
            {item.href ? (
              <Link href={item.href} className="tap-row hover:text-ink">
                <span className="t-caption motion-underline">{item.label}</span>
              </Link>
            ) : (
              <span aria-current="page" className={cn("t-caption text-ink")}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
