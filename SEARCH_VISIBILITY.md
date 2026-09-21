# Morfliq 검색 노출 점검 (2026-09-21)

## 실제 확인한 상태

- 공개 주소: https://morfliq.win
- 공개 홈페이지 HTTP 200, robots meta `index, follow`, canonical `https://morfliq.win/` 확인.
- 공개 robots.txt가 모든 검색로봇에 수집을 허용하고 실제 사이트맵 주소를 안내합니다. 이 규칙은 네이버 Yeti에도 적용됩니다.
- 공개 sitemap.xml에 메인·가이드·포맷·소개·개인정보·문의 6개 URL이 있습니다.
- 사용자가 추가한 AdSense 소유확인 태그 및 ads.txt를 보존합니다. 광고 실행 스크립트는 관찰되지 않았습니다.
- Google Search Console은 사용자 보고상 등록 완료입니다. 계정 내부의 색인·성과 데이터는 이번 작업에서 확인하지 않았습니다.
- 네이버 서치어드바이저에 접근했으나 NAVER 로그인 화면이 표시되어 사이트 등록 및 소유확인·사이트맵 제출은 완료하지 못했습니다.

## 이번에 반영한 개선

1. 검색 제목·설명에 실제 작업(WebM/MP4 변환, GIF 생성, MP3 추출)과 200MB 제한을 명확히 표시.
2. 메인 기능 설명에서 가이드의 해당 항목으로 바로 이동하는 일반 HTML 링크 추가.
3. 소개·문의의 반복 문장을 줄이고 구체적인 오류 신고 안내를 유지.
4. 네이버·Bing 소유확인 토큰을 공용 빌드 함수에서 검증·출력. 빈 값·가짜 토큰은 실제 사이트에 출력하지 않음.
5. 테스트로 공개 메인 페이지에만 확인 태그가 출력되는지, 사이트맵·canonical·미리보기 noindex가 유지되는지 검증.

## 네이버 등록을 마치는 방법

1. https://searchadvisor.naver.com 에 운영자 계정으로 로그인합니다.
2. 웹마스터 도구에서 `https://morfliq.win`을 등록합니다. 이미 등록되어 있다면 같은 사이트를 사용합니다.
3. HTML 태그 방식의 `naver-site-verification`에서 **content 값만** 복사해 `site.config.json` → `searchVerification.naver` 또는 배포 환경 변수 `NAVER_SITE_VERIFICATION`에 넣습니다.
4. 다시 배포한 뒤 네이버에서 소유확인을 완료합니다.
5. 요청 → 사이트맵 제출에서 `https://morfliq.win/sitemap.xml`을 제출합니다. 사이트 간단 체크와 수집·색인 상태도 확인합니다.

Bing을 추가하려면 Bing Webmaster Tools에서 사이트를 등록하거나 Google Search Console 가져오기를 이용할 수 있습니다. HTML 메타 방식이면 발급된 `msvalidate.01`의 content 값을 `searchVerification.bing` 또는 `BING_SITE_VERIFICATION`에 넣습니다. 이번 작업에서는 Bing 계정 등록을 수행하지 않았습니다.

## 운영 중 확인할 항목

- Search Console에서는 `/`, `/guide`, `/formats`의 색인 여부와 실제 검색어·클릭을 확인하세요. 실제 질문이 반복될 때 해당 가이드를 개선하세요.
- 같은 내용을 포맷명만 바꿔 여러 페이지로 늘리거나, 숨겨진 키워드·가짜 후기·평점·업데이트 날짜를 넣지 않습니다.
- 이 사이트는 정적 도구와 안내 페이지이므로 억지로 뉴스 RSS를 만들지 않았습니다. sitemap.xml이 주요 발견 경로입니다.
- 검색로봇용 UA 요청만으로 진짜 Googlebot/Yeti의 접근을 증명할 수는 없습니다. 플랫폼별 수집 보고서가 최종 확인 경로입니다.
- 등록·수집 허용은 노출 순위나 AdSense 승인을 보장하지 않습니다.

## 공식 참고

- 네이버: https://searchadvisor.naver.com/guide/seo-basic-intro
- robots: https://searchadvisor.naver.com/guide/seo-basic-robots
- Google 유용한 콘텐츠: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- AdSense 사이트 준비: https://support.google.com/adsense/answer/7299563?hl=ko
