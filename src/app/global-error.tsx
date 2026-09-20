"use client";

import { contact, site } from "@/lib/config/site";

/**
 * Сбой корневого layout — последний рубеж.
 *
 * Эта страница подменяет собой весь документ, поэтому провайдеров,
 * словарей и шрифтов здесь нет: всё, что в ней есть, должно работать,
 * когда не работает больше ничего. Отсюда русский текст без словаря и
 * стили строкой. Телефон — главное: магазин живой, даже когда сайт нет.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "2rem",
          textAlign: "center",
          background: "#0B1513",
          color: "#F2EADB",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <p style={{ letterSpacing: "0.22em", fontSize: "0.85rem" }}>
          {site.name}
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 400, margin: 0 }}>
          Сайт временно недоступен
        </h1>
        <p style={{ maxWidth: "40ch", lineHeight: 1.6, opacity: 0.85 }}>
          Попробуйте обновить страницу. Если не получится — позвоните или
          напишите, мы ответим.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "14px",
              border: "none",
              background: "#F2EADB",
              color: "#03211F",
              font: "inherit",
              cursor: "pointer",
            }}
          >
            Обновить
          </button>
          <a
            href={`tel:${contact.phone}`}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "14px",
              border: "1px solid rgba(242,234,219,.45)",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {contact.phoneDisplay}
          </a>
        </div>
      </body>
    </html>
  );
}
