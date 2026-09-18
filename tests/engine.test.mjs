import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { buildArgs } from '../src/modules/presets.js';
const require = createRequire(import.meta.url);
const createCore = require('../node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js');
globalThis.self = { location: { href: import.meta.url } };
test('Real core: requested conversions decode, scale and fail safely',async()=>{
 const core = await createCore({wasmBinary:await readFile('node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm')});
 for(const ext of ['mp4','webm']) core.FS.writeFile(`input.${ext}`,await readFile(`tests/fixtures/sample.${ext}`));
 for(const [input,format] of [['input.webm','mp4'],['input.mp4','gif'],['input.mp4','mp3']]) {
   core.reset();
   assert.equal(core.exec(...buildArgs(input,{format,resolution:'480',quality:'balanced',fps:10,duration:1})),0);
   const output=`output.${format}`;
   const data=core.FS.readFile(output);
   assert.ok(data.length>100);
   const header=Buffer.from(data.subarray(0,16)).toString('ascii');
   assert.ok(format==='mp4'?header.includes('ftyp'):format==='gif'?header.startsWith('GIF8'):header.startsWith('ID3'));
   core.reset();
   assert.equal(core.exec('-i',output,'-f','null','-'),0,'Result fully decodes');
 }
 core.reset();
 assert.equal(core.exec('-f','lavfi','-i','testsrc=size=1280x720:rate=10','-t','0.3','-c:v','libx264','-pix_fmt','yuv420p','silent.mp4'),0);
 core.reset();
 assert.equal(core.exec(...buildArgs('silent.mp4',{format:'mp4',resolution:'480',quality:'small'})),0);
 core.reset();
 core.ffprobe('-v','error','-show_entries','stream=width,height','-of','json','-o','probe.json','output.mp4');
 const dimensions=JSON.parse(new TextDecoder().decode(core.FS.readFile('probe.json'))).streams[0];
 assert.equal(dimensions.height,480);assert.equal(dimensions.width,854);
 core.reset();
 assert.notEqual(core.exec(...buildArgs('silent.mp4',{format:'mp3',resolution:'original',quality:'balanced'})),0,'Silent video must not claim audio success');
 core.FS.writeFile('broken.mp4',new Uint8Array([1,2,3]));core.reset();
 assert.notEqual(core.exec(...buildArgs('broken.mp4',{format:'mp4',resolution:'original',quality:'balanced'})),0,'Corrupt file must fail');
});
