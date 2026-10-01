import './modules/related-sites.js';
import { currentLanguage, preferredLanguage, languagePath } from './modules/i18n.js';
const key = 'morfliq-language';
let saved;
const explicit = new URLSearchParams(location.search).get('lang');
try {
  if (explicit === currentLanguage()) localStorage.setItem(key, explicit);
  saved = localStorage.getItem(key);
} catch { /* Storage may be unavailable in private mode. */ }
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
    // Restore the control if the user cancels the browser's leave warning.
    picker.value = currentLanguage();
    const query = new URLSearchParams(location.search);
    query.set('lang', language);
    location.assign(languagePath(location.pathname, language) + '?' + query.toString() + location.hash);
  });
}
