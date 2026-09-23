import { escapeHtml as escape, verificationMeta } from './lib/search-verification.mjs';
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const config = JSON.parse(await readFile('site.config.json', 'utf8'));
const raw = process.env.SITE_URL || config.url || process.env.CF_PAGES_URL;
const contact = process.env.CONTACT_EMAIL || config.contactEmail;
const operator = process.env.OPERATOR_NAME || config.operatorName;
const pageNames = ['index', 'guide', 'formats', 'about', 'privacy', 'contact'];
const pages = ['ko','en'].flatMap(lang => pageNames.map(page => ({page,lang,pathKey:lang === 'en' ? `en/${page}` : page})));
const route = (page,lang) => `${lang === 'en' ? '/en' : ''}/${page === 'index' ? '' : page}`;
let origin;
if (raw) {
  const parsed = new URL(raw);
  if (parsed.protocol !== 'https:' || parsed.pathname !== '/' || parsed.search || parsed.hash || parsed.username || parsed.password) throw new Error('SITE_URL must be an HTTPS origin without credentials, path, query or hash');
  origin = parsed.origin;
}
if (contact && !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contact)) throw new Error('CONTACT_EMAIL must be a valid email address');
// Cloudflare preview deployments should not compete with the public canonical site.
const preview = process.env.SITE_NOINDEX === '1' || (process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== (process.env.PRODUCTION_BRANCH || 'main'));
const indexable = Boolean(origin) && !preview;
const hashes = [];
for (const {page,lang,pathKey} of pages) {
  const path = `dist/${pathKey}.html`;
  let html = await readFile(path, 'utf8');
  // Keep this postprocessor repeatable without accumulating duplicate metadata.
  html = html.replace(/<!--SEO_START-->[\s\S]*?<!--SEO_END-->/g, '');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] || config.name;
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  const url = origin && `${origin}${route(page,lang)}`;
  let meta = `<meta name="robots" content="${indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow'}"><meta property="og:site_name" content="${escape(config.name)}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}">`;
  meta += verificationMeta(config, process.env, indexable && lang === 'ko', page);
  if (origin) {
    meta += `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}">`;
    meta += ['ko','en','x-default'].map(locale => `<link rel="alternate" hreflang="${locale}" href="${escape(origin + route(page,locale === 'en' ? 'en' : 'ko'))}">`).join('');
    const schema = {'@context':'https://schema.org','@graph':[
      {'@type':'WebSite','@id':`${origin}/#website`,name:config.name,url:`${origin}/`,inLanguage:['ko','en']},
      {'@type':page === 'contact' ? 'ContactPage' : page === 'about' ? 'AboutPage' : 'WebPage', '@id':`${url}#page`,url,name:title,description,inLanguage:lang,isPartOf:{'@id':`${origin}/#website`}},
      ...(page === 'index' ? [{'@type':'WebApplication',name:config.name,url,applicationCategory:'MultimediaApplication',operatingSystem:'Web browser',browserRequirements:'Requires JavaScript, WebAssembly and Web Workers',isAccessibleForFree:true,featureList:lang === 'en' ? ['JPG, PNG and WebP conversion','MP4 conversion','GIF from video','MP3 extraction','Resolution and quality controls'] : ['JPG·PNG·WebP 이미지 변환','MP4 변환','GIF 생성','MP3 추출','해상도 및 품질 조절']}] : [{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:config.name,item:origin + route('index',lang)},{'@type':'ListItem',position:2,name:title.split(' | ')[0],item:url}]}])
    ]};
    const json = JSON.stringify(schema).replace(/</g,'\\u003c');
    hashes.push(`'sha256-${createHash('sha256').update(json).digest('base64')}'`);
    meta += `<script type="application/ld+json">${json}</script>`;
  }
  html = html.replace('</head>', `<!--SEO_START-->${meta}<!--SEO_END--></head>`);
  if(page === 'contact') {
    let block = `${operator ? `<p>운영자: ${escape(operator)}</p>` : ''}${contact ? `<p>이메일: <a class="contact-link" href="mailto:${escape(contact)}">${escape(contact)}</a></p><p>링크를 누르면 기기의 메일 앱이 열립니다. 직접 전송한 이메일만 접수되며, 이 웹사이트가 파일을 자동으로 전송하지 않습니다.</p>` : '<p>공개 문의 이메일은 아직 등록되지 않았습니다. 현재 이 페이지에서 문의를 전송하거나 접수할 수는 없습니다.</p>'}`;
    if (lang === 'en') block = `${operator ? `<p>Operator: ${escape(operator)}</p>` : ''}${contact ? `<p>Email: <a class="contact-link" href="mailto:${escape(contact)}">${escape(contact)}</a></p><p>The link opens your email app. This website does not send files automatically.</p>` : '<p>A contact email has not been published yet.</p>'}`;
    html = html.replace(/<!--CONTACT_DETAILS_START-->[\s\S]*?<!--CONTACT_DETAILS_END-->/,`<!--CONTACT_DETAILS_START-->${block}<!--CONTACT_DETAILS_END-->`);
  }
  if (page === 'about' && operator) html=html.replace(/<!--OPERATOR_START-->[\s\S]*?<!--OPERATOR_END-->/,`<!--OPERATOR_START--><p>운영자: ${escape(operator)}. 서비스 문의는 <a href="/contact.html">문의 페이지</a>에서 안내합니다.</p><!--OPERATOR_END-->`);
  if (page === 'about' && operator && lang === 'en') html=html.replace(/<!--OPERATOR_START-->[\s\S]*?<!--OPERATOR_END-->/,`<!--OPERATOR_START--><p>Operator: ${escape(operator)}. See the <a href="/en/contact">contact page</a> for support.</p><!--OPERATOR_END-->`);
  await writeFile(path, html);
}
await writeFile('dist/robots.txt', indexable ? `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nAllow: /\n# Non-production pages use a noindex meta tag.\n');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable ? pages.map(({page,lang}) => `  <url><loc>${escape(origin + route(page,lang))}</loc></url>`).join('\n') : ''}\n</urlset>\n`);
const headers = await readFile('public/_headers', 'utf8');
await writeFile('dist/_headers', headers.replace("script-src 'self' 'wasm-unsafe-eval'", `script-src 'self' 'wasm-unsafe-eval' ${hashes.join(' ')}`));
async function check(dir) { for (const entry of await readdir(dir, {withFileTypes:true})) { const path = `${dir}/${entry.name}`; if(entry.isDirectory()) await check(path); else if((await stat(path)).size > 25*1024*1024) throw new Error(`Cloudflare Pages asset too large: ${path}`); } }
await check('dist');
console.log(indexable ? `SEO: ${origin}; sitemap includes ${pages.length} canonical URLs.` : 'Preview: noindex. Configure SITE_URL or site.config.json url for public SEO.');
if (!contact || !operator) console.log('Before review: supply contactEmail and operatorName in site.config.json (or CONTACT_EMAIL / OPERATOR_NAME).');
