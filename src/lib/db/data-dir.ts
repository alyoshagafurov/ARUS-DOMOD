import path from "node:path";

/* -------------------------------------------------------------------------
   Где лежат данные магазина: база `arus.sqlite` и загруженные кадры.

   Каталог должен находиться на ТОМЕ Railway. Файловая система контейнера
   живёт до перезапуска: всё, что записано мимо тома, стирается каждой
   выкаткой. Так и было — том был подключён, но база писалась в
   `ARUS_DATA_DIR`, а он указывал не туда, куда смонтирован том. Каждый
   деплой начинал магазин с чистого листа: пропадали бы товары, кадры,
   скидки и заявки, и снаружи это никак не было видно.

   Поэтому главный источник — переменная, которую Railway выдаёт сам:
   `RAILWAY_VOLUME_MOUNT_PATH`, путь, куда смонтирован подключённый том.
   Две настройки, которые обязаны совпадать, рано или поздно расходятся;
   одна, которую выставляет сама платформа, — нет.

     RAILWAY_VOLUME_MOUNT_PATH  есть том — данные на нём
     ARUS_DATA_DIR              используется, только если лежит внутри
                                тома, или если тома нет вовсе
     ./data                     разработка
   ------------------------------------------------------------------------- */

let warned = false;

/** Лежит ли путь внутри каталога (или совпадает с ним) */
function isInside(child: string, parent: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

export function dataDir(): string {
  const volume = process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();
  const explicit = process.env.ARUS_DATA_DIR?.trim();

  if (volume) {
    if (explicit && isInside(explicit, volume)) return explicit;
    if (explicit && !warned) {
      warned = true;
      console.warn(
        `[data] ARUS_DATA_DIR=${explicit} лежит вне тома ${volume} — ` +
          "данные пишутся на том, иначе их стирала бы каждая выкатка",
      );
    }
    return volume;
  }

  return explicit || path.join(process.cwd(), "data");
}
