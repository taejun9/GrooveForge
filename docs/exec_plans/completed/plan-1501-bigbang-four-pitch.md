# plan-1501-bigbang-four-pitch

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

BIGBANG을 GD, 태양, 대성, T.O.P의 4인 기준으로 멤버·발매곡 스타일·콘셉트를 철저히 조사한 뒤 타기팅 곡을 작곡하고 Downloads에 저장한다. SoundCloud 업로드에 필요한 BPM, 분위기, 장르, 태그 등의 정보도 함께 작성한다.

## Goal

2026-07-23 기준 그룹의 시대별 음악 변화와 네 멤버의 최신 공개 솔로 작업을 공식·신뢰 가능한 자료로 교차 조사하고, 이를 고수준 작곡 원리로만 추상화한 완전한 오리지널 4인 그룹 피치 데모를 만든다. 청취 가능한 WAV, 편집 가능한 MIDI와 GrooveForge 프로젝트, 전체 가사·파트 가이드, SoundCloud 메타데이터, 리서치 브리프를 Downloads에 전달한다.

## Non-Goals

- 기존 BIGBANG 또는 멤버 솔로곡의 멜로디, 가사, 편곡, 녹음물, 고유 애드리브를 복제하지 않는다.
- 실제 멤버 음성을 복제하거나 공식 발매·승인작처럼 표현하지 않는다.
- 현재 공식 활동 인원을 4인으로 오인시키지 않는다. 요청의 4인 기준은 2022년 4인 구성과 각 멤버의 최신 솔로 방향을 결합한 가상 크리에이티브 브리프로 명시한다.
- 생성 음원과 사용자 전달 패키지를 저장소에 커밋하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 품질 규칙: `docs/quality/rules.md`
- 오디오 렌더러: `src/audio/`
- 프로젝트 및 MIDI 도메인: `src/domain/`
- 이전 유사 전달: `docs/exec_plans/completed/plan-1499-rescene-songbook.md`, `docs/exec_plans/completed/plan-1500-rescene-member-songs.md`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1501-bigbang-four-pitch`와 `.worktree/plan-1501-bigbang-four-pitch`에서 저장소 작업을 수행한다.
- 저작권 음원, 외부 샘플, 보이스 클로닝, 원격 AI 음성 합성을 사용하지 않는다.
- 그룹의 역사적 스타일은 장르 대비, 파트 기능, 후렴 규모, 정서적 서사 같은 추상 원리로만 반영한다.
- 최종 산출물은 Downloads에 전달하고 저장소에는 계획·리뷰 증거만 남긴다.

## Implementation Plan

- [x] 그룹의 4인 마지막 공식 곡, 시대별 주요 앨범·싱글, 현재 3인 활동 상태를 조사한다.
- [x] GD, 태양, 대성, T.O.P의 디스코그래피, 음색·랩 기능, 최신 솔로 스타일과 콘셉트를 조사한다.
- [x] 조사 결과를 토대로 독창적인 제목, 가사, 화성, 톱라인, 리듬, 64마디 편곡과 4인 파트 가이드를 설계한다.
- [x] 샘플 없는 합성 악기로 WAV, MIDI, GrooveForge 프로젝트를 생성하고 SoundCloud 메타데이터를 작성한다.
- [x] 파일 형식, 길이, 음량, 무음/클리핑, MIDI 파싱, 프로젝트 재열기, 가사·메타데이터 완전성을 검증한다.
- [x] QA 뒤 별도 리뷰를 작성하고 계획을 완료 상태로 옮긴 다음 Downloads에 전달한다.

## QA Plan

- WAV가 stereo 44.1 kHz 16-bit PCM으로 디코드되고 유효 신호, 안전한 peak, 무 full-scale sample, terminal zero를 갖는지 확인한다.
- MIDI가 format 1 다중 트랙이며 tempo, note-on, 64마디 편곡 길이를 포함하는지 확인한다.
- GrooveForge 프로젝트가 현재 파서로 재열기되고 전달 MIDI를 재생성하는지 확인한다.
- 가사 문서에 전체 구조, 네 멤버 파트 가이드, 음역·보컬·랩 방향, 프로덕션 노트가 있는지 확인한다.
- SoundCloud 문서에 title, BPM, key, genre, mood, tags, description, artwork brief, content warning/licensing note가 있는지 확인한다.
- 기존 곡 제목·가사 문구·멜로디 전사·오디오 샘플·보이스 클론이 없음을 검토한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 조사 근거의 최신성, 4인 가상 브리프 표시, 멤버별 기능, 곡의 독창성, 산출물 완전성, 개인정보·저작권 경계, 실제 제작 전 잔여 위험을 별도로 검토해 `docs/reviews/plan-1501-bigbang-four-pitch-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 현재 공식 활동 상태와 사용자의 4인 기준을 분리해 표기한다. | 최신 사실을 왜곡하지 않으면서 요청한 네 멤버용 가상 피치를 충족하기 위해서다. |
| 2026-07-23 | 실제 보컬 대신 신스 톱라인이 포함된 인스트루멘털 피치 데모를 만든다. | 보이스 클로닝 없이 작곡·편곡과 멤버별 파트 의도를 편집 가능한 형태로 전달하기 위해서다. |
| 2026-07-23 | 결과물은 한 곡의 64마디 WAV, format-1 MIDI, 재열기 가능한 프로젝트, 전체 가사/제작 메모, 리서치와 SoundCloud 메타데이터로 구성한다. | 사용자의 단수 곡 요청과 실사용 가능한 전달 범위를 동시에 맞추기 위해서다. |
| 2026-07-23 | 최초 영문 제목 `BLACKOUT BLOOM`을 `NEON ZERO BLOOM`으로 교체한다. | 제목 검색에서 2025년 이후 동명 음원이 여러 개 확인되어 피치 식별력을 높이고 불필요한 충돌을 피하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Plan created. |
| 2026-07-23 | repo_cartographer | Confirmed the 2022 quartet release boundary, the current 2026 trio activity, the unreleased anniversary project, and each requested member's latest solo direction through official artist pages, platform catalogs, interviews, and reputable reporting. |
| 2026-07-23 | harness_builder | Created `정전의 꽃 (NEON ZERO BLOOM)`, an original 64-bar 104 BPM F# minor alternative hip-hop/electro-rock/R&B pitch with complete lyrics, four-member role guide, WAV, MIDI, and reopenable project. |
| 2026-07-23 | quality_runner | Generator QA passed: stereo 44.1 kHz 16-bit PCM, 148.558 seconds, -1.000 dBFS peak, -18.866 dBFS RMS, zero full-scale samples, terminal digital zero, format-1 five-track MIDI with 2,576 note-ons, and byte-identical MIDI regeneration after project reopen. |
| 2026-07-23 | quality_runner | Independent manifest audit passed for nine hashed deliverables. `python3 harness/scripts/run_qa.py` and `python3 harness/scripts/run_quality_gate.py` passed. |
| 2026-07-23 | review_judge | Post-QA review found no blocking research, current-lineup disclosure, artifact, privacy, or originality-boundary issue. Actual member range testing, vocal production, subjective listening, and legal similarity clearance remain required before public release. |
| 2026-07-23 | project_lead | Copied the 25MB, 10-file package to `/Users/taejungkim/Downloads/NEON_ZERO_BLOOM_4인_피치_2026-07-23`; the destination matches the source byte-for-byte and all nine manifest SHA-256 hashes pass. |

## Completion Notes

- Delivered one original four-member pitch song titled `정전의 꽃 (NEON ZERO BLOOM)`.
- Package contents: research brief, complete lyrics/production notes, SoundCloud metadata, session/part guide, PCM WAV, format-1 MIDI, reopenable GrooveForge project, manifest, QA report, and first-read guide.
- Audio: 148.558 seconds, stereo 44.1 kHz 16-bit PCM, peak -1.000 dBFS, RMS -18.866 dBFS, no full-scale samples, terminal digital zero.
- MIDI: 104 BPM, format 1, five tracks, 480 PPQ, 2,576 note-ons; project reopen regenerated it byte-identically.
- The package contains no existing BIGBANG/member recording, copied melody or lyric, third-party sample, cloned voice, credential, or private data.
- Current group activity is accurately disclosed as GD, TAEYANG, and DAESUNG, while the requested quartet is framed as a hypothetical creative brief including T.O.P.
- Final user package is copied to `/Users/taejungkim/Downloads/NEON_ZERO_BLOOM_4인_피치_2026-07-23` after repository completion.
