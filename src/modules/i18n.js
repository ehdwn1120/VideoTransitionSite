import english from '../locales/en.json' with { type: 'json' };
export function currentLanguage() {
  return typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'ko';
}
export function t(source, values = {}, language = currentLanguage()) {
  const message = language === 'en' ? (english[source] ?? source) : source;
  return message.replace(/\{(\w+)\}/g, (match, key) => String(values[key] ?? match));
}
export function languagePath(path, language) {
  const base = path.replace(/^\/en(?=\/|$)/, '') || '/';
  return language === 'en' ? `/en${base === '/index.html' ? '/' : base}` : base;
}
export function preferredLanguage(saved, languages = []) {
  if (saved === 'ko' || saved === 'en') return saved;
  return (languages[0] || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en';
}
