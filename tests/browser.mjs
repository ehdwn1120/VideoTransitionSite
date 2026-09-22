// Run against npm run dev: TEST_URL=http://127.0.0.1:4175 node tests/browser.mjs
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const browser = await chromium.launch({headless:true, ...(process.env.BROWSER_PATH ? {executablePath:process.env.BROWSER_PATH} : {})});
try {
 const page = await browser.newPage({acceptDownloads:true});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const engineRequests=[];page.on('request',r=>{if(r.url().includes('/engine/'))engineRequests.push(r.url());});
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4175');
 const fixtures=await page.evaluate(async()=>{
  const c=document.createElement('canvas');c.width=1200;c.height=800;
  const x=c.getContext('2d');x.fillStyle='#ff0000';x.fillRect(500,300,100,100);
  const files={};for(const type of ['png','jpeg','webp']) files[type]=Array.from(new Uint8Array(await (await new Promise(r=>c.toBlob(r,'image/'+type))).arrayBuffer()));
  return files;
 });
 for(const source of ['png','jpeg','webp']) for(const format of ['jpg','png','webp']) {
  await page.locator('#file').setInputFiles({name:`test.${source}`,mimeType:`image/${source}`,buffer:Buffer.from(fixtures[source])});
  assert.deepEqual(await page.locator('#format option').evaluateAll(options=>options.map(o=>o.value)),['jpg','png','webp']);
  await page.selectOption('#format',format);await page.selectOption('#resolution','480');
  assert.equal(await page.locator('#quality').isDisabled(),format==='png');
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible'});
  const result=await page.evaluate(async()=>{
   const blob=await(await fetch(document.querySelector('#download').href)).blob();
   const bitmap=await createImageBitmap(blob);const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;
   const x=c.getContext('2d');x.drawImage(bitmap,0,0);const pixel=Array.from(x.getImageData(0,0,1,1).data);
   return {type:blob.type,width:bitmap.width,height:bitmap.height,pixel};
  });
  assert.equal(result.type,`image/${format==='jpg'?'jpeg':format}`);assert.equal(result.width,720);assert.equal(result.height,480);
  if(source!=='jpeg') assert.deepEqual(result.pixel,format==='jpg'?[255,255,255,255]:[0,0,0,0]);
  const downloadPromise=page.waitForEvent('download');await page.click('#download');const download=await downloadPromise;
  assert.equal(download.suggestedFilename(),`test-converted.${format}`);
  const bytes=await readFile(await download.path());assert.ok(bytes.length>100);
  console.log(`PASS ${source} → ${format}: actual download, dimensions, transparency`);
 }
 assert.equal(engineRequests.length,0,'Image conversions must not load FFmpeg');
 await page.locator('#file').setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('broken')});
 await page.click('#convert');await page.waitForFunction(()=>document.querySelector('#status-text').textContent.includes('오류:'));
 assert.equal(await page.locator('#result').isVisible(),false);
 if (!process.env.PRODUCTION_TEST) {
 const safety=await page.evaluate(async()=>{
  const {ImageEngine}=await import('/src/modules/image-engine.js');
  const engine=new ImageEngine();engine.cancel();let cancelled=false;
  try{await engine.convert(new File(['x'],'a.png'),{format:'png',quality:'balanced'});}catch{cancelled=true;}
  const animated=new Uint8Array(32);animated.set([137,80,78,71,13,10,26,10]);animated.set([97,99,84,76],12);
  let rejected=false;try{await new ImageEngine().convert(new File([animated],'a.png'),{format:'png',quality:'balanced'});}catch(e){rejected=e.message.includes('움직이는');}
  return {cancelled,rejected};
 });assert.deepEqual(safety,{cancelled:true,rejected:true});
 console.log('PASS corrupt image, cancellation, animated image rejection');
 }
 for(const [source,format] of [['webm','mp4'],['mp4','gif'],['mp4','mp3'],['avi','mp4'],['avi','gif'],['avi','mp3']]) {
  await page.locator('#file').setInputFiles(`tests/fixtures/sample.${source}`);
  assert.deepEqual(await page.locator('#format option').evaluateAll(options=>options.map(o=>o.value)),['mp4','gif','mp3']);
  await page.selectOption('#format',format);if(format==='gif')await page.fill('#duration','1');
  await page.click('#convert');await page.locator('#result').waitFor({state:'visible',timeout:60000}).catch(async error => { console.error(await page.locator('#status-text').textContent(), await page.locator('#logs').textContent(), errors); throw error; });
  const promise=page.waitForEvent('download');await page.click('#download');const download=await promise;
  assert.equal(download.suggestedFilename(),`sample-converted.${format}`);
  const data=await readFile(await download.path());const head=data.subarray(0,16).toString('ascii');
  assert.ok(format==='mp4'?head.includes('ftyp'):format==='gif'?head.startsWith('GIF8'):head.startsWith('ID3'));
  console.log(`PASS browser ${source} → ${format}: real FFmpeg + download`);
 }
 await page.click('#remove');assert.equal(await page.locator('#convert').isDisabled(),true);assert.equal(await page.locator('#result').isVisible(),false);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/morfliq-image-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS reset, mobile width, no uncaught browser errors');
} finally {await browser.close();}
