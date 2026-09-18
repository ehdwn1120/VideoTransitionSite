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
  if (format === 'mp3') return [...base, '-vn', '-c:a', 'libmp3lame', '-b:a', { high: '256k', balanced: '192k', small: '128k' }[quality], output];
  const scale = resolution === 'original' ? 'scale=trunc(iw/2)*2:trunc(ih/2)*2' : `scale=-2:trunc(min(ih\\,${resolution})/2)*2`;
  if (format === 'gif') {
    if (![10, 15, 24].includes(Number(fps)) || !Number.isFinite(Number(duration)) || duration < 1 || duration > 30) throw new Error('GIF 길이는 1~30초로 설정해 주세요.');
    return [...base, '-t', String(duration), '-filter_complex', `fps=${fps},${scale},split[a][b];[a]palettegen=max_colors=${quality === 'small' ? 128 : 256}[p];[b][p]paletteuse=dither=bayer:bayer_scale=3`, '-an', '-loop', '0', output];
  }
  return [...base, '-vf', scale, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', { high: '20', balanced: '26', small: '32' }[quality], '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', output];
}
export function validateFile(file) {
  if (!file || !/\.(mp4|webm|mov|mkv|m4v)$/i.test(file.name)) throw new Error('MP4, WebM, MOV, MKV, M4V 파일을 선택해 주세요.');
  if (!file.size) throw new Error('빈 파일은 변환할 수 없습니다.');
  if (file.size > 200 * 1024 * 1024) throw new Error('안정적인 브라우저 처리를 위해 200MB 이하 파일을 선택해 주세요.');
}
