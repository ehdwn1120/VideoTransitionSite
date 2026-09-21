// Verification tokens are public identifiers, not account passwords.
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
export function verificationMeta(config, env, indexable, page) {
  if (!indexable || page !== 'index') return '';
  const tokens = [
    ['naver-site-verification', env.NAVER_SITE_VERIFICATION || config.searchVerification?.naver],
    ['msvalidate.01', env.BING_SITE_VERIFICATION || config.searchVerification?.bing],
  ];
  return tokens.filter(([, value]) => value?.trim()).map(([name, value]) => {
    const token = value.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(token)) throw new Error(`${name}: enter only the content token, not the complete HTML tag`);
    return `<meta name="${name}" content="${escapeHtml(token)}">`;
  }).join('');
}
