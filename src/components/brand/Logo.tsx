"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { site } from "@/lib/config/site";

/* -------------------------------------------------------------------------
   Логотип ARUS DOMOD.

   Официальный ассет — золотой знак (пара в венке) на тёмно-бирюзовом поле,
   надпись ARUS.DOMOD.TJ и подпись «ДЛЯ САМЫХ КРАСИВЫХ НЕВЕСТ».

   Файлы (получены из /logo.png кадрированием и сжатием, знак не перерисован):
     public/brand/arus-domod-logo.jpg   полный лок-ап (подвал)
     public/brand/arus-domod-mark.jpg   квадратный кроп знака (шапка)
     public/brand/arus-domod-og.jpg     лок-ап для Open Graph

   Полный лок-ап в шапку не ставится: при высоте строки 68px надпись внутри
   него была бы в три пикселя. В шапке идёт кроп знака рядом с именем дома,
   набранным витринной антиквой, — это разрешённый лок-ап из того же ассета,
   сам знак при этом не перерисован.

   onError оставлен намеренно: если ассет когда-нибудь потеряется при
   пересборке, шапка не покажет битую картинку, а откатится к типографике.
   ------------------------------------------------------------------------- */

/**
 * full    — официальный лок-ап целиком (подвал, Open Graph)
 * lockup  — знак рядом с именем дома (шапка)
 * wordmark— только имя дома
 * mark    — только знак
 */
type LogoVariant = "full" | "lockup" | "wordmark" | "mark";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

const MARK_SRC = "/brand/arus-domod-mark.jpg";
const FULL_SRC = "/brand/arus-domod-logo.jpg";

/** Временный знак: ступенчатый ромб чакана — тот же мотив, что в орнаментах */
function FallbackMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="presentation"
      aria-hidden="true"
      className={cn("h-[1em] w-[1em] shrink-0 fill-current", className)}
    >
      <path d="M10 2h4v4h-4zM6 6h4v4H6zm8 0h4v4h-4zM2 10h4v4H2zm8 0h4v4h-4zm8 0h4v4h-4zM6 14h4v4H6zm8 0h4v4h-4zm-4 4h4v4h-4z" />
    </svg>
  );
}

/**
 * Знак из официального ассета. Если файла ещё нет, молча уступает место
 * временному знаку — сломанной картинки в шапке не появится.
 */
function BrandMark({ className }: { className?: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) return <FallbackMark className={className} />;

  return (
    /* Знак фиксированного размера: оптимизатор next/image здесь ничего не
       даёт, а onError нужен для мягкой деградации, пока файла нет. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MARK_SRC}
      alt=""
      aria-hidden="true"
      onError={() => setMissing(true)}
      className={cn("h-[1.15em] w-[1.15em] shrink-0 object-contain", className)}
    />
  );
}

export function Logo({ variant = "full", className }: LogoProps) {
  const [fullMissing, setFullMissing] = useState(false);

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex text-[1.5rem]", className)}>
        <BrandMark />
        <span className="sr-only">{site.name}</span>
      </span>
    );
  }

  /** Подвал показывает официальный лок-ап целиком и без изменений */
  if (variant === "full" && !fullMissing) {
    return (
      /* Тот же случай: официальный лок-ап с известными пропорциями. */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={FULL_SRC}
        alt={`${site.name} — ${site.tagline}`}
        onError={() => setFullMissing(true)}
        className={cn("h-auto w-[13rem] max-w-full object-contain", className)}
      />
    );
  }

  return (
    <span
      className={cn("inline-flex flex-col items-start leading-none", className)}
    >
      <span className="inline-flex items-center gap-[0.45em]">
        {variant === "full" || variant === "lockup" ? (
          <BrandMark className="text-[1em]" />
        ) : null}
        <span className="font-display text-[1em] font-medium tracking-[0.22em]">
          {site.name}
        </span>
      </span>
      {variant === "full" ? (
        <span className="t-label-wide mt-[0.5em] text-[0.3em] text-ink-muted">
          {site.handle}
        </span>
      ) : null}
    </span>
  );
}
