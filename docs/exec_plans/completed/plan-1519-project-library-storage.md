# plan-1519-project-library-storage

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

GrooveForge로 음악을 만들 때 프로젝트 정보가 SQLite3에 저장되도록 하고, Windows 현재 사용자 폴더 바로 아래 `GrooveForge` 폴더를 만들어 내부 데이터를 폴더별로 정리한다. 구현 전 팀 회의로 저장 구조와 안전 정책을 합의한다.

## Goal

Electron 데스크톱 앱이 실제 현재 사용자 홈 아래에 로컬 전용 GrooveForge 작업공간을 지연 생성한다. 사용자가 확정 저장하는 portable project file은 `Projects`, 프로젝트 catalog와 편집 중 최신 복구 JSON은 SQLite3 `Data/grooveforge.db`에 분리한다. 일반 Windows에서는 결과가 `C:\Users\<현재 사용자>\GrooveForge`이고, 리디렉션되거나 다른 드라이브에 있는 사용자 프로필도 실제 홈을 안전하게 따른다.

## Non-Goals

- 프로젝트 파일 schema 또는 현재 `fileVersion: 1`을 변경하지 않는다.
- 자동 복구본을 명시적으로 저장된 프로젝트로 표시하거나 dirty 상태를 해제하지 않는다.
- 프로젝트별 폴더, portable project-id, 백업 회전, 휴지통을 이번 계획에 추가하지 않는다.
- WAV, Stem, MIDI, Handoff, Delivery Bundle의 기존 다운로드 위치를 변경하지 않는다. 관리형 Export Library는 후속 범위다.
- 계정, 클라우드 동기화, 원격 AI, analytics, 광고, 결제, sample import를 추가하지 않는다.
- 기존 외부 `.grooveforge.json` 파일을 자동 이동하거나 삭제하지 않는다.

## Context Map

- 회의 기록: `docs/meetings/2026-07-24-plan-1519-project-library-storage.md`
- 프로젝트 직렬화와 안전한 파일명: `src/domain/workstation.ts`
- Save/Open, dirty, local recovery: `src/ui/App.tsx`
- renderer local draft: `src/ui/workstationPatternTools.ts`
- Save 완료 경쟁 상태: `src/ui/projectSaveCompletion.ts`
- Electron 파일 경계: `electron/main.ts`, `electron/preload.cts`
- SQLite adapter: `electron/projectLibrary.ts`
- workspace/atomic writer: `electron/projectWorkspace.ts`
- 브라우저 fallback: `src/platform/downloads.ts`
- 제품 구조: `docs/architecture/product-architecture.md`
- 품질 규칙: `docs/quality/rules.md`
- 개인정보 원칙: `docs/privacy/principles.md`

## Constraints

- QA와 review를 분리한다.
- scope나 접근이 달라지면 이 계획의 Decision Log를 갱신한다.
- `codex/plan-1519-project-library-storage`와 `.worktree/plan-1519-project-library-storage`에서 저장소 작업을 수행한다.
- `C:\Users`나 사용자명을 조립하지 않고 Electron의 현재 사용자 home 경계를 사용한다.
- 관리형 경로 결정, 디렉터리 생성, 파일 읽기/쓰기/삭제는 Electron main process가 소유한다.
- renderer/preload에 raw SQL 또는 database path를 노출하지 않는다.
- 프로젝트 본문과 실제 사용자 홈 절대경로를 로그, 문서, QA evidence에 기록하지 않는다.
- portable project write는 같은 디렉터리의 임시 파일을 flush한 뒤 교체하고, SQLite write는 parameterized short transaction으로 수행한다.
- 현재 1,500,000-character / 6,000,000-byte 제한, project normalization, unsupported-version fail-closed 계약을 유지한다.
- 기존 exact-current/stale Save 판정, dirty state, close guard, replacement guard, browser download/localStorage fallback을 유지한다.
- 실제 사용자 홈은 자동 QA에서 사용하지 않고 임시 경로를 주입한다.

## Implementation Plan

- [x] 사용자 home 기반 `GrooveForge/Projects`와 `GrooveForge/Data` 경로를 계산하고 지연·반복 안전하게 준비하는 Electron workspace 모듈을 추가한다.
- [x] 같은 디렉터리 임시 파일, flush, 교체, 실패 cleanup을 사용하는 bounded atomic project writer를 추가한다.
- [x] Electron 내장 SQLite3 adapter에 schema version/application id, STRICT JSON tables, WAL/FULL, integrity check, parameterized recovery/catalog transaction을 추가한다.
- [x] native Save/Open dialog의 기본 위치를 `Projects`로 연결하고 명시적 Save file 성공 뒤 exact JSON snapshot을 SQLite catalog에 mirror한다.
- [x] renderer의 기존 bounded local draft와 병행해 SQLite latest recovery를 debounce 기록·읽기·지우는 좁은 IPC를 추가한다.
- [x] SQLite recovery가 명시적 Save와 dirty/clean 의미를 바꾸지 않으며, browser fallback은 기존 동작을 유지하게 한다.
- [x] 임시 home 기반 workspace smoke와 production Electron project I/O SQLite evidence를 추가한다.
- [x] 제품 구조, 품질, 개인정보 문서를 구현 계약과 맞춘다.

## QA Plan

- Windows, macOS/Linux 형식의 synthetic home에서 `GrooveForge/Projects`와 `GrooveForge/Data/grooveforge.db`가 올바르게 계산되는지 확인한다.
- 임시 home에서 폴더 준비가 반복 안전하고 실제 사용자 홈을 건드리지 않는지 확인한다.
- SQLite schema bootstrap/reopen, recovery upsert/read/clear, catalog upsert, parameter binding, JSON/size constraints, application id, WAL, integrity check, future schema 거부를 확인한다.
- Save/Open dialog 기본 경로가 Projects이고, 프로젝트 저장은 기존 파일명/파서 roundtrip/크기 제한을 유지하는지 확인한다.
- recovery IPC가 bounded JSON만 다루고 renderer가 SQL/database path/절대 저장 위치를 지정할 수 없는지 확인한다.
- 자동 복구 성공이 프로젝트 dirty 상태를 해제하거나 명시적 Save 완료로 표시되지 않는지 확인한다.
- legacy localStorage recovery와 browser download fallback이 유지되는지 확인한다.
- `python3 harness/scripts/run_quality_gate.py`, `npm run project-workspace:smoke`, `npm run renderer:smoke`, `npm run harness:smoke`, `npm run workflow:smoke`, `npm run typecheck`, `npm run build`, `npm run desktop:project-io-smoke`, `npm run desktop:close-flow-smoke`를 실행한다.

## Review Plan

QA 완료 뒤 review_judge가 경로/SQLite 소유권, schema migration/fail-closed, 실제 홈 비노출, atomic file write와 transaction 안전성, recovery/explicit Save 의미 분리, async stale completion, close/replacement 보호, browser fallback을 독립 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-24 | plan-1519 초기 범위를 관리형 `Projects`와 단일 최신 recovery로 정한다. | 사용자 요청을 직접 충족하면서 backup restore와 대용량 export IPC까지 한 번에 바꾸는 위험을 피한다. |
| 2026-07-24 | `C:`를 하드코딩하지 않고 `app.getPath("home")`을 사용한다. | 일반 Windows의 요청 경로를 충족하면서 이동·리디렉션된 사용자 프로필과 다른 데스크톱 OS를 안전하게 지원한다. |
| 2026-07-24 | 폴더는 첫 Save/Open 또는 자동 복구 쓰기 때 지연 생성한다. | 관리자 권한을 요구하지 않고 사용자가 실제로 로컬 저장 기능을 사용할 때만 홈 아래 데이터를 만든다. |
| 2026-07-24 | 사용자의 추가 요청에 따라 recovery와 saved-project mirror를 `Data/grooveforge.db` SQLite3 schema v1에 저장한다. | 정보 저장 기술을 SQLite3로 명시했으며 catalog/recovery JSON mirror가 기존 project schema를 이중 모델링하지 않고 요구를 충족한다. |
| 2026-07-24 | 외부 `sqlite3` npm addon 대신 Electron 39의 내장 `node:sqlite`를 main-only adapter로 사용한다. | 같은 SQLite3 엔진을 사용하면서 deprecated addon, Electron ABI rebuild, native binary packaging/codesign 부담을 피한다. |
| 2026-07-24 | 기존 localStorage draft를 유지하고 SQLite recovery를 병행한다. | browser fallback과 기존 복구 호환을 보존하면서 desktop recovery 내구성을 높인다. |
| 2026-07-24 | recovery는 명시적 Save와 분리하고 dirty 상태를 바꾸지 않는다. | 자동 안전망이 사용자가 확정한 durable project file을 가장하거나 최신 편집을 clean으로 오판하지 않게 한다. |
| 2026-07-24 | Backups, portable project-id, project folders, managed Exports는 후속 계획으로 둔다. | 보존 한도·복원 UX·동명 충돌·대용량 artifact IPC가 각각 별도 설계와 QA를 요구한다. |
| 2026-07-24 | SQLite catalog는 native location의 SHA-256 key만 저장하고 실제 home/absolute path는 저장하지 않는다. | 로컬 library upsert identity를 유지하면서 사용자명과 실제 home 경로 노출을 줄인다. |
| 2026-07-24 | 정상 desktop 실행은 single-instance로 제한하고 smoke만 격리 workspace에서 예외로 둔다. | 두 프로세스가 singleton recovery를 덮거나 다른 인스턴스의 Clear로 복구본을 잃는 것을 방지한다. |
| 2026-07-24 | POSIX workspace는 directory `0700`, project/database 파일 `0600`으로 제한한다. | exact project JSON이 다른 로컬 계정에 읽히지 않도록 OS profile 경계 안에서도 최소 권한을 적용한다. |
| 2026-07-24 | explicit Clear 완료에는 request/recovery/project identity를 재검증하고 recovery-save 응답은 timestamp만 반환한다. | 대기 중 새 편집의 복구본을 지우는 경쟁과 불필요한 대용량 JSON IPC roundtrip을 막는다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-24 | project_lead | 기존 활성 목표를 확인하고 저장 요구사항 조사를 시작했다. |
| 2026-07-24 | repo_cartographer | 현재 native Save/Open, localStorage draft, 파일 schema, QA 접점을 조사하고 plan-1519를 제안했다. |
| 2026-07-24 | privacy_guard | 실제 사용자 home 사용, main-process 경로 소유, 원자적 쓰기, 경로/내용 비노출 기준을 제시했다. |
| 2026-07-24 | plan_keeper | 명시적 Save와 자동 복구 분리, 기존 v1/fallback 유지, 임시 home QA 전략을 제안했다. |
| 2026-07-24 | project_lead | 회의 합의에 따라 전용 브랜치와 worktree를 만들고 계획을 활성화했다. |
| 2026-07-24 | project_lead | 사용자 SQLite3 요구를 받아 repo/privacy/plan 역할과 재회의하고 plan scope를 SQLite project library로 갱신했다. |
| 2026-07-24 | harness_builder | current-user workspace, atomic project writer, SQLite schema/catalog/recovery adapter, narrow IPC와 renderer recovery mirror를 구현했다. |
| 2026-07-24 | quality_runner | SQLite workspace smoke, typecheck, build, production Electron project I/O와 guarded close-flow 1차 검증을 통과했다. |
| 2026-07-24 | review_judge | Save/Clear 경쟁, POSIX 권한, smoke workspace 누수, 넓은 IPC 응답, multi-instance recovery 충돌, v1 application-id fail-closed, verify 통합 문제를 발견했다. |
| 2026-07-24 | harness_builder | 모든 review finding을 수정하고 delayed Clear guard, single-instance, 사용자 전용 mode, 좁은 recovery 응답, smoke cleanup, application-id 무변경 거부 evidence를 추가했다. |
| 2026-07-24 | quality_runner | quality gate, repository QA, workspace/runtime/renderer/workflow/persona/desktop-entry smoke, typecheck, build, production Electron project I/O와 guarded close-flow 최종 검증을 통과했다. |
| 2026-07-24 | review_judge | 수정 후 최신 트리를 재검토하고 잔여 P0-P3 finding이 없다고 판정했다. |
| 2026-07-24 | doc_gardener | completion-summary refresh를 실행했으나 기존 external proof bundle의 current-operator sequence가 준비되지 않아 중단됐으며 기능 QA와 분리해 review에 기록했다. |

## Completion Notes

구현, QA, 독립 리뷰를 완료했다. 정상 Electron 실행은 실제 current-user home 아래 `GrooveForge/Projects`와 `GrooveForge/Data`를 지연 생성한다. portable `.grooveforge.json` 파일을 원자적으로 먼저 저장한 뒤 SQLite3 schema v1 catalog에 exact snapshot을 mirror하고, 편집 중에는 기존 localStorage와 함께 bounded singleton SQLite recovery를 debounce 기록한다. renderer는 raw SQL/database path를 받지 않으며, 정상 앱은 single-instance로 제한되고 POSIX 관리형 데이터는 사용자 전용 mode를 사용한다.

독립 리뷰에서 발견된 저장/삭제 경쟁, multi-instance 충돌, 권한, smoke 누수, IPC 응답, application-id fail-closed 및 표준 verify 통합 문제를 모두 수정했다. 최종 리뷰의 잔여 P0-P3 finding은 없다. 실제 Windows packaged 환경의 redirected profile, 한글 사용자명, ACL과 disk-full/file-lock/강제 종료 fault injection은 residual risk로 남긴다.

`npm run release:completion-summary-refresh-smoke`는 실행했지만 이 기능과 무관한 기존 external proof bundle에 ready current-operator command sequence가 없어 실패했다. private release input이나 외부 배포 작업은 이번 사용자 요청의 권한과 범위를 넘으므로 확장하지 않았다.
