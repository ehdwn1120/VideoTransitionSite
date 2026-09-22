import { detectMedia } from './media.js';
export const AUDIO_BITRATES = { mp4: '128k', mp3: { high: '256k', balanced: '192k', small: '128k' } };
export function describeOutput({format, resolution, quality, fps, duration}) {
  const qualityLabel = { high: '높은 품질', balanced: '균형 잡힌 품질', small: '작은 파일' }[quality];
  const height = resolution === 'original' ? '원본 해상도' : `높이 최대 ${resolution}px`;
  if (format === 'mp3') return `MP3 · ${AUDIO_BITRATES.mp3[quality].replace('k', 'kbps')} · 오디오만 저장`;
  if (format === 'gif') return `GIF · 시작부터 ${duration}초 · ${fps}fps · ${height} · 소리 없음`;
  return `MP4 · ${height} · ${qualityLabel} · AAC ${AUDIO_BITRATES.mp4.replace('k', 'kbps')}`;
}
export const presets = {
  mp4: { label: 'MP4 비디오', extension: 'mp4', mime: 'video/mp4' },
  gif: { label: 'GIF 애니메이션', extension: 'gif', mime: 'image/gif' },
  mp3: { label: 'MP3 오디오', extension: 'mp3', mime: 'audio/mpeg' },
};
export function buildArgs(input, options) {
  const { format, resolution, quality, fps, duration } = options;
  if (!presets[format]) throw new Error('지원하지 않는 출력 포맷입니다.');
  if (!['original', '1080', '720', '480'].includes(resolution)) throw new Error('해상도를 확인해 주세요.');
  if (!['high', 'balanced', 'small'].includes(quality)) throw new Error('품질을 확인해 주세요.');
  const output = `output.${presets[format].extension}`;
  const base = ['-i', input];
  if (format === 'mp3') return [...base, '-vn', '-c:a', 'libmp3lame', '-b:a', AUDIO_BITRATES.mp3[quality], output];
  const scale = resolution === 'original' ? 'scale=trunc(iw/2)*2:trunc(ih/2)*2' : `scale=-2:trunc(min(ih\\,${resolution})/2)*2`;
  if (format === 'gif') {
    if (![10, 15, 24].includes(Number(fps)) || !Number.isFinite(Number(duration)) || duration < 1 || duration > 30) throw new Error('GIF 길이는 1~30초로 설정해 주세요.');
    return [...base, '-t', String(duration), '-filter_complex', `fps=${fps},${scale},split[a][b];[a]palettegen=max_colors=${quality === 'small' ? 128 : 256}[p];[b][p]paletteuse=dither=bayer:bayer_scale=3`, '-an', '-loop', '0', output];
  }
  return [...base, '-vf', scale, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', { high: '20', balanced: '26', small: '32' }[quality], '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', AUDIO_BITRATES.mp4, '-movflags', '+faststart', output];
}
export function validateFile(file) {
  if (detectMedia(file) !== 'video') throw new Error('영상 파일을 선택해 주세요.');
}
