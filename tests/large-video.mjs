// Synthetic boundary test: short AVI padded with sparse zeros, not 1.1GB of real footage.
import {chromium,devices} from 'playwright';
import {mkdtemp,copyFile,truncate,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {MAX_VIDEO_BYTES} from '../src/modules/media.js';
const dir=await mkdtemp(join(tmpdir(),'morfliq-large-'));
const file=join(dir,'boundary.avi');
await copyFile('tests/fixtures/sample.avi',file);await truncate(file,MAX_VIDEO_BYTES);
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
try {
 const page=await browser.newPage({...devices['Pixel 7']});
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
 await page.evaluate(()=>{File.prototype.arrayBuffer=()=>{throw Error('Full input read forbidden by test');};});
 await page.locator('#file').setInputFiles(file);
 assert.match(await page.locator('#selection-message').textContent(),/큰 영상은 PC/);
 assert.equal(await page.locator('#source-video').getAttribute('src'),null);
 assert.equal(await page.locator('#convert').isEnabled(),true);
 await page.locator('#convert').tap();
 await page.locator('#result').waitFor({state:'visible',timeout:60000});
 const duration=await page.locator('#output-preview video').evaluate(async video=>{
  if(video.readyState<1)await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=reject;});
  return video.duration;
 });
 assert.ok(duration>=1);
 console.log('PASS synthetic 1.1GiB boundary file, mobile warning, no full input arrayBuffer, WORKERFS conversion');
}finally{await browser.close();await rm(dir,{recursive:true,force:true});}
