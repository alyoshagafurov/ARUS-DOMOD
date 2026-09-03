import { getDictionary } from "@/lib/i18n/server";

/** Путь заказа — по процессу, описанному клиентом. Без сроков и обещаний. */
export async function HowItWorksSteps() {
  const { steps } = await getDictionary();
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((s, i) => (
        <li
          key={s.title}
          data-surface="day"
          className="card lift flex flex-col p-5"
          style={{ "--reveal-delay": `${i * 60}ms` } as never}
        >
          <span className="t-num text-[2rem] text-gold-ink">0{i + 1}</span>
          <h3 className="t-h3 mt-4">{s.title}</h3>
          <p className="t-caption mt-2">{s.note}</p>
        </li>
      ))}
    </ol>
  );
}
