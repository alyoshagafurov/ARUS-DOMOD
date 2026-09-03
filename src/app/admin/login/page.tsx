import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { isAdmin, isAdminConfigured } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

import { login } from "./actions";

export const metadata = { title: "Вход в админку", robots: { index: false } };

const field =
  "mt-2 h-11 w-full rounded-md border border-strong bg-white px-3 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-fast)] focus:border-accent focus:shadow-raise";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin");
  const params = await searchParams;
  const failed = params.error === "1";
  const next = typeof params.next === "string" ? params.next : "/admin";
  const configured = isAdminConfigured();

  return (
    <main
      data-surface="night"
      className="flex min-h-svh items-center justify-center px-[var(--gutter)] py-16"
    >
      <div className="card card--float relative w-full max-w-[24rem] p-8">
        <span aria-hidden="true" className="gold-frame" />
        <Logo variant="lockup" className="text-[1rem]" />
        <h1 className="t-h2 mt-8">Вход в админку</h1>

        {configured ? (
          <form action={login} className="mt-6">
            <input type="hidden" name="next" value={next} />
            <label className="block">
              <span className="t-body-sm">Пароль</span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                autoFocus
                className={field}
              />
            </label>
            {failed ? (
              <p role="alert" className="t-body-sm mt-4 text-danger">
                Неверный пароль
              </p>
            ) : null}
            <Button type="submit" fullWidth className="mt-6">
              Войти
            </Button>
          </form>
        ) : (
          <p className="t-body-sm mt-6 text-ink-secondary">
            Админка не настроена: задайте <code>ADMIN_PASSWORD</code> в
            окружении сервера (см. <code>.env.example</code>).
          </p>
        )}
      </div>
    </main>
  );
}
