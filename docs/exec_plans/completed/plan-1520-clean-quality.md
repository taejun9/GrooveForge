# plan-1520-clean-quality

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

모든 테스트와 린트를 깨끗하게 통과시키고, 실행 과정에서 발견되는 버그를 모두 수정한다.

## Goal

저장소가 선언한 로컬 품질 명령을 전체 실행해 실패를 재현하고, 원인이 제품 코드·테스트·하네스·문서 계약 중 어디에 있든 근본 원인을 수정한다. 최종 상태는 `npm run release:check`와 변경 범위에 필요한 보조 검증이 모두 통과하며 독립 리뷰에 잔여 P0-P3 finding이 없는 상태다.

## Non-Goals

- 실제 배포, 업로드, notarization 제출, 외부 계정 설정 또는 비공개 release input 입력은 수행하지 않는다.
- 실패와 무관한 기능, UI, 제품 범위를 확장하지 않는다.
- 테스트를 건너뛰거나 assertion을 약화해 통과시키지 않는다.

## Context Map

- 품질 명령과 계약: `docs/quality/rules.md`, `package.json`
- 로컬 QA 진입점: `harness/scripts/run_qa.py`, `harness/scripts/run_quality_gate.py`
- 제품 코드: `src/`, `electron/`
- 하네스: `harness/`
- 활성 계획: `docs/exec_plans/active/plan-1520-clean-quality.md`

## Constraints

- 저장소 작업은 `codex/plan-1520-clean-quality`와 `.worktree/plan-1520-clean-quality`에서 수행한다.
- QA와 review를 분리하고 review는 QA 완료 후 시작한다.
- scope나 접근이 달라지면 Decision Log를 갱신한다.
- 사용자 또는 저장소의 비공개 release 값을 추측하거나 기록하지 않는다.
- 외부 서비스와 네트워크가 필요한 gate는 로컬 smoke 계약과 구분해 보고한다.

## Implementation Plan

- [x] 현재 전체 품질 명령을 실행하고 모든 실패를 정확히 기록한다.
- [x] 각 실패의 근본 원인을 수정하고 직접 회귀 검증을 추가하거나 강화한다.
- [x] lint/정적 검사, 타입 검사, 테스트, build, desktop/runtime/release smoke를 전체 재실행한다.
- [x] QA 이후 변경 diff와 안전·회귀 위험을 독립 리뷰한다.
- [x] 계획을 completed로 이동하고 review mirror와 completion summary evidence를 갱신한다.

## QA Plan

- `git diff --check`
- `npm run qa`
- `npm run verify`
- `npm run release:check`
- 실패 수정 범위의 직접 smoke 또는 회귀 명령
- `npm run release:completion-summary-refresh-smoke`

## Review Plan

QA 완료 뒤 review_judge가 변경 diff, 실패 원인의 완전한 제거, assertion 약화 여부, 플랫폼·개인정보·release boundary 회귀, 문서와 명령 catalog 정합성을 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-24 | 저장소의 최상위 품질 계약인 `npm run release:check`를 전체 clean 기준으로 삼는다. | 이 명령이 repository QA와 표준 verify 체인을 함께 실행하며 package scripts에 선언된 현재 공식 진입점이다. |
| 2026-07-24 | 외부 배포 실행과 비공개 값 입력은 범위에서 제외하되 로컬 dry-run/smoke는 실행한다. | 품질 검증은 완수하면서 사용자 권한 밖의 외부 변경과 민감 정보 추측을 피한다. |
| 2026-07-24 | release audience completion handoff의 local delivery artifact 계약을 8개에서 9개로 맞춘다. | SoundCloud Upload Sheet 추가로 실제 package/reopen 계약은 이미 9개인데 후속 handoff만 stale한 8개를 요구해 표준 `verify`가 실패했다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-24 | project_lead | 기존 활성 goal을 확인하고 main의 깨끗한 상태와 QA 명령을 조사했다. |
| 2026-07-24 | plan_keeper | plan-1520 전용 브랜치와 worktree를 만들고 전체 품질 정리 범위를 활성화했다. |
| 2026-07-24 | quality_runner | `npm run qa`는 통과했고 전체 `npm run verify` 후반에서 release audience completion handoff의 stale 8-artifact 기대값을 재현했다. |
| 2026-07-24 | harness_builder | local delivery package와 reopen의 현재 9-artifact 계약을 label 목록에서 파생하고 SoundCloud Upload Sheet 존재까지 handoff readiness와 검증에 반영했다. |
| 2026-07-24 | quality_runner | 직접 handoff와 downstream completion report packet이 통과한 뒤 승인된 macOS GUI 컨텍스트에서 전체 `npm run release:check`를 종료 코드 0으로 통과했다. |
| 2026-07-24 | review_judge | 단순 숫자 9만 유지하면 future artifact drift가 반복될 수 있음을 발견해 label 기반 파생으로 강화했고, 최종 diff에서 잔여 P0-P3 finding이 없다고 판정했다. |
| 2026-07-24 | quality_runner | review 강화 후 `node --check`, `npm run qa`, `npm run release:audience-completion-handoff-smoke`를 다시 통과했다. |
| 2026-07-24 | doc_gardener | plan-1520을 completed로 이동하고 QA, finding, residual risk를 review mirror에 기록했다. |

## Completion Notes

전체 품질 체인에서 SoundCloud Upload Sheet가 추가된 현재 local delivery package는 9개 artifact인데 release audience completion handoff만 8개를 요구하는 stale 계약을 발견했다. handoff가 project, mix, 네 stem, MIDI, Handoff Sheet, SoundCloud Upload Sheet label을 모두 확인하고 artifact count와 reopen verified/source count를 동일한 9개 계약으로 검증하도록 수정했다.

직접 회귀, downstream completion report packet, 전체 `npm run release:check`가 통과했다. 전체 체인은 정적 QA, typecheck, build, 41개 playable WAV와 33개 full-mix tail, source/packaged/signed/PKG payload/installed Electron launch, project I/O, release/privacy dry-run evidence를 포함했다. 외부 배포는 기존과 같이 사용자 비공개 release input, Developer ID, notarization, Gatekeeper, manual QA가 없어 pending이며 이번 로컬 품질 완료와 분리된다.
