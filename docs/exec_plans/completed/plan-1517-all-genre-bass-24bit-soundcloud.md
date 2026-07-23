# plan-1517-all-genre-bass-24bit-soundcloud

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

프로젝트에서 개선할 부분과 추가 기능을 팀 회의로 찾고 구현·수정한 뒤 테스트한다. 생성 WAV를 24-bit로 만들고 SoundCloud에 올릴 수 있는 작성 내용을 정리해 Downloads에 저장한다. 추가로 GrooveForge가 808 베이스 비트만 만들 수 있는지 확인하고, 그렇다면 범용 베이스 제작이 가능하도록 수정한다.

## Goal

GrooveForge의 all-genre 약속을 실제 오디오에 연결한다. 기존 프로젝트의 `bass_808` 저장 id는 보존하면서 style profile의 `808`, `sub`, `walking`, `pluck`, `reese`, `minimal` Bass Voice와 작성된 glide를 offline render와 realtime playback에 반영하고 주요 사용자 표기를 Bass 중심으로 정리한다. 앱의 mix, stems, preview, Delivery Bundle WAV를 stereo 44.1kHz signed PCM 24-bit로 통일하고, 복사 가능한 SoundCloud 메타데이터·권리·공개·업로드 체크리스트를 로컬 Delivery Bundle과 사용자 전달 패키지에 포함한다.

## Non-Goals

- SoundCloud 계정에 로그인하거나 OAuth/token을 저장하거나 실제 업로드·공개·수익화·배급 설정을 변경하지 않는다.
- 기존 `bass_808` durable id, project file version, arrangement mute id를 이름만 바꾸기 위해 깨지 않는다.
- sample import, sample pack, 원격 AI 오디오, 계정, 분석 추적을 추가하지 않는다.
- 24-bit를 SoundCloud 필수 사양 또는 전문 mastering 보장으로 표현하지 않는다.
- 사용자 전달 WAV와 로컬 패키지를 git에 커밋하지 않는다.

## Context Map

- 회의 기록: `docs/meetings/2026-07-23-plan-1517-all-genre-bass-24bit-soundcloud.md`
- 제품 원칙: `docs/product/product.md`
- 제품 구조: `docs/architecture/product-architecture.md`
- 오디오 렌더/재생: `src/audio/render.ts`, `src/audio/scheduler.ts`
- 프로젝트 도메인: `src/domain/workstation.ts`
- 전달물: `src/audio/handoff.ts`, `src/audio/deliveryBundle.ts`
- WAV QA: `harness/scripts/run_sample_audio_qa.mjs`
- 품질 규칙: `docs/quality/rules.md`
- 개인정보·외부 행동 경계: `docs/privacy/principles.md`
- SoundCloud 공식 근거: `docs/references/official-sources.md`

## Constraints

- QA와 review를 분리한다.
- scope나 접근이 달라지면 이 계획의 Decision Log를 갱신한다.
- `codex/plan-1517-24bit-bass-soundcloud`와 `.worktree/plan-1517-24bit-bass-soundcloud`에서 저장소 작업을 수행한다.
- 24-bit PCM은 내부 Float32 render에서 직접 deterministic하게 양자화하고 무작위 dither를 넣지 않는다.
- WAV는 canonical RIFF/WAVE format 1, stereo, 44.1kHz, 24-bit, 6-byte block align, 264600 byte rate를 사용한다.
- Bass Voice와 glide의 offline/realtime 경로는 shared configuration으로 드리프트를 막는다.
- SoundCloud 문서는 2026-07-23 현재 공식 도움말을 근거로 하되 실제 외부 상태 변경은 하지 않는다.
- 최종 전달 패키지는 고유한 Downloads 하위 디렉터리에 복사하고 SHA-256 및 WAV header를 다시 검증한다.

## Implementation Plan

- [x] 공통 Bass Voice profile을 만들고 여섯 style bass voice를 distinct oscillator/envelope/filter/gain posture로 정의한다.
- [x] offline render와 realtime scheduler가 style bass voice와 연결 glide를 동일한 규칙으로 소비하게 한다.
- [x] 호환 id는 유지하면서 주요 UI, stem, MIDI, mixer 사용자 표기를 범용 Bass 중심으로 정리하고 현재 voice를 노출한다.
- [x] native mix/stem/preview/bundle WAV encoder를 deterministic signed PCM 24-bit로 전환하고 format metadata를 노출한다.
- [x] SoundCloud upload sheet generator를 추가해 title, artist/rightsholder placeholder, BPM, key, genre, mood, English tags, description, artwork brief, privacy/license/download defaults와 upload checklist를 제공한다.
- [x] Delivery Bundle manifest와 ZIP에 SoundCloud upload sheet를 포함한다.
- [x] README, product, harness, quality, official-source 문서를 새 audio/export 계약과 일치시킨다.
- [x] 대표 sample-free beat의 24-bit 전달 패키지를 생성한다.

## QA Plan

- WAV header와 PCM을 독립 파싱해 format 1, stereo, 44100Hz, 24-bit, block align 6, byte rate 264600, 완전한 frame, 유효 신호, 실제 lower-byte activity, no full-scale, terminal zero, export tail, renderer peak/RMS 허용오차를 확인한다.
- mix와 four stems, preview blob, Delivery Bundle 내부 WAV가 모두 동일한 24-bit 계약인지 확인한다.
- 즉시 재렌더 byte identity, stem isolation, solo parity, project import repair, Unicode filename identity를 유지한다.
- 동일 event/mix에서 Bass Voice별 bass stem이 유효하고 distinct하며 비-Bass stem은 영향을 받지 않는지 확인한다.
- glide on/off가 offline WAV를 실제로 바꾸고 첫 note·연결되지 않은 note에서도 안전하며 deterministic한지 확인한다.
- 기존 project가 `bass_808` id와 arrangement mute를 유지한 채 재열기·저장되는지 확인한다.
- SoundCloud upload sheet가 placeholder·권리·Private·Downloads Off·transcoded playback 체크를 포함하고 credential/실제 private value/업로드 완료 주장을 포함하지 않는지 확인한다.
- `npm run qa`, `npm run typecheck`, `npm run harness:smoke`, `npm run sample-audio:qa`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run delivery:bundle-zip-smoke`, `npm run build`를 실행한다.

## Review Plan

QA 완료 뒤 review_judge가 all-genre Bass Voice 실효성, glide parity, legacy project 호환성, 24-bit 실신호, Delivery Bundle 정합성, SoundCloud metadata 완전성, 외부 행동·권리 경계를 별도로 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 앱 전체는 808 전용이 아니지만 style `bassStyle`이 오디오에서 무시되고 UI가 808 중심인 상태를 실제 제품 결함으로 판정한다. | 14개 style과 six bass roles가 선언되어도 render/scheduler가 이를 소비하지 않아 all-genre 약속이 충분히 구현되지 않았기 때문이다. |
| 2026-07-23 | `bass_808` 저장 id는 유지하고 user-facing 명칭과 합성 동작을 Bass Voice로 확장한다. | 기존 v1 project, arrangement mute, mixer topology를 깨지 않고 사용자 오해와 실제 음색 공백을 함께 해소하기 위해서다. |
| 2026-07-23 | 작성된 glide를 이번 Bass 경로에서 offline/realtime 모두 구현한다. | UI가 connected slide를 약속하지만 현재 audio가 flag를 무시하는 인접한 사용자-visible 결함이기 때문이다. |
| 2026-07-23 | 앱 표준 WAV를 44.1kHz stereo signed PCM 24-bit로 통일한다. | 최근 전달물의 일회성 24-bit 과정을 제품에서 재현 가능하게 만들고 사용자 요구를 직접 충족하기 위해서다. |
| 2026-07-23 | SoundCloud에는 직접 업로드하지 않고 local upload sheet와 Private-first 체크리스트를 제공한다. | 계정 권한·token·외부 공개는 별도 명시 권한과 최종 권리·청취 판단이 필요한 상태 변경이기 때문이다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Registered the existing user goal and started the team meeting. |
| 2026-07-23 | repo_cartographer | Confirmed the app is not compositionally 808-only, but found the unused style bass roles and 808-heavy public naming. |
| 2026-07-23 | harness_builder | Confirmed native WAV is 16-bit and Bass glide is authored but ignored by audio/MIDI paths. |
| 2026-07-23 | quality_runner | Defined independent 24-bit PCM, lower-byte, deterministic, stem-isolation, Bass Voice, legacy, and bundle checks. |
| 2026-07-23 | privacy_guard | Kept SoundCloud support local-first and excluded account/token/upload actions. |
| 2026-07-23 | plan_keeper | Created plan-1517 on the required feature worktree. |
| 2026-07-23 | harness_builder | Added shared 808/Sub/Walking/Pluck/Reese/Minimal voice profiles, chronological Bass glide, generic Bass outputs, native signed PCM 24-bit encoding, and the local SoundCloud Upload Sheet. |
| 2026-07-23 | quality_runner | Passed static QA, strict quality gate, typecheck, production build, runtime, renderer, workflow, persona, 41-file sample-audio, delivery bundle, local package, reopen, and ZIP checks. |
| 2026-07-23 | review_judge | Found and fixed stale primary 808 wording plus storage-order-dependent glide lookup; the focused rerun passed with no blocking findings. |
| 2026-07-23 | project_lead | Copied the verified GrooveForge Sub Bass package and ZIP to `~/Downloads/GrooveForge-24bit-Sub-Bass-SoundCloud-2026-07-23`. |

## Completion Notes

- The app was not structurally limited to 808 events, but its declared style Bass Voices were ignored by audio and its primary low-end language/output names overpromoted 808. The implementation now renders six style-specific Bass Voices and actual glide while keeping `bass_808` only as the version-1 compatibility token.
- Mix, four stems, preview/export blobs, and Delivery Bundle WAVs now use RIFF/WAVE PCM format 1, stereo 44.1kHz, signed 24-bit samples, 6-byte block alignment, and 264600-byte rate. Sample QA confirmed real lower-byte activity rather than padded 16-bit data.
- Delivery Bundle and the Downloads package include a SoundCloud Upload Sheet with copy-ready metadata, placeholders, rights checks, Private-first and Downloads-Off defaults, artwork guidance, processed-stream listening checks, and official help links. No login, token, upload, publication, or external channel state was touched.
- The delivered `GrooveForge Sub Bass` project is an 8-bar K-Hip-Hop/R&B built-in-synthesis beat at 94 BPM in C minor using the Sub Bass voice. Its mix is 21.38 seconds, peak -6.82 dB, RMS -26.39 dB, and local status Ready.
- Downloads mix SHA-256: `1aa9fb4e441517ff53a46e96eee46189bf49a8b2a499b61579e07e7abb70c011`.
- Downloads ZIP SHA-256: `be5c1731479afe212856cc9503d8c29b4b3fba8774925c96cc30738dd16ee7fd`; `unzip -t` passed with no errors.
- Completion review: `docs/reviews/plan-1517-all-genre-bass-24bit-soundcloud-review.md`.
