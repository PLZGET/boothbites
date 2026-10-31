# 랜딩 C 한글 서체

공식 Google Fonts CSS API와 `fonts.gstatic.com`에서 받은 WOFF2 서브셋을 자체 호스팅한다. 취득일 2026-10-31, SIL Open Font License 1.1.

| CSS 이름 | 서체·굵기 | 로컬 파일 | 라이선스 |
| --- | --- | --- | --- |
| `Booth Print` | Noto Serif KR 700–900 | `/fonts/noto-serif-kr-landing.woff2` | `/fonts/OFL-NotoSerifKR.txt` |
| `Booth Korean` | Noto Sans KR 400–900 | `/fonts/noto-sans-kr-landing.woff2` | `/fonts/OFL-NotoSansKR.txt` |

명조는 제목·워드마크·음식명, 고딕은 기본 본문에 쓴다. 두 선언 모두 `font-style: normal`, `font-display: swap`이다. 기존 Manrope는 픽업 번호와 영문 상태 문구에 명시적으로 적용한다. 서브셋은 현재 랜딩과 공유 푸터 문구 기준이므로 문구 추가 시 포함 글자를 확인한다. 이 CSS 이름과 적용 범위는 랜딩 전용이다.

- [Noto Serif KR 공식 소개](https://fonts.google.com/noto/specimen/Noto+Serif+KR), [OFL 원문](https://github.com/google/fonts/blob/main/ofl/notoserifkr/OFL.txt)
- [Noto Sans KR 공식 소개](https://fonts.google.com/noto/specimen/Noto+Sans+KR), [OFL 원문](https://github.com/google/fonts/blob/main/ofl/notosanskr/OFL.txt)

폰트 파일의 HTTP 제공은 확인했다. 브라우저의 실제 로딩·폴백·줄바꿈은 시각 검증하지 않았다.
