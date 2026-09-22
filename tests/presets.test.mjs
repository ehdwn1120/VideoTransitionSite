import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArgs, validateFile, describeOutput } from '../src/modules/presets.js';
const options = {format:'mp4',resolution:'720',quality:'balanced',fps:15,duration:10};
test('MP4 keeps aspect ratio without enlarging and outputs compatible codecs',()=>{
 const args=buildArgs('input.webm',options); assert.ok(args.includes('libx264')); assert.ok(args.includes('yuv420p')); assert.ok(args.includes('scale=-2:trunc(min(ih\\,720)/2)*2')); assert.equal(args.at(-1),'output.mp4');
});
test('MP3 ignores video sizing and selects audio bitrate',()=>{const args=buildArgs('input.mp4',{...options,format:'mp3',quality:'small'});assert.ok(args.includes('-vn'));assert.ok(args.includes('128k'));assert.ok(!args.includes('-vf'));});
test('GIF is bounded and uses palette generation',()=>{const args=buildArgs('input.mp4',{...options,format:'gif'});assert.ok(args.includes('-t'));assert.ok(args.some(a=>a.includes('palettegen')));assert.throws(()=>buildArgs('input.mp4',{...options,format:'gif',duration:31}));});
test('Reject empty, unsupported and excessive input',()=>{assert.throws(()=>validateFile({name:'x.mp4',size:0}));assert.throws(()=>validateFile({name:'x.exe',size:1}));assert.throws(()=>validateFile({name:'x.mp4',size:1.2*1024**3}));assert.doesNotThrow(()=>validateFile({name:'x.WEBM',size:1024}));});

test('Displayed audio settings match encoding options',()=>{
 for(const quality of ['small','balanced','high']) for(const format of ['mp4','mp3']) {
  const settings={...options,format,quality};
  const args=buildArgs('input.mp4',settings);
  const bitrate=args[args.indexOf('-b:a')+1].replace('k','kbps');
  assert.ok(describeOutput(settings).includes(bitrate));
 }
 assert.ok(describeOutput({...options,format:'gif',duration:5}).includes('시작부터 5초'));
});
