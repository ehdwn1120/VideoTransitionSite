# Morfliq

HTML + CSS + ES 모듈 기반 브라우저 비디오 변환기. 런타임 백엔드, 영상 업로드 API, 계정, 분석·광고 스크립트가 없습니다. Vite는 개발 및 정적 파일 번들링에만 사용합니다.

## 실행

Node.js 22.12 이상 권장.

```sh
npm ci
npm run build
npm run preview
```

개발 중에는 먼저 `node scripts/prepare-core.mjs` 실행 후 `npm run dev`를 사용하세요. `index.html`을 file://로 직접 열면 Worker가 실행되지 않습니다. HTTPS 또는 localhost 서버가 필요합니다.

## Cloudflare Pages 배포

- Git 저장소에 소스를 올린 뒤 Pages 프로젝트에 연결합니다.
- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Production 환경 변수 `SITE_URL`: 실제 공개 주소의 HTTPS origin (예: `https://your-domain.com`, 경로 없이).
- `SITE_URL`, `site.config.json`의 `url`, Cloudflare의 `CF_PAGES_URL` 순서로 공개 주소를 선택합니다. 모두 없으면 로컬 미리보기용 `noindex` 빌드를 만들며 robots.txt는 접근을 허용하고 페이지의 noindex로 색인을 제한합니다. sitemap은 비워 둡니다.
- 커스텀 도메인을 연결하거나 도메인을 변경한 뒤에는 `SITE_URL`을 설정하고 다시 빌드하세요.
- Direct Upload를 사용하려면 로컬에서 `SITE_URL=https://실제도메인 npm run build` 후 생성된 **dist 폴더만** 업로드하세요. node_modules나 프로젝트 전체는 업로드하지 마세요.
- Pages는 `.html` 페이지를 확장자 없는 URL로 리디렉션하므로 canonical 및 sitemap은 `/guide`, `/formats`, `/about`, `/privacy`, `/contact`를 사용합니다.

`@ffmpeg/core` WASM은 Pages의 파일당 25MiB 제한보다 큽니다. 빌드가 16MiB 이하 `.bin` 조각으로 나누며 브라우저가 같은 origin에서 받아 Blob으로 합칩니다. R2, 외부 CDN 또는 서버가 필요하지 않습니다. 단일 스레드 엔진을 사용하므로 COOP/COEP와 SharedArrayBuffer도 필요하지 않습니다. `public/_headers`는 Worker와 WASM 실행을 허용하는 CSP 및 기본 보안 헤더를 제공합니다. 향후 광고를 실제 도입할 때 해당 도메인과 동의 흐름에 맞춰 CSP를 수정해야 합니다.

## 구조

- `index.html`: 변환 화면, 빠른 가이드, FAQ
- `guide.html`, `formats.html`, `about.html`, `privacy.html`, `contact.html`: 검색 가능한 정적 콘텐츠
- `src/main.js`: 파일 선택, UI 상태, 진행률, 결과 다운로드
- `src/modules/engine.js`: 엔진 로딩과 변환 수명주기, 취소
- `src/modules/presets.js`: 포맷 정의, 파일 검증, FFmpeg 명령 생성
- `src/style.css`: 테마 토큰, 반응형 레이아웃, 모션 감소 대응
- `scripts/prepare-core.mjs`: 로컬 엔진 파일 패키징
- `scripts/seo.mjs`: 도메인 기반 canonical, robots.txt, sitemap.xml 생성 및 Pages 크기 검사
- `site.config.json`: 사이트명, 공개 도메인, 문의 이메일과 운영자 설정
- `tests/presets.test.mjs`: 변환 옵션과 입력 제한 테스트

새 포맷은 `presets.js`의 메타데이터와 명령 생성 분기에 추가하고 UI 선택지를 연결하세요. 다른 영상 처리 도구는 별도 모듈로 분리하고 `ConversionEngine`을 재사용할 수 있습니다.

## 동작과 제한

입력: MP4 / WebM / MOV / MKV / M4V / AVI, 1.1GiB 이하 (사용자 안내는 최대 1GB, 용량 표시 오차를 위한 내부 여유 한도는 1.1GiB, 최대 1,181,116,006바이트). 내부 코덱에 따라 지원 여부가 달라집니다. 출력: MP4 (H.264/AAC), GIF (최대 30초), MP3. 해상도는 높이 기준이며 업스케일하지 않습니다. 품질 기반 압축이므로 목표 바이트 크기를 보장하지 않습니다. 큰 파일은 메모리 제한으로 실패할 수 있습니다.

변환 엔진은 실행 시에만 로드합니다. 완료·실패·취소 시 Worker를 종료해 작업 메모리를 해제합니다. 결과 Blob은 다운로드와 미리보기를 위해 유지하고 파일 제거·설정 변경·페이지 종료 시 해제합니다. 출력 파일은 서버에 저장되지 않습니다.

## 운영자 및 공개 설정

문의: ehh1120@naver.com, 운영자: ew. `site.config.json`에 저장되어 있습니다. 공개 도메인은 `https://morfliq.win`입니다. 이 주소를 기준으로 사이트맵 12개 URL과 canonical, 구조화 데이터가 빌드에 반영됩니다. `CONTACT_EMAIL`, `OPERATOR_NAME`, `SITE_URL` 환경 변수로 덮어쓸 수 있습니다. Cloudflare의 production 브랜치가 main이 아니면 `PRODUCTION_BRANCH`도 설정하세요. 프리뷰 브랜치 및 `SITE_NOINDEX=1` 빌드는 noindex입니다.

`npm run check:release`로 공개 설정 누락을 점검하세요. 현재 공개 도메인이 설정되어 이 검사를 통과합니다. 기술·콘텐츠 점검 내역과 AdSense 연결 시 남은 단계는 [ADSENSE_READINESS.md](ADSENSE_READINESS.md)에 정리했습니다. AdSense 승인은 Google이 판단하며 AdSense 소유확인 메타 태그와 ads.txt가 있으며, 계정 승인 상태는 별도 확인이 필요합니다.

## 검증

```sh
npm run build
npm test
node scripts/create-fixture.mjs
```

마지막 명령은 개인 영상 대신 합성 패턴·음성으로 구성된 1초 MP4/WebM을 tests/fixtures에 만듭니다. 이 테스트 파일은 dist에 배포되지 않습니다.

## 참고

- https://ffmpegwasm.netlify.app/docs/getting-started/usage/
- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/pages/configuration/headers/

엔진과 코덱의 라이선스는 각 프로젝트에 따릅니다. 배포 엔진 버전에 해당하는 고지와 소스 정보는 `THIRD_PARTY_NOTICES.md`를 참고하세요.

## 네이버·Bing 검색 등록

`site.config.json`의 `searchVerification.naver` / `searchVerification.bing` 또는 `NAVER_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` 환경 변수에 각 서비스가 발급한 content 값만 넣고 다시 빌드하세요. 빈 값은 태그로 출력하지 않으며, 공개 홈페이지에만 출력합니다. Google의 기존 설정과 AdSense 태그는 유지합니다.

등록 단계와 실제 확인 결과는 [SEARCH_VISIBILITY.md](SEARCH_VISIBILITY.md)에 기록했습니다. 사이트맵 주소는 https://morfliq.win/sitemap.xml 입니다.

### 이미지 자동 감지 및 변환

같은 업로드 창에서 JPG/JPEG·PNG·WebP는 이미지 옵션, MP4·WebM·MOV·MKV·M4V·AVI는 영상 옵션으로 전환됩니다. `src/modules/media.js`는 종류 판별·크기 계산·이미지 포맷 정의를, `src/modules/image-engine.js`는 디코딩과 Canvas 인코딩·취소·자원 해제를 담당합니다. 영상 엔진과 독립적으로 동작하며 이미지 작업에는 FFmpeg 다운로드가 발생하지 않습니다.

정지 이미지에 한해 최대 200MB/4천만 픽셀을 지원합니다. PNG·WebP 투명도를 유지하고 JPG의 투명 영역은 흰색으로 채웁니다. 원본 메타데이터는 복사하지 않습니다. 움직이는 PNG/WebP, GIF·HEIC·AVIF 입력은 지원하지 않습니다.

브라우저 통합 테스트: `node scripts/create-fixture.mjs`로 테스트용 영상을 만든 뒤 개발 서버를 켜고 `TEST_URL=http://127.0.0.1:4175 node tests/browser.mjs`를 실행합니다. Playwright Chromium이 필요하며 기존 설치를 사용할 경우 `BROWSER_PATH`에 실행 파일 경로를 지정할 수 있습니다. 실제 이미지 9개 변환 조합, 투명도·해상도·다운로드, 오류 및 취소 처리, 기존 영상 및 AVI → MP4·GIF·MP3 변환 조합, 모바일 가로 넘침을 검사합니다.

영상 입력은 WORKERFS Blob 마운트로 필요한 부분씩 읽습니다. 원본 전체의 arrayBuffer/MEMFS 복사를 피하지만 결과 파일과 인코더 메모리는 별도로 필요하며 1.1GB 실파일의 모바일 성공을 보장하지 않습니다.

`node tests/large-video.mjs`는 짧은 AVI 뒤에 빈 영역을 덧붙인 1.1GiB 합성 파일로 선택 경계·경고·WORKERFS 읽기를 검사합니다. 고해상도 1.1GB 실영상의 메모리 부하를 재현하는 테스트는 아닙니다.

## 한국어·영어 지원

오른쪽 위 언어 메뉴에서 한국어/English를 선택합니다. 첫 홈페이지 방문은 브라우저의 첫 번째 선호 언어(한국어 이외는 영어)를 따릅니다. 선택은 `morfliq-language`에 저장하며, 저장소를 차단한 브라우저에서도 `lang` 쿼리로 수동 전환이 가능합니다. 명시적 `/en/` 및 가이드 링크는 자동으로 다른 언어로 이동하지 않습니다. 파일 선택 후 전환은 재선택 안내를 표시하고, 변환 중에는 언어 변경을 잠급니다.

공통 UI·변환 메시지 번역은 `src/locales/en.json`, 언어 처리 공용 함수는 `src/modules/i18n.js`, 영어 문서 본문은 `content/en/`에서 관리합니다. `scripts/localize.mjs`가 한국어 홈페이지와 공통 헤더/푸터를 바탕으로 `en/*.html`을 생성하므로 생성 파일을 직접 수정하지 마세요. `npm run dev`와 `npm run build`가 자동 생성합니다. 한국어 문구를 변경할 때 대응 번역 키도 갱신하세요.

언어별 canonical과 상호 hreflang, 12개 URL 사이트맵을 생성합니다. 영어 브라우저 통합 검사: `PRODUCTION_TEST=1 TEST_LOCALE=en-US TEST_URL=http://127.0.0.1:4173 node tests/browser.mjs`. 언어 선택·저장소 차단·모바일·변환 잠금 검사는 `TEST_URL=http://127.0.0.1:4173 node tests/language-browser.mjs`로 실행합니다. 해외 방문자 수는 이 변경으로 측정되지 않으며 분석 도구의 국가별 통계에서 별도로 확인해야 합니다.
