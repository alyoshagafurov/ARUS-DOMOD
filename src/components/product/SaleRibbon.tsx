import { cn } from "@/lib/cn";

/**
 * Лента скидки: «СКИДКА −20%» на красном.
 *
 * Единственная наклейка, которая ложится поверх фотографии, и единственная
 * красная заливка в системе — по решению клиента: скидку должны замечать
 * с первого взгляда на ленту образов. Правый край вырезан ласточкиным
 * хвостом, поэтому это читается лентой, а не кнопкой; левый край прямой
 * и прилегает к краю кадра, как лента, заправленная за него.
 *
 * Компонент без состояния и без словаря: подпись приносит вызывающий,
 * поэтому лента одинаково работает в серверной и в клиентской разметке.
 */
export function SaleRibbon({
  label,
  percent,
  className,
}: {
  label: string;
  percent: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "t-label inline-flex items-center gap-1.5 whitespace-nowrap bg-sale py-1.5 pl-3 pr-5 text-sale-contrast",
        "[clip-path:polygon(0_0,100%_0,calc(100%_-_0.55rem)_50%,100%_100%,0_100%)]",
        className,
      )}
    >
      {label}
      <span className="tabular-nums">−{percent}%</span>
    </span>
  );
}
