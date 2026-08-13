# plan-1525-mystic-song-actual-app-qa

## Status

completed

## Owner

project_lead / repo_cartographer / harness_builder / quality_runner / review_judge

## User Request

기능별 탭을 나눈 실제 GrooveForge 앱을 실행해 제대로 동작하는지 테스트하고, 발견한 버그를 수정한다. 테스트 과정에서 신비롭고 철학적인 정서의 오리지널 곡을 만든다.

## Goal

표시된 실제 Electron 앱에서 Compose, Arrange, Mix, Deliver 탭을 직접 조작하며 한 곡을 처음부터 저장·재생·전달 가능한 상태까지 만들고, 탭·편집·상태 보존·포커스·재생·저장 경로의 버그를 수정한 뒤 같은 실제 화면 경로로 재검증한다.

## Creative Boundary

- 특정 현존 아티스트의 고유한 멜로디, 가사, 편곡, 음색 또는 인식 가능한 스타일을 모사하지 않는다.
- 대신 신비로운 분위기, 철학적 질문, 대비되는 전개, 여백이 있는 리듬, 몽환적인 신스와 같은 일반적 특성으로 완전한 오리지널 테스트 곡을 만든다.
- 기존 사용자 초안·프로젝트·Electron 세션은 변경하지 않고, plan-1525 전용 앱 빌드·비영속 세션·프로젝트 파일을 사용한다.

## Context Map

- 앱 셸과 작업 상태: `src/ui/App.tsx`
- 음악 프로젝트 모델과 생성: `src/domain/`, `src/audio/`
- 기능 탭과 패널: `src/ui/workstation*Panels.tsx`, `src/ui/workstationGuidancePanels.tsx`
- Electron 실행·프로젝트 I/O·화면 스모크: `electron/main.ts`, `harness/scripts/`
- 시각·반응형 규칙: `src/styles.css`

## Constraints

- QA and review are separate loops.
- Do not implement, commit, or push directly on `main`.
- Use `codex/plan-1525-mystic-song-actual-app-qa` and `.worktree/plan-1525-mystic-song-actual-app-qa`.
- 모든 실제 화면 조작은 사용자 데이터와 분리된 테스트 프로젝트에서 수행한다.
- 앱에서 만든 음악 데이터가 테스트의 source of truth이며, 소스 파일을 직접 조작해 성공을 가장하지 않는다.
- 발견한 버그는 재현 증거, 수정, 동일 경로 재검증을 남긴다.

## Implementation Plan

- [x] 실제 실행 중인 GrooveForge 화면과 renderer 상태를 감사한다.
- [x] plan-1525 전용 실제 앱·세션·증거 경로를 준비한다.
- [x] 오리지널 테스트 곡의 BPM, key, style, 패턴, 편곡, 믹스 목표를 정한다.
- [x] 실제 화면에서 Compose → Arrange → Mix → Deliver 전 경로로 곡을 만든다.
- [x] 탭을 독립된 4분할 표면과 명확한 선택 상태로 재구성한다.
- [x] 탭·상태 보존·포커스·단축키·재생·저장·성능 버그를 수정한다.
- [x] 수정된 앱에서 같은 곡과 회귀 체크리스트를 다시 실행한다.
- [x] 프로젝트 파일, 화면 캡처, 재생/렌더 증거와 QA 로그를 보존한다.
- [x] QA 후 독립 리뷰를 실행하고 계획을 완료 처리한다.

## QA Plan

- 실제 화면: 네 탭 pointer/keyboard 이동, 탭당 단일 visible panel, 상태 왕복, scroll/sticky, 포커스, 좁은 화면.
- 곡 제작: project metadata, drums, bass, synth/melody, chords, Pattern A/B/C, arrangement, mixer/master, playback, save/open, export/handoff.
- 안전: 비활성 Compose shortcut/MIDI/Delete 무효, 활성 Compose 입력 유효, 테스트 프로젝트 fingerprint 보존.
- 회귀: `npm run qa`, `npm run typecheck`, `npm run build`, renderer/workflow/desktop smoke와 관련 실제 Electron smoke.
- 증거: 실제 앱 탭별 PNG, 완성 `.grooveforge` 프로젝트, 렌더 WAV/전달물, 구조화 QA 요약.

## Review Plan

QA 완료 후 별도 review loop에서 실제 앱 증거, 사용자 데이터 격리, 음악 프로젝트 무결성, 탭 접근성, 재현된 버그와 수정 범위, 외부/아티스트 모사 경계를 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-08-13 | 테스트 곡은 특정 아티스트 모사가 아닌 오리지널 신비·철학적 얼터너티브 팝으로 만든다. | 창작 요청의 정서를 유지하면서 현존 아티스트의 고유 스타일 복제를 피한다. |
| 2026-08-13 | 사용자 실행 앱과 분리된 plan-1525 앱·비영속 세션을 사용한다. | 기존 초안과 복구 데이터를 훼손하지 않고 실제 화면을 검증하기 위해서다. |
| 2026-08-13 | 첫 실제 앱 확인에서 renderer가 전면 검은 화면인 현상을 P1 후보로 기록한다. | 탭과 곡 제작을 시작할 수 없는 실제 실행 실패를 화면에서 재현했다. |
| 2026-08-13 | 기존 Workflow 카드 안에 탭 역할을 숨기지 않고 `WORKSPACE TABS` 독립 표면, 4개 분할 탭, `ACTIVE` 배지, 고대비 테두리와 강조선을 사용한다. | 사용자가 실제 앱에서 탭이 구분되지 않는다고 확인한 문제를 시각적으로 직접 해결한다. |
| 2026-08-13 | 실제 앱 QA는 전용 workspace root, 별도 Open/Save 경로, PID별 비영속 partition을 강제하는 visible Electron 모드로 수행한다. | 사용자의 유일한 복구 초안과 SQLite 프로젝트를 건드리지 않으면서 네이티브 입력·화면·파일 I/O를 검증한다. |
| 2026-08-13 | 일반 UI 입력은 5초, WAV/번들/저장·열기 같은 명시적 장기 작업은 120초 예산으로 실제 화면 하드 게이트를 둔다. | 기능 성공만으로 수십 초 멈춤을 통과시키지 않고 체감 UI 버그로 취급한다. |
| 2026-08-13 | 프로젝트 오디오 분석은 프로젝트 오디오 identity 기반 Web Worker로 이동하고 stale 결과를 폐기한다. | 20-bar Blueprint에서 동기 mix+4 stem 렌더가 모드·메타데이터 변경마다 메인 스레드를 수십 초 막는 실제 병목을 제거한다. |
| 2026-08-13 | Studio 도구는 현재 활성 탭만 즉시 펼치고 다른 탭은 최초 진입 때 펼친다. | Studio 전환 한 번에 14개 disclosure와 5개 채널 처리를 모두 레이아웃하던 장시간 commit을 줄이면서 전문 도구 자동 노출 의미를 보존한다. |
| 2026-08-13 | Electron에서 확인된 Arrange/Mix 48px 가로 페인트 넘침은 app shell의 `overflow-x: clip`으로 제한한다. | sticky navigator의 filter/shadow 페인트만 문서 폭에 포함되는 Chromium 차이를 막고 sticky와 모바일 내부 탭 스크롤은 유지한다. |
| 2026-08-14 | 분석이 pending/error인 동안 Mix, Master, Deliver, Guide의 meter·dB·readiness 파생 표면은 수치 대신 `Analyzing` 또는 `Meters unavailable` gate와 Retry만 표시한다. | 초기 `Silent` 또는 이전 프로젝트의 exact snapshot을 현재 값처럼 보이는 오판을 막는다. |
| 2026-08-14 | 오디오 분석은 Compose/Arrange에서 보류하고 Mix/Deliver 진입 또는 Retry route에서만 exact 결과를 commit하며, metadata-only 변경은 audio identity cache를 재사용한다. | 창작 중 Worker CPU와 대형 React commit이 입력을 방해하지 않으면서 stale identity는 폐기하기 위해서다. |
| 2026-08-14 | 분석 PCM working set은 192 MiB로 제한하고, 보통 곡은 combined pass, 64 bars / 60 BPM 경계는 4-array bounded-sequential pass를 사용한다. | 최대 프로젝트에서 약 908 MiB 동시 배열 할당을 약 181.7 MiB로 낮추면서 기존 분석 결과 parity를 유지한다. |
| 2026-08-14 | Save/Export 완료와 Handoff receipt는 latest request와 exact immutable project reference 모두가 맞을 때만 현재 UI를 갱신한다. | 제목, BPM, mixer, 프로젝트 교체 뒤 이전 비동기 완료나 export 영수증이 현재 파일/패키지로 보이는 문제를 막는다. |
| 2026-08-14 | Save/Open/Undo/Redo/교체/beforeunload 전에 focused Title·Session Brief draft를 동기 flush하고 실제 교체 시 UI-local export·snapshot identity를 초기화한다. | 포커스 중인 metadata가 창 닫기나 프로젝트 교체에서 유실되거나 새 프로젝트에 덮어씌워지는 문제를 막는다. |
| 2026-08-14 | cross-zone route는 대상 zone을 먼저 활성화한 뒤 live ref resolver로 disclosure·scroll·focus를 수행한다. | Activity가 cold/hidden인 탭의 null/stale ref 때문에 Quick Actions가 무반응이거나 잘못된 화면에 포커스하는 문제를 해소한다. |
| 2026-08-14 | Chord card의 Enter/Space는 card 자체에서만 처리하고 자식 button 이벤트는 그대로 통과시킨다. | 카드 선택과 전역 transport 이중 실행을 막으면서 delete/inversion 등 자식 키보드 조작을 보존한다. |
| 2026-08-14 | manual QA는 owned root, isolated Electron userData, no-symlink realpath gate와 `dist`+`dist-electron` 전체 regular-file closed manifest를 요구한다. | 일반 사용자 데이터·외부 경로 쓰기를 차단하고 실제 화면이 정확한 current source/build라는 provenance를 수정·추가·삭제까지 검증한다. |
| 2026-08-14 | launch smoke는 native Mix → exact analysis → Compose restore로 lazy 분석 표면을 준비하고, 그 전에 초기 project ownership 문구를 immutable evidence로 보존한다. | Compose/Arrange Worker defer와 UI route status 변경을 제품 실패로 오인하지 않으면서 실제 초기 상태와 visible route를 모두 증명한다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-08-13 | project_lead | Plan created on a dedicated branch/worktree after the displayed GrooveForge window reproduced a fully black renderer. |
| 2026-08-13 | repo_cartographer | 기존 사용자 workspace의 SQLite integrity와 유일한 recovery draft를 확인하고, 일반 앱 세션 대신 전용 workspace/partition이 필요함을 확정했다. |
| 2026-08-13 | harness_builder | visible manual/auto QA 모드, 네이티브 포인터·키보드 입력, 프로젝트 Save/Open, WAV export, 탭별 PNG와 구조화 evidence collector를 구현했다. |
| 2026-08-13 | harness_builder | 1152×768 실제 화면에서 독립 탭 표면 93.5px, 탭 4개 각 약 214×71.5px, 선택 Compose `ACTIVE`, 단일 visible panel, document overflow 0을 확인했다. |
| 2026-08-13 | quality_runner | 첫 자동 곡 QA에서 Studio 20.8s, Guide 6.0s, Experimental Pulse 30.4s와 입력 클릭 19s를 재현해 성능 회귀를 기능 실패로 기록했다. |
| 2026-08-13 | harness_builder | 동기 PCM 분석을 identity-cached Worker로 이동한 뒤 typecheck, build, renderer, workflow, runtime smoke에서 metadata 5/5 cache reuse, audio edit 8/8 invalidation, stale guard 3/3을 통과했다. |
| 2026-08-13 | quality_runner | Worker 수정 뒤 실제 Studio 전환은 기능적으로 성공했지만 13.815s로 5초 게이트를 실패해, disclosure를 활성 탭 단위로 materialize하는 후속 수정을 시작했다. |
| 2026-08-14 | harness_builder | main-thread PCM, 대형 Guide reconciliation, cold Activity route, metadata draft, export receipt, stale meter, chord key propagation, max-project memory, unsafe QA path/provenance 버그를 수정하고 각 finding의 runtime/renderer/Electron 계약을 추가했다. |
| 2026-08-14 | quality_runner | 최신 production Electron launch smoke에서 네 탭의 native click/Arrow/Home/End, 단일 selected/visible/tabstop, deep sticky, 숨은 mutation guard, cold Quick Actions route, modal focus, 1180px zero overflow를 모두 통과했다. |
| 2026-08-14 | quality_runner | 최신 source/bundle로 `문 없는 방`을 실제 UI에서 제작했다. Studio/Experimental, 110 BPM, D minor, Pattern A/B/C, 7 blocks/20 bars, Wide mix, vocal headroom, intro/outro automation, A/B/C·arrangement·WAV preview, export, Save/Open이 5/5 단계로 통과했다. |
| 2026-08-14 | quality_runner | auto-song QA의 68 native interactions는 일반 최대 3339ms/5000ms, slow 최대 5161ms/120000ms로 위반 0건이었다. Compose 508/508, Arrange 134/134, Mix 158/158, Deliver 57/57 interactive control이 접근 가능했고 네 화면 overflow offender는 0건이었다. |
| 2026-08-14 | quality_runner | 최신 build의 source Electron launch, project-I/O, focused-draft close-flow, static QA, renderer/workflow/runtime/workspace/Quick Actions/desktop entry가 모두 exit 0으로 통과했다. |
| 2026-08-14 | quality_runner | 실제 곡 보고서, 프로젝트, WAV, 8개 탭 top/deep PNG를 main의 ignored evidence 경로에 byte-identical하게 보존하고 source 61개와 bundle 49개 closed provenance를 독립 재계산했다. |
| 2026-08-14 | review_judge | 최종 post-QA review는 P0 0 / P1 0 / P2 0 / P3 0으로 통과했다. 시각적 4탭, async identity, truthful meter, focused metadata, cold route, chord keyboard, max-memory, manual-QA path와 full-bundle provenance의 기존 지적을 모두 acceptance 충족으로 판정했다. |
| 2026-08-14 | plan_keeper | `npm run release:completion-summary-refresh-smoke`를 실행했으나 이 feature worktree에 기존 external preflight/remediation/runbook/readiness/progress source evidence가 없어 proof-bundle 단계에서 exit 1했다. 요청 범위 밖의 `npm run release:check`와 private external gates로 확장하지 않고 실패와 후속 명령을 기록하며 완료율은 주장하지 않는다. |

## Completion Notes

- `WORKSPACE TABS`를 Compose, Arrange, Mix, Deliver 네 개의 독립 카드로 표시하고 선택 탭에 cyan 고대비 면·3px 경계·4px 하단선·`ACTIVE` 배지를 적용했다. 실제 각 화면에서 tab 4 / selected 1 / tabstop 1 / panel 4 / visible 1을 확인했다.
- 최신 production Electron에서 native click, Arrow/Home/End, deep sticky, 숨은 shortcut/MIDI/Delete guard, cold disclosure/Quick Actions route, modal focus, 1180px overflow, 프로젝트 I/O, 포커스 중 metadata close-save를 재검증했다.
- 실제 UI로 `문 없는 방`을 제작했다. Studio / Experimental, 110 BPM, D minor, Pattern A/B/C, 7 blocks / 20 bars, 84 repeat-inclusive hits, Wide mix, vocal headroom, intro/outro automation을 사용했다. 특정 아티스트를 직접 모사하지 않는 오리지널 신비·사색적 한국어 alt-pop brief를 프로젝트에 저장했다.
- auto-song QA는 5/5 단계와 68 native pointer/keyboard interactions를 통과했다. 일반 UI 최대 3339ms / 5000ms, slow operation 최대 5161ms / 120000ms이며 A/B/C·arrangement·WAV preview, WAV export, Save/Open이 모두 통과했다.
- 프로젝트는 28,094 bytes, SHA-256 `c231878832f2adcedb543e2f0ea643a41071cd9ac524d1923bdcecde773b46f3`이다. WAV는 11,762,720 bytes, SHA-256 `0a457fb10cf3cec454882afc26a6bb31d46bfe5e9cb7704d06e6a29bb220a062`, 44.454558초 stereo 44.1kHz signed PCM 24-bit이다.
- Compose 508/508, Arrange 134/134, Mix 158/158, Deliver 57/57 rendered interactive controls가 접근 가능했고 inaccessible/unchecked는 0이었다. 네 화면의 horizontal overflow와 offender는 0이며 top/deep PNG 8개를 보존했다.
- 최신 source provenance는 61 files, SHA-256 `f85a89d614a7ef40c8016692bfb8d5ca769df7fc9cc2b0b0dd825cb16958ed7c`; production bundle은 49 files, SHA-256 `b04fcc14a348d951bda3336fd9c56e9da8d957be9b15bb13999cf25f0d5b9f66`이다. Electron launch가 각 file path/bytes/mtime/hash와 추가·삭제·변조·symlink를 독립 검증했다.
- 최종 비-GUI QA는 `git diff --check`, `npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run harness:smoke`, `npm run project-workspace:smoke`, `npm run quick-actions:bundle-smoke`, `npm run desktop:smoke`를 통과했다. 추가로 `npm run persona:smoke`와 `npm run sample-audio:qa`가 16/16 styles, playable WAV 43개, digital-zero tail 43/43, full-mix tail 35/35, render isolation 11/11을 통과했다.
- 실제 앱 QA는 `npm run build`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, `npm run desktop:close-flow-smoke`, 격리된 `npm run desktop:manual-qa -- --auto-song-qa`를 통과했다. 보고서 SHA-256은 `7e3d1c93988e6d0d6ddc395d968c049cc72f29edaccdc50f25f5739ddc93dd69`이다.
- 독립 증거 감사와 post-QA review는 모두 통과했고 최종 verdict는 P0 0 / P1 0 / P2 0 / P3 0이다.
- `npm run release:completion-summary-refresh-smoke`는 desktop crash-report regression을 통과한 뒤, 이 worktree에 기존 external distribution source evidence가 없어 `release:proof-bundle`에서 exit 1했다. 출력은 후속 명령으로 `npm run release:check`를 제시했지만 Developer ID, notarization, live release metadata와 외부 채널이 이번 제품 UI/곡 QA 범위를 벗어나므로 실행하지 않았다. 이 plan은 제품 완료율이나 외부 배포 준비율을 주장하지 않는다.
- 잔여 범위: visible Electron native-input 자동화는 사람이 모든 상태 조합을 수동 조작한 것을 뜻하지 않으며, PCM/구조/재생 검증은 헤드폰 청음이나 최종 mastering 판단을 대체하지 않는다. 192 MiB는 분석 PCM working-set 추정 cap이지 Electron 전체 RSS 상한이 아니다. 실제 `/Applications` 설치, Developer ID signing, notarization, Gatekeeper, update feed, 외부 업로드·배포는 실행하거나 완료로 주장하지 않는다.
