import test from 'node:test';
import assert from 'node:assert/strict';
import { verificationMeta } from '../scripts/lib/search-verification.mjs';
test('Search verification emits only configured tokens on the public homepage',()=>{
 assert.equal(verificationMeta({}, {}, true, 'index'),'');
 const config={searchVerification:{naver:'test-token',bing:'ABC123'}};
 assert.match(verificationMeta(config,{},true,'index'),/name="naver-site-verification" content="test-token"/);
 assert.match(verificationMeta(config,{},true,'index'),/name="msvalidate.01" content="ABC123"/);
 assert.equal(verificationMeta(config,{},false,'index'),'');
 assert.equal(verificationMeta(config,{},true,'privacy'),'');
 assert.match(verificationMeta(config,{NAVER_SITE_VERIFICATION:'override'},true,'index'),/content="override"/);
 assert.throws(()=>verificationMeta({searchVerification:{naver:'<meta name="wrong">'}},{},true,'index'));
});
