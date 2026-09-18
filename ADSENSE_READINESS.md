# Morfliq 공개·AdSense 준비 점검

점검 기준: 현재 소스 및 로컬 정적 빌드. 아래 결과는 Google의 승인 판정이 아닙니다.

## 완료한 항목

- 실제 기능: WebM→MP4, MP4→GIF, MP4→MP3를 브라우저에서 실행해 결과 생성 확인.
- 엔진 테스트: 생성 파일의 헤더 및 전체 디코딩, 1280×720→854×480 축소, 무음 영상 MP3 실패, 손상 파일 실패 검증.
- 본문 콘텐츠: 메인 페이지에 사용 방법, 기능별 활용 예시, 실제 출력 설정, 포맷 비교표, 압축·해상도 관련 팁, FAQ 7개. JavaScript를 실행하지 않아도 읽을 수 있는 HTML입니다.
- 신뢰 정보: 소개, 개인정보처리방침, 문의 페이지. 운영자 ew, 문의 ehh1120@naver.com. 실제 mailto 링크이며 문의가 전송되었다고 가장하는 폼은 없습니다.
- 모든 페이지에서 소개·개인정보·문의 페이지로 이동할 수 있습니다.
- 페이지별 제목과 description, 한국어 lang, H1, 반응형 레이아웃, favicon, 404 페이지.
- 공개 도메인을 설정하면 canonical·Open Graph·Twitter 메타, WebSite/WebPage/WebApplication 또는 Breadcrumb 구조화 데이터, 6개 URL의 sitemap.xml, robots.txt가 생성됩니다.
- 구조화 데이터 스크립트는 실제 내용과 일치하며 임의 평점·리뷰를 넣지 않았습니다. CSP 해시도 함께 생성합니다.
- 광고 스크립트와 대형 빈 광고 영역은 아직 없습니다. 파일 업로드 API, 사용자 계정, 분석 추적 코드도 없습니다.

## 공개 도메인 확정 후 필요한 일

1. `site.config.json`의 `url` 또는 Cloudflare Pages의 `SITE_URL`을 실제 HTTPS 도메인으로 설정하고 다시 빌드하세요. 현재 localhost용 빌드는 noindex이고 sitemap에 가상의 URL을 넣지 않았습니다.
2. Cloudflare Pages: build command `npm run build`, output directory `dist`. production 브랜치가 main이 아니라면 `PRODUCTION_BRANCH`를 실제 이름으로 설정하세요. 다른 브랜치 빌드는 noindex입니다.
3. 공개 배포에서 여섯 페이지와 `/sitemap.xml`, `/robots.txt`, 엔진 조각 파일 로딩을 확인하세요. Cloudflare Access 등 로그인 제한 없이 심사 봇이 접근할 수 있어야 합니다.
4. Search Console에서 도메인 소유권을 확인하고 사이트맵을 제출할 수 있습니다. 사이트맵 제출은 색인 또는 승인을 보장하지 않습니다.
5. `npm run check:release`로 도메인·운영자·문의·noindex·사이트맵 상태를 확인하세요.

## AdSense 연결 시 필요한 일

- AdSense 계정에서 사이트 소유권 확인 방법과 게시자 ID를 받아 실제 설정을 연결해야 합니다. 현재 계정이나 게시자 ID는 연결되어 있지 않습니다.
- ads.txt가 필요한 설정에서는 해당 계정에서 제공하는 정확한 레코드를 사용하세요. 임의의 pub-ID나 빈 승인 표시를 만들지 않았습니다.
- 실제 광고를 켤 때 Google 및 제3자 광고 쿠키·데이터 처리 내용을 개인정보처리방침에 반영하고 필요한 동의 절차를 구현해야 합니다. EEA·영국·스위스에 광고를 제공하는 경우 Google의 인증 CMP 요구사항을 확인하세요.
- 현재 CSP는 자체 사이트 리소스만 허용합니다. 광고와 CMP를 추가할 때 실제 필요한 출처를 허용하고 공개 배포에서 동작을 검증해야 합니다.
- 변환·다운로드 버튼과 광고를 구분하고 광고 클릭을 유도하지 않아야 합니다.

## 공식 기준

Google은 독창적이고 유용한 콘텐츠와 명확한 탐색을 강조합니다. 특정 글자 수나 특정 정책 페이지 몇 개만으로 승인된다고 설명하지 않습니다.

- 사이트 준비: https://support.google.com/adsense/answer/7299563?hl=ko
- 개인정보 고지: https://support.google.com/adsense/answer/1348695?hl=ko
- CMP 요구사항: https://support.google.com/adsense/answer/13554116?hl=ko
- 사이트맵: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- canonical: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

## 카피·SEO 정리

장식용 셸 명령과 상태 문구, 반복되는 특징·활용 카드, 고정 버전 라벨을 줄였습니다. MP4의 AAC 128kbps와 MP3의 품질별 비트레이트를 구분하고 GIF는 앞부분만 지원한다고 명시합니다. 설정 요약은 실제 인코딩 설정과 공용 상수를 사용합니다.

검색용으로 숨긴 문구, 키워드 나열, 가짜 후기·평점은 추가하지 않습니다. 메인 페이지의 실사용 안내와 별도 상세 가이드, 정책·문의 링크를 유지합니다. 디자인·문구 변경 자체가 검색 노출이나 AdSense 승인을 보장하지 않습니다. 공개 도메인 및 실제 광고 설정 점검은 여전히 필요합니다.
