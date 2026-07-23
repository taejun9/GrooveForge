# plan-1518-project-change-safety

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

사용성과 연관된 기능 또는 UI/UX를 팀 회의로 검토하고, 선정한 부분을 추가·수정한다.

## Goal

단순 설정이나 시작 버튼처럼 보이는 동작이 작성 중인 프로젝트를 예고 없이 크게 바꾸지 않도록 한다. Style 변경은 현재 비트에 미칠 범위를 먼저 보여 주고 명시적 Apply/Cancel 뒤에만 실행하며, Guided/Studio starter 전환은 unsaved changes 또는 local recovery draft가 있을 때 현재 프로젝트 유지 선택을 제공한다.

## Non-Goals

- Style generation 규칙, style profile, starter 음악 데이터, 프로젝트 schema를 변경하지 않는다.
- 새 온보딩 투어, 계정, 클라우드 동기화, 원격 AI, analytics, sample import를 추가하지 않는다.
- Key retarget, Beat Blueprint, arrangement, mixer, render/export 동작을 변경하지 않는다.
- Handoff Pack 포함 데이터 안내와 Guided 선택 노트 Essentials는 후속 후보로 남긴다.

## Context Map

- 회의 기록: `docs/meetings/2026-07-24-plan-1518-project-change-safety.md`
- 제품 원칙: `docs/product/product.md`
- 제품 구조: `docs/architecture/product-architecture.md`
- 앱 UI와 프로젝트 변경 흐름: `src/ui/App.tsx`
- 프로젝트 교체 보호: `src/ui/projectReplacementGuard.ts`
- modal focus trap: `src/ui/useModalFocusTrap.ts`
- style 및 starter 도메인: `src/domain/workstation.ts`
- renderer/desktop 검증: `harness/scripts/run_renderer_smoke.mjs`, `harness/scripts/run_desktop_launch_smoke.mjs`
- 품질 규칙: `docs/quality/rules.md`
- 개인정보 원칙: `docs/privacy/principles.md`

## Constraints

- QA와 review를 분리한다.
- scope나 접근이 달라지면 이 계획의 Decision Log를 갱신한다.
- `codex/plan-1518-project-change-safety`와 `.worktree/plan-1518-project-change-safety`에서 저장소 작업을 수행한다.
- Style preview를 열거나 취소할 때 project, undo/redo, draft, selection, playback, render/export state가 바뀌지 않아야 한다.
- Style Apply는 기존 `updateProject` history 경로를 정확히 한 번 사용하고 즉시 Undo 가능해야 한다.
- Starter 보호 취소는 현재 project, undo/redo, selection, playback, recovery state를 그대로 보존해야 한다.
- 첫 실행의 깨끗한 프로젝트에서는 starter를 추가 확인 없이 시작할 수 있어야 한다.
- modal은 Escape, focus trap, 명시적 Apply/Cancel, opener focus 복귀를 제공한다.
- 기존 첫 화면 높이, disclosure 수, Workflow Navigator, direct composition-first 흐름을 유지한다.

## Implementation Plan

- [x] Style 변경 preview model과 접근 가능한 confirmation dialog를 추가한다.
- [x] 상단 Style select, Style Inspector, Quick Actions가 동일한 preview/apply 경로를 사용하게 한다.
- [x] Style Apply/Cancel의 상태·history·focus 계약을 연결한다.
- [x] Starter 생성 전에 unsaved/recovery replacement guard를 적용하고 취소 결과를 명확히 알린다.
- [x] runtime, renderer, production Electron smoke에 변경 안전성 증거를 추가한다.
- [x] 관련 제품/품질 문서를 구현 계약과 맞춘다.

## QA Plan

- Style 선택만으로 project fingerprint, dirty state, undo/redo, playback가 바뀌지 않는지 확인한다.
- dialog가 현재/대상 style, BPM, swing, sound preset, Pattern A/B/C 재생성, Undo 가능성을 정확히 보여 주는지 확인한다.
- Apply가 정확히 한 edit만 만들고 selected Pattern A 및 selection reset을 유지하며 Undo가 원래 프로젝트를 복원하는지 확인한다.
- Cancel, Escape, overlay close가 아무 프로젝트 변경 없이 Style control로 focus를 돌려주는지 확인한다.
- clean starter는 바로 생성되고 dirty/recovery starter는 확인되며 거절 시 현재 상태가 보존되는지 확인한다.
- `python3 harness/scripts/run_quality_gate.py`, `npm run renderer:smoke`, `npm run harness:smoke`, `npm run workflow:smoke`, `npm run typecheck`, `npm run build`, `npm run desktop:launch-smoke`를 실행한다.

## Review Plan

QA 완료 뒤 review_judge가 destructive-change 발견성, modal keyboard/focus, Quick Actions async 결과, starter cancel 상태 보존, direct composition/local-first 불변 조건을 별도로 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-24 | Style 변경과 Starter 교체 보호를 이번 사용성 개선의 P0 범위로 정한다. | Style select는 설정처럼 보이지만 BPM·swing·sound·Pattern A/B/C를 즉시 재생성하고, starter도 작성 중 프로젝트를 즉시 교체하므로 사용자 작업 보존 위험이 가장 크다. |
| 2026-07-24 | Style에는 native confirm 대신 미리보기 modal과 명시적 Apply/Cancel을 사용한다. | 변경 범위가 크고 여러 항목이 바뀌므로 사용자가 적용 전에 구체적인 결과를 읽을 수 있어야 한다. |
| 2026-07-24 | Starter는 dirty/recovery 상태에서만 확인하고 clean 첫 실행은 한 번의 클릭을 유지한다. | 데이터 보호와 빠른 첫 비트 시작을 함께 지키기 위해서다. |
| 2026-07-24 | Handoff 포함 데이터 안내와 Guided 선택 노트 Essentials는 후속 후보로 기록한다. | 유효한 개선안이지만 이번 계획은 가장 큰 프로젝트 교체 위험을 작은 검증 범위로 먼저 제거한다. |
| 2026-07-24 | Style/Starter Quick Actions는 명시적 `complete`/`canceled` outcome을 전달한다. | 취소 중 다른 로컬 변경이 발생해도 before/after equality로 결정을 추측하지 않고 정확한 결과 피드백을 제공하기 위해서다. |
| 2026-07-24 | native Style select의 listbox 의미를 유지하고 review 동작은 `aria-describedby`로 설명한다. | 실제 native popup을 dialog로 잘못 알리는 접근성 상태를 피하기 위해서다. |
| 2026-07-24 | Style modal을 Workspace Command Dock보다 높은 layer에 둔다. | preview 중 Play/Undo/Redo/Actions가 overlay 위로 노출되어 프로젝트나 재생 상태를 바꾸지 못하게 하기 위해서다. |
| 2026-07-24 | production project-change/starter collector는 280초로 한정하고 UI 상태는 `flushSync`/`MessageChannel`, 실제 focus만 animation frame으로 기다린다. | hidden Electron 창의 timer throttling을 피하면서 실제 DOM focus와 modal lifecycle을 검증하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-24 | project_lead | Registered the goal and opened the usability review. |
| 2026-07-24 | repo_cartographer | Identified immediate Style regeneration and unguarded Starter replacement as P0 usability risks. |
| 2026-07-24 | quality_runner | Defined focus, keyboard, 1180×760, project-state preservation, and QA regression criteria. |
| 2026-07-24 | privacy_guard | Confirmed local-first boundaries and proposed Handoff metadata transparency as a follow-up. |
| 2026-07-24 | plan_keeper | Created plan-1518 on the required feature worktree. |
| 2026-07-24 | harness_builder | Added immutable Style preview/apply helpers, accessible modal, shared Quick Action outcomes, Starter replacement guard, and focused Master Ceiling draft protection. |
| 2026-07-24 | quality_runner | Passed quality gate, typecheck, renderer, runtime harness, workflow, build, diff check, and full production Electron launch smoke. |
| 2026-07-24 | review_judge | Found and drove fixes for cancel-result ambiguity, pre-confirm draft mutation, native select semantics, missing production interaction evidence, canceled-result tone, and modal/dock stacking. |

## Completion Notes

Implementation and QA are complete. Independent review reported no remaining P0-P3 findings after the follow-up fixes. Style changes now stay read-only until explicit Apply, restore through one Undo, and remain modal above the Workspace Command Dock. Dirty/recovery Starter replacement is confirmed before mutation; cancel preserves the current project, history posture, and recovery state. The product remains local-first and direct-composition-led.
