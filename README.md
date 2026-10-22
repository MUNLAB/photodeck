# PhotoDeck

사진을 한꺼번에 올리면 지정한 레이아웃에 맞춰 PowerPoint 슬라이드를 생성하는 브라우저 도구입니다.

서비스: https://photodeck-layout-studio.zippywand9.chatgpt.site/

## 기능

- 페이지당 1·2·3·4·6장 사진 자동 배치 및 자유 레이아웃
- 텍스트, 사각형, 원, 직선, 화살표 편집
- 모든 페이지에 반복되는 고정 이미지(로고 등)
- 위치, 크기, 회전, 정렬, 겹침 순서 및 실행 취소
- 복사한 이미지·스크린샷 붙여넣기 (Ctrl+V / ⌘V, 이미지 데이터가 클립보드에 있는 경우)
- 사진 순서 변경, 미리보기, 편집 가능한 PPTX 다운로드
- 레이아웃 JSON 저장 및 불러오기(고정 이미지 포함)

사진은 브라우저에서 처리합니다. 자동 배치할 사진 목록은 새로고침하면 초기화됩니다.

## 로컬 실행

설치나 빌드 없이 실행할 수 있습니다. Python 3가 설치된 환경에서:

```sh
python3 -m http.server 8080 --directory dist
```

브라우저에서 http://localhost:8080 을 여세요.

## 파일 구조

- `dist/index.html`: 편집 화면
- `dist/style.css`: 스타일
- `dist/app.js`: 레이아웃, 사진 처리, PPT 생성
- `dist/vendor/pptxgen.bundle.js`: PptxGenJS 3.12.0 번들
- `.openai/hosting.json`: 기존 Sites 배포 설정

## 배포와 코드 관리

이 저장소는 PhotoDeck 소스를 관리합니다. 현재 운영 사이트는 ChatGPT Sites에 배포되어 있습니다.
GitHub 커밋만으로 운영 사이트가 자동 배포되지는 않습니다. 변경 시 GitHub 소스와 Sites 배포를 함께 반영해야 합니다.

사진이나 개인 레이아웃 파일은 이 저장소에 올릴 필요가 없습니다.

## 외부 라이브러리

[PptxGenJS](https://github.com/gitbrent/PptxGenJS) (MIT)를 사용합니다. 번들에 포함된 외부 라이브러리의 라이선스는 각 원저작자의 조건을 따릅니다.
