import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

import { UPLOAD_DIR } from "@/lib/admin/uploads";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * Раздача загруженных изображений. Только файлы внутри data/uploads:
 * путь нормализуется, и выход за каталог (..) отбрасывается.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await context.params;
  const relative = path.normalize(parts.join("/"));
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new NextResponse(null, { status: 404 });
  }
  const type = TYPES[path.extname(relative).toLowerCase()];
  if (!type) return new NextResponse(null, { status: 404 });

  const file = path.join(UPLOAD_DIR, relative);
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return new NextResponse(null, { status: 404 });

  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new NextResponse(stream, {
    headers: {
      "content-type": type,
      "content-length": String(info.size),
      // Имя файла содержит время и случайный хвост, поэтому не меняется —
      // можно кэшировать надолго
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
