export const imageFormats = {
  jpg: { label: 'JPG — 사진', mime: 'image/jpeg' },
  png: { label: 'PNG — 투명 이미지', mime: 'image/png' },
  webp: { label: 'WebP — 웹 이미지', mime: 'image/webp' },
};
export function detectMedia(file) {
  if (!file?.size) throw new Error('빈 파일은 변환할 수 없습니다.');
  if (file.size > 200 * 1024 * 1024) throw new Error('200MB 이하 파일을 선택해 주세요.');
  const ext = file.name.split('.').at(-1).toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'mkv', 'm4v'].includes(ext)) return 'video';
  throw new Error('이미지는 JPG·PNG·WebP, 영상은 MP4·WebM·MOV·MKV·M4V를 지원합니다. GIF·HEIC·AVIF 이미지는 지원하지 않습니다.');
}
export function imageDimensions(width, height, resolution) {
  if (!['original', '1080', '720', '480'].includes(resolution)) throw new Error('해상도를 확인해 주세요.');
  const ratio = resolution === 'original' ? 1 : Math.min(1, Number(resolution) / height);
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
}
export function describeImage({format, resolution, quality}) {
  return `${format.toUpperCase()} · ${resolution === 'original' ? '원본 해상도' : `높이 최대 ${resolution}px`} · ${format === 'png' ? '무손실 저장' : {high:'높은 품질',balanced:'균형 잡힌 품질',small:'작은 파일'}[quality]}${format === 'jpg' ? ' · 투명 영역은 흰색' : ''}`;
}
