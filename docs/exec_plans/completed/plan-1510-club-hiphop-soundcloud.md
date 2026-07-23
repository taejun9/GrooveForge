# plan-1510-club-hiphop-soundcloud

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

SoundCloud에 올릴 수 있고 클럽에서 재생하기 좋은 힙합 트랙 비트를 stereo WAV 24-bit로 만들고, BPM·분위기·장르·태그 등 업로드에 필요한 정보를 함께 작성한다.

## Goal

저작권 음원이나 외부 sample 없이 합성 악기와 편집 가능한 이벤트만으로 독창적인 club hip-hop / trap instrumental을 작곡·편곡한다. 최종 stereo 44.1kHz signed PCM 24-bit WAV, format-1 MIDI, 재열기 가능한 GrooveForge project, 제작 노트, SoundCloud 업로드 문서, manifest와 QA 증거를 로컬 전달 패키지로 제공한다.

## Non-Goals

- SoundCloud 계정에 실제 업로드하거나 공개·수익화·배급 설정을 변경하지 않는다.
- 제3자 sample, 보컬, voice clone, 기존 상업 음원을 사용하지 않는다.
- 특정 아티스트·곡의 멜로디, 플로우, 드럼 패턴, 고유 음색을 복제하지 않는다.
- 생성 음원과 사용자 전달 패키지를 git에 커밋하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 오디오 렌더러: `src/audio/render.ts`
- 프로젝트·MIDI 도메인: `src/domain/workstation.ts`, `src/audio/midi.ts`
- 품질 규칙: `docs/quality/rules.md`
- 선행 club EDM 전달: `docs/exec_plans/completed/plan-1509-club-edm-soundcloud.md`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1510-club-hiphop-soundcloud`와 `.worktree/plan-1510-club-hiphop-soundcloud`에서 저장소 작업을 수행한다.
- 최종 산출물은 workspace의 ignored `build/plan-1510-club-hiphop-soundcloud/delivery/`에 두고 저장소에는 계획·리뷰 증거만 남긴다.
- WAV는 내부 float mix에서 직접 24-bit signed integer PCM으로 양자화한다.
- 모든 음악 이벤트는 직접 작곡하고 sample-free synthesis로 렌더링한다.
- SoundCloud 안내는 2026-07-23 현재 공식 도움말 기준을 적용한다.

## Implementation Plan

- [x] 104 BPM, G minor, 4/4 club hip-hop의 drum pocket, sliding 808, synth hook과 64-bar DJ-friendly arrangement를 설계한다.
- [x] 세 개의 editable pattern과 arrangement로 project를 만들고 MIDI와 float 기반 24-bit WAV를 렌더링한다.
- [x] 제목, BPM, key, genre, mood, English tags, 설명, artwork brief, privacy/license/download 권장값을 작성한다.
- [x] WAV·MIDI·project·manifest·문서의 기술 및 음악적 일관성을 검증한다.
- [x] QA 뒤 별도 review를 작성하고 계획을 완료로 이동해 패키지를 전달한다.

## QA Plan

- WAV가 RIFF/WAVE format 1, stereo 44.1kHz, signed PCM 24-bit, 6-byte block align인지 확인한다.
- frame count, duration, peak, RMS, DC offset, full-scale sample, terminal zero, 24-bit lower-byte activity를 독립 계산한다.
- 64 bars, 104 BPM, G minor, three-pattern arrangement와 intro/build/drop/verse/break/drop/outro 구성이 project에서 다시 열리는지 확인한다.
- MIDI가 format 1, tempo 104 BPM, five tracks, 유효 note-on과 arrangement duration을 갖는지 확인한다.
- 서로 다른 section의 RMS와 drum/bass/melody/chord density가 의도한 energy arc를 만드는지 확인한다.
- manifest hash와 실제 전달 파일 hash가 일치하는지 확인한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 club hip-hop usability, kick/808 중심성, verse 공간, hook identity, 저역·피크 안전성, 24-bit 실신호, 편집 가능성, SoundCloud metadata 완전성, 권리·공개 기본값을 별도로 검토하고 `docs/reviews/plan-1510-club-hiphop-soundcloud-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 104 BPM, G minor, straight club hip-hop / trap / electro-hop hybrid로 제작한다. | 랩 가능한 pocket과 클럽에서 분명하게 읽히는 kick/808 추진력을 함께 확보하기 위해서다. |
| 2026-07-23 | 64 bars의 compact club cut으로 만들고 앞뒤 8 bars를 DJ-friendly하게 둔다. | 현재 project 경계 안에서 mix-in/out과 빠른 hook 도달을 함께 제공하기 위해서다. |
| 2026-07-23 | 실제 업로드는 하지 않고 copy-ready 정보와 파일만 전달한다. | 외부 공개와 계정 설정은 사용자의 최종 청취·권리 확인이 필요한 별도 상태 변경이기 때문이다. |
| 2026-07-23 | -1dBFS ceiling에서 0.0567%의 bounded limiting을 유지한다. | full-scale sample 없이 hook의 club impact를 확보하고 SoundCloud transcoding headroom을 남기는 균형이기 때문이다. |
| 2026-07-23 | 최종 24-bit 양자화 전에 각 채널의 DC 평균을 제거하고 80ms terminal fade를 다시 적용한다. | PA 저역 여유와 click-free digital-zero 종료를 함께 보장하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Plan created on the required feature worktree; scope fixed to one original sample-free club hip-hop instrumental plus editable and upload-ready artifacts. |
| 2026-07-23 | harness_builder | Composed `MIDNIGHT PRESSURE (Club Mix)` at 104 BPM in G minor with three editable patterns, sliding 808 events, open verse space, and a 64-bar DJ-friendly arrangement. |
| 2026-07-23 | harness_builder | Rendered the internal float mix directly to stereo 44.1kHz signed PCM 24-bit, removed channel DC offset before quantization, and exported the five-track format-1 MIDI plus reopenable project. |
| 2026-07-23 | privacy_guard | Prepared copy-ready SoundCloud metadata with uploader-owned artist placeholders, All Rights Reserved, initial Private visibility, Downloads Off, and no-third-party-audio disclosure. |
| 2026-07-23 | quality_runner | Independent WAV/MIDI/project/metadata/manifest audit, `file`, `afinfo`, repository QA, and quality gate passed. The final WAV has peak -1.052dBFS, RMS -17.082dBFS, zero full-scale samples, digital-zero final frame, and 99.610% lower-byte activity. |
| 2026-07-23 | review_judge | Separate post-QA review passed with no blocking artifact, club hip-hop structure, metadata, ownership, or handoff finding; physical club monitoring remains a user-side release check. |

## Completion Notes

- 곡: `MIDNIGHT PRESSURE (Club Mix)` — 104 BPM, G minor, 4/4, Club Hip-Hop / Trap / Electro-Hop
- 구조: 64 bars, 148.558초; 8-bar DJ intro, build, 16-bar first hook, verse pocket, breakdown, final hook, 8-bar DJ outro
- WAV: stereo 44.1kHz signed PCM 24-bit, peak -1.052dBFS, RMS -17.082dBFS, hook RMS 약 -14.90dBFS
- PCM: full-scale samples 0, final frame digital zero, DC offset 0.00000144, 24-bit lower-byte activity 99.610%
- MIDI: format 1, five tracks, 480 PPQ, 104 BPM, 2,128 note-ons, 147.692-second musical duration
- 전달물: WAV, editable GrooveForge project, MIDI, production notes, SoundCloud upload sheet, generator QA, independent QA, SHA-256 manifest, README
- 사용자 전달 경로: `build/plan-1510-club-hiphop-soundcloud/delivery/`
