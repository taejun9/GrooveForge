# plan-1522-composition-workflow-genre-qa

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

프로그램에 추가하거나 수정할 만한 기능을 모두 반영하고 실제 테스트에서 발견되는 버그를 고친다. 발라드, 힙합, R&B 등 여러 장르를 번갈아 테스트해 SoundCloud 업로드 준비가 된 음원을 Downloads에 정리한다.

## Goal

현재 코드와 직전 하드웨어 갭 감사를 다시 대조해 이번 릴리스에서 안전하게 닫을 수 있는 기능 공백을 완성하고, 정적·도메인·오디오·renderer·desktop QA를 반복해 발견한 회귀를 수정한다. 전체 StyleProfile을 실제 24-bit WAV로 검증하고 발라드·힙합·R&B를 포함한 대표 장르 전달 패키지를 로컬에서 재현 가능하게 생성해 사용자 Downloads의 고유 폴더에 SoundCloud private-first 업로드 자료와 함께 정리한다.

## Non-Goals

- SoundCloud 로그인, 업로드, 공개, 수익화, 배급, Content ID 또는 사용자 계정 상태를 변경하지 않는다.
- sample import, 오디오 녹음, plugin hosting, cloud sync, 원격 AI, 계정, 결제, 분석을 core workflow로 승격하지 않는다.
- 물리 MIDI 장치나 전문 mastering 환경 없이 hardware latency, LUFS/true-peak, 플랫폼 transcoding 품질을 검증했다고 주장하지 않는다.
- 기존 version-1 project를 깨는 일괄 schema 교체를 검증 없이 수행하지 않는다.
- 사용자 전달 WAV와 ZIP을 git에 커밋하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 제품 구조: `docs/architecture/product-architecture.md`
- 직전 갭 감사: `docs/exec_plans/completed/plan-1521-hardware-workflow-gap.md`
- 도메인과 UI: `src/domain/workstation.ts`, `src/ui/App.tsx`, `src/ui/workstationComposePanels.tsx`
- 오디오: `src/audio/scheduler.ts`, `src/audio/render.ts`, `src/audio/deliveryBundle.ts`, `src/audio/soundcloud.ts`
- 테스트: `harness/scripts/run_qa.py`, `harness/scripts/run_runtime_smoke.mjs`, `harness/scripts/run_renderer_smoke.mjs`, `harness/scripts/run_sample_audio_qa.mjs`
- 품질·개인정보: `docs/quality/rules.md`, `docs/privacy/principles.md`

## Constraints

- 저장소 작업은 `codex/plan-1522-composition-workflow-genre-qa`와 `.worktree/plan-1522-composition-workflow-genre-qa`에서 수행한다.
- QA와 review를 분리하고 review는 QA 완료 뒤 시작한다.
- scope나 접근이 달라질 때 Decision Log를 갱신한다.
- 새 schema는 기존 project import/roundtrip과 deterministic render를 보존한다.
- 모든 기능은 domain, UI, realtime playback, offline render/export, save/load, Undo/recovery 중 적용되는 경계를 끝까지 연결한다.
- Downloads 쓰기는 최종 검증된 산출물에 한하며 고유 디렉터리를 사용한다.

## Implementation Plan

- [x] 현재 전체 QA와 코드/UX 감사를 실행해 실패와 실제 기능 공백을 기록한다.
- [x] flexible Track/Device, multi-bar Pattern, Live Capture 2, automation/queue, Web MIDI sync 후보를 호환성·물리 장치 검증·작업 크기 기준으로 감사하고 독립 후속 계획으로 분리한다.
- [x] 사용자 요청에 명시됐지만 기존 profile에 없던 Ballad와 일반 Hip-Hop을 StyleProfile, Beat Blueprint, Pattern A/B/C, Composer Action, style contrast, sound/mixer에 끝까지 연결한다.
- [x] 고정된 14개 장르 기대값을 현재 StyleProfile 수에서 파생하도록 renderer/persona/문서를 수정한다.
- [x] 전체 16개 style matrix와 대표 발라드·힙합·R&B 프로젝트를 deterministic 24-bit WAV 및 delivery bundle로 생성한다.
- [x] 검증된 대표 장르 패키지, checksum, 청취/업로드 체크리스트를 Downloads 고유 폴더에 정리한다.
- [x] QA 이후 독립 리뷰를 수행하고 발견 사항을 수정한 뒤 계획과 review mirror를 완료한다.

## QA Plan

- `git diff --check`
- `npm run qa`
- `npm run typecheck`
- `npm run build`
- `npm run renderer:smoke`
- `npm run workflow:smoke`
- `npm run persona:smoke`
- `npm run harness:smoke`
- `npm run sample-audio:qa`
- local delivery package/reopen/ZIP smoke
- 변경 기능별 직접 회귀 테스트와 실제 Electron 화면·재생 검증
- 최종 `npm run release:check`
- Downloads WAV header, duration, peak/RMS, digital-zero tail, SHA-256, ZIP CRC 재검증

## Review Plan

QA 완료 뒤 review_judge가 schema 호환성, realtime/offline parity, deterministic audio, Undo/recovery, 접근성, 장르 편향, 개인정보·외부 행동 경계, 전달 패키지 정합성을 독립 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-29 | 직전 plan-1521의 검증된 후속 순위를 초기 범위로 사용한다. | 이미 공식 하드웨어 자료와 구현 근거를 대조해 중복 기능과 sampling-first 편향을 제거한 목록이기 때문이다. |
| 2026-07-29 | 기존 14개 profile에 Ballad와 일반 Hip-Hop을 추가하고 전체 16개 StyleProfile matrix를 자동 렌더하며, 발라드·힙합·R&B는 별도 사용자 전달 패키지로 만든다. | 사용자가 명시한 대표 장르 중 기존에 없던 두 장르를 실제 제품 데이터로 추가하고 폭넓은 회귀 범위와 업로드 준비 산출물을 함께 증명하기 위해서다. |
| 2026-07-29 | 실제 SoundCloud 업로드는 하지 않고 private-first upload sheet를 포함한다. | 외부 계정·권리·공개 결정은 사용자 승인이 필요한 별도 상태 변경이기 때문이다. |
| 2026-07-29 | flexible Track/Device, multi-bar Pattern, Live Capture 2, automation/queue, Web MIDI sync는 이번 구현 묶음에서 보류하고 독립 후속 계획으로 다룬다. | 프로젝트 schema, 모든 편집·재생·렌더 경로, 물리 장치 검증을 동시에 바꾸는 장기 로드맵을 장르 전달 작업에 섞으면 기존 project 호환성과 테스트 신뢰도를 떨어뜨리기 때문이다. 이번 릴리스의 실제 공백은 명시된 장르 지원과 재현 가능한 전 장르 오디오 QA였다. |
| 2026-07-29 | 장르 전달 생성기는 저장소의 고정된 ignored build 디렉터리만 재생성하고 임의 `--output` 삭제를 허용하지 않는다. | 사용자 지정 경로를 재귀 삭제할 수 있는 위험을 review 전에 제거하기 위해서다. Downloads 전달은 검증 뒤 별도 복사한다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-29 | project_lead | 활성 goal을 확인하고 깨끗한 main, 활성 계획 없음, 기존 1,521개 완료 계획과 직전 하드웨어 갭 로드맵을 조사했다. |
| 2026-07-29 | plan_keeper | 전용 branch/worktree와 plan-1522를 열고 기능 완성, 전체 QA, 장르별 전달 범위를 등록했다. |
| 2026-07-29 | harness_builder | Ballad/Hip-Hop profile과 blueprint를 추가하고 모든 16개 style을 순환 렌더·재열기·24-bit WAV·stem·결정론·SoundCloud sheet로 검사하는 로컬 생성기를 구현했다. |
| 2026-07-29 | quality_runner | 기준 QA와 집중 renderer/workflow/persona/runtime/audio 검사를 통과했으며 Ballad 초기 레벨을 실제 렌더 분석으로 조정했다. 승인된 비샌드박스 GUI 권한의 전체 `npm run release:check`도 종료 코드 0으로 통과했다. |
| 2026-07-29 | privacy_guard | SoundCloud 자료가 placeholder, Private-first, Downloads Off, monetization/distribution/Content ID Off를 유지하고 네트워크·업로드·개인값 기록을 수행하지 않음을 확인했다. |
| 2026-07-29 | review_judge | QA 완료 뒤 독립 diff/schema/render/privacy/delivery 리뷰를 수행했으며 blocking 또는 follow-up code finding이 없었다. |
| 2026-07-29 | plan_keeper | 54개·176 MB 전달물을 `/Users/taejungkim/Downloads/GrooveForge-SoundCloud-Genre-Rotation-2026-07-29`에 복사하고 그 위치에서 53개 checksum과 3개 ZIP CRC를 재검증했다. |

## Completion Summary

- Ballad와 일반 Hip-Hop을 기존 14개 style과 같은 편집·저장·렌더·export 경로에 추가해 전체 16개 style/blueprint를 제공한다.
- 16장르를 정확히 한 번씩 순환하는 재현 가능한 24-bit WAV 전달 생성기와 `npm run genre-rotation:delivery` 검증 gate를 추가했다.
- 발라드·힙합·R&B에는 11개 artifact Delivery Bundle ZIP을 제공하고, 모든 장르에 project/full-mix/SoundCloud sheet를 제공한다.
- 전체 release check, 실제 Electron 소스/패키징/ad-hoc/PKG payload/임시 설치본 GUI, 프로젝트 IO, 오디오, ZIP, 개인정보 경계가 통과했다.
- Downloads 전달본의 54개 파일, 53개 자기 자신을 제외한 SHA-256 항목, 3개 ZIP CRC를 최종 위치에서 재검증했다.
- 사람의 청취·LUFS/true-peak mastering·권리/metadata 확정·SoundCloud 변환 스트림 승인과 실제 공개는 사용자 단계로 남긴다.
