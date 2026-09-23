import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
const base=process.env.TEST_URL || 'http://127.0.0.1:4174';
try{
 for(const locale of ['en-US','de-DE','ko-KR']){
  const page=await browser.newPage({locale});
  await page.goto(base);await page.waitForFunction(()=>document.querySelector('#language-select'));
  await page.waitForURL(locale==='ko-KR'?base+'/':base+'/en/');
  assert.equal(await page.locator('html').getAttribute('lang'),locale==='ko-KR'?'ko':'en');
  await page.close();
 }
 for(const blocked of [false,true]){
  const page=await browser.newPage({locale:'en-US'});
  if(blocked)await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});
  await page.goto(base+'/en/');
  await page.selectOption('#language-select','ko');await page.waitForURL(/\/?lang=ko/);
  assert.equal(await page.locator('html').getAttribute('lang'),'ko');
  await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'ko');
  if(!blocked){await page.goto(base);assert.equal(await page.locator('html').getAttribute('lang'),'ko');}
  await page.goto(base+'/guide.html#gif');await page.selectOption('#language-select','en');await page.waitForURL(/\/en\/guide.*#gif/);
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.goto(base+'/en/');await page.locator('#file').setInputFiles('tests/fixtures/sample.avi');
  page.once('dialog',dialog=>dialog.dismiss());await page.selectOption('#language-select','ko');
  assert.equal(await page.locator('#language-select').inputValue(),'en');
  await page.click('#convert');assert.ok(await page.locator('#language-select').isDisabled());
  await page.locator('#result').waitFor({state:'visible',timeout:60000});
  assert.equal(await page.locator('#language-select').isDisabled(),false);
  assert.ok(!/[가-힣]/.test(await page.locator('#status-text').textContent()));
  await page.screenshot({path:`/tmp/morfliq-en-${blocked?'blocked':'mobile'}.png`,fullPage:true});
  await page.close();
 }
 console.log('PASS language detection, remembered choice, blocked storage, article/hash links, mobile width, file warning, conversion lock');
}finally{await browser.close();}
