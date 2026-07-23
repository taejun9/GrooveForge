# plan-1506-switchback-hiphop-remake

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

기존 MINAMI 타기팅 곡 `스위치백 (Switchback)`을 힙합 비트로 바꾸어 다시 작업한다.

## Goal

기존 곡의 D minor 정체성과 방향 전환 모티프를 유지하면서, 88 BPM의 sample-free boom-bap / modern hip-hop hybrid로 새로 작곡·편곡한다. 청취용 stereo 44.1kHz signed PCM 24-bit WAV, 편집 가능한 GrooveForge 프로젝트와 MIDI, 제작·SoundCloud 메타데이터, 기술 QA를 Downloads에 전달한다.

## Non-Goals

- 기존 완성 WAV에 단순 필터·타임스트레치만 적용하지 않는다.
- 제3자 sample, 저작권 음원, 실제 MINAMI 음성 또는 voice clone을 사용하지 않는다.
- MINAMI/RESCENE의 공식 발매·참여·승인 음원으로 표현하지 않는다.
- SoundCloud 계정에 실제 업로드하거나 공개 설정을 변경하지 않는다.

## Context Map

- 원곡 계획: `docs/exec_plans/completed/plan-1500-rescene-member-songs.md`
- 원곡 리뷰: `docs/reviews/plan-1500-rescene-member-songs-review.md`
- 원곡 24-bit 계획: `docs/exec_plans/completed/plan-1504-switchback-soundcloud.md`
- 원곡 24-bit 리뷰: `docs/reviews/plan-1504-switchback-soundcloud-review.md`
- 원곡 레퍼런스 WAV: `/Users/taejungkim/Downloads/Switchback_SoundCloud_Upload_Pack_2026-07-23/Switchback_MINAMI_Target_Pitch_Demo_24bit_44k1.wav`
- 오디오 렌더러: `src/audio/render.ts`
- 프로젝트·MIDI 도메인: `src/domain/`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1506-switchback-hiphop-remake`와 `.worktree/plan-1506-switchback-hiphop-remake`에서 저장소 작업을 수행한다.
- 사용자 음원·프로젝트 패키지는 Downloads에만 두고 커밋하지 않는다.
- 임시 생성 도구는 ignored `build/`에 두며 제품 코드를 변경하지 않는다.
- 모든 음색은 GrooveForge의 sample-free synthesis로 만든다.

## Implementation Plan

- [x] 원곡의 tempo, key, 길이, 콘셉트와 기술 기준을 확인한다.
- [x] 88 BPM, D minor, 64마디 힙합 구조와 swing drum, bass, chords, lead motif를 새로 작성한다.
- [x] GrooveForge 프로젝트를 재열기 가능한 형태로 만들고 MIDI와 float 기반 24-bit WAV를 렌더링한다.
- [x] 제작 노트와 업데이트된 SoundCloud 메타데이터를 작성한다.
- [x] WAV·MIDI·프로젝트·음악적 차별성·패키지 무결성을 검증한다.
- [x] QA 뒤 별도 review를 작성하고 계획을 완료로 이동한 다음 Downloads에 전달한다.

## QA Plan

- 프로젝트가 88 BPM, D minor, 64 arrangement bars로 재열기되는지 확인한다.
- 기존 146 BPM 전자음악 버전과 tempo·drum density·bass rhythm·arrangement fingerprint가 달라졌는지 확인한다.
- MIDI가 format 1, tempo metadata, 다중 트랙, 유효 note-on을 포함하는지 파싱한다.
- WAV가 RIFF/WAVE PCM format 1, stereo 44.1kHz, 24-bit, 6-byte block align인지 확인한다.
- peak/RMS, full-scale samples, final-frame zero, 24-bit lower-byte activity, duration, SHA-256를 검증한다.
- 프로젝트 재열기와 MIDI 재생성이 byte-identical인지 확인한다.
- 제작·업로드 문서에 BPM, key, genre, mood, tags, 구조, 권리 경계가 있는지 확인한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 힙합 전환의 실질성, Switchback 정체성 보존, 랩·보컬 공간, sample-free/voice-clone 경계, 편집 가능성, SoundCloud 오인 방지, 전달 완전성을 별도로 검토하고 `docs/reviews/plan-1506-switchback-hiphop-remake-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 146 BPM breakbeat electro에서 88 BPM boom-bap / modern hip-hop hybrid로 전환한다. | 단순 장르 라벨 변경이 아니라 체감 박자, drum pocket, bass phrasing, 랩 공간을 명확히 바꾸기 위해서다. |
| 2026-07-23 | D minor와 꺾이는 2마디 lead motif는 유지하고 화성·리듬·구조는 새로 쓴다. | 원곡의 Switchback 정체성을 잃지 않으면서 독립적인 힙합 버전을 만들기 위해서다. |
| 2026-07-23 | 결과물은 24-bit WAV와 함께 project, MIDI, production notes, SoundCloud metadata로 전달한다. | 청취뿐 아니라 후속 보컬 작업과 편집·게시 준비까지 가능하게 하기 위해서다. |
| 2026-07-23 | master output을 첫 렌더보다 2.1dB 높여 최종 peak -3.386dBFS로 정한다. | limiter를 전혀 작동시키지 않으면서 과도한 headroom을 줄이고 랩 보컬 작업 여유를 유지하기 위해서다. |
| 2026-07-23 | 원본 reference WAV는 입력·sample·time-stretch source로 쓰지 않고 hash와 기술 비교에만 사용한다. | 원본 편집 project가 이동된 상황에서도 단순 후처리가 아닌 새 힙합 작곡·편곡임을 보장하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Created plan and confirmed the retained reference WAV plus the original 146 BPM, D minor, 64-bar technical record. |
| 2026-07-23 | harness_builder | Composed a new 88 BPM, D minor, 18% swing, 64-bar boom-bap/modern hip-hop project with three drum, bass, chord, and lead patterns plus section mutes and energy changes. |
| 2026-07-23 | harness_builder | Rendered the float mix directly to stereo 44.1kHz signed PCM 24-bit and exported a reopenable GrooveForge project plus format-1 five-track MIDI. |
| 2026-07-23 | quality_runner | Generator QA and independent audit passed: 7,742,557 frames, zero full-scale samples, zero terminal frame, 99.610% lower-byte activity, byte-identical MIDI regeneration, and all manifest hashes matched. |
| 2026-07-23 | quality_runner | `file`, `afinfo`, repository QA, and quality gate passed; independent section analysis confirmed intro, verse, hook, bridge, and outro dynamics. |
| 2026-07-23 | review_judge | Post-QA review found no blocking transformation, identity, artifact, safety, or handoff issue and recorded the unavailable original-edit-project limitation. |
| 2026-07-23 | project_lead | Copied the verified nine-file, approximately 44MB package to `/Users/taejungkim/Downloads/Switchback_HipHop_Remake_Pack_2026-07-23`; directory diff and destination WAV/MIDI/project hashes passed. |

## Completion Notes

- Final WAV: `Switchback_HipHop_Remake_88BPM_24bit_44k1.wav`
- Audio: stereo 44.1kHz signed PCM 24-bit, 175.568186초, peak -3.386dBFS, RMS -19.743dBFS
- WAV SHA-256: `320bb6afd27e21acb2e8e8239c89a1d6cefd05710aa4e3745f46188c0c60797d`
- MIDI: format 1, five tracks, 480 PPQ, 2,140 note-ons, byte-identical regeneration
- Project: 88 BPM, D minor, 18% swing, boom_bap, 64 arrangement bars
- Transformation: 새 drum pocket, bass phrasing, chords, lead motif, 11-block arrangement를 만들었으며 reference WAV를 audio input으로 사용하지 않음
- Package: WAV, MIDI, GrooveForge project, production notes, SoundCloud metadata, generator QA, independent QA, README, manifest
- Final user package: `/Users/taejungkim/Downloads/Switchback_HipHop_Remake_Pack_2026-07-23`
