import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { imageSize } from "@/lib/admin/image-size";
import { UPLOAD_DIR } from "@/lib/admin/uploads";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Загрузка изображений из админки.
 *
 * Файлы ложатся в data/uploads рядом с базой, а не в public/: Next
 * запоминает содержимое public/ на момент сборки, и файл, добавленный
 * после неё, отдавался бы как 404. Раздача идёт через /uploads/[...path]
 * (route handler), поэтому next/image видит их как обычные локальные
 * адреса.
 *
 * Доступ закрыт proxy.ts: без сессии сюда не попасть.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл больше 8 МБ" }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const size = imageSize(bytes);
  if (!size) {
    return NextResponse.json(
      { error: "Поддерживаются JPEG, PNG и WebP" },
      { status: 415 },
    );
  }

  const year = String(new Date().getFullYear());
  const name = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${size.type === "jpeg" ? "jpg" : size.type}`;
  await mkdir(path.join(UPLOAD_DIR, year), { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, year, name), bytes);

  return NextResponse.json(
    { url: `/uploads/${year}/${name}`, width: size.width, height: size.height },
    { status: 201 },
  );
}
