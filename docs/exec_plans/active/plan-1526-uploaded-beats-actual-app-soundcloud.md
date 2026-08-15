# plan-1526-uploaded-beats-actual-app-soundcloud

## Status

active

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

업로드한 `05_SUNDAY_ENGINE_MASTER.wav`와 `문-없는-방-demo.wav`를 실제 GrooveForge 앱에서 각각 2분 30초~4분 30초 길이의 곡으로 만들고, SoundCloud에 올릴 수 있도록 한글 자료와 함께 Downloads에 정리한다.

## Goal

두 WAV와 byte-identical한 GrooveForge 원본 프로젝트를 격리된 실제 Electron 앱에서 열어 원래 BPM, key, editable events와 음색을 보존하면서 장편 편곡을 만든다. 앱이 렌더한 구간만 사용해 최종 stereo 44.1kHz signed PCM 24-bit WAV를 조립하고, 한글 SoundCloud 메타데이터·권리 확인·Private-first 체크리스트·검증 보고서·SHA-256 manifest를 Downloads의 새 폴더에 전달한다.

## Non-Goals

- SoundCloud 계정 로그인, 실제 업로드, 공개, 다운로드 허용, 수익화, 배급 또는 Content ID 설정을 변경하지 않는다.
- 업로드 WAV를 앱이 직접 import한 것처럼 주장하지 않는다. 현재 앱은 project JSON만 열 수 있다.
- 원본 WAV, 기존 Delivery Bundle, plan-1525 증거, 사용자 프로젝트 또는 기존 Electron 세션을 수정하지 않는다.
- 전문 mastering, LUFS/true-peak 인증 또는 사람의 전체 청취 승인을 자동 검사와 동일하게 주장하지 않는다.
- sampling-first 제품 방향이나 일반 목적 sampler/audio-clip 기능을 이번 전달 작업에 추가하지 않는다.

## Source Proof

- `05_SUNDAY_ENGINE_MASTER.wav`: SHA-256 `e6ebb80c68c98ad6fba4711cb170733b43f8098daffcffa07365556471acaadd`, 28.178571초, stereo 44.1kHz signed PCM 24-bit. 기존 `05_SUNDAY_ENGINE_DELIVERY_BUNDLE.zip`의 `first-guided-beat-demo.wav`와 byte-identical하며 같은 ZIP에 `first-guided-beat.grooveforge.json`이 있다.
- `문-없는-방-demo.wav`: SHA-256 `0a457fb10cf3cec454882afc26a6bb31d46bfe5e9cb7704d06e6a29bb220a062`, 44.454558초, stereo 44.1kHz signed PCM 24-bit. plan-1525 actual-app evidence WAV와 byte-identical하며 대응 프로젝트는 `build/desktop/plan-1525-final-evidence/final-current-song/Projects/문-없는-방.grooveforge.json`이다.

## Context Map

- 실제 앱/프로젝트 상태: `src/ui/App.tsx`, `src/domain/workstation.ts`
- 오디오 렌더·24-bit WAV: `src/audio/render.ts`
- SoundCloud handoff: `src/audio/soundcloud.ts`, `src/audio/deliveryBundle.ts`
- 실제 Electron QA: `electron/main.ts`, `harness/scripts/run_desktop_manual_qa.mjs`
- 품질 규칙: `docs/quality/rules.md`
- 선행 actual-app 곡 QA: `docs/exec_plans/completed/plan-1525-mystic-song-actual-app-qa.md`

## Constraints

- QA와 review를 분리한다.
- 저장소 작업은 `codex/plan-1526-uploaded-beats-actual-app-soundcloud`와 `.worktree/plan-1526-uploaded-beats-actual-app-soundcloud`에서 수행한다.
- 실제 앱은 사용자 데이터와 분리된 plan 전용 workspace, Electron userData, Open/Save/exports 경로만 사용한다.
- 음악 편집의 source of truth는 실제 앱에서 저장한 프로젝트와 실제 앱이 export한 WAV다. 직접 JSON 편집으로 UI 사용을 가장하지 않는다.
- 프로젝트당 64-bar 제품 한도를 유지한다. 한 곡이 64 bars를 넘으면 실제 앱에서 별도 movement를 저장·렌더한 뒤 로컬 PCM 조립 단계에서 bar boundary를 연결한다.
- 최종 WAV는 150~270초, stereo 44.1kHz signed PCM 24-bit, sample peak -1.0dBFS 이하 목표, full-scale sample 0, terminal digital zero를 만족해야 한다.

## Implementation Plan

- [ ] 원본 hash와 대응 GrooveForge project의 byte identity를 별도 증거로 보존한다.
- [ ] 실제 Electron 앱에서 두 원본 프로젝트를 각각 Open하고 Compose, Arrange, Mix, Deliver 상태를 확인한다.
- [ ] `SUNDAY ENGINE`을 원래 140 BPM의 112-bar, 약 3분 13초 extended arrangement로 만든다.
- [ ] `문 없는 방`을 원래 110 BPM의 80-bar, 약 2분 55초 extended arrangement로 만든다.
- [ ] 앱의 64-bar 한도 안에서 곡별 movement 프로젝트를 실제 UI로 저장하고 WAV를 실제 UI로 export한다.
- [ ] 앱 export의 musical boundary와 tail을 검증해 movement를 짧은 click-safe 경계로 연결하고 최종 24-bit WAV를 만든다.
- [ ] 제목, BPM, key, 장르, 분위기, English tags, 한글 설명, 권리·공개 기본값과 업로드 체크리스트를 곡별 한글 문서로 작성한다.
- [ ] 기술 QA, 구조 QA, source-preservation QA와 별도 post-QA review를 수행한다.
- [ ] 검증된 패키지를 Downloads의 새 고유 폴더에 복사하고 그 위치에서 checksum과 파일 형식을 재검증한다.

## Arrangement Direction

- `SUNDAY ENGINE`: 8-bar intro, 24-bar development, 16-bar hook, 8-bar breakdown, 32-bar drive/final hook, 24-bar outro/reprise. 원본 140 BPM과 sample-free GrooveForge synth/drum identity를 유지한다.
- `문 없는 방`: 8-bar intro, 16-bar verse, 16-bar hook, 8-bar reflective break, 16-bar verse variation, 8-bar final hook, 8-bar outro. 원본 110 BPM, D minor, Experimental profile과 여백·질문 중심의 신비로운 정서를 유지한다.

## QA Plan

- 원본 두 WAV와 source project/archive가 작업 전후 byte-identical인지 SHA-256으로 확인한다.
- 실제 앱 Open/Save/reopen과 Compose/Arrange/Mix/Deliver, arrangement playback, rendered preview, WAV export의 성공 증거를 기록한다.
- 각 movement project가 64 bars 이하이고 곡별 합계가 112/80 bars인지 확인한다.
- 최종 WAV header, frame count, duration, peak, RMS, DC offset, full-scale sample count, lower-byte activity, final frame, join-boundary discontinuity를 독립 계산한다.
- `afinfo`, `afclip`, `file`, manifest SHA-256을 교차 검증한다.
- `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`와 변경 범위에 맞는 renderer/runtime/desktop checks를 실행한다.
- 사람 청취가 필요한 전체 곡, 헤드폰/스피커, SoundCloud processed stream 확인은 사용자 체크리스트에 남긴다.

## Review Plan

QA 완료 후 review_judge가 actual-app provenance, 원본 보존, arrangement continuity, 24-bit signal, 150~270초 길이, clipping/DC/join 안전성, SoundCloud 문서 완전성, 권리·외부 행동 경계를 독립 검토하고 `docs/reviews/plan-1526-uploaded-beats-actual-app-soundcloud-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-08-15 | WAV import 기능을 새로 만들지 않고 byte-identical 원본 프로젝트를 실제 앱에서 편곡한다. | 현재 GrooveForge는 event-based project만 열 수 있지만 두 업로드 WAV 모두 정확한 원본 프로젝트가 있어 음악적 source와 실제 앱 사용을 함께 보존할 수 있기 때문이다. |
| 2026-08-15 | 원래 140/110 BPM을 유지하고 64 bars를 넘는 곡은 앱에서 movement별로 렌더한 뒤 PCM 경계 조립한다. | BPM을 103 이하로 강제로 낮추는 것보다 원곡 groove를 보존하며, 제품의 검증된 64-bar 한도를 변경하지 않기 위해서다. |
| 2026-08-15 | 최종 길이는 Sunday 112 bars, 문 없는 방 80 bars로 정한다. | 각각 약 3분 13초와 2분 55초로 사용자 범위 안이며 intro, development, contrast, final hook, outro를 충분히 만들 수 있기 때문이다. |
| 2026-08-15 | 실제 SoundCloud 업로드는 하지 않고 Private-first 한글 자료와 로컬 파일만 전달한다. | 계정·권리·공개·수익화 결정은 사용자의 최종 청취와 명시적 외부 행동이 필요한 별도 단계이기 때문이다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-08-15 | project_lead | Plan created after proving both uploaded WAVs have byte-identical GrooveForge source projects and recording the current no-WAV-import limitation. |
