# plan-1500-rescene-member-songs

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

RESCENE의 워니, 리브, 미나미, 메이, 제나 각 멤버에게 어울리는 곡을 2곡씩, 총 10곡 작곡한다.

## Goal

2026-07-23 기준 공개 인터뷰와 직전 RESCENE 리서치를 멤버별로 재검증하고, 각 멤버의 공개된 음색·무대 강점·캐릭터를 서로 다른 두 방향으로 확장한 독창적인 솔로 피치 데모 10곡을 만든다. 각 곡은 청취 가능한 WAV, 편집 가능한 MIDI와 GrooveForge 프로젝트, 전체 한국어 가사, 보컬·프로덕션 메모를 포함해 Downloads에 전달한다.

## Non-Goals

- 실제 멤버의 음성을 복제하거나 멤버가 직접 부른 공식 음원처럼 표현하지 않는다.
- 기존 RESCENE 곡이나 직전 송북 10곡의 멜로디·가사·편곡을 재사용하지 않는다.
- 비공개 신상, 추측성 성격 묘사, 회사·아티스트 승인 또는 상업적 발매 가능성을 주장하지 않는다.
- 생성 음원과 사용자 전달 패키지를 저장소에 커밋하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 품질 규칙: `docs/quality/rules.md`
- 직전 완료 계획: `docs/exec_plans/completed/plan-1499-rescene-songbook.md`
- 직전 리뷰: `docs/reviews/plan-1499-rescene-songbook-review.md`
- 오디오 렌더러: `src/audio/`
- 프로젝트 및 MIDI 도메인: `src/domain/`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1500-rescene-member-songs`와 `.worktree/plan-1500-rescene-member-songs`에서 작업한다.
- 저작권 음원, 외부 샘플, 보이스 클로닝, 원격 AI 음성 합성을 사용하지 않는다.
- 멤버별 2곡은 같은 캐릭터를 반복하지 않고 대비되는 두 가지 아티스트 가능성을 보여 준다.
- 최종 산출물은 Downloads에 전달하고 저장소에는 계획·리뷰 증거만 남긴다.

## Implementation Plan

- [x] 공식 프로필과 직접 인터뷰를 중심으로 다섯 멤버의 공개 강점을 재검증한다.
- [x] 멤버별로 대비되는 두 개의 장르·음역·서사·향기 콘셉트를 설계한다.
- [x] 총 10곡의 오리지널 멜로디, 화성, 리듬, 64마디 편곡과 전체 한국어 가사를 작성한다.
- [x] 샘플 없는 합성 악기로 WAV, MIDI, GrooveForge 프로젝트를 생성한다.
- [x] 직전 송북과 이번 송북 내부의 중복, 파일 형식, 음량, 클리핑, 해시, 재열기 가능성을 검증한다.
- [x] QA 뒤 독립 리뷰를 작성하고 완료 계획으로 이동한 다음 Downloads에 전달한다.

## QA Plan

- 정확히 5명 × 2곡 = 10곡인지 manifest로 검증한다.
- WAV가 stereo 44.1kHz 16-bit PCM이며 유효 신호, 안전한 peak, 무 full-scale sample, terminal zero를 갖는지 확인한다.
- MIDI가 format 1, 다중 트랙, tempo와 충분한 note-on을 포함하는지 파싱한다.
- 모든 프로젝트가 현재 GrooveForge 파서로 64마디 재열기되고 MIDI를 재생성하는지 확인한다.
- 각 가사 문서에 완전한 곡 구조, 음역·호흡·보컬 방향, 무대 표현, 프로덕션 메모가 있는지 확인한다.
- 이번 10곡의 멜로디 지문이 서로 고유하고 직전 10곡의 지문과도 겹치지 않는지 확인한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 멤버별 근거의 과장 여부, 2곡 간 대비, 산출물 완전성, 독창성·개인정보 경계, 보컬 데모의 한계를 별도로 검토하고 `docs/reviews/plan-1500-rescene-member-songs-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 다섯 멤버별 정확히 두 곡, 총 10곡으로 범위를 정한다. | 사용자 수량 요구를 명확하게 충족하고 멤버별 비교가 가능하게 하기 위해서다. |
| 2026-07-23 | 각 멤버에게 대표 강점을 살린 곡과 예상 밖 확장성을 보여 주는 곡을 한 곡씩 배정한다. | 공개 이미지를 단순 반복하거나 한 가지 성격으로 고정하지 않기 위해서다. |
| 2026-07-23 | 실제 보컬 대신 신스 톱라인이 포함된 인스트루멘털 피치 데모를 만든다. | 보이스 클로닝 없이 작곡·편곡과 음역 의도를 편집 가능한 형태로 전달하기 위해서다. |
| 2026-07-23 | 각 곡은 64마디 WAV, format-1 5트랙 MIDI, 재열기 가능한 프로젝트, 전체 가사로 전달하고 stems는 제외한다. | 실제 보컬 세션에 필요한 편집 가능성을 유지하면서 10곡 패키지를 약 245MB로 제한하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Plan created. |
| 2026-07-23 | repo_cartographer | Revalidated the official five-member lineup, direct member statements, the 2025 NME interview, LIV's 2026 OST, and MINAMI's 2025 feature before defining two contrasting solo lanes per member. |
| 2026-07-23 | harness_builder | Created ten original 64-bar member pitches with complete Korean lyrics, synth topline guides, WAV, MIDI, and reopenable GrooveForge projects. |
| 2026-07-23 | quality_runner | Independent package audit passed: 5×2 allocation, 46 files, 20/20 binary hashes, 10/10 project reopens and MIDI regenerations, 10 complete lyric forms, and zero fingerprint overlap with the prior ten-song package. |
| 2026-07-23 | quality_runner | `python3 harness/scripts/run_qa.py` and `python3 harness/scripts/run_quality_gate.py` passed. WAV signature audit confirmed 10 stereo 44.1kHz 16-bit PCM files; MIDI signature audit confirmed 10 format-1 five-track files. |
| 2026-07-23 | review_judge | Post-QA review found no blocking research, allocation, artifact, privacy, or originality-boundary issue. Real range testing, prosody editing, subjective listening, and legal similarity clearance remain required for release. |
| 2026-07-23 | project_lead | Copied the 245MB package to `/Users/taejungkim/Downloads/RESCENE_Member_Solo_Songbook_2026-07-23`; the 46-file destination matches the source byte-for-byte and all 20 manifest SHA-256 hashes match. |

## Completion Notes

- Delivered song count: 10 total; WONI, LIV, MINAMI, MAY, and ZENA each receive exactly two songs.
- Package contents: member research brief, overview, playlist, 10 PCM WAV demos, 10 format-1 five-track MIDI files, 10 GrooveForge projects, 10 complete lyric/production sheets, manifest, and QA report.
- Package size before Downloads copy: approximately 245MB across 46 files.
- Audio duration range: 103.150–198.077 seconds; peak range: -5.257 to -3.000 dBFS.
- Every render has nonzero audible PCM, zero full-scale samples, and terminal digital zero.
- All ten projects reopen at 64 bars and regenerate the delivered MIDI byte-identically.
- Ten current melody fingerprints are mutually unique and do not overlap the ten fingerprints from the 2026-07-22 RESCENE songbook.
- No existing RESCENE audio, lyric, melody, third-party sample, cloned voice, credential, or private data was used.
- Final user package: `/Users/taejungkim/Downloads/RESCENE_Member_Solo_Songbook_2026-07-23`.
