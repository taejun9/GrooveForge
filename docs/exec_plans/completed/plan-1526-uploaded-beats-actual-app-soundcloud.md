# plan-1526-uploaded-beats-actual-app-soundcloud

## Status

completed

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

- [x] 원본 hash와 대응 GrooveForge project의 byte identity를 별도 증거로 보존한다.
- [x] 실제 Electron 앱에서 두 원본 프로젝트를 각각 Open하고 Compose, Arrange, Mix, Deliver 상태를 확인한다.
- [x] `SUNDAY ENGINE`을 원래 140 BPM의 112-bar, 약 3분 13초 extended arrangement로 만든다.
- [x] `문 없는 방`을 원래 110 BPM의 80-bar, 약 2분 55초 extended arrangement로 만든다.
- [x] 앱의 64-bar 한도 안에서 곡별 movement 프로젝트를 실제 UI로 저장하고 WAV를 실제 UI로 export한다.
- [x] 앱 export의 musical boundary와 tail을 검증해 movement를 짧은 click-safe 경계로 연결하고 최종 24-bit WAV를 만든다.
- [x] 제목, BPM, key, 장르, 분위기, English tags, 한글 설명, 권리·공개 기본값과 업로드 체크리스트를 곡별 한글 문서로 작성한다.
- [x] 기술 QA, 구조 QA, source-preservation QA와 별도 post-QA review를 수행한다.
- [x] 검증된 패키지를 Downloads의 새 고유 폴더에 복사하고 그 위치에서 checksum과 파일 형식을 재검증한다.

## Executed Arrangement

실제 앱의 section label은 원본 블록 순서를 유지했고, 들리는 역할은 Pattern A/B/C, energy, bars, track mute로 만들었다. 아래 값은 저장 후 다시 열린 실제 렌더러에서 exact match를 확인한 최종 상태다.

`SUNDAY ENGINE` 1부 64 bars:

1. Intro / A / 8 bars / 0.28 / Drums·Bass·Synth mute
2. Verse / A / 8 bars / 0.44 / Bass·Synth mute
3. Verse / A / 8 bars / 0.62 / Synth mute
4. Hook / B / 8 bars / 0.78 / all tracks
5. Hook / A / 16 bars / 0.96 / all tracks
6. Verse / B / 16 bars / 0.78 / all tracks

`SUNDAY ENGINE` 2부 48 bars:

1. Intro / A / 8 bars / 0.82 / all tracks
2. Verse / B / 8 bars / 0.96 / all tracks
3. Verse / A / 8 bars / 1.00 / all tracks
4. Hook / B / 8 bars / 0.88 / all tracks
5. Hook / C / 8 bars / 0.48 / Bass mute
6. Verse / C / 8 bars / 0.20 / Drums·Bass·Synth mute

따라서 실제 청감 구조는 저밀도 8-bar intro, 16-bar build, 8-bar lift, 16-bar first peak, 24-bar drive/re-entry, 24-bar final peak/release, 8-bar bassless afterglow, 8-bar sparse outro다. 중간 breakdown이 아니라 final peak 뒤에 리듬과 저역을 걷는 afterglow가 있다는 점을 SoundCloud 설명에도 그대로 반영했다.

`문 없는 방` 1부 64 bars:

1. Intro / C / 8 bars / 0.20 / Drums·Bass mute
2. Verse / A / 16 bars / 0.52 / Synth mute
3. Bridge / A / 8 bars / 0.62 / all tracks
4. Hook / B / 8 bars / 0.88 / all tracks
5. Bridge / C / 8 bars / 0.28 / Drums·Bass mute
6. Hook / B / 8 bars / 0.94 / all tracks
7. Outro / A / 8 bars / 0.74 / all tracks

`문 없는 방` 2부 16 bars:

1. Intro / B / 8 bars / 0.98 / all tracks
2. Verse / A / 4 bars / 0.42 / Bass mute
3. Bridge / C / 4 bars / 0.20 / Drums·Bass·Synth mute

문 없는 방은 1부 첫 bar에 fade-in steps 0–16만, 2부 마지막 bar에 fade-out steps 240–256만 적용했다. 실제 청감 구조는 sparse intro, extended verse, development, first hook, reflective break, second hook/re-entry, final hook, 8-bar release/outro다.

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
| 2026-08-15 | 재현 가능한 실제 앱 movement 편집을 `desktop:movement-qa` 명령으로 제품 운영 문서 네 곳에 공개한다. | 표준 QA가 새 명령의 공개 명령 목록 누락을 발견했으며, 실제 GUI 증거 경로도 다른 데스크톱 운영 명령과 같은 수준으로 문서화해야 하기 때문이다. |
| 2026-08-15 | native select의 불안정한 platform 동작을 우회해 section label은 원본 순서를 유지하고 audible structure는 pattern, energy, bars, mute로 확정한다. | 실제 음악 렌더를 결정하는 조절값을 재현 가능하게 편집하면서 원본 이벤트·음색을 보존하기 위해서다. 완료 문서에는 실제 label과 audible 역할을 함께 기록한다. |
| 2026-08-15 | post-QA 심사에서 지적한 reopen/source 증거 범위를 코드로 보강하고 네 movement를 fresh workspace에서 모두 재실행한다. | 저장 파일만이 아니라 재열린 실제 renderer의 arrangement/automation exact state와 앱 종료 뒤 외부 source hash 불변성을 직접 증명하기 위해서다. |
| 2026-08-15 | 전달 QA JSON의 worktree 절대 경로를 `WORKTREE_REDACTED`로 치환한다. | 수치와 hash 증거를 보존하면서 패키지 공유 시 로컬 사용자명과 삭제될 작업 경로를 노출하지 않기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-08-15 | project_lead | Plan created after proving both uploaded WAVs have byte-identical GrooveForge source projects and recording the current no-WAV-import limitation. |
| 2026-08-15 | harness_builder | Added a spec-driven visible native movement QA path and deterministic PCM24 movement assembler, then hardened live reopen and external-source postflight evidence after review. |
| 2026-08-15 | quality_runner | Ran four fresh actual-app movements at 64/48/64/16 bars; all reported failures empty, source/core preservation, exact reopened arrangement/automation, native WAV export, Save and reopen success. |
| 2026-08-15 | quality_runner | Reassembled deterministic final WAVs at 192.730s and 175.343651s; verified stereo 44.1kHz PCM24, -1.2dBFS sample peak, zero full-scale samples, terminal zero, clip-free output, and unchanged final hashes. |
| 2026-08-15 | quality_runner | Initial repository QA found four command-catalog omissions; documented `desktop:movement-qa`, reran QA, and passed both standard QA and quality gate. |
| 2026-08-15 | project_lead | Delivered 29 sanitized files to `Downloads/GrooveForge-업로드비트-확장곡-SoundCloud-2026-08-15`; destination manifest, actual-app evidence, WAV format, and original hashes passed final revalidation. |
| 2026-08-15 | review_judge | Independent post-QA review closed the earlier reopen, external-source, arrangement-description, and local-path findings; final verdict is P0 0 / P1 0 / P2 0 / P3 0. |
| 2026-08-15 | plan_keeper | Marked the plan complete after the final SoundCloud checklist wording, destination manifest, repository QA, and review mirror were revalidated. |

## Completion Notes

- 실제 GrooveForge 앱에서 두 업로드 WAV와 byte-identical한 원본 event project를 열어 64/48/64/16-bar movement 네 개를 native UI로 편집, WAV export, Save, reopen했다. 현재 앱이 WAV 자체를 import하지 못한다는 제한은 전달 문서에 그대로 명시했다.
- `SUNDAY ENGINE` 최종 WAV는 192.730초, SHA-256 `95a7a0fd88f6a1d5e3a3c7f2db0ace396ecad68e67cc48f77b76123ce5897d6b`; `문 없는 방`은 175.343651초, SHA-256 `509733bfd6498a835459744f9d0a57efaa8993c87d3b51264a3ca47af16a0f14`다. 둘 다 stereo 44.1kHz signed PCM 24-bit, sample peak 최대 -1.2dBFS, full-scale sample 0, terminal digital zero이며 `afclip`에 clipping이 보고되지 않았다.
- 두 movement는 20ms unity-sum seam, 15Hz DC blocker, 80ms terminal fade와 deterministic TPDF dither로 조립했다. 원본 WAV와 source project의 SHA-256은 작업 전후 동일하다.
- Downloads 전달 폴더에는 최종 WAV 2개, 한글 README·곡별 SoundCloud 자료·제작/QA 보고서·manifest, 재편집 가능한 movement project 4개, actual-app 보고서와 화면 증거를 포함해 29개 파일이 있다. manifest는 자기 자신을 제외한 28개 파일을 모두 검증한다.
- 저장소 QA와 quality gate, 네 실제 앱 movement 실행, 패키지 독립 감사가 통과했다. 최종 review verdict는 P0 0 / P1 0 / P2 0 / P3 0이다.
- 잔여 범위: 자동 수치 검증은 사람의 헤드폰/스피커 전곡 청취, LUFS/true-peak mastering 판단, SoundCloud 변환 스트림 확인을 대신하지 않는다. 실제 업로드·공개는 하지 않았고, 공개 전 아티스트/권리자 placeholder 교체와 권리 확인이 필요하다.
