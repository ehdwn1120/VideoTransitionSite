import { FFmpeg } from '@ffmpeg/ffmpeg';
export class ConversionEngine {
  constructor() { this.ffmpeg = null; this.abort = null; }
  async load(onLog, onProgress, onLoad) {
    if (this.ffmpeg?.loaded) return;
    const ffmpeg = new FFmpeg();
    this.ffmpeg = ffmpeg;
    this.abort = new AbortController();
    ffmpeg.on('log', ({ message }) => onLog(message));
    ffmpeg.on('progress', ({ progress }) => onProgress(progress));
    const signal = this.abort.signal;
    const get = async (path) => {
      const response = await fetch(`/engine/${path}`, { signal });
      if (!response.ok) throw new Error('변환 엔진을 불러오지 못했습니다. 연결을 확인하고 다시 시도해 주세요.');
      return response;
    };
    const manifest = await (await get('manifest.json')).json();
    const parts = [];
    for (let i = 0; i < manifest.parts.length; i++) {
      parts.push(await (await get(manifest.parts[i])).arrayBuffer());
      onLoad(i + 1, manifest.parts.length);
    }
    const wasmURL = URL.createObjectURL(new Blob(parts, { type: 'application/wasm' }));
    try { await ffmpeg.load({ coreURL: `${location.origin}/engine/ffmpeg-core.js`, wasmURL }); }
    finally { URL.revokeObjectURL(wasmURL); }
  }
  async convert(file, args, onLog, onProgress, onLoad) {
    try {
      await this.load(onLog, onProgress, onLoad);
      const ffmpeg = this.ffmpeg;
      await ffmpeg.writeFile(args[1], new Uint8Array(await file.arrayBuffer()));
      const code = await ffmpeg.exec(args);
      if (code !== 0) throw new Error('변환에 실패했습니다. 오디오 트랙, 파일 손상 또는 지원되지 않는 코덱을 확인해 주세요.');
      const result = await ffmpeg.readFile(args.at(-1));
      return result;
    } finally { this.cancel(); }
  }
  cancel() { this.abort?.abort(); this.ffmpeg?.terminate(); this.ffmpeg = null; }
}
