import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH});
try {
 for(const lang of ['ko','en']){
  const page=await browser.newPage({locale:lang==='ko'?'ko-KR':'en-US'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=process.env.TEST_URL||'http://127.0.0.1:4176';
  await page.goto(base+(lang==='en'?'/en/':'/?lang=ko'));
  await page.locator('#file').setInputFiles('tests/fixtures/sample.mp4');
  await page.selectOption('#format','mp3');await page.click('#convert');
  await page.locator('#result').waitFor({state:'visible',timeout:60000});
  const href=await page.locator('#download').getAttribute('href');
  await page.selectOption('#quality','small');
  assert.equal(await page.locator('#download').getAttribute('href'),href);
  assert(await page.locator('#result').isVisible());
  assert.match(await page.locator('#result-meta').textContent(),/KB/);
  let count=0;page.on('dialog',async d=>{count++;assert.equal(d.type(),'beforeunload');await d.dismiss();});
  await page.locator(`.site-header nav a[href="${lang==='en'?'/en':''}/about"]`).click();
  assert.equal(count,1);assert.equal(await page.locator('#download').getAttribute('href'),href);
  await page.selectOption('#language-select',lang==='ko'?'en':'ko');
  assert.equal(count,2);assert.equal(await page.locator('#language-select').inputValue(),lang);
  assert.equal(await page.evaluate(()=>document.documentElement.lang),lang);
  const download=page.waitForEvent('download');await page.click('#download');assert.equal((await download).suggestedFilename(),'sample-converted.mp3');
  await page.locator(`.site-header nav a[href="${lang==='en'?'/en':''}/about"]`).click();await page.waitForURL('**/about');assert.equal(count,2);
  assert.deepEqual(errors,[]);await page.close();console.log('PASS',lang,'result retention, metadata, cancelled navigation/language, download and unguarded navigation');
 }
}finally{await browser.close();}
