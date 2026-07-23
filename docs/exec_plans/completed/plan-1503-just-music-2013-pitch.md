# plan-1503-just-music-2013-pitch

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

2013년도 저스트뮤직을 타기팅해 당시 멤버, 현재까지 발표한 곡의 스타일과 콘셉트를 철저히 조사한 뒤 곡을 작곡한다. 24-bit WAV와 SoundCloud 업로드용 BPM, 분위기, 장르, 태그 정보를 Downloads에 저장한다.

## Goal

2013년 당시 Just Music의 실제 구성과 그 시점까지 공개된 멤버별 음악을 공식·신뢰 가능한 자료로 교차 조사하고, 이를 고수준 작곡 원리로만 추상화한 독창적인 한국어 힙합 피치 데모를 만든다. 24-bit PCM WAV, 편집 가능한 MIDI와 GrooveForge 프로젝트, 전체 가사·파트 가이드, 리서치 브리프, SoundCloud 메타데이터를 Downloads에 전달한다.

## Non-Goals

- 기존 Just Music 또는 멤버 곡의 멜로디, 가사, 플로우, 편곡, 녹음물, 고유 애드리브를 복제하지 않는다.
- 실제 멤버 음성을 복제하거나 공식 발매·승인작처럼 표현하지 않는다.
- 2013년 당시 멤버와 이후 합류·탈퇴 멤버를 혼동하지 않는다.
- 생성 음원과 사용자 전달 패키지를 저장소에 커밋하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 품질 규칙: `docs/quality/rules.md`
- 오디오 렌더러: `src/audio/`
- 프로젝트 및 MIDI 도메인: `src/domain/`
- 이전 유사 전달: `docs/exec_plans/completed/plan-1501-bigbang-four-pitch.md`, `docs/exec_plans/completed/plan-1502-idol-performance-pitch.md`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1503-just-music-2013-pitch`와 `.worktree/plan-1503-just-music-2013-pitch`에서 저장소 작업을 수행한다.
- 저작권 음원, 외부 샘플, 보이스 클로닝, 원격 AI 음성 합성을 사용하지 않는다.
- 2013년 음반과 당시 공개 자료를 시대 분석의 중심으로 두고, 이후 자료는 멤버의 장기적 변화와 현재까지의 맥락을 보조하는 데만 사용한다.
- 최종 WAV는 stereo 44.1 kHz, signed integer PCM 24-bit로 전달한다.
- 최종 산출물은 Downloads에 전달하고 저장소에는 계획·리뷰 증거만 남긴다.

## Implementation Plan

- [x] 2013년 당시 레이블 구성, 멤버 가입 시점, 그 시점까지의 주요 발매와 활동을 교차 조사한다.
- [x] 멤버별 2013년 이전·당시 스타일과 이후 현재까지의 변화, 레이블 공통 콘셉트를 구분해 리서치 브리프를 작성한다.
- [x] 조사 결과를 토대로 독창적인 제목, 가사, 화성, 톱라인, 리듬, 64마디 편곡과 파트 가이드를 설계한다.
- [x] 샘플 없는 합성 악기로 24-bit WAV, MIDI, GrooveForge 프로젝트를 생성하고 SoundCloud 메타데이터를 작성한다.
- [x] 파일 형식, 길이, 음량, 무음/클리핑, MIDI 파싱, 프로젝트 재열기, 가사·메타데이터 완전성을 검증한다.
- [x] QA 뒤 별도 리뷰를 작성하고 계획을 완료 상태로 옮긴 다음 Downloads에 전달한다.

## QA Plan

- WAV가 stereo 44.1 kHz signed integer PCM 24-bit로 디코드되고 유효 신호, 안전한 peak, 무 full-scale sample, terminal zero를 갖는지 확인한다.
- MIDI가 format 1 다중 트랙이며 tempo, note-on, 64마디 편곡 길이를 포함하는지 확인한다.
- GrooveForge 프로젝트가 현재 파서로 재열기되고 전달 MIDI를 재생성하는지 확인한다.
- 가사 문서에 전체 구조, 가상 파트 가이드, 랩·보컬 방향, 프로덕션 노트가 있는지 확인한다.
- SoundCloud 문서에 title, BPM, key, genre, mood, tags, description, artwork brief, content warning/licensing note가 있는지 확인한다.
- 기존 곡 제목·가사 문구·멜로디 전사·오디오 샘플·보이스 클론이 없음을 검토한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 2013년 시점 정확성, 이후 경력과의 구분, 멤버별 기능, 곡의 독창성, 산출물 완전성, 개인정보·저작권 경계, 실제 제작 전 잔여 위험을 별도로 검토해 `docs/reviews/plan-1503-just-music-2013-pitch-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 2013년 당시 자료와 이후 현재까지의 자료를 두 층으로 분리한다. | 시대 타기팅을 정확히 유지하면서 사용자가 요청한 멤버별 장기 스타일 조사도 충족하기 위해서다. |
| 2026-07-23 | 실제 보컬 대신 신스 톱라인이 포함된 인스트루멘털 피치 데모와 전체 가사를 만든다. | 보이스 클로닝 없이 작곡·편곡과 파트 의도를 편집 가능한 형태로 전달하기 위해서다. |
| 2026-07-23 | 기존 엔진의 16-bit 렌더를 고정밀 24-bit 마스터로 변환하지 않고, 부동소수점 렌더 버퍼에서 직접 24-bit PCM으로 인코딩한다. | 단순 비트 확장이 아닌 실제 24-bit 양자화 산출물을 제공하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Plan created. |
| 2026-07-23 | repo_cartographer | 2014년 당사자 인터뷰로 2013 핵심 4인과 씨잼·바스코의 2014 합류 경계를 확인하고, 2013 발매·사건 자료와 2026-07-23 현재 플랫폼 카탈로그를 교차 조사했다. |
| 2026-07-23 | harness_builder | `지하의 정오 (BASEMENT NOON)`를 92 BPM, F minor, Swing 10%, 64마디의 boom-bap/experimental electronic hip-hop 피치로 작곡하고 전체 가사, 네 역할, SoundCloud 정보, MIDI와 재열기 가능한 프로젝트를 작성했다. |
| 2026-07-23 | harness_builder | 내부 Float32 믹스 버퍼에서 stereo 44.1 kHz signed integer PCM 24-bit WAV를 직접 인코딩한 뒤 임시 렌더 export를 복원해 제품 코드 변경을 남기지 않았다. |
| 2026-07-23 | quality_runner | 독립 패키지 감사와 macOS `afinfo`가 10개 파일, 167.935초, -1.413 dBFS peak, -18.940 dBFS RMS, 무 full-scale sample, final-frame digital zero, 99.609% low-byte activity를 확인했다. |
| 2026-07-23 | quality_runner | MIDI format 1, 5 tracks, 480 PPQ, 92 BPM, 2,640 note-ons와 프로젝트 재열기 후 byte-identical MIDI 재생성을 확인했다. Repository QA와 quality gate가 통과했다. |
| 2026-07-23 | review_judge | Post-QA review에서 시대 경계, 조사 근거, 독창성, 24-bit 형식, 산출물, privacy/SoundCloud 오인 방지에 차단 이슈가 없었다. 로컬 이전 피치 프로젝트 6개와 정확 이벤트 지문 중복도 없었다. |
| 2026-07-23 | project_lead | 42MB, 10개 파일 패키지를 `/Users/taejungkim/Downloads/BASEMENT_NOON_2013_JM_Pitch_2026-07-23`에 복사하고 source/destination recursive diff 및 3개 핵심 산출물 SHA-256 일치를 확인했다. |

## Completion Notes

- 완성곡: `지하의 정오 (BASEMENT NOON)` — 92 BPM, F minor, 4/4, Swing 10%, 64 bars.
- 오디오: 167.935초, stereo 44.1 kHz signed integer PCM 24-bit, peak -1.413 dBFS, RMS -18.940 dBFS, full-scale sample 0, final frame digital zero.
- 편집 산출물: format-1 five-track MIDI와 현재 GrooveForge 파서로 재열기 가능한 프로젝트.
- 문서: 2013 핵심 멤버/2014 합류 경계/현재까지의 변화 리서치, 전체 한국어 가사, 네 역할 및 세션 지도, SoundCloud title/BPM/key/genre/mood/tags/description/caption/artwork/권리 설정.
- 기존 녹음, 제3자 샘플, 복제 가사·멜로디, 멤버 보이스 클론, 로고·사진, 개인정보를 사용하지 않았다.
- 최종 전달: `/Users/taejungkim/Downloads/BASEMENT_NOON_2013_JM_Pitch_2026-07-23`.
