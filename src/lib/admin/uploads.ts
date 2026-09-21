import path from "node:path";

import { dataDir } from "@/lib/db/data-dir";

/**
 * Загрузки живут рядом с базой — на томе, переезжают и бэкапятся вместе
 * с ней. Путь берётся из того же места, что и путь к базе: две копии
 * одной строки однажды разошлись бы, и кадры легли бы мимо тома.
 */
export const UPLOAD_DIR = path.join(dataDir(), "uploads");
