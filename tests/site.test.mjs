import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,cp,mkdir,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const pages=['index','guide','formats','about','privacy','contact'];
test('Every page has Morfliq metadata, one h1 and working policy links',async()=>{
 for(const page of pages){
  const html=await readFile(`dist/${page}.html`,'utf8');
  assert.match(html,/<html lang="ko"/);assert.match(html,/<title>[^<]*Morfliq/);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
  assert.ok(!html.includes('FRAME'));assert.match(html,/name="description"/);
  for(const dest of ['about','privacy','contact']) assert.ok(html.includes(`href="/${dest}.html"`));
  for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
   const target=match[1]==='/'?'/index.html':match[1];
   await readFile(`dist${target}`);
  }
 }
 const home=await readFile('dist/index.html','utf8');
 for(const id of ['converter','how-to','workflows','format-comparison','tips','faq']) assert.ok(home.includes(`id="${id}"`));
 const contact=await readFile('dist/contact.html','utf8');assert.match(contact,/mailto:ehh1120@naver.com/);assert.match(contact,/운영자: ew/);
});
test('Production sitemap, canonical, structured data and preview noindex',async()=>{
 // Build metadata in isolation; never place the example test domain in the deliverable.
 const dir=await mkdtemp(join(tmpdir(),'morfliq-seo-'));
 await cp('dist',join(dir,'dist'),{recursive:true});
 await cp('site.config.json',join(dir,'site.config.json'));await mkdir(join(dir,'public'));
 await cp('public/_headers',join(dir,'public/_headers'));
 const env={...process.env,SITE_URL:'https://morfliq.example',CF_PAGES:'1',CF_PAGES_BRANCH:'main',CF_PAGES_URL:'https://different-project.pages.dev',SITE_NOINDEX:'',NAVER_SITE_VERIFICATION:'test-naver-token',BING_SITE_VERIFICATION:'test-bing-token'};
 const run=()=>execFileSync(process.execPath,[resolve('scripts/seo.mjs')],{cwd:dir,env});
 run();run();
 const sitemap=await readFile(join(dir,'dist/sitemap.xml'),'utf8');
 assert.equal((sitemap.match(/<loc>/g)||[]).length,6);assert.match(sitemap,/<loc>https:\/\/morfliq.example\/contact<\/loc>/);
 const robots=await readFile(join(dir,'dist/robots.txt'),'utf8');assert.match(robots,/Sitemap: https:\/\/morfliq.example\/sitemap.xml/);
 const headers=await readFile(join(dir,'dist/_headers'),'utf8');
 for(const page of pages){
  const html=await readFile(join(dir,`dist/${page}.html`),'utf8');
  if(page === 'index') assert.match(html,/name="naver-site-verification" content="test-naver-token"/);
  else assert.ok(!html.includes('naver-site-verification'));
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert.ok(!html.includes('content="noindex'));
  const json=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];assert.ok(JSON.parse(json)['@graph']);
  assert.ok(headers.includes(createHash('sha256').update(json).digest('base64')));
 }
 env.CF_PAGES_BRANCH='feature/test';run();
 assert.match(await readFile(join(dir,'dist/index.html'),'utf8'),/content="noindex, follow"/);
 assert.equal(((await readFile(join(dir,'dist/sitemap.xml'),'utf8')).match(/<loc>/g)||[]).length,0);
});
