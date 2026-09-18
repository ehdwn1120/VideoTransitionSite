import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
await mkdir('public/engine', { recursive: true });
await copyFile('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js', 'public/engine/ffmpeg-core.js');
const bytes = await readFile('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm');
const size = 16 * 1024 * 1024;
const parts = [];
for (let offset = 0; offset < bytes.length; offset += size) {
  const name = `core-${parts.length}.bin`;
  await writeFile(`public/engine/${name}`, bytes.subarray(offset, offset + size));
  parts.push(name);
}
await writeFile('public/engine/manifest.json', JSON.stringify({ parts, bytes: bytes.length }));
