# Morfliq 검색 표현과 콘텐츠 관리

2026-09-23 적용. 아래 표현은 기능을 바탕으로 정한 목표 검색 의도이며, 검색량·경쟁도·순위가 검증된 키워드 목록은 아닙니다.

| 페이지 | 검색 의도 | 실제 제공 정보 |
| --- | --- | --- |
| `/` | 무료 이미지 변환기, 무료 영상 변환기, 서버 업로드 없는 변환기 | 같은 창에서 이미지·비디오 자동 구분, 지원 포맷과 한계, 변환 UI |
| `/guide#image` | WebP JPG 변환, PNG WebP 변환 | 출력 포맷 선택, 투명도, 해상도, 다운로드 방법 |
| `/guide#mp4` | AVI MP4 변환, WebM MP4 변환 | H.264/AAC 출력과 원본 코덱에 따른 제한 |
| `/guide#gif`, `/guide#mp3` | MP4 GIF 만들기, MP4 MP3 추출 | 시작 부분 GIF와 소리 추출 설정 |
| `/guide#local-processing` | 서버에 저장하지 않는 이미지 변환기 | 로컬 처리와 내 기기에 결과를 저장하는 방법의 차이 |
| `/about` | Morfliq 로컬 변환기 | 브랜드·운영자·기능·처리 방식 |

브랜드와 기능을 결합해 사용할 수 있는 표현: Morfliq 로컬 변환기, Morfliq 이미지 변환, Morfliq AVI MP4 변환. 독점성이나 검색 순위를 보장하는 표현은 아닙니다. 영어 홈페이지에는 Free Image & Video Converter, No Uploads를 반영하고 영어 가이드에도 실제 변환 사례를 설명합니다.

`저장 안 되는 변환기`는 다운로드 오류와 혼동되므로 `서버에 업로드·보관하지 않는 변환기`로 설명합니다. 브라우저와 사용자 기기에서 처리·저장되는 사실을 숨기지 않습니다. 메타 keywords, 숨김 키워드, 가짜 리뷰·평점, 검색어만 바꾼 복제 페이지는 추가하지 않습니다.

기존 URL과 사이트맵의 12개 canonical을 유지합니다. 홈페이지 제목·본문 변경은 `src/locales/en.json`의 대응 번역도 갱신해야 합니다. 영어 문서는 `content/en/`, 문서 제목은 `scripts/localize.mjs`에서 관리합니다.

## 확인한 현재 상태

Search Console에서 확인한 보고서는 총 노출 0, 클릭 0, 검색어 데이터 없음이었습니다. 이는 보고서 지연을 포함할 수 있으며 현재 모든 검색 결과를 직접 조사한 결과는 아닙니다. 사이트맵 UI의 `가져올 수 없음`은 여전히 남아 있습니다. 실제 `https://morfliq.win/sitemap.xml` 응답은 HTTP 200, application/xml이며 12개 URL을 포함합니다. Google의 실제 수집 성공까지 확인한 것은 아닙니다.

이후에는 Search Console 실적에서 검색어·페이지별 노출과 클릭을 이전 기간과 비교하고, URL 검사에서 색인 상태와 Google 선택 canonical을 확인합니다. 새로운 문구의 효과를 확인하기 전에 사이트맵 제출을 반복하거나 제목을 계속 바꾸지 않습니다.

근거: [Google 검색 기본 가이드](https://developers.google.com/search/docs/essentials), [제목 링크 권장사항](https://developers.google.com/search/docs/appearance/title-link), [스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies).
