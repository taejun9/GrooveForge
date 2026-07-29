# plan-1521-hardware-workflow-gap

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

실제 비트 제작 기계와 비교해 GrooveForge에 부족한 기능이 없는지 팀 회의로 검토하고, 추가하면 좋은 기능을 제품에 추가하거나 기존 기능을 수정한다.

## Goal

공식 하드웨어 비트 머신 자료와 현재 GrooveForge 제품·코드·QA 근거를 비교해 기능 갭을 분류하고, composition-first·all-genre·event-based·local-first 원칙을 지키는 가장 가치 높은 누락 워크플로를 구현한다. 회의에서 채택·보류·제외 결정을 기록하고 제품 문서, 아키텍처, 공식 소스, 구현, 검증 계약을 함께 갱신한다.

## Non-Goals

- 하드웨어 제품의 모든 기능을 복제하거나 특정 제조사의 UI·브랜드·프리셋을 모방하지 않는다.
- 샘플링, 오디오 녹음, 클라우드 서비스, 계정, 결제, 분석을 MVP 중심으로 이동하지 않는다.
- 외부 MIDI 장치 없이 검증할 수 없는 연결 성공을 주장하지 않는다.
- 사용자 승인 없이 배포, 업로드, 원격 호출, 외부 계정 변경을 수행하지 않는다.

## Context Map

- 제품 원칙과 현재 기능: `docs/product/product.md`
- 제품 데이터·오디오·UI 구조: `docs/architecture/product-architecture.md`
- 공식 벤치마크 근거: `docs/references/official-sources.md`
- 회의록: `docs/meetings/2026-07-29-plan-1521-hardware-workflow-gap.md`
- 품질 계약: `docs/quality/rules.md`, `package.json`
- 제품 코드와 smoke: `src/`, `harness/`

## Constraints

- 저장소 작업은 `codex/plan-1521-hardware-workflow-gap`와 `.worktree/plan-1521-hardware-workflow-gap`에서 수행한다.
- 실제 하드웨어 비교 근거는 제조사 공식 문서나 공식 제품 페이지를 우선한다.
- 현재 구현 여부는 설명 문구가 아니라 domain/UI/audio/test 코드 근거로 판정한다.
- QA 완료 후에만 review를 시작한다.
- scope나 접근이 달라지면 Decision Log를 갱신한다.

## Implementation Plan

- [x] 공식 하드웨어 자료와 현재 저장소를 병렬 조사해 기능 갭 매트릭스를 만든다.
- [x] 제품·아키텍처·워크플로·개인정보 관점 회의를 열어 채택/보류/제외 항목을 결정한다.
- [x] 합의된 최우선 기능을 domain, UI, realtime playback, offline render/export에 일관되게 구현한다.
- [x] 제품 문서, 아키텍처, 공식 소스, 회의록, QA 계약을 갱신한다.
- [x] 직접 회귀, 표준 QA, 빌드, 관련 desktop/runtime smoke를 실행한다.
- [x] QA 이후 독립 리뷰하고 계획을 completed로 이동해 review mirror를 만든다.

## QA Plan

- `git diff --check`
- `npm run qa`
- `npm run typecheck`
- `npm run build`
- 변경 범위의 직접 runtime/renderer/workflow smoke
- 변경 위험에 비례한 `npm run verify` 또는 표준 전체 품질 게이트

## Review Plan

QA 완료 뒤 review_judge가 하드웨어 비교의 근거성, 구현과 문서의 정합성, realtime/offline parity, project roundtrip, undo/recovery, 샘플링 편향, 원격·개인정보 경계, 회귀 테스트 강도를 별도 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-29 | 공식 제조사 자료와 저장소 구현 근거를 모두 확보한 뒤 기능을 채택한다. | 단순 체크리스트 비교로 이미 있는 기능을 중복 구현하거나 하드웨어의 샘플링 중심 범위를 그대로 옮기는 오류를 피하기 위해서다. |
| 2026-07-29 | 1차 구현은 한 개의 응집된 최우선 워크플로에 집중한다. | 기능 수보다 프로젝트 데이터, 편집, 재생, 렌더, 저장, QA가 끝까지 연결되는 완성도가 중요하다. |
| 2026-07-29 | 첫 구현은 Pattern Live Overdub으로 정하고 Track/Device schema migration은 후속 계획으로 분리한다. | Live capture가 하드웨어 대비 가장 큰 즉시 체감 갭이고, 기존 이벤트·Undo·저장·재생·렌더·MIDI 경로를 재사용해 schema migration 없이 완결할 수 있다. |
| 2026-07-29 | Live Overdub은 현재 선택 Pattern의 active pattern playback에만 허용하고 16분음표 grid로 quantize한다. | Song/Block/Turn과 다른 Pattern은 하나의 durable Pattern slot을 안전하게 식별하지 못하며 현재 데이터 경계보다 정밀한 timing을 주장해서는 안 된다. |
| 2026-07-29 | 다음 우선순위는 flexible Track/Device·Drum Rack, multi-bar cycle, Live Capture 2단계, parameter lock/automation, Pattern Queue, MIDI sync 순으로 둔다. | 주요 하드웨어의 공통 강점을 제품의 composition-first 구조에 맞추되 migration과 scheduler 위험을 별도 계획에서 다룬다. |
| 2026-07-29 | sampling/audio recording/plugin/cloud는 이번 범위에서 제외하고 Web MIDI는 explicit `sysex: false` local input만 유지한다. | 첫 제품 목표와 local-first/privacy 경계를 지키고 장치·원시 MIDI 데이터를 저장하거나 전송하지 않기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-29 | project_lead | 사용자 요청을 plan-1521로 열고 하드웨어 벤치마크, 저장소 갭, 제품·개인정보 경계 검토를 병렬로 시작했다. |
| 2026-07-29 | repo_cartographer | 현재 강점과 고정 16-step·고정 역할/lane·제한된 automation·실시간 capture 부재를 코드와 smoke 기준으로 확인하고 문서의 구현 과장을 분리했다. |
| 2026-07-29 | review_judge | Live Capture -> Drum Rack/Track topology -> Pattern Queue 순으로 사용자 체감 우선순위를 합의했다. |
| 2026-07-29 | harness_builder | Next/Replace를 보존하는 Pattern Live Overdub placement, UI/Quick Actions, scheduler snapshot ref, Pattern-slot update, renderer smoke를 구현했다. |
| 2026-07-29 | privacy_guard | 명시적 Web MIDI 권한, `sysex: false`, 장치명/raw event 비저장, remote 경로 미추가를 구현 경계로 확정했다. |
| 2026-07-29 | quality_runner | typecheck, renderer smoke, runtime harness와 실제 로컬 화면에서 세 모드 배치·Pattern 전환·playhead 갱신을 1차 확인했다. |
| 2026-07-29 | review_judge | QA 이후 리뷰에서 stale delayed `onStop`, selected-Pattern readout 불일치, Live Overdub Quick Action after/canceled metric 결함 3건을 발견했다. |
| 2026-07-29 | harness_builder | playback session guard, pattern-aware readout, Quick Action playhead/canceled 결과를 수정하고 각각 renderer 회귀를 추가했다. |
| 2026-07-29 | quality_runner | 리뷰 수정 뒤 typecheck, renderer smoke, QA, build, Quick Actions bundle smoke, quality gate를 다시 통과했다. |
| 2026-07-29 | review_judge | 재리뷰에서 cached Quick Action의 stale `isPlaying`과 canceled follow-up 문구 2건을 추가 발견했다. |
| 2026-07-29 | harness_builder | active playback mode ref와 Live Overdub 전용 canceled 복구 안내를 추가하고 회귀 검증을 강화했다. |
| 2026-07-29 | review_judge | 최종 재리뷰에서 잔여 P0-P3 finding이 없다고 판정했다. |
| 2026-07-29 | doc_gardener | plan-1521을 completed로 이동하고 review mirror에 QA, 수정 finding, 잔여 위험, 후속 로드맵을 기록했다. |

## Completion Notes

공식 MPC One+, Maschine+, Digitakt II, TR-8S, MC-707 자료와 현재 구현을 비교해 GrooveForge의 sample-free composition/export 강점과 live capture, flexible track/device, multi-bar pattern, parameter lock/automation, scene queue, MIDI sync 갭을 분리했다. 이번 계획에서는 기존 Next/Replace를 보존하면서 Desktop Keyboard와 Web MIDI Note On을 선택 Pattern의 재생 playhead에 1/16 quantize하는 Pattern Live Overdub을 구현했다.

Live Overdub은 Pattern playback만 허용하고 Song/Block/Turn과 다른 Pattern은 거부한다. 성공 이벤트는 기존 undo, dirty/recovery, save/load, realtime, WAV/stem, MIDI 경로를 재사용한다. playback session/active mode ref는 빠른 Stop→Play 및 cached Quick Action에서도 오래된 callback/state를 차단한다. 공식 소스, 회의록, 제품·아키텍처·QA·공개 영문 문서를 갱신했고 현재 구현보다 앞서 있던 16/32-step, pitch envelope, LUFS, generic Track/Clip/Device, persisted fx-return 표현을 현재와 목표로 나눴다.

통과한 검증은 `git diff --check`, `npm run qa`, `npm run typecheck`, `npm run build`, `npm run renderer:smoke`, `npm run harness:smoke`, `npm run workflow:smoke`, `npm run quick-actions:bundle-smoke`, `python3 harness/scripts/run_quality_gate.py`다. 실제 로컬 화면에서도 세 모드의 무겹침 배치, Overdub 선택 시 Pattern 전환, live playhead 갱신을 확인했다. QA 뒤 독립 리뷰에서 발견한 다섯 결함을 모두 수정했고 최종 재리뷰에 잔여 P0-P3 finding이 없다.

`npm run release:completion-summary-refresh-smoke`도 실행했으나 새 feature worktree에 이전 ignored external source evidence가 없어 `release:proof-bundle` 단계에서 중단됐다. 이는 로컬 기능·빌드 실패가 아니라 `npm run release:check`로 별도 재생성해야 하는 외부 배포 증거 상태이며, 네트워크 probe·서명·공증·업로드는 실행하거나 완료로 주장하지 않았다.
