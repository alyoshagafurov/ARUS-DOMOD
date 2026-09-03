import path from "node:path";

/** Загрузки живут рядом с базой — переезжают и бэкапятся вместе с ней */
export const UPLOAD_DIR = path.join(
  process.env.ARUS_DATA_DIR ?? path.join(process.cwd(), "data"),
  "uploads",
);
