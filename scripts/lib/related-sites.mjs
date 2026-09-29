// Add related sites here; the build shares this navigation across every page.
export const relatedSites = [
  { name: 'SlimPic', label: '사진 용량 줄이기', url: 'https://slimpic-3ma.pages.dev/' },
];
export function relatedSitesMarkup() {
  return `<details class="related-sites"><summary>다른 사이트</summary><div class="related-sites-panel">${relatedSites.map(site => `<a href="${site.url}" target="_blank" rel="noopener noreferrer"><strong>${site.label}</strong><span>${site.name} ↗</span></a>`).join('')}<small>새 탭에서 열립니다</small></div></details>`;
}
