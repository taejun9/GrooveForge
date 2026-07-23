# plan-1515-collab-club-research-beat

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

공개 자료를 조사해 KC의 식케이·김하온·NOWIMYOUNG에게서 연상되는 넓은 음악적 맥락을 이해한 뒤, SoundCloud에 올릴 수 있는 독창적인 힙합 비트를 stereo WAV 24-bit로 만들고 BPM·분위기·장르·태그 등 업로드 정보를 함께 작성한다.

## Goal

특정 곡이나 멤버의 고유 목소리·플로우·가사·후렴·신스·드럼·편곡을 복제하지 않고, 공개 인터뷰와 공식 발매 정보에서 확인되는 performance-first energy, freestyle-friendly freedom, new-sound exploration, 여러 래퍼가 교대하는 collaboration structure를 고수준 창작 방향으로만 번역한다. 합성 악기와 편집 가능한 이벤트만으로 132 BPM, F# minor의 melodic club trap / Korean hip-hop / pop rap instrumental을 작곡·편곡하고, stereo 44.1kHz signed PCM 24-bit WAV, format-1 MIDI, 재열기 가능한 GrooveForge project, 조사·제작·SoundCloud 업로드 문서, manifest와 QA 증거를 로컬 전달 패키지로 제공한다.

## Non-Goals

- KC 멤버의 목소리, 랩·싱잉 플로우, ad-lib, 특정 곡의 멜로디·화성·드럼·샘플링·편곡·고유 음색을 모사하지 않는다.
- KC 또는 멤버 이름을 제목, 설명, 장르 또는 태그에 사용해 공식 연관이나 `type beat`를 암시하지 않는다.
- 기존 음원, reference audio, 제3자 sample, 보컬 또는 voice clone을 사용하지 않는다.
- 기존 작품의 가사, 연애·성인·약물·폭력·과시 소재, 개인사 또는 label narrative를 결과물의 개념으로 차용하지 않는다.
- SoundCloud 계정에 실제 업로드하거나 공개·수익화·배급 설정을 변경하지 않는다.
- 생성 음원과 사용자 전달 패키지를 git에 커밋하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 오디오 렌더러: `src/audio/render.ts`
- 프로젝트·MIDI 도메인: `src/domain/workstation.ts`, `src/audio/midi.ts`
- 품질 규칙: `docs/quality/rules.md`
- 선행 조사 기반 전달: `docs/exec_plans/completed/plan-1514-trap-pocket-research-beat.md`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1515-collab-club-research-beat`와 `.worktree/plan-1515-collab-club-research-beat`에서 저장소 작업을 수행한다.
- 최종 산출물은 workspace의 ignored `build/plan-1515-collab-club-research-beat/delivery/`에 두고 저장소에는 계획·리뷰 증거만 남긴다.
- WAV는 내부 float mix에서 직접 24-bit signed integer PCM으로 양자화한다.
- 모든 음악 이벤트는 직접 작곡하고 sample-free synthesis로 렌더링한다.
- SoundCloud 안내는 2026-07-23 현재 공식 도움말 기준을 적용한다.
- 조사 문서는 관찰 사실, 그 사실에서 도출한 창작 추론, 의도적으로 제외한 요소를 분리한다.

## Implementation Plan

- [x] 공개 인터뷰와 공식 앨범·레이블 정보를 교차 확인하고, 복제가 아닌 고수준 창작 브리프를 작성한다.
- [x] 132 BPM, F# minor, 4/4에서 glassy call-and-response synth, elastic moving 808, crisp club-trap drums와 세 번의 rapper handoff를 받을 수 있는 세 개의 editable pattern을 작곡한다.
- [x] 4-bar intro / hook / verse relay / verse relay / hook / bridge / third verse / final hook의 64-bar performance-first arrangement를 구성하고 project, MIDI, float 기반 24-bit WAV를 렌더링한다.
- [x] 제목, BPM, key, genre, mood, English tags, 설명, artwork brief, privacy/license/download 권장값을 작성한다.
- [x] WAV·MIDI·project·research·metadata·manifest의 기술 및 음악적 일관성을 독립 검증한다.
- [x] QA 뒤 별도 review를 작성하고 계획을 완료로 이동해 패키지를 전달한다.

## QA Plan

- WAV가 RIFF/WAVE format 1, stereo 44.1kHz, signed PCM 24-bit, 6-byte block align인지 확인한다.
- frame count, duration, peak, RMS, DC offset, full-scale sample, terminal zero, 24-bit lower-byte activity를 독립 계산한다.
- 64 bars, 132 BPM, F# minor, three-pattern arrangement와 section별 energy/mute 구성이 project에서 다시 열리는지 확인한다.
- MIDI가 format 1, tempo 132 BPM, five tracks, 유효 note-on과 arrangement duration을 갖는지 확인한다.
- verse relay의 중역 여백, hook의 melodic lift, bridge와 intro의 대비가 section RMS와 event density에 반영되는지 확인한다.
- 조사 브리프가 출처와 창작 추론을 구분하고 direct imitation, source audio, lyric/topic borrowing 배제 사항을 명시하는지 확인한다.
- manifest hash와 실제 전달 파일 hash가 일치하는지 확인한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 originality boundary, performance energy, three-rapper handoff headroom, kick/808 중심성, melodic hook identity, 저역·피크 안전성, 24-bit 실신호, 편집 가능성, SoundCloud metadata 완전성, 권리·공개 기본값을 별도로 검토하고 `docs/reviews/plan-1515-collab-club-research-beat-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 공개 인터뷰의 performance-first energy, freestyle freedom, new-sound exploration, collaborative handoff만 고수준 영감으로 삼는다. | 사용자의 조사 요청을 반영하면서 특정 멤버의 식별 가능한 톤·플로우·표현을 복제하지 않기 위해서다. |
| 2026-07-23 | 132 BPM, F# minor, 3% swing의 melodic club trap / Korean hip-hop / pop rap instrumental로 제작한다. | halftime rap pocket, 밝고 유리 같은 hook, 탄력적인 808과 관객 반응을 받을 수 있는 클럽 에너지를 함께 확보하기 위해서다. |
| 2026-07-23 | 제목은 `NEON RELAY`로 정하고 팀·멤버명과 `type beat` 표현을 metadata에서 제외한다. | 결과물의 독립적인 정체성과 업로드 시 오인 가능성 방지를 위해서다. |
| 2026-07-23 | 기존 작품의 연애·성인·약물·폭력·과시·개인사·레이블 서사를 창작 개념에서 제외한다. | 음악적 제작 특성만 연구 대상으로 삼고 서사·메시지는 사용자의 독립적인 창작 영역으로 남기기 위해서다. |
| 2026-07-23 | 실제 업로드는 하지 않고 copy-ready 정보와 파일만 전달한다. | 외부 공개와 계정 설정은 사용자의 최종 청취·권리 확인이 필요한 별도 상태 변경이기 때문이다. |
| 2026-07-23 | -1dBFS project ceiling과 약 -1.08dBFS encoded target을 적용한다. | melodic club-trap impact를 유지하면서 SoundCloud transcoding headroom과 full-scale exclusion을 확보하기 위해서다. |
| 2026-07-23 | 최종 24-bit 양자화 전에 채널별 DC 평균을 제거하고 80ms terminal fade를 다시 적용한다. | 저역 여유와 click-free digital-zero 종료를 함께 보장하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Required feature worktree and active plan created; scope fixed to one researched but original sample-free melodic club-trap instrumental plus editable and upload-ready artifacts. |
| 2026-07-23 | plan_keeper | Research boundary fixed: public performance and collaboration context may inform a high-level brief; no source audio, sampling, transcription, team/member-name metadata, voice/flow imitation, lyric/topic borrowing, or recognizable track element is permitted. |
| 2026-07-23 | harness_builder | Composed `NEON RELAY (Original Mix)` at 132 BPM in F# minor with three editable patterns, a glassy call-and-response hook, elastic moving 808, three vocal handoff zones, and a 64-bar performance-first arrangement. |
| 2026-07-23 | harness_builder | Rendered the internal float mix directly to stereo 44.1kHz signed PCM 24-bit, removed channel DC offset before quantization, and exported a five-track format-1 MIDI plus reopenable project. |
| 2026-07-23 | privacy_guard | Prepared a source-linked research brief that separates public observations from creative inferences; excluded voice, flow, singing style, lyrics, relationship/adult/drug/violence/flex topics and personal narrative, while upload metadata omits all referenced team/member identities and defaults to Private / All Rights Reserved / Downloads Off. |
| 2026-07-23 | quality_runner | Independent WAV/MIDI/project/research/metadata/manifest audit, `file`, `afinfo`, checksum verification, repository QA, and quality gate passed. The WAV has peak -1.080dBFS, RMS -17.788dBFS, zero full-scale samples, digital-zero final frame, and 99.608% lower-byte activity. |
| 2026-07-23 | review_judge | Separate post-QA review passed with no blocking originality, artifact, metadata, ownership, privacy, or handoff finding; human listening on the user's intended playback systems remains the release check. |

## Completion Notes

- 곡: `NEON RELAY (Original Mix)` — 132 BPM, F# minor, 4/4, Melodic Club Trap / Korean Hip-Hop / Pop Rap
- 구조: 64 bars, 117.114초; suspended intro, early glassy hook, two 12-bar verse relays, hook return, drum/bass-free bridge, stripped third verse, short final hook
- WAV: stereo 44.1kHz signed PCM 24-bit, peak -1.080dBFS, RMS -17.788dBFS, hook RMS -15.842/-15.687/-15.634dBFS
- PCM: full-scale samples 0, final frame digital zero, DC offset 0.00000189 이하, 24-bit lower-byte activity 99.608%, post-musical tail nonzero samples 66,150
- MIDI: format 1, five tracks, 480 PPQ, 132 BPM, 1,968 note-ons, 122,880 ticks / 116.364-second musical duration
- 조사 경계: public interview/official release context only; no source audio, sample, transcription, voice likeness, flow/lyric/topic borrowing, team/member-name upload metadata, or recognizable track element
- 전달물: WAV, editable GrooveForge project, MIDI, research brief, production notes, SoundCloud upload sheet, generator QA, independent QA, SHA-256 manifest, README
- 사용자 전달 경로: `build/plan-1515-collab-club-research-beat/delivery/`
