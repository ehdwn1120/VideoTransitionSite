import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {languagePath,preferredLanguage,t} from '../src/modules/i18n.js';
test('Language selection respects saved preferences and preserves article routes',()=>{
 assert.equal(preferredLanguage('ko',['en-US']),'ko');
 assert.equal(preferredLanguage(null,['ko-KR']),'ko');
 assert.equal(preferredLanguage(null,['de-DE']),'en');
 assert.equal(languagePath('/en/guide','ko'),'/guide');
 assert.equal(languagePath('/guide.html','en'),'/en/guide.html');
 assert.equal(t('변환이 완료되었습니다.',{},'en'),'Conversion complete.');
});
test('English pages have complete metadata and working local links',async()=>{
 for(const name of ['index','guide','formats','about','privacy','contact']){
  const html=await readFile(`dist/en/${name}.html`,'utf8');
  assert.match(html,/<html lang="en"/);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
  assert.match(html,/hreflang="ko"/);assert.match(html,/hreflang="en"/);
  assert.match(html,/id="language-select"/);
  const plain=html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,'').replaceAll('한국어','').replaceAll('언어','');
  assert.ok(!/[가-힣]/.test(plain),`${name} has untranslated Korean`);
  for(const m of html.matchAll(/(?:href|src)="(\/[^"?#]*)/g)){
   let path=`dist${m[1]}`;
   if(path.endsWith('/'))path+='index.html';
   else if(!/\.[^/]+$/.test(path))path+='.html';
   await stat(path);
  }
 }
});
