# plan-1502-idol-performance-pitch

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

직전 BIGBANG 4인 타기팅 곡에 이어 아이돌스러운 음악도 추가로 만든다.

## Goal

직전 리서치와 4인 파트 가정을 유지하면서, 어두운 얼터너티브 피치와 대비되는 밝고 즉각적인 K-pop 아이돌 퍼포먼스곡을 만든다. 선명한 verse/pre-chorus/chorus/post-chorus, 단체 챈트, 포인트 안무, 댄스 브레이크를 포함한 64마디 24-bit PCM WAV·MIDI·GrooveForge 프로젝트와 전체 가사·파트·SoundCloud 정보를 Downloads에 전달한다.

## Non-Goals

- 기존 BIGBANG 또는 다른 아이돌 곡의 멜로디, 가사, 편곡, 훅, 안무 포인트를 복제하지 않는다.
- 실제 멤버 음성, 보이스 클론, 저작권 음원·샘플을 사용하지 않는다.
- 현재 공식 4인 활동이나 아티스트 승인작으로 표현하지 않는다.
- 생성 음원과 사용자 전달 패키지를 저장소에 커밋하지 않는다.

## Context Map

- 직전 계획: `docs/exec_plans/completed/plan-1501-bigbang-four-pitch.md`
- 직전 리뷰: `docs/reviews/plan-1501-bigbang-four-pitch-review.md`
- 품질 규칙: `docs/quality/rules.md`
- 오디오 렌더러: `src/audio/`
- 프로젝트 및 MIDI 도메인: `src/domain/`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1502-idol-performance-pitch`와 `.worktree/plan-1502-idol-performance-pitch`에서 저장소 작업을 수행한다.
- 4인 역할 대비는 유지하되 밝기, 리듬 밀도, 훅 반복, 무대 동선을 직전 곡보다 강화한다.
- 최종 산출물은 Downloads에 전달하고 저장소에는 계획·리뷰 증거만 남긴다.

## Implementation Plan

- [x] 직전 곡과 대비되는 아이돌 퍼포먼스 콘셉트·제목·메타데이터를 설계한다.
- [x] 4인 파트용 전체 가사, 64마디 구조, 코드·톱라인·드럼·베이스를 작성한다.
- [x] 샘플 없는 합성 악기로 WAV, 5트랙 MIDI, GrooveForge 프로젝트를 생성한다.
- [x] SoundCloud 업로드 정보와 보컬·랩·안무 세션 가이드를 작성한다.
- [x] WAV·MIDI·프로젝트 재열기·해시·문서 완전성을 검증한다.
- [x] QA 뒤 별도 리뷰를 작성하고 완료 계획으로 이동한 다음 Downloads에 전달한다.

## QA Plan

- WAV가 내부 float 렌더에서 직접 생성된 stereo 44.1 kHz 24-bit PCM이며 유효 신호, -1 dBFS ceiling, 무 full-scale sample, terminal zero를 갖는지 확인한다.
- MIDI가 format 1, 5 tracks, 480 PPQ, 126 BPM과 충분한 note-on을 포함하는지 확인한다.
- 프로젝트가 64마디로 재열기되고 전달 MIDI를 byte-identical하게 재생성하는지 확인한다.
- 가사에 intro, verse, pre-chorus, chorus, post-chorus, second verse, dance break, final chorus가 포함되는지 확인한다.
- SoundCloud 문서에 BPM, key, genre, mood, English tags, description, caption, artwork, privacy/licensing 지침이 있는지 확인한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 후 아이돌 곡으로서의 즉시성, 직전 곡과의 대비, 네 멤버 기능, 제목·가사 식별성, 산출물 완전성, 오인·저작권·보컬 한계를 별도로 검토해 `docs/reviews/plan-1502-idol-performance-pitch-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 126 BPM C minor의 electro-funk/synth-pop 기반 K-pop dance-pop으로 설계한다. | 밝은 아이돌 에너지와 네 멤버의 랩·보컬 대비를 모두 담고 직전 104 BPM 곡과 명확히 구분하기 위해서다. |
| 2026-07-23 | 제목을 `불꽃 비밀번호 (FIREWORK PASSWORD)`로 정한다. | 정확 제목 검색에서 동명 음원이 확인되지 않았고, 팬과 무대가 공유하는 신호라는 퍼포먼스 콘셉트를 짧게 전달하기 때문이다. |
| 2026-07-23 | 무보컬 신스 톱라인 데모로 전달한다. | 보이스 클로닝 없이 작곡·편곡과 파트 기능을 편집 가능한 형태로 제공하기 위해서다. |
| 2026-07-23 | WAV를 내부 float mix에서 직접 24-bit integer PCM으로 인코딩한다. | 사용자의 추가 규격을 충족하고 16-bit 값을 단순 확장한 가짜 24-bit 파일을 피하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Plan created. |
| 2026-07-23 | harness_builder | Created `불꽃 비밀번호 (FIREWORK PASSWORD)`, a 126 BPM C minor idol dance-pop pitch with full lyrics, post-chorus chant, dance break, four-member functional allocation, MIDI, and reopenable project. |
| 2026-07-23 | harness_builder | Encoded the internal float mix directly to stereo 44.1 kHz 24-bit integer PCM, then restored the repository renderer source with no product-code change. |
| 2026-07-23 | quality_runner | Generator and independent package QA passed: 122.655 seconds, -1.140 dBFS peak, -17.706 dBFS RMS, zero full-scale samples, terminal digital zero, and 10,775,684 samples with non-zero low-order bytes. |
| 2026-07-23 | quality_runner | MIDI QA passed for format 1, five tracks, 480 PPQ, 126 BPM, 2,872 note-ons, and byte-identical regeneration after project reopen. Repository QA and quality gate passed. |
| 2026-07-23 | review_judge | Post-QA review found no blocking idol-form, contrast, 24-bit, artifact, privacy, or originality-boundary issue. Real vocal/chorography testing, critical listening, full production, and legal clearance remain required. |
| 2026-07-23 | project_lead | Copied the nine-file package to `/Users/taejungkim/Downloads/FIREWORK_PASSWORD_아이돌_피치_2026-07-23`; recursive comparison found no difference and the delivered WAV, MIDI, and project hashes matched the source. |

## Completion Notes

- 완성곡 `불꽃 비밀번호 (FIREWORK PASSWORD)`를 126 BPM, C minor, 64마디의 밝은 K-pop idol dance-pop으로 제작했다.
- 내부 float mix에서 직접 stereo 44.1 kHz 24-bit integer PCM WAV를 만들었다. 재생 시간은 122.655초, peak는 -1.140 dBFS, RMS는 -17.706 dBFS이며 full-scale sample은 0개다.
- 10,775,684개 sample의 low-order byte가 0이 아니어서 16-bit 데이터를 24-bit container에 패딩한 파일이 아님을 확인했다.
- 전체 가사·파트·안무·SoundCloud 정보, 5-track MIDI, 재열기 가능한 GrooveForge 프로젝트, manifest, QA report를 포함한 9개 파일을 Downloads에 전달했다.
- 저장소 QA와 quality gate를 통과했고, post-QA review에서 차단 이슈가 없었다.
