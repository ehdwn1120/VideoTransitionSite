import {chromium, devices} from 'playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
try {
const page=await browser.newPage({...devices['Pixel 7'],locale:'ko-KR'});
await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
const chooser=page.waitForEvent('filechooser');await page.locator('#file').tap();await (await chooser).setFiles('tests/fixtures/sample.avi');
assert.match(await page.locator('#selection-message').textContent(),/선택 완료.*sample.avi/);
assert.equal(await page.locator('#convert').isEnabled(),true);
assert.equal(await page.locator('#source-video').getAttribute('src'),null);
await page.evaluate(()=>{
 const file=new File(['x'],'large.AVI',{type:''});Object.defineProperty(file,'size',{value:Math.floor(1.1*1024**3)+1});
 const data=new DataTransfer();data.items.add(file);document.querySelector('#file').files=data.files;document.querySelector('#file').dispatchEvent(new Event('change'));
});
assert.match(await page.locator('#selection-message').textContent(),/large.AVI.*1GB/);
assert.equal(await page.locator('#convert').isDisabled(),true);
await page.locator('#file').setInputFiles({name:'mobile.AVI',mimeType:'',buffer:await readFile('tests/fixtures/sample.avi')});
assert.match(await page.locator('#selection-message').textContent(),/선택 완료.*mobile.AVI/);
await page.locator('#convert').tap();await page.locator('#result').waitFor({state:'visible',timeout:60000});
assert.match(await page.locator('#download').getAttribute('download'),/mobile-converted.mp4/);
await page.locator('#file').setInputFiles({name:'unsupported.heic',mimeType:'image/heic',buffer:Buffer.from('x')});
assert.equal(await page.locator('#result').isVisible(),false);
assert.equal(await page.locator('#selection-message').getAttribute('data-error'),'true');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
console.log('PASS mobile native chooser, AVI without MIME/preview, oversized and unsupported feedback, recovery and real AVI conversion');
}finally{await browser.close();}
