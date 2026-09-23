import { currentLanguage, preferredLanguage, languagePath } from './modules/i18n.js';
const key = 'morfliq-language';
let saved;
const explicit = new URLSearchParams(location.search).get('lang');
try { saved = localStorage.getItem(key); } catch { /* Storage may be unavailable in private mode. */ }
// Explicit /en/ and deep links remain stable for sharing and indexing.
// Browser preference applies only to the entry homepage, before a file is selected.
if (location.pathname === '/' || location.pathname === '/index.html') {
  const language = preferredLanguage(['ko', 'en'].includes(explicit) ? explicit : saved, navigator.languages?.length ? navigator.languages : [navigator.language]);
  if (language === 'en') location.replace(`/en/${location.search}${location.hash}`);
}
const picker = document.getElementById('language-select');
if (picker) {
  picker.value = currentLanguage();
  picker.addEventListener('change', () => {
    const language = picker.value;
    if (language === currentLanguage()) return;
    if (document.getElementById('source-preview')?.hidden === false) {
      const message = currentLanguage() === 'en'
        ? 'Changing language reloads the page. Download any result first; you will need to select your file again. Continue?'
        : '언어를 바꾸면 페이지가 다시 열립니다. 결과를 먼저 다운로드해 주세요. 파일은 다시 선택해야 합니다. 계속할까요?';
      if (!window.confirm(message)) { picker.value = currentLanguage(); return; }
    }
    try { localStorage.setItem(key, language); } catch { /* Navigation still works without storage. */ }
    const query = new URLSearchParams(location.search);
    query.set('lang', language);
    location.assign(languagePath(location.pathname, language) + '?' + query.toString() + location.hash);
  });
}
