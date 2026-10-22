export type IcoImage = { size: number; png: Uint8Array };

/**
 * Packs PNG images into a .ico container (PNG-compressed entries are
 * supported by every modern browser and Windows Vista+).
 * Layout: ICONDIR (6 bytes) + one 16-byte ICONDIRENTRY per image + PNG data.
 */
export function buildIco(images: IcoImage[]): Uint8Array {
  const headerSize = 6 + 16 * images.length;
  const total = headerSize + images.reduce((s, i) => s + i.png.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: 1 = icon
  view.setUint16(4, images.length, true);

  let offset = headerSize;
  images.forEach((img, i) => {
    const entry = 6 + i * 16;
    view.setUint8(entry, img.size >= 256 ? 0 : img.size); // width (0 means 256)
    view.setUint8(entry + 1, img.size >= 256 ? 0 : img.size); // height
    view.setUint8(entry + 2, 0); // palette colors
    view.setUint8(entry + 3, 0); // reserved
    view.setUint16(entry + 4, 1, true); // color planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, img.png.length, true); // image data size
    view.setUint32(entry + 12, offset, true); // image data offset
    out.set(img.png, offset);
    offset += img.png.length;
  });
  return out;
}
