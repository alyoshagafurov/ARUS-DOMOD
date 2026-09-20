"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { contact } from "@/lib/config/site";
import { useDictionary } from "@/lib/i18n/client";

/**
 * Сбой на витрине.
 *
 * Главное здесь — телефон. Пока страница не работает, человек всё равно
 * должен иметь возможность позвонить: магазин живой, даже когда сайт нет.
 */
export default function SiteError({ reset }: { reset: () => void }) {
  const t = useDictionary();
  return (
    <Container className="flex flex-col items-center py-32 text-center lg:py-48">
      <span aria-hidden="true" className="hoshiya-seam max-w-[10rem]" />
      <h1 className="t-h1 mt-10 max-w-[18ch] text-balance">
        {t.misc.errorTitle}
      </h1>
      <p className="t-lead mt-6 max-w-[40ch]">{t.misc.errorHint}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>{t.misc.errorRetry}</Button>
        <Button href={`tel:${contact.phone}`} external variant="secondary">
          {contact.phoneDisplay}
        </Button>
      </div>
    </Container>
  );
}
