import { t } from './i18n.js';
import { imageFormats, imageDimensions } from './media.js';
// Animated PNG/WebP inputs are rejected rather than silently dropping their frames.
function isAnimated(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (start, length) => String.fromCharCode(...bytes.subarray(start, start + length));
  if (text(1, 3) === 'PNG') {
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const length = view.getUint32(offset);
      if (text(offset + 4, 4) === 'acTL') return true;
      offset += length + 12;
    }
  }
  if (text(0, 4) === 'RIFF' && text(8, 4) === 'WEBP') {
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const length = view.getUint32(offset + 4, true);
      if (text(offset, 4) === 'ANIM' || (text(offset, 4) === 'VP8X' && (bytes[offset + 8] & 2))) return true;
      offset += 8 + length + (length % 2);
    }
  }
  return false;
}
export class ImageEngine {
  constructor() { this.cancelled = false; }
  cancel() { this.cancelled = true; }
  check() { if (this.cancelled) throw new Error(t('변환을 중지했습니다.')); }
  async convert(file, options) {
    const format = imageFormats[options.format];
    if (!format || !['high','balanced','small'].includes(options.quality)) throw new Error(t('출력 설정을 확인해 주세요.'));
    const bytes = new Uint8Array(await file.arrayBuffer());
    this.check();
    const signature = String.fromCharCode(...bytes.subarray(0, 12));
    if (!(bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) &&
        !signature.startsWith('\x89PNG\r\n\x1a\n') &&
        !(signature.startsWith('RIFF') && signature.slice(8) === 'WEBP')) throw new Error(t('JPG·PNG·WebP 이미지 내용이 아닙니다. 확장자와 파일 손상을 확인해 주세요.'));
    if (isAnimated(bytes)) throw new Error(t('움직이는 PNG·WebP는 지원하지 않습니다. 정지 이미지를 선택해 주세요.'));
    let bitmap, canvas;
    try {
      try { bitmap = await createImageBitmap(file); }
      catch { throw new Error(t('이미지를 읽을 수 없습니다. 손상된 파일이거나 이 브라우저에서 지원하지 않는 이미지입니다.')); }
      this.check();
      if (bitmap.width * bitmap.height > 40_000_000) throw new Error(t('이미지는 4천만 픽셀 이하로 선택해 주세요.'));
      const dimensions = imageDimensions(bitmap.width, bitmap.height, options.resolution);
      canvas = document.createElement('canvas');
      Object.assign(canvas, dimensions);
      const context = canvas.getContext('2d');
      if (!context) throw new Error(t('이 브라우저에서는 이미지 변환을 사용할 수 없습니다.'));
      if (options.format === 'jpg') { context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, format.mime, { high: .92, balanced: .8, small: .6 }[options.quality]));
      this.check();
      if (!blob || blob.type !== format.mime) throw new Error(t('이 브라우저는 선택한 이미지 포맷의 저장을 지원하지 않습니다. 다른 포맷을 선택해 주세요.'));
      return { blob, ...dimensions };
    } finally {
      bitmap?.close();
      if (canvas) { canvas.width = 0; canvas.height = 0; }
    }
  }
}
