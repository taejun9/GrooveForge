# plan-1523-user-guide-portfolio

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

앱을 실제로 실행하고 사용법을 자세히 설명하는 스크린샷 포함 PDF와 프로젝트 포트폴리오를 만든다.

## Goal

현재 GrooveForge 제품을 로컬에서 직접 실행하고 주요 작업 흐름을 실제 UI로 검증한 뒤, 합성 시작 프로젝트만 사용한 한국어 실사용 설명서 PDF와 제품·기술·품질 근거를 정리한 한국어 프로젝트 포트폴리오 PDF를 재현 가능하게 생성한다.

## Non-Goals

- 앱 기능, 프로젝트 schema, 오디오 엔진 또는 배포 동작을 변경하지 않는다.
- 실제 사용자 프로젝트, 음원, 개인 경로, 계정, 자격 증명 또는 외부 서비스를 문서에 포함하지 않는다.
- 실제 SoundCloud 업로드, 외부 배포, Developer ID 서명, notarization 또는 배포 완료를 주장하지 않는다.
- 아직 구현되지 않은 roadmap 기능을 현재 기능처럼 소개하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 제품 구조: `docs/architecture/product-architecture.md`
- 공개 제품 설명: `README.md`, `readme-en.md`
- 개인정보 원칙: `docs/privacy/principles.md`
- 품질 규칙: `docs/quality/rules.md`
- 앱 UI: `src/ui/App.tsx`, `src/ui/workstation*`
- 도메인과 오디오: `src/domain/workstation.ts`, `src/audio/`
- 앱 실행과 검증: `package.json`, `harness/scripts/run_desktop_launch_smoke.mjs`

## Constraints

- 저장소 작업은 `codex/plan-1523-user-guide-portfolio`와 `.worktree/plan-1523-user-guide-portfolio`에서 수행한다.
- QA와 review를 분리하고 review는 QA 완료 뒤 시작한다.
- scope나 접근이 달라질 때 Decision Log를 갱신한다.
- PDF는 `output/pdf/`에 두고, 중간 렌더는 `tmp/pdfs/`에서 관리한다.
- 실제 앱 화면을 사용하되 합성 시작 데이터만 노출하고 개인정보·로컬 민감 경로를 화면에서 제외한다.
- 최종 PDF를 PNG로 다시 렌더해 한글 글꼴, 이미지 선명도, 줄바꿈, 페이지 번호, 잘림과 겹침을 시각 검수한다.

## Implementation Plan

- [x] 앱 실행 방법과 현재 기능 근거를 코드·문서·테스트에서 교차 확인한다.
- [x] 개발 앱을 실행하고 Guided 첫 비트부터 작곡, 편곡, 믹싱, 전달까지 주요 화면을 직접 조작·검증해 스크린샷을 수집한다.
- [x] 스크린샷과 단계별 설명을 포함한 한국어 실사용 설명서 PDF를 만든다.
- [x] 제품 비전, 사용자 문제, 핵심 기능, UX 흐름, 기술 구조, 품질·프라이버시, 현재 한계와 로드맵을 담은 한국어 프로젝트 포트폴리오 PDF를 만든다.
- [x] PDF 텍스트·페이지·이미지 및 시각 렌더를 검수하고 발견한 문제를 수정한다.
- [x] QA 뒤 독립 리뷰를 수행하고 계획을 완료 위치로 이동한 뒤 review mirror를 만든다.

## QA Plan

- `git diff --check`
- `npm run qa`
- `npm run typecheck`
- `npm run build`
- `npm run renderer:smoke`
- 브라우저에서 실제 개발 앱의 주요 사용자 흐름과 콘솔 오류 확인
- `pdfinfo`로 페이지 수·용지·메타데이터 확인
- `pdftotext`/`pypdf`로 필수 제목·절차·페이지 번호·이미지 수 확인
- `pdftoppm`으로 모든 페이지를 PNG로 렌더하고 접촉 시트 및 대표 원본 페이지 시각 검수

## Review Plan

QA 완료 뒤 review_judge가 실제 UI와 설명 일치, 미구현 기능 과장 여부, 스크린샷 개인정보 노출, 한글 가독성, 페이지 구성, 기술 근거와 잔여 위험을 독립 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-08-05 | 설명서와 포트폴리오를 각각 독립된 한국어 PDF로 제공한다. | 실사용 절차와 프로젝트 소개의 독자·목적·정보 구조가 달라 분리하는 편이 탐색성과 재사용성이 높다. |
| 2026-08-05 | 개발 웹 앱의 합성 starter 데이터를 실제 조작해 화면을 수집한다. | 현재 UI를 정확히 보여 주면서 사용자 프로젝트나 외부 계정 없이 개인정보 경계를 지킬 수 있다. |
| 2026-08-05 | 문서 생성기를 저장소에 남기고 PDF를 `output/pdf/`에 생성한다. | 콘텐츠와 레이아웃을 반복 검증하고 향후 앱 변화에 맞춰 문서를 재생성할 수 있게 하기 위해서다. |
| 2026-08-05 | 실제 Electron 실행은 데스크톱 진입 검증에 사용하고, 단계별 조작과 캡처는 별도 IPv6 loopback 세션에서 수행한다. | 실제 앱 진입을 증명하면서 기존 사용자의 복구 초안과 localStorage를 변경하지 않기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-08-05 | project_lead | 깨끗한 main과 활성 계획 없음, 최신 완료 계획 1522를 확인하고 전용 branch/worktree를 열었다. |
| 2026-08-05 | plan_keeper | 실사용 화면 수집, 두 PDF 생성, 시각 QA와 독립 리뷰 범위를 등록했다. |
| 2026-08-05 | repo_cartographer | 제품·아키텍처·품질·프라이버시 문서와 구현·smoke 근거를 교차 확인했다. |
| 2026-08-05 | privacy_guard | Electron 복구 알림은 `Not now`로 보존하고, 합성 starter만 사용하는 격리 캡처 세션에서 개인정보 없는 화면 9장을 수집했다. |
| 2026-08-05 | harness_builder | ReportLab 기반 재현 가능 생성기로 한국어 실사용 설명서 19쪽과 프로젝트 포트폴리오 15쪽을 만들었다. |
| 2026-08-05 | quality_runner | 실제 Electron/브라우저 흐름, 콘솔 0건, PDF 구조 검사, 34쪽 전체 렌더 시각 검사, QA·typecheck·build·renderer/workflow/persona smoke를 통과했다. |
| 2026-08-05 | review_judge | 34쪽 전체와 구현 근거·개인정보 경계를 독립 검토해 blocking finding 없음을 확인했다. 생성 환경 이식성 P3만 잔여 위험으로 기록했다. |
| 2026-08-05 | doc_gardener | active plan을 completed로 이동하고 동일 범위의 review mirror를 만들었다. |

## Completion Notes

한국어 실사용 설명서 `output/pdf/grooveforge-user-guide-ko.pdf`와 프로젝트 포트폴리오 `output/pdf/grooveforge-project-portfolio-ko.pdf`를 완성했다. 실제 Electron 프로덕션 UI 진입을 확인하고, 사용자 복구 데이터를 건드리지 않는 격리 loopback 세션에서 Guided starter의 작곡·편곡·믹스·마스터·전달 흐름을 조작해 9개 화면을 수집했다.

PDF는 A4, 내장 한글 글꼴, 페이지 번호, 메타데이터, 북마크와 스크린샷을 포함한다. `pdfinfo`와 `pypdf` 구조 검사, 34쪽 전체 PNG 렌더 시각 검사, 개인정보 문자열 검사, `npm run qa`, `npm run typecheck`, `npm run build`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`를 통과했다. 브라우저 콘솔 error/warning은 0건이었다.

독립 리뷰에서 P0/P1/P2 및 blocking finding은 없었다. 잔여 P3는 생성기가 현재 macOS의 Arial Unicode 글꼴과 별도 Pillow/ReportLab 런타임에 의존해 다른 개발기·CI 재현을 위해 의존성·실행 명령·글꼴 fallback 문서화가 필요하다는 점이다. 향후 UI가 바뀌면 정적 스크린샷과 버전 정보도 함께 갱신해야 한다.
