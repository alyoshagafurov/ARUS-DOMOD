import { cn } from "@/lib/cn";

/** Повторяет раппорт настоящей сетки, иначе при появлении товаров всё прыгнет */
const cells = [
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

/**
 * Ожидание выдачи.
 *
 * Не серые прямоугольники из UI-кита: прямоугольник — это муслиновая
 * поверхность каталога с медленным дыханием и тонкой полосой на месте
 * подписи. Пропорции совпадают с настоящей сеткой, поэтому при появлении
 * товаров ничего не прыгает.
 */
export function CatalogSkeleton({ count = 7 }: { count?: number }) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-12 lg:gap-y-12"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={cells[index % cells.length]}>
          <div
            className={cn(
              "w-full rounded-xs bg-sunken animate-pulse",
              index % 7 >= 4
                ? "aspect-[var(--ratio-editorial)]"
                : "aspect-[var(--ratio-portrait)]",
            )}
            style={{ animationDelay: `${(index % 7) * 80}ms` }}
          />
          <div
            className="mt-5 h-2 w-1/3 rounded-xs bg-sunken animate-pulse"
            style={{ animationDelay: `${(index % 7) * 80 + 50}ms` }}
          />
          <div
            className="mt-3 h-2 w-1/2 rounded-xs bg-sunken animate-pulse"
            style={{ animationDelay: `${(index % 7) * 80 + 100}ms` }}
          />
        </li>
      ))}
    </ul>
  );
}
