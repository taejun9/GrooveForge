# plan-1524-functional-tabs-ui-qa

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

사용할 때 UI/UX가 더 편하도록 기능별로 탭을 나누고, 모든 버그 테스트를 실제 화면으로 진행한다.

## Goal

GrooveForge의 주요 작업 기능을 한눈에 이해할 수 있는 키보드 접근 가능한 탭으로 재구성하고, 기존 제작 상태와 작업 흐름을 보존한 채 실제 렌더러 및 Electron 화면에서 기능·접근성·반응형·회귀 동작을 검증한다.

## Non-Goals

- 프로젝트 데이터 스키마, 오디오 엔진, 렌더/내보내기 포맷을 변경하지 않는다.
- 샘플 브라우징이나 샘플링을 첫 화면 또는 MVP 중심으로 올리지 않는다.
- 클라우드, 계정, 원격 분석, 결제 기능을 추가하지 않는다.
- 외부 배포 자격 증명이나 실제 배포 채널 검증을 이번 UI 범위에 포함하지 않는다.

## Context Map

- 앱 셸과 작업 상태: `src/ui/App.tsx`
- 기능별 패널: `src/ui/workstationComposePanels.tsx`, `src/ui/workstationMixPanels.tsx`, `src/ui/workstationShellPanels.tsx`, `src/ui/workstationGuidancePanels.tsx`
- 시각·반응형 규칙: `src/styles.css`
- 렌더러/워크플로/데스크톱 화면 스모크: `harness/scripts/`
- 품질 계약: `docs/quality/rules.md`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1524-functional-tabs-ui-qa` and `.worktree/plan-1524-functional-tabs-ui-qa` for git repository work.
- 탭 전환은 프로젝트 데이터를 바꾸거나 Undo 기록을 만들지 않는 UI 로컬 상태여야 한다.
- 첫 진입은 직접 비트 작곡 흐름을 우선한다.
- 숨겨진 탭의 상태와 편집 내용은 유지되어야 한다.

## Implementation Plan

- [x] 현재 화면 구조와 기존 내비게이션/포커스/단축키 계약을 감사한다.
- [x] 기능 그룹과 탭 정보 구조를 확정하고 계획 Decision Log에 기록한다.
- [x] 탭 선택·키보드 이동·패널 연결을 기존 Workflow Navigator에 추가한다.
- [x] 앱 셸을 기능별 탭과 단일 활성 작업면으로 재구성한다.
- [x] 탭 상태, 포커스, 모바일/좁은 화면, 숨김 패널 렌더링을 다듬는다.
- [x] 화면 기반 탭 회귀 스모크와 증거 캡처 경로를 추가한다.
- [x] 실제 화면에서 발견한 모바일 Style 필드 오버플로와 숨은 Compose 단축키 버그를 수정한다.
- [x] 사용자 문서와 품질 규칙의 화면 검증 기록을 갱신한다.

## QA Plan

- 정적/도메인: `npm run qa`, `npm run typecheck`, `npm run build`.
- 렌더러: `npm run renderer:smoke`, `npm run workflow:smoke`, 새 탭 화면 스모크.
- 실제 브라우저 화면: 각 탭 클릭, Arrow/Home/End 키보드 이동, 포커스, 상태 보존, 좁은 화면, 콘솔 오류, 주요 작곡→편곡→믹스→마스터→전달 경로를 직접 조작하고 스크린샷을 남긴다.
- 실제 Electron 화면: 개발/패키지 앱에서 탭과 핵심 제작 경로를 조작하고 기존 데스크톱 launch/project I/O/close-flow smoke를 실행한다.
- 전체 회귀: 저장소 품질 게이트 중 로컬에서 재현 가능한 전체 제품 검증을 실행하고, 외부 비밀값·배포 자격 증명 의존 항목은 범위와 결과를 명시한다.

## Review Plan

QA completes before review starts. Review checks product invariants, keyboard/ARIA semantics, state preservation, responsive behavior, test evidence, and unrelated regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-08-11 | `plan-1524` 전용 브랜치와 작업트리에서 진행한다. | 저장소 작업 흐름과 `main` 보호 규칙을 따른다. |
| 2026-08-11 | 탭 전환은 UI 로컬 상태로 유지한다. | 음악 프로젝트 데이터와 Undo/Redo 의미를 바꾸지 않기 위해서다. |
| 2026-08-11 | QA는 자동 스모크와 실제 렌더 화면 조작을 함께 사용한다. | 화면 배치·포커스·상태 보존은 소스 검사만으로 충분히 검증할 수 없다. |
| 2026-08-11 | 탭은 `Compose`, `Arrange`, `Mix`, `Deliver` 네 개로 구성하고 Master는 Mix에 둔다. | 기존 `WorkflowZoneId`, Quick Actions, Guide 이동 계약과 일치하며 Chords와 Sound Design을 억지로 분리하지 않는다. |
| 2026-08-11 | 기존 Workflow Navigator 카드를 tablist로 승격한다. | 중복 내비게이션 없이 기능 상태와 탭 이동을 한 표면에서 제공한다. |
| 2026-08-11 | 비활성 패널은 마운트를 유지한 채 `hidden` 처리하고 모든 이동을 중앙 reveal 경로로 보낸다. | 자식 편집 상태를 보존하면서 숨은 탭으로의 Quick Actions/가이드 포커스 실패를 막는다. |
| 2026-08-11 | Compose 밖에서는 패턴 숫자 단축키, Delete, 키보드/MIDI 캡처를 일시 중지한다. | 보이지 않는 음악 이벤트가 우발적으로 바뀌지 않도록 한다. |
| 2026-08-12 | Vite가 허용하는 PostCSS 8.5.26과 Nano ID 3.3.18 패치 버전으로 잠금 파일을 갱신한다. | 전체 검사 중 발견한 고위험 의존성 권고 2건을 해소하고 `npm audit`을 0건으로 만들기 위해서다. |
| 2026-08-12 | 데스크톱 Deliver 탭의 Handoff 요약 열을 250px로 넓힌다. | 1180px 실제 Electron 캡처에서 150px 요약 열의 파일·상태 문구가 과도하게 글자 단위로 줄바꿈되는 문제를 확인했다. |
| 2026-08-12 | 프로젝트 I/O 스모크는 표시 창과 PID별 비영속 Electron 세션을 사용하고 UI Open을 복구 브리지 검사보다 먼저 수행한다. | 실제 사용자 복구 초안이 패키지 스모크에 유입되어 보이지 않는 교체 확인창이 부모 타임아웃까지 렌더러를 막는 결함을 화면에서 확인했다. |
| 2026-08-12 | 프로젝트 I/O의 저장·열기·화면 반영·복구 단계를 개별 타임아웃으로 나누고 앱 watchdog을 모든 부모 harness보다 짧게 둔다. | 긴 단일 `executeJavaScript`와 역전된 timeout이 실제 정지 지점과 구조화된 실패를 가리지 않게 한다. |
| 2026-08-12 | 독립 리뷰에서 찾은 숨은 포커스, Finish Checklist reveal, MIDI 전환, 네이티브 Delete, 프로젝트 Open 증거 결함을 릴리스 전 보완한다. | 탭이 화면만 나누고 숨은 편집·포커스·가짜 DOM 클릭을 남기면 실제 사용 안전성과 화면 QA 요구를 충족하지 못한다. |
| 2026-08-12 | 기능 탭 화면 collector 제한을 480초로 늘리고 실제 Electron 메뉴 콜백과 Quick Actions 화면을 검증한다. | 네 탭 PNG, 닫힌 Guide/Review Queue, 탭 밖 Transport, Finish Checklist, 키별 숨은 Compose 가드까지 포함한 네이티브 화면 경로가 기존 제한을 넘었으며, 480초는 전역 30분 watchdog 안에서 구조화된 회귀 증거를 보존한다. |
| 2026-08-13 | 모든 `block: start` workspace reveal은 실제로 sticky인 Workflow Navigator의 하단을 동적으로 피한다. | 1180px에서 Finish Checklist와 Review Queue 제목이 고정 탭 아래 가려지는 문제를 실제 Electron 화면 계약이 발견했으며, breakpoint나 고정 scroll-margin보다 현재 navigator 높이를 쓰는 중앙 보정이 포괄적이다. |
| 2026-08-13 | 숨은 Compose 가드는 `1`, `2`, `3`, `Delete`, `A` 각 키 직후 Pattern과 project fingerprint를 비교하고, 탭 간 포커스는 viewport 교차까지 증명한다. | 여러 키의 잘못된 변경이 서로 상쇄되거나 화면 밖의 양수 rect가 보이는 포커스로 오인되는 테스트 허점을 막는다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-08-11 | project_lead | Plan created; repository, screen, and QA audits started. |
| 2026-08-11 | repo_cartographer | Mapped four established workflow zones and 153 ref-driven focus routes; recommended reusing Workflow Navigator. |
| 2026-08-11 | harness_builder | Implemented controlled ARIA tabs, persistent tabpanels, central reveal routing, and responsive layouts. |
| 2026-08-11 | quality_runner | Live browser checks passed at 1280 and 1180 widths; 390px revealed and then verified the fix for a 122px Style-field overflow. |
| 2026-08-12 | quality_runner | Fresh browser screen QA passed pointer and Arrow/Home/End traversal, one-panel visibility, Pattern Lab/Pattern B round-trip state, hidden Compose shortcut guards, producer-to-Mix/Review Queue routing, 1440/1180/390 zero document overflow, and zero error/warning logs; six PNGs plus SHA-256 receipts were saved under ignored `build/desktop/plan-1524-tab-screen-qa/browser/`. |
| 2026-08-12 | quality_runner | Workflow, persona, runtime, 16-style sample-audio, 54 genre-rotation artifacts including 16 WAV files, SQLite workspace, Quick Actions bundle, typecheck, production build, and desktop-entry checks passed. Dependency audit found then cleared two high-severity transitive advisories. |
| 2026-08-12 | quality_runner | Production Electron functional-tab smoke passed native pointer/Arrow/Home/End traversal, inactive focus and shortcut isolation, state roundtrip, 1180px overflow, and four per-tab capturePage PNG digests; the final Deliver capture confirmed readable Handoff summary wrapping. |
| 2026-08-12 | quality_runner | Source Electron project I/O passed all default, beginner, and producer save/open/SQLite recovery roundtrips in displayed isolated windows after fixing persistent-session draft leakage and opaque timeout staging. |
| 2026-08-12 | review_judge | Post-QA review found hidden-source focus retention, one uncoupled Finish Checklist route, same-tick MIDI exposure, native Delete menu bypass, shallow UI Open assertions, and configured evidence-directory deletion risk; every finding entered the follow-up implementation loop. |
| 2026-08-12 | harness_builder | Added ref-time Compose guards, visible cross-tab focus transfer, synchronized Finish Checklist reveal, actual Electron menu callbacks, live Quick Actions route evidence, native project Open pointer activation with rendered source fingerprints, and non-destructive screenshot writes. |
| 2026-08-13 | quality_runner | Final isolated production Electron launch smoke passed four ARIA tabs, native pointer/Arrow/Home/End traversal, per-key hidden Compose guards, 1180px sticky tabs and zero overflow, exact in-viewport focus for Finish Checklist, Review Queue, Beat Passport, and Transport routes, and four tab PNG captures. |
| 2026-08-13 | quality_runner | The same functional-tab screen contract passed in the portable packaged app, ad-hoc signed app, simulated installed app, and unsigned PKG-extracted app; source, packaged, simulated-installed, and PKG-payload project Open/Save roundtrips also passed in isolated displayed Electron windows. |
| 2026-08-13 | review_judge | Post-follow-up review found no remaining P0–P2 issues; its final documentation finding was resolved by aligning this plan with the 480-second collector and the latest actual-screen evidence. |

## Completion Notes

- `Compose`, `Arrange`, `Mix`, `Deliver` 네 개의 ARIA 탭으로 작업면을 나누고 Master는 Mix에 유지했다. 화살표·Home·End 키, roving tab stop, 탭/패널 연결, 비활성 패널의 상태 보존을 구현했다.
- 탭 밖의 편집 단축키·MIDI·Delete 가드, Quick Actions의 탭 전환·닫힌 Guide/Review Queue/Finish Checklist/Transport reveal, 포커스 이동, 1180px sticky 네비게이터 가림, 모바일 Style 필드 overflow, 프로젝트 Open 화면 증거·복구 세션 격리 문제를 실제 화면 회귀 검증으로 발견하고 수정했다.
- 인앱 브라우저에서 1440×960, 1180×760, 390×844를 포인터·키보드로 조작했고, 네 탭·상태 왕복·숨은 단축키·포커스·overflow·콘솔을 검증했다. fresh-load console error/warning은 0건이었고 SHA-256 영수증을 갖춘 PNG 6개와 구조화 JSON/Markdown 증거를 남겼다.
- 실제 Electron 자동화는 production source, portable packaged app, ad-hoc signed app, simulated installed app, unsigned PKG-extracted app에서 native pointer/keyboard 탭 순회, Quick Actions, 포커스·viewport·sticky clearance, 키별 숨은 Compose 가드, 네 탭 capturePage를 검증했다. source·packaged·simulated-installed·PKG-payload 프로젝트 Open/Save 회귀와 SQLite integrity/recovery clear도 표시된 Electron 창에서 통과했다.
- `npm run qa`, `npm run typecheck`, `npm run build`, renderer/workflow/persona/runtime, 오디오·SQLite·Quick Actions, desktop entry/crash/close, source/package/project-I/O 및 로컬 배포 보고서 검사가 통과했다. `npm run release:check`는 격리 복사본의 DMG 생성 시 디스크 여유 공간 부족으로 한 번 중단됐고, 테스트 전용 대용량 생성물만 정리한 뒤 나머지 로컬 검사를 개별로 재개해 통과했다. 따라서 해당 오케스트레이터의 단일 최종 0 exit은 주장하지 않는다.
- 독립 심사의 후속 루프 후 남은 P0–P2 finding은 없었고, 계획서의 collector 시간 표기를 코드와 같은 480초로 맞춘 문서 finding도 해소했다.
- 실제 `/Applications` 설치, Developer ID 서명, Apple notarization, Gatekeeper 승인, 자동 업데이트 피드 게시, 외부 업로드/배포는 자격 증명·비밀값·외부 채널이 필요하므로 실행하거나 완료로 주장하지 않는다.
