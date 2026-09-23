import { t } from './i18n.js';
export const MAX_VIDEO_BYTES = Math.floor(1.1 * 1024 ** 3);
export const MAX_IMAGE_BYTES = 200 * 1024 ** 2;
export const LARGE_VIDEO_BYTES = MAX_IMAGE_BYTES;
export const videoExtensions = ['mp4', 'webm', 'mov', 'mkv', 'm4v', 'avi'];
export const imageFormats = {
  jpg: { label: t('JPG — 사진'), mime: 'image/jpeg' },
  png: { label: t('PNG — 투명 이미지'), mime: 'image/png' },
  webp: { label: t('WebP — 웹 이미지'), mime: 'image/webp' },
};
export function detectMedia(file) {
  if (!file?.size) throw new Error(t('빈 파일은 변환할 수 없습니다.'));
  const ext = file.name.split('.').at(-1).toLowerCase();
  const kind = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? 'image' : videoExtensions.includes(ext) ? 'video' : null;
  if (kind) {
    if (file.size > (kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) throw new Error(kind === 'video' ? t('영상은 1GB 이하 파일을 선택해 주세요.') : t('이미지는 200MB 이하 파일을 선택해 주세요.'));
    return kind;
  }
  throw new Error(t('이미지는 JPG·PNG·WebP, 영상은 MP4·WebM·MOV·MKV·M4V·AVI를 지원합니다. GIF·HEIC·AVIF 이미지는 지원하지 않습니다.'));
}
export function imageDimensions(width, height, resolution) {
  if (!['original', '1080', '720', '480'].includes(resolution)) throw new Error(t('해상도를 확인해 주세요.'));
  const ratio = resolution === 'original' ? 1 : Math.min(1, Number(resolution) / height);
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
}
export function describeImage({format, resolution, quality}) {
  return `${format.toUpperCase()} · ${resolution === 'original' ? t('원본 해상도') : t('높이 최대 {height}px', {height:resolution})} · ${format === 'png' ? t('무손실 저장') : {high:t('높은 품질'),balanced:t('균형 잡힌 품질'),small:t('작은 파일')}[quality]}${format === 'jpg' ? t(' · 투명 영역은 흰색') : ''}`;
}
