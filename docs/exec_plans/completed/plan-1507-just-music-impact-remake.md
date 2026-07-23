# plan-1507-just-music-impact-remake

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

기존 `지하의 정오 (BASEMENT NOON)` 비트와 충분히 다르지 않다는 피드백을 반영해 곡을 처음부터 새로 만든다. 특정 곡을 복제하지 않되 `파급효과`에서 느껴지는 파괴적 에너지와 집단 대비를 고수준 원리로 재해석한다.

## Goal

이전 92 BPM, F minor, swing boom-bap 설계를 폐기하고 136 BPM, D minor, straight industrial/electronic hip-hop, 비대칭 3+3+2 액센트, 이동하는 bass line, 중반 beat switch를 가진 독창적인 64마디 피치 데모를 만든다. 24-bit PCM WAV, 편집 가능한 MIDI와 GrooveForge 프로젝트, 전체 가사·파트 가이드, 차이점 보고서, SoundCloud 메타데이터를 Downloads에 새 패키지로 전달한다.

## Non-Goals

- `파급효과` 수록곡이나 다른 저작물의 멜로디, 리듬 전사, 가사, 플로우, 편곡, 녹음물, 고유 음색을 복제하지 않는다.
- 실제 Just Music 멤버의 음성이나 정체성을 모사하지 않는다.
- 기존 전달 패키지를 수정하거나 삭제하지 않는다.
- 생성 음원과 사용자 전달 패키지를 저장소에 커밋하지 않는다.

## Context Map

- 선행 조사·작곡 계획: `docs/exec_plans/completed/plan-1503-just-music-2013-pitch.md`
- 선행 완료 리뷰: `docs/reviews/plan-1503-just-music-2013-pitch-review.md`
- 제품 원칙: `docs/product/product.md`
- 품질 규칙: `docs/quality/rules.md`
- 오디오 렌더러: `src/audio/`
- 프로젝트 및 MIDI 도메인: `src/domain/`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1507-just-music-impact-remake`와 `.worktree/plan-1507-just-music-impact-remake`에서 저장소 작업을 수행한다.
- 선행 리서치의 시대 구분과 멤버 범위는 유지하되 새 곡의 차별화 분석을 추가한다.
- 저작권 음원, 외부 샘플, 보이스 클로닝, 원격 AI 음성 합성을 사용하지 않는다.
- 최종 WAV는 stereo 44.1 kHz, signed integer PCM 24-bit로 전달한다.
- 최종 산출물은 Downloads에 전달하고 저장소에는 계획·리뷰 증거만 남긴다.

## Implementation Plan

- [x] 선행 버전의 BPM, key, swing, 화성, 드럼·베이스·톱라인·편곡 지문을 기준선으로 고정한다.
- [x] `파급효과`의 고수준 미학을 독창성 경계 안에서 재정의하고 새 제목·가사·화성·리듬·64마디 편곡을 설계한다.
- [x] 샘플 없는 합성 악기로 24-bit WAV, MIDI, GrooveForge 프로젝트를 생성한다.
- [x] 리서치·재설계 브리프, 전체 가사, 파트 가이드, 이전 버전 차이점, SoundCloud 메타데이터를 작성한다.
- [x] 파일 형식, 길이, 음량, 무음/클리핑, MIDI 파싱, 프로젝트 재열기와 새/구 버전의 구조적 차이를 독립 검증한다.
- [x] QA 뒤 별도 리뷰를 작성하고 계획을 완료 상태로 옮긴 다음 기존 패키지를 보존한 채 Downloads에 전달한다.

## QA Plan

- WAV가 stereo 44.1 kHz signed integer PCM 24-bit이며 유효 신호, 안전한 peak, 무 full-scale sample, terminal zero를 갖는지 확인한다.
- MIDI가 format 1 다중 트랙이며 136 BPM, note-on, 64마디 편곡 길이를 포함하는지 확인한다.
- GrooveForge 프로젝트가 현재 파서로 재열기되고 전달 MIDI를 byte-identical하게 재생성하는지 확인한다.
- 선행 버전과 BPM, key, swing, 장르, 화성, 드럼 onset, bass pitch, arrangement signature가 다른지 정량 비교한다.
- 문서에 전체 가사, 가상 역할, 세션 지도, 차이점, SoundCloud 필수·권장 메타데이터와 오인 방지 문구가 있는지 확인한다.
- 기존 곡 제목·가사 문구·멜로디 전사·오디오 샘플·보이스 클론이 없음을 검토한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 사용자 피드백 반영 정도, 선행 버전과의 구조적 차이, 레퍼런스의 추상화 수준, 작곡 완성도, 24-bit 형식, 산출물 완전성, 개인정보·저작권 경계를 별도로 검토해 `docs/reviews/plan-1507-just-music-impact-remake-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 선행 패키지는 보존하고 새 경로에 별도 전달한다. | 사용자가 이전 결과와 직접 비교할 수 있고 되돌릴 수 있게 하기 위해서다. |
| 2026-07-23 | 특정 곡의 모사가 아니라 거친 전자 질감, 집단 대비, 급격한 전개 변화라는 고수준 속성만 사용한다. | 레퍼런스의 에너지를 반영하면서도 독창성을 지키기 위해서다. |
| 2026-07-23 | 136 BPM, D minor, straight feel, 3+3+2 액센트와 중반 beat switch를 핵심 차별점으로 고정한다. | 선행 92 BPM, F minor, swing boom-bap의 뼈대부터 교체하기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Plan created; previous package preserved as comparison baseline. |
| 2026-07-23 | repo_cartographer | 선행 멤버·디스코그래피 조사의 시대 경계를 유지하고, 2014년 `파급효과` 리뷰의 raw electronics, layered production, producer-led intricacy를 복제가 아닌 상위 설계 원리로 분리했다. 제목 exact-phrase 검색에서 뚜렷한 동명 음악 결과가 없음을 확인했다. |
| 2026-07-23 | harness_builder | `압력의 문법 (PRESSURE GRAMMAR)`을 136 BPM, D minor, straight feel, 3+3+2 accents, moving distorted sub, bar-37 beat switch의 64마디 original pitch로 새로 작곡했다. 선행 오디오나 이벤트를 변형하지 않고 신규 패턴에서 렌더링했다. |
| 2026-07-23 | harness_builder | stereo 44.1 kHz Float32 mix에서 signed integer PCM 24-bit WAV를 직접 인코딩하고 format-1 five-track MIDI, 재열기 가능한 GrooveForge project, 전체 가사·세션·SoundCloud·차이점 문서를 포함한 11개 파일 패키지를 만들었다. |
| 2026-07-23 | quality_runner | 독립 감사가 113.691초, peak -1.428 dBFS, RMS -17.509 dBFS, full-scale sample 0, terminal zero, 99.612% low-byte activity와 64-bar post-boundary tail을 확인했다. macOS `afinfo`도 stereo 44.1 kHz signed integer 24-bit로 판독했다. |
| 2026-07-23 | quality_runner | MIDI format 1, 5 tracks, 480 PPQ, 136.000145 BPM, 3,184 note-ons, end tick 122,880과 project reopen 뒤 byte-identical MIDI 재생성을 확인했다. Repository QA와 quality gate가 통과했다. |
| 2026-07-23 | quality_runner | 선행 버전 대비 BPM +44, key/style/swing/pattern/arrangement/WAV hash 변화, drum grid 70/192 cells(36.5%) 변화, 전체 이벤트 Jaccard overlap 14.7%를 확인했다. 구간 RMS는 Intro -40.89, Hook 약 -15.6, Verse A -17.73, switch -20.02, drumless bridge -27.54 dBFS였다. |
| 2026-07-23 | review_judge | Post-QA review에서 사용자 피드백, 레퍼런스 추상화, 작곡 차별성, 형식, 메타데이터, 저작권·privacy 경계에 차단 이슈가 없었다. |
| 2026-07-23 | project_lead | 29MB, 11개 파일을 `/Users/taejungkim/Downloads/PRESSURE_GRAMMAR_2013_JM_Remake_2026-07-23`에 복사했다. source/destination recursive diff와 10개 manifest hash가 일치했고 선행 Downloads 패키지도 보존되어 있다. |

## Completion Notes

- 완성곡: `압력의 문법 (PRESSURE GRAMMAR)` — 136 BPM, D minor, 4/4, straight feel, 64 bars.
- 오디오: 113.691초, stereo 44.1 kHz signed integer PCM 24-bit, peak -1.428 dBFS, RMS -17.509 dBFS, full-scale sample 0, final frame digital zero.
- 편집 산출물: format-1 five-track MIDI와 현재 GrooveForge parser로 재열기 가능한 project.
- 차별화: 선행 92 BPM/F minor/10% swing/boom-bap에서 tempo, key, feel, style, drums, bass, harmony, form과 audio hash를 모두 교체했다.
- 콘텐츠: 전체 신규 한국어 가사, 네 가상 역할, 64-bar session map, research/redesign brief, SoundCloud title/BPM/key/genre/mood/tags/description/license, quantitative delta report.
- 기존 녹음, 제3자 sample, 복제 가사·멜로디, 실존 멤버 voice clone, logo·사진, 개인정보를 사용하지 않았다.
- 최종 전달: `/Users/taejungkim/Downloads/PRESSURE_GRAMMAR_2013_JM_Remake_2026-07-23`.
