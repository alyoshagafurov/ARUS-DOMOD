/**
 * Размеры изображения по заголовку файла — без библиотек.
 *
 * next/image требует width и height, чтобы кадр не прыгал при загрузке;
 * читаем их прямо из байтов: JPEG (маркер SOF), PNG (IHDR), WebP (VP8 /
 * VP8L / VP8X). Остальные форматы в загрузку не принимаются.
 */
export interface ImageSize {
  width: number;
  height: number;
  type: "jpeg" | "png" | "webp";
}

export function imageSize(buf: Uint8Array): ImageSize | null {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // PNG: 89 50 4E 47 … IHDR на смещении 16
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return {
      width: view.getUint32(16),
      height: view.getUint32(20),
      type: "png",
    };
  }

  // JPEG: FF D8, дальше сегменты; размер лежит в SOF0..SOF15 (кроме DHT/JPG/DAC)
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) return null;
      const marker = buf[offset + 1];
      const length = view.getUint16(offset + 2);
      const isSof =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isSof) {
        return {
          height: view.getUint16(offset + 5),
          width: view.getUint16(offset + 7),
          type: "jpeg",
        };
      }
      offset += 2 + length;
    }
    return null;
  }

  // WebP: RIFF …. WEBP, затем чанк VP8 / VP8L / VP8X
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    const chunk = String.fromCharCode(buf[12], buf[13], buf[14], buf[15]);
    if (chunk === "VP8 ") {
      return {
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
        type: "webp",
      };
    }
    if (chunk === "VP8L") {
      const b0 = buf[21],
        b1 = buf[22],
        b2 = buf[23],
        b3 = buf[24];
      return {
        width: 1 + (((b1 & 0x3f) << 8) | b0),
        height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
        type: "webp",
      };
    }
    if (chunk === "VP8X") {
      return {
        width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
        height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
        type: "webp",
      };
    }
  }
  return null;
}
