import {readFile,writeFile,mkdir} from 'node:fs/promises';
const translations=JSON.parse(await readFile('src/locales/en.json','utf8'));
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function translate(html) {
 // Translate complete text nodes and attributes, never partial matches inside a sentence.
 return html.replace(/>[^<]+</g, text => '>'+ (translations[text.slice(1,-1)] ? escape(translations[text.slice(1,-1)]) : text.slice(1,-1)) +'<')
 .replace(/(content|aria-label|alt)="([^"]*)"/g, (all,key,value)=>translations[value] ? `${key}="${escape(translations[value])}"` : all)
 .replace('lang="ko"','lang="en"').replace('content="ko_KR"','content="en_US"')
 .replace(/href="\/(?!src\/|favicon|en\/)([^"#]*)(#[^"]*)?"/g, (_,path,hash='')=>`href="/en/${path.replace(/\.html$/,'')}${hash}"`)
 .replace('value="ko" selected','value="ko"').replace('value="en"','value="en" selected');
}
const home=await readFile('index.html','utf8');
await mkdir('en',{recursive:true});
await writeFile('en/index.html',translate(home));
const header=translate(home.match(/<header[\s\S]*?<\/header>/)[0]);
const footer=translate(home.match(/<footer[\s\S]*?<\/footer>/)[0]);
const meta={
 guide:['Conversion guide','How to convert images and videos, choose quality and resolution, and troubleshoot common errors.'],
 formats:['Image, video and audio formats','Compare JPG, PNG, WebP, MP4, WebM, AVI, GIF and MP3, and learn how codecs affect conversion.'],
 about:['About Morfliq','A browser-based image and video converter operated by ew. Files are processed locally without uploads.'],
 privacy:['Privacy policy','How Morfliq handles your files, browser memory, language preference and hosting requests.'],
 contact:['Contact and report an issue','Contact the Morfliq operator about conversion errors, feature requests and privacy.']
};
for(const [page,[title,description]] of Object.entries(meta)) {
 const body=await readFile(`content/en/${page}.html`,'utf8');
 await writeFile(`en/${page}.html`,`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} | Morfliq</title><meta name="description" content="${description}"><meta name="theme-color" content="#0b0e0c"><meta property="og:type" content="website"><meta property="og:locale" content="en_US"><meta property="og:title" content="${title} | Morfliq"><meta property="og:description" content="${description}"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/src/style.css"></head><body>${header}<main class="article-shell"><a href="/en/" class="back-link">← Back to converter</a>${body}</main>${footer}<script type="module" src="/src/language.js"></script></body></html>`);
}
console.log('Generated six English pages from shared layout, translations and article content.');
