# plan-1499-rescene-songbook

## Status

completed

## Owner

project_lead / plan_keeper / quality_runner / review_judge / privacy_guard

## User Request

아이돌 그룹 RESCENE(리센느)의 멤버, 기존 발매곡 스타일, 콘셉트를 철저히 조사한 뒤 리센느를 위한 곡 7곡 이상과 팬 REMINE(리마인)을 위한 곡 3곡 이상을 작곡하고 다운로드 폴더에 저장한다.

## Goal

2026-07-22 기준 공식·1차 자료를 우선해 RESCENE의 현재 정체성을 분석하고, 이를 작곡 방향으로만 추상화한 10곡 이상의 독창적인 K-pop 데모 패키지를 만든다. 각 곡은 청취 가능한 WAV, 편집 가능한 MIDI, 한국어 가사/구조/제작 메모를 포함한다.

## Non-Goals

- 기존 RESCENE 곡의 멜로디, 가사, 편곡 또는 특정 녹음물을 복제·샘플링하지 않는다.
- 멤버의 목소리를 복제하거나 실제 멤버가 부른 것처럼 표현하지 않는다.
- 회사·아티스트의 공식 의뢰, 발매 승인 또는 상업적 사용 가능성을 주장하지 않는다.
- 특정 사용자 산출물을 제품 기본 데이터나 테스트 fixture로 커밋하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 품질 규칙: `docs/quality/rules.md`
- 오디오 렌더러: `src/audio/`
- 프로젝트 및 MIDI 도메인: `src/domain/`
- 공식 출처 기록: 최종 다운로드 패키지의 `00_리서치_브리프.md`

## Constraints

- QA and review are separate loops.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1499-rescene-songbook` and `.worktree/plan-1499-rescene-songbook` for repository work.
- 생성 음원과 사용자 전달 패키지는 커밋하지 않고 다운로드 폴더에만 둔다.
- 저작권 음원, 보컬 복제, 실제 멤버 개인정보, 원격 AI 음성 합성을 사용하지 않는다.

## Implementation Plan

- [x] 공식 프로필, 발매사·음원 플랫폼 크레딧, 공식 MV/티저, 신뢰 가능한 인터뷰·보도를 교차 조사한다.
- [x] 멤버 구성, 디스코그래피, 반복되는 사운드·서사·비주얼 문법과 팬덤 REMINE의 의미를 리서치 브리프로 정리한다.
- [x] 그룹용 최소 7곡과 팬용 최소 3곡의 서로 다른 음악적 설계·가사·구조를 작성한다.
- [x] 저작권 샘플 없는 합성 악기로 각 곡의 WAV와 MIDI 데모를 렌더링한다.
- [x] 파일 구조, WAV/MIDI 형식, 길이, 음량, 무음/클리핑, 곡별 차별성, 가사·메타데이터를 검증한다.
- [x] QA 완료 후 별도 리뷰를 수행하고 계획/리뷰 문서를 마감한 뒤 다운로드 폴더에 최종 패키지를 전달한다.

## QA Plan

- 모든 곡의 WAV가 PCM stereo 44.1 kHz로 디코드되고, 0이 아닌 유효 오디오를 포함하는지 확인한다.
- 모든 MIDI가 Standard MIDI File로 파싱되고 곡별 tempo, note-on, arrangement 길이를 포함하는지 확인한다.
- 최소 10곡, 그룹용 7곡 이상, 팬용 3곡 이상인지 manifest로 확인한다.
- 곡마다 제목, BPM, key, 콘셉트, 구조, 전체 한국어 가사, 보컬/랩 배분 제안, 프로덕션 노트를 확인한다.
- 파일 해시, peak/RMS, duration, terminal silence, 파일 크기를 QA 보고서에 기록한다.
- 멜로디 지문과 기본 화성/리듬 설정이 곡 사이에서 과도하게 중복되지 않는지 자동·수동 검토한다.

## Review Plan

QA가 완료된 뒤 조사 근거, 독창성 경계, 멤버·팬덤 적합성, 산출물 누락, 청취 데모의 한계를 별도로 검토하고 `docs/reviews/plan-1499-rescene-songbook-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-22 | 7+3 최소 요구를 정확히 충족하는 10곡 패키지를 기본 범위로 잡는다. | 곡별 완성도와 사용 가능성을 유지하면서 사용자의 수량 요구를 충족하기 위해서다. |
| 2026-07-22 | 보컬 음성 대신 오리지널 인스트루멘털 데모와 전체 가사를 제공한다. | 멤버 보이스 클로닝·오인 가능성을 피하면서 작곡과 편곡 의도를 편집 가능한 형태로 전달하기 위해서다. |
| 2026-07-22 | 조사에서 발견한 특성은 무드·구조·악기 선택의 고수준 방향으로만 사용한다. | 기존 곡을 모방하지 않고 아티스트 타기팅과 독창성을 함께 지키기 위해서다. |
| 2026-07-22 | 사용자 산출물은 다운로드 폴더에만 전달하고 저장소에는 계획·리뷰 증거만 남긴다. | 프로젝트 저장소의 제품 데이터와 특정 아티스트용 창작물을 분리하기 위해서다. |
| 2026-07-22 | 각 곡은 64마디 full mix WAV, 5트랙 MIDI, 재오픈 가능한 프로젝트, 전체 가사로 전달하고 stems는 제외한다. | 편집 가능성을 유지하면서 10곡 전달 크기를 약 234MB로 제한하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-22 | project_lead | Plan created. |
| 2026-07-22 | repo_cartographer | Official artist pages, platform discographies, member interviews, NME features, Soompi announcements, and IZM reviews were cross-referenced through the 2026-07-22 Pretty Girl era. |
| 2026-07-22 | harness_builder | Created seven RESCENE pitches and three REMINE fan songs with original harmony, topline motifs, 64-bar arrangements, full lyrics, MIDI, project files, and sample-free synth WAV demos. |
| 2026-07-22 | quality_runner | Generator QA passed for 10 WAVs, 10 MIDIs, 10 projects, 10 lyric sheets, 20 artifact hashes, and 10 unique internal melody fingerprints. |
| 2026-07-22 | quality_runner | Independent reopen QA passed for all ten 64-bar projects; `python3 harness/scripts/run_qa.py` and `python3 harness/scripts/run_quality_gate.py` passed. |
| 2026-07-22 | quality_runner | The escalated `npm run verify` exercised build, desktop launch, native project I/O, packaged app, DMG, PKG, install simulation, delivery-package reopen, and release-progress checks successfully. The aggregate command was stopped at the unrelated external-distribution handoff because it requested missing private release-channel inputs; `release:completion-summary-smoke` itself passed and no private values were invented. |
| 2026-07-22 | review_judge | Post-QA review found no blocking artifact, research, privacy, or originality-boundary issue; commercial similarity clearance and member-range validation remain outside this demo scope. |
| 2026-07-22 | project_lead | Copied the 234MB package to `/Users/taejungkim/Downloads/RESCENE_Original_Songbook_2026-07-22`; the destination contains 46 files and matches the source byte-for-byte, including all 20 manifest SHA-256 hashes. |

## Completion Notes

- Delivered song count: 10 total, including 7 RESCENE-targeted songs and 3 REMINE fan songs.
- Package contents: research brief, songbook overview, playlist, 10 PCM WAV demos, 10 format-1 five-track MIDI files, 10 GrooveForge project files, 10 complete lyric/production sheets, manifest, and QA report.
- Audio duration range: 110.464–175.568 seconds per song.
- Audio format: RIFF/WAVE Microsoft PCM, stereo, 44.1 kHz, 16-bit.
- Peak range: -6.516 to -3.461 dBFS; every render has zero full-scale samples and terminal digital zero.
- All projects reopen through the current GrooveForge project parser at 64 bars and can regenerate valid MIDI.
- No existing RESCENE recording, copyrighted sample, lyric, melody, member voice clone, credential, or private data was used.
- The generated user package remained ignored under `build/` during repository QA and was copied separately to `/Users/taejungkim/Downloads/RESCENE_Original_Songbook_2026-07-22`.
