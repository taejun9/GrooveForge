# plan-1516-collective-hardtrap-research-beat

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

공개 자료를 조사해 인디고뮤직의 컴필레이션에서 느껴지는 넓은 음악적 맥락을 이해한 뒤, SoundCloud에 올릴 수 있는 독창적인 힙합 비트를 stereo WAV 24-bit로 만들고 BPM·분위기·장르·태그 등 업로드 정보를 함께 작성한다.

## Goal

특정 레이블·아티스트·곡의 고유 목소리, 플로우, 가사, 멜로디, 드럼 시그니처 또는 편곡을 복제하지 않고, 공개 발매·수상 정보에서 확인되는 collective statement, rapper rotation, hard hip-hop/trap breadth와 performance-ready contrast를 고수준 창작 방향으로만 번역한다. 합성 악기와 편집 가능한 이벤트만으로 146 BPM, G minor의 hardcore trap / Korean hip-hop / cypher rap instrumental을 작곡·편곡하고, stereo 44.1kHz signed PCM 24-bit WAV, format-1 MIDI, 재열기 가능한 GrooveForge project, 조사·제작·SoundCloud 업로드 문서, manifest와 QA 증거를 로컬 전달 패키지로 제공한다.

## Non-Goals

- 인디고뮤직 소속·관련 아티스트의 목소리, 랩 플로우, ad-lib, 가사, 특정 곡의 멜로디·화성·드럼·샘플·편곡·고유 음색을 모사하지 않는다.
- 레이블명, 아티스트명 또는 `type beat` 표현을 제목, 설명, 장르 또는 태그에 사용해 공식 연관을 암시하지 않는다.
- 기존 음원, reference audio, 제3자 sample, 보컬 또는 voice clone을 사용하지 않는다.
- 기존 작품의 가사, 약물·폭력·과시·개인사 또는 레이블 서사를 결과물의 개념으로 차용하지 않는다.
- SoundCloud 계정에 실제 업로드하거나 공개·수익화·배급 설정을 변경하지 않는다.
- 생성 음원과 사용자 전달 패키지를 git에 커밋하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 오디오 렌더러: `src/audio/render.ts`
- 프로젝트·MIDI 도메인: `src/domain/workstation.ts`, `src/audio/midi.ts`
- 품질 규칙: `docs/quality/rules.md`
- 선행 조사 기반 전달: `docs/exec_plans/completed/plan-1515-collab-club-research-beat.md`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1516-collective-hardtrap-research-beat`와 `.worktree/plan-1516-collective-hardtrap-research-beat`에서 저장소 작업을 수행한다.
- 최종 산출물은 workspace의 ignored `build/plan-1516-collective-hardtrap-research-beat/delivery/`에 두고 저장소에는 계획·리뷰 증거만 남긴다.
- WAV는 내부 float mix에서 직접 24-bit signed integer PCM으로 양자화한다.
- 모든 음악 이벤트는 직접 작곡하고 sample-free synthesis로 렌더링한다.
- SoundCloud 안내는 2026-07-23 현재 공식 도움말 기준을 적용한다.
- 조사 문서는 관찰 사실, 그 사실에서 도출한 창작 추론, 의도적으로 제외한 요소를 분리한다.

## Implementation Plan

- [x] 공식 발매·수상 정보와 공개 비평을 교차 확인하고, 복제가 아닌 고수준 창작 브리프를 작성한다.
- [x] 146 BPM, G minor, 4/4에서 metallic minor-second motif, driven moving 808, hard-switch drums와 세 번의 rapper handoff를 받을 수 있는 세 개의 editable pattern을 작곡한다.
- [x] 4-bar intro / hook / two 12-bar verses / hook / bridge / third verse / final hook의 64-bar collective-performance arrangement를 구성하고 project, MIDI, float 기반 24-bit WAV를 렌더링한다.
- [x] 제목, BPM, key, genre, mood, English tags, 설명, artwork brief, privacy/license/download 권장값을 작성한다.
- [x] WAV·MIDI·project·research·metadata·manifest의 기술 및 음악적 일관성을 독립 검증한다.
- [x] QA 뒤 별도 review를 작성하고 계획을 완료로 이동해 패키지를 전달한다.

## QA Plan

- WAV가 RIFF/WAVE format 1, stereo 44.1kHz, signed PCM 24-bit, 6-byte block align인지 확인한다.
- frame count, duration, peak, RMS, DC offset, full-scale sample, terminal zero, 24-bit lower-byte activity를 독립 계산한다.
- 64 bars, 146 BPM, G minor, three-pattern arrangement와 section별 energy/mute 구성이 project에서 다시 열리는지 확인한다.
- MIDI가 format 1, tempo 146 BPM, five tracks, 유효 note-on과 arrangement duration을 갖는지 확인한다.
- 세 verse zone의 중역 여백, hook의 metallic motif lift, bridge와 intro의 대비가 section RMS와 event density에 반영되는지 확인한다.
- 조사 브리프가 출처와 창작 추론을 구분하고 direct imitation, source audio, lyric/topic borrowing 배제 사항을 명시하는지 확인한다.
- manifest hash와 실제 전달 파일 hash가 일치하는지 확인한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 originality boundary, collective-performance energy, three-rapper handoff headroom, kick/808 중심성, metallic hook identity, 저역·피크 안전성, 24-bit 실신호, 편집 가능성, SoundCloud metadata 완전성, 권리·공개 기본값을 별도로 검토하고 `docs/reviews/plan-1516-collective-hardtrap-research-beat-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 공개 발매·수상·비평에서 확인되는 collective statement, rapper rotation, hard hip-hop/trap breadth, performance contrast만 고수준 영감으로 삼는다. | 사용자의 자료조사 요청을 반영하면서 특정 레이블·아티스트의 식별 가능한 표현을 복제하지 않기 위해서다. |
| 2026-07-23 | 146 BPM, G minor, 4% swing의 hardcore trap / Korean hip-hop / cypher rap instrumental로 제작한다. | 빠른 표기 템포와 halftime 랩 포켓, 차가운 긴장감, 공격적인 훅 복귀를 함께 확보하기 위해서다. |
| 2026-07-23 | 제목은 `IRON CHORUS`로 정하고 레이블·아티스트명과 `type beat` 표현을 metadata에서 제외한다. | 결과물의 독립적인 정체성과 업로드 시 공식 연관 오인 가능성 방지를 위해서다. |
| 2026-07-23 | 기존 작품의 가사·약물·폭력·과시·개인사·레이블 서사를 창작 개념에서 제외한다. | 음악적 제작 특성만 연구 대상으로 삼고 메시지는 사용자의 독립적인 창작 영역으로 남기기 위해서다. |
| 2026-07-23 | 실제 업로드는 하지 않고 copy-ready 정보와 파일만 전달한다. | 외부 공개와 계정 설정은 사용자의 최종 청취·권리 확인이 필요한 별도 상태 변경이기 때문이다. |
| 2026-07-23 | -1dBFS project ceiling과 약 -1.08dBFS encoded target을 적용한다. | 하드 트랩의 impact를 유지하면서 SoundCloud transcoding headroom과 full-scale exclusion을 확보하기 위해서다. |
| 2026-07-23 | 최종 24-bit 양자화 전에 채널별 DC 평균을 제거하고 80ms terminal fade를 다시 적용한다. | 저역 여유와 click-free digital-zero 종료를 함께 보장하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Required feature worktree and active plan created; scope fixed to one researched but original sample-free hardcore-trap instrumental plus editable and upload-ready artifacts. |
| 2026-07-23 | plan_keeper | Research boundary fixed: release/review context may inform a high-level collective brief; no source audio, sampling, transcription, label/member-name metadata, voice/flow imitation, lyric/topic borrowing, or recognizable track element is permitted. |
| 2026-07-23 | harness_builder | Composed `IRON CHORUS (Original Mix)` at 146 BPM in G minor with three editable patterns, a metallic minor-second hook, driven moving 808, three vocal handoff zones, and a 64-bar collective-performance arrangement. |
| 2026-07-23 | harness_builder | Rendered the internal float mix directly to stereo 44.1kHz signed PCM 24-bit, removed channel DC offset before quantization, and exported a five-track format-1 MIDI plus reopenable project. |
| 2026-07-23 | privacy_guard | Prepared a source-linked research brief that separates public observations from creative inferences; excluded source audio, sampling, voice/flow/lyric/topic borrowing and recognizable track elements, while upload metadata omits referenced label/member identities and defaults to Private / All Rights Reserved / Downloads Off. |
| 2026-07-23 | quality_runner | Independent WAV/MIDI/project/research/metadata/manifest audit, `file`, `afinfo`, checksum verification, repository QA, and quality gate passed. The WAV has peak -1.080dBFS, RMS -16.798dBFS, zero full-scale samples, digital-zero final frame, and 99.612% lower-byte activity. |
| 2026-07-23 | review_judge | Separate post-QA review passed with no blocking originality, artifact, metadata, ownership, privacy, or handoff finding; human listening on the user's intended playback systems remains the release check. |

## Completion Notes

- 곡: `IRON CHORUS (Original Mix)` — 146 BPM, G minor, 4/4, Hardcore Trap / Korean Hip-Hop / Cypher Rap
- 구조: 64 bars, 105.955초; drum/bass-free intro, early metallic hook, two 12-bar verse handoffs, hook return, drum/bass-free bridge, dry third verse, short final hook
- WAV: stereo 44.1kHz signed PCM 24-bit, peak -1.080dBFS, RMS -16.798dBFS, hook RMS -14.886/-14.816/-14.781dBFS
- PCM: full-scale samples 0, final frame digital zero, DC offset 0.00000234 이하, 24-bit lower-byte activity 99.612%, post-musical tail nonzero samples 66,148
- MIDI: format 1, five tracks, 480 PPQ, 146 BPM, 2,188 note-ons, 122,880 ticks / 105.206-second musical duration
- 조사 경계: official award/public release context only; no source audio, sample, transcription, voice likeness, flow/lyric/topic borrowing, label/member-name upload metadata, or recognizable track element
- 전달물: WAV, editable GrooveForge project, MIDI, research brief, production notes, SoundCloud upload sheet, generator QA, independent QA, SHA-256 manifest, README
- 사용자 전달 경로: `build/plan-1516-collective-hardtrap-research-beat/delivery/`
