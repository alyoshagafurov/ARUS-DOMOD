import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Оболочка витрины: шапка и подвал.
 *
 * Вынесена из корневого layout в route group, потому что у админки своя
 * оболочка, а адреса при этом не меняются — группа в скобках в URL не
 * попадает.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
