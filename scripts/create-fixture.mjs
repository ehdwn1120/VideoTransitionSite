import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const createFFmpegCore = require('../node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js');
globalThis.self = {location: {href: import.meta.url}};
const core = await createFFmpegCore({wasmBinary: await readFile('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm')});
core.setLogger(({message})=> { if(message.includes('Error')) console.error(message); });
await mkdir('tests/fixtures', {recursive:true});
core.exec('-f','lavfi','-i','testsrc=size=160x120:rate=10','-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','1','-c:v','libvpx','-c:a','libvorbis','sample.webm');
await writeFile('tests/fixtures/sample.webm',core.FS.readFile('sample.webm'));
core.reset();
core.exec('-i','sample.webm','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','sample.mp4');
await writeFile('tests/fixtures/sample.mp4',core.FS.readFile('sample.mp4'));
console.log('Created one-second synthetic WebM and MP4 fixtures.');

core.reset();
if(core.exec('-i','sample.mp4','-c:v','mpeg4','-c:a','libmp3lame','sample.avi') !== 0) throw new Error('AVI fixture failed');
await writeFile('tests/fixtures/sample.avi',core.FS.readFile('sample.avi'));
