# plan-1530-tabbed-localization

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge

## User Request

화면을 메인 탭과 서브 탭으로 분류하고, UI/UX를 사용자 친화적으로 개선하며, 설정에서 영어/한국어를 선택할 수 있는 다국어 처리를 구현한다.

## Goal

기존 `Compose`, `Arrange`, `Mix`, `Deliver` 작업 흐름을 명확한 메인 탭으로 유지하면서 현재 화면이 메인/서브 탭 중 어디인지 한눈에 알 수 있게 한다. 자주 쓰는 기능과 설명의 시각적 위계를 단순화하고, 로컬 설정에서 한국어와 영어를 즉시 전환하며 다음 실행에도 선택을 유지할 수 있는 접근 가능한 언어 설정을 제공한다.

## Non-Goals

- 프로젝트 데이터 스키마, 오디오 엔진, 렌더/내보내기 포맷을 변경하지 않는다.
- 샘플 탐색이나 샘플링을 첫 화면 또는 제품 중심으로 올리지 않는다.
- 클라우드 동기화, 계정, 원격 번역 API, 분석, 광고, 결제를 추가하지 않는다.
- 번역 선택을 `.grooveforge` 프로젝트 데이터에 저장하지 않는다.
- 외부 배포나 호스팅을 수행하지 않는다.

## Context Map

- 앱 셸과 화면 상태: `src/ui/App.tsx`
- 메인 탭: `src/ui/workstationGuidancePanels.tsx`
- 서브 탭: `src/ui/WorkspacePageTabs.tsx`
- 화면 스타일: `src/styles.css`
- UI 문자열과 설정 기반: `src/ui/localization.tsx`, `src/ui/SettingsDialog.tsx`
- 렌더러/워크플로 스모크: `harness/scripts/run_renderer_smoke.mjs`, `harness/scripts/run_workflow_smoke.mjs`
- 품질 계약: `docs/quality/rules.md`

## Constraints

- QA and review are separate loops; review starts only after QA completes.
- Do not implement, commit, or push directly on `main`.
- Use `codex/plan-1530-tabbed-localization` and `.worktree/plan-1530-tabbed-localization`.
- Scope or approach changes must be recorded in the Decision Log.
- 탭 전환과 언어 선택은 프로젝트 Undo/Redo 기록을 만들지 않는 UI 로컬 상태여야 한다.
- 언어 설정은 기기 로컬에만 저장하며 읽기 실패나 손상된 값에는 안전하게 영어로 복구한다.
- 탭은 키보드 Arrow/Home/End, roving tab stop, `tab`/`tabpanel` 연결을 유지한다.
- 기존 `data-testid`, 기능 ID, 내보내기 포맷, 프로젝트 상태 문자열 계약은 가능한 한 보존한다.

## Implementation Plan

- [x] 현재 메인/서브 탭, 상단 작업 도구, 설정 진입점, 번역 범위를 감사한다.
- [x] 중앙 번역 카탈로그와 로컬 언어 설정 저장소를 추가한다.
- [x] 접근 가능한 설정 대화상자에서 한국어/영어를 즉시 선택하도록 한다.
- [x] 메인 탭과 서브 탭의 레이블·설명·현재 위치 위계를 일관되게 재구성한다.
- [x] 첫 화면과 공용 작업 셸의 핵심 조작 문구를 두 언어로 제공한다.
- [x] 좁은 화면, 키보드, 포커스 복귀, 긴 한국어 문구를 포함한 반응형 스타일을 다듬는다.
- [x] 언어 지속성·손상 복구·탭 접근성·기존 제작 흐름 회귀 스모크를 추가한다.
- [x] QA 통과 후 별도 리뷰를 실행하고 발견 사항을 보완한다.

## QA Plan

- 정적/타입/빌드: `npm run qa`, `npm run typecheck`, `npm run build`.
- 렌더러/워크플로: `npm run renderer:smoke`, `npm run workflow:smoke`와 새 로컬라이제이션 스모크.
- 화면 계약: 메인/서브 탭 포인터 및 Arrow/Home/End 이동, 한 패널만 표시, 설정 열기/닫기/포커스 복귀, 한국어/영어 즉시 반영, 새로고침 후 유지, 손상 값 영어 복구를 검증한다.
- 반응형: 1440px, 1180px, 390px에서 상단 도구·탭·설정 문구의 가로 오버플로가 없는지 확인한다.

## Review Plan

QA 완료 후 별도 리뷰에서 제품 불변 조건, 메인/서브 정보 구조, ARIA/키보드, 언어 지속성, 번역 누락, 한국어 레이아웃, 기존 테스트 계약 회귀를 점검했고 P0/P1/P2가 없음을 확인했다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-09-01 | 기존 탭 구현을 대체하지 않고 `plan-1530`에서 위계와 설정 기반 다국어를 확장한다. | `plan-1524`와 `plan-1528`의 검증된 탭·상태 보존 계약을 유지하기 위해서다. |
| 2026-09-01 | 언어는 프로젝트가 아니라 브라우저/Electron 로컬 환경설정으로 저장한다. | 같은 프로젝트를 열어도 사용자 기기 설정을 따르고 음악 데이터 및 Undo 의미를 바꾸지 않기 위해서다. |
| 2026-09-01 | 외부 호스팅은 수행하지 않는다. | GrooveForge의 local-first 데스크톱 제품 경계와 사용자의 UI 변경 범위를 지키기 위해서다. |
| 2026-09-01 | 메인 탭은 네 제작 단계를 유지하고 Compose·Arrange·Mix에 작업별 서브 탭을 둔다. | 검증된 제품 흐름을 보존하면서 길었던 Arrange 화면을 Timeline과 Structure로 분리하고 탭 위계를 명확히 하기 위해서다. |
| 2026-09-01 | Settings는 다섯 번째 제작 탭이 아니라 헤더의 독립 모달로 둔다. | 언어 환경설정이 음악 제작 단계처럼 오해되거나 프로젝트 상태에 섞이지 않게 하기 위해서다. |
| 2026-09-01 | 1차 번역 범위는 설정, 첫 실행, 공용 셸, 메인/서브 탭, 핵심 Compose/Mix/Deliver 제목, 스타일 확인으로 고정한다. | 안정적인 기능 ID·Quick Action 결과·음악 도메인 문자열을 번역 상태와 분리하면서 사용자가 매일 만나는 탐색 표면을 우선 완성하기 위해서다. |
| 2026-09-01 | 독립 리뷰에서 확인한 Workflow Navigator, Guide, transport, playback, mixer, handoff 등 상시 노출 표면까지 EN/KO 번역 범위를 확장한다. | 언어를 한국어로 바꾼 직후 핵심 작업 화면에 영어 상태 문구가 남으면 설정의 사용자 기대와 어긋나므로 같은 등급의 보이는 누락을 한 번에 닫기 위해서다. 기능 ID, `data-testid`, 프로젝트 데이터, 사용자 입력은 번역하지 않는다. |
| 2026-09-01 | renderer는 `en` 또는 `ko`만 요청하고 preload와 main이 허용 목록을 다시 확인한 뒤 네이티브 메뉴·파일 대화상자·미저장 종료 문구를 직접 만든다. | 신뢰 경계를 넘어온 임의 문자열을 네이티브 UI에 반영하지 않으면서 renderer와 Electron chrome의 언어를 동기화하기 위해서다. |
| 2026-09-01 | `grooveforge.ui.locale.v1`의 손상 값은 영어로 복구하고 저장소 쓰기 실패 시 현재 세션에만 언어를 적용하며 Settings에 경고한다. | 저장소가 차단돼도 즉시 전환은 유지하되, 다음 실행까지 저장됐다고 오해시키지 않기 위해서다. |
| 2026-09-01 | 실제 클릭 포커스 증명은 명시적인 click→Arrow/Home/End 탭 순회에만 적용하고 일반 route 활성화와 분리한다. | route가 편집 컨트롤로 포커스를 의도적으로 옮기는 정상 동작을 실패로 오판하지 않으면서 탭 자체의 네이티브 키보드 연속성은 엄격히 증명하기 위해서다. |
| 2026-09-01 | Settings 배경 클릭은 닫기 전에 pointer 기본 동작을 막고 opener 포커스를 복구한다. | focus-trap cleanup이 돌려준 포커스를 같은 mousedown의 기본 동작이 다시 `body`로 빼앗는 실제 Electron 결함을 막기 위해서다. |
| 2026-09-01 | 정적 QA는 이전 영어 리터럴 대신 번역 호출과 현재 소유 모듈을 검증한다. | 현지화 뒤에도 QA가 낡은 복사본을 요구하지 않고 App, helper, panel, native dialog 사이의 실제 번역 경계를 잠그기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-09-01 | project_lead | 기존 탭 계획과 현재 main 상태를 감사하고 전용 브랜치·작업트리에서 계획을 시작했다. |
| 2026-09-01 | repo_cartographer | 기존 4개 메인 탭과 Compose/Mix 서브 탭, 긴 Arrange 페이지, 설정·i18n 공백, 접근성·반응형 위험을 매핑했다. |
| 2026-09-01 | harness_builder | 타입 안전 번역 카탈로그, 기기 로컬 언어 설정, Settings 모달, 한국어/영어 공용 셸, Arrange 서브 탭, skip link, 모드 선택 ARIA, focus 복귀, reduced-motion/forced-colors 처리를 구현했다. |
| 2026-09-01 | quality_runner | 타입 검사와 English/Korean SSR·저장소·탭 ARIA를 포함한 renderer smoke 첫 패스를 통과했다. |
| 2026-09-01 | harness_builder | Electron 네이티브 메뉴와 Save/Open/미저장 종료 대화상자를 EN/KO로 동기화하고 preload/main 양쪽에서 로케일 허용 목록을 검증하도록 했다. `$`가 들어간 보간값, localStorage 쓰기 실패, 손상 값 복구도 순수 helper와 SSR/runtime 스모크로 고정했다. |
| 2026-09-01 | harness_builder | Compose 3개, Arrange 2개, Mix 2개 서브 탭을 전체 폭 상호 배타 패널로 완성하고 Mute Map이 Timeline에서 Structure 도구를 여는 실제 route, Quick Actions 스크롤·native hit-test, 숨은 패널 mutation 방지 계약을 보강했다. |
| 2026-09-01 | quality_runner | 실제 Electron의 첫 재실행에서 탭·Mute Map·중첩 route는 통과했지만 일반 route까지 탭 포커스를 요구한 QA assertion이 과도함을 확인했다. 실제 click→keyboard 구간만 fail-close로 남기고 일반 route 포커스 이전은 허용하도록 검사 범위를 교정했다. |
| 2026-09-01 | review_judge | Settings 중 Space/Undo 검사가 라디오 입력 보호만으로 통과할 수 있는 false-positive를 발견했다. 비편집 `settings-dialog`에 직접 포커스한 뒤 keyboard Space/Undo와 native-menu Play/Undo 전후의 재생·프로젝트 SHA·정확한 history posture를 비교하도록 actual evidence를 강화했다. |
| 2026-09-01 | quality_runner | 최종 actual Electron smoke에서 1440×928, 최소 1180 폭, 390px 한국어 화면을 검증했다. 메인/서브 탭 pointer·Arrow/Home/End, route/state 복귀, Mute Map cold route, Settings EN↔KO↔EN, 네이티브 메뉴, 저장 지속성·손상 복구·세션 경고, backdrop 포커스 복귀, 모달 입력 가드가 모두 통과했다. |
| 2026-09-01 | quality_runner | `npm run qa`, `npm run typecheck`, `npm run build`, renderer/workflow/persona/harness/desktop/launch/quick-actions smoke, 한국어 주석 검사, `git diff --check`, 전체 quality gate를 통과했다. |
| 2026-09-01 | review_judge | QA 이후 독립 코드·접근성·번역 리뷰에서 P0 0 / P1 0 / P2 0, actionable finding 0을 확인했다. |
| 2026-09-01 | plan_keeper | 계획을 완료로 전환하고 `docs/reviews/plan-1530-tabbed-localization-review.md` 리뷰 미러를 만들었다. |

## Completion Notes

- Compose, Arrange, Mix, Deliver를 메인 탭으로 유지하고 Compose 3개, Arrange 2개, Mix 2개 서브 탭을 상호 배타적인 전체 폭 작업 페이지로 완성했다.
- Settings에서 영어/한국어를 즉시 전환하며 선택은 `grooveforge.ui.locale.v1`에 기기 로컬로 유지된다. 저장소 차단·손상 값은 명시적인 세션 경고 또는 영어 복구로 처리한다.
- 공용 셸, 제작/편곡/믹스/전달의 상시 노출 표면, Electron 네이티브 메뉴와 Save/Open/미저장 종료 대화상자를 EN/KO로 동기화했다.
- 키보드 탭 순회, skip link, focus trap/복귀, 긴 한국어 문구, 1180/390 반응형, reduced motion/forced colors, 숨은 패널 mutation 방지를 검증했다.
- 최종 독립 리뷰는 P0 0 / P1 0 / P2 0이며 열린 actionable finding은 없다. 지원 언어는 현재 영어와 한국어로 한정되고, 번역 자동 검증은 전문 번역가의 문맥 검수를 대체하지 않는다.
