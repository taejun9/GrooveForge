# plan-1505-pink-flash-soundcloud

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

ZENA 타기팅 곡 `핑크 플래시 (Pink Flash)`를 WAV 24-bit로 만들고, SoundCloud 업로드에 필요한 BPM, 분위기, 장르, 태그 등의 정보를 함께 작성한다.

## Goal

기존 GrooveForge 프로젝트에서 믹스를 float 버퍼로 다시 렌더링해 stereo 44.1kHz signed PCM 24-bit WAV를 만들고, 2026-07-23 기준 SoundCloud 공식 업로드 안내에 맞춘 게시 메타데이터·설명·권리 경계·체크리스트를 한글 문서로 전달한다.

## Non-Goals

- 기존 16-bit WAV를 단순히 24-bit 컨테이너로 변환하지 않는다.
- SoundCloud 계정에 실제 업로드하거나 공개·수익화·배포 설정을 변경하지 않는다.
- ZENA 또는 RESCENE의 공식 발매, 승인, 참여 보컬로 오인시키지 않는다.
- 기존 음악 상태를 변경하거나 새 보컬을 합성하지 않는다.

## Context Map

- 원본 완료 계획: `docs/exec_plans/completed/plan-1500-rescene-member-songs.md`
- 원본 리뷰: `docs/reviews/plan-1500-rescene-member-songs-review.md`
- 선행 24-bit 방식: `docs/exec_plans/completed/plan-1504-switchback-soundcloud.md`
- GrooveForge 오디오 렌더러: `src/audio/render.ts`
- 프로젝트 파서: `src/domain/workstation.ts`
- 원본 프로젝트: `/Users/taejungkim/Downloads/10_ZENA_핑크_플래시_Pink_Flash/10_ZENA_핑크_플래시_Pink_Flash.grooveforge.json`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1505-pink-flash-soundcloud`와 `.worktree/plan-1505-pink-flash-soundcloud`에서 저장소 작업을 수행한다.
- 사용자 WAV와 메타데이터 패키지는 Downloads에만 두고 커밋하지 않는다.
- 임시 렌더 도구는 ignored `build/`에 두고 제품 코드를 변경하지 않는다.
- 직전 SoundCloud 공식 도움말 조사를 재사용하되 핑크 플래시의 음악적 메타데이터는 원본 프로젝트와 곡별 제작 메모에서 확인한다.

## Implementation Plan

- [x] 원본 프로젝트의 BPM, Key, 장르, 가사·퍼포먼스 콘셉트를 확인한다.
- [x] 현재 파서로 프로젝트를 재열기하고 float 믹스에서 24-bit PCM WAV를 직접 인코딩한다.
- [x] 제목, Artist 표기, BPM, Key, 장르, 분위기, 태그, 설명, 권리·공개 설정을 작성한다.
- [x] WAV header, 해상도, 음량, 클리핑, 길이와 원본 음악 상태 동일성을 검증한다.
- [x] QA 뒤 독립 review를 작성하고 계획을 완료로 이동한 다음 Downloads에 전달한다.

## QA Plan

- WAV가 RIFF/WAVE format 1, stereo 44.1kHz, 24 bits per sample, 6 bytes per frame인지 확인한다.
- 데이터 청크 크기·프레임 수·duration이 헤더와 일치하는지 검증한다.
- 24-bit 하위 8비트에 실제 신호가 있어 단순 16-bit zero-padding이 아닌지 확인한다.
- peak/RMS, nonzero sample, full-scale sample, final-frame digital zero를 계산한다.
- 같은 프로젝트의 현재 16-bit 재렌더가 기존 16-bit WAV와 byte-identical인지 확인한다.
- 메타데이터 문서에 BPM, Key, genre, mood, English tags, title, description, rights boundary, upload checklist가 있는지 확인한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 실제 float 기반 24-bit 렌더 여부, 핑크 플래시의 빠르고 장난스러운 퍼포먼스 정체성과 메타데이터 일치, ZENA/RESCENE 공식 음원 오인 방지, 권리·공개 기본값을 별도로 검토하고 `docs/reviews/plan-1505-pink-flash-soundcloud-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 사용자 표현의 `RPM`은 음악 속도를 뜻하는 `BPM`으로 해석한다. | 표준 음악 속도 단위이며 원본 프로젝트가 150 BPM을 기록하기 때문이다. |
| 2026-07-23 | 기존 프로젝트를 float 단계에서 다시 렌더링해 signed PCM 24-bit로 직접 양자화한다. | 가짜 해상도 증가를 피하고 원본 음악 상태를 보존하기 위해서다. |
| 2026-07-23 | 실제 SoundCloud 업로드는 수행하지 않고 준비 파일과 문서만 전달한다. | 외부 공개는 사용자 계정과 최종 권리 확인이 필요한 별도 상태 변경이기 때문이다. |
| 2026-07-23 | 마지막 frame은 digital zero로 두되 직전 128 frames의 sub-16-bit 잔향은 보존한다. | 클릭 없는 종료와 float 렌더의 미세 신호 보존을 함께 만족하기 위해서다. |
| 2026-07-23 | 주 장르는 `Dance & EDM`, 초기 공개는 Private, license는 All Rights Reserved, downloads와 수익화·배급은 Off를 권장한다. | SoundCloud 입력 구조에 맞추고 비공식 피치 데모의 공개·권리 위험을 낮추기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Plan created. Located the user-moved Pink Flash source folder directly under Downloads. |
| 2026-07-23 | harness_builder | Reopened the 150 BPM, F minor project and rendered the float mix directly to stereo 44.1kHz signed PCM 24-bit. |
| 2026-07-23 | privacy_guard | Prepared an unofficial instrumental pitch disclosure, uploader-identity guidance, Private/Downloads Off defaults, and artwork restrictions. |
| 2026-07-23 | quality_runner | `file`, `afinfo`, independent PCM parsing, repository QA, and quality gate passed; lower-byte activity was 99.609% and no full-scale samples were found. |
| 2026-07-23 | review_judge | Separate post-QA review passed with no blocking findings; placeholders and future rights clearance remain explicit handoff items. |
| 2026-07-23 | project_lead | Copied the verified four-file upload pack to `/Users/taejungkim/Downloads/Pink_Flash_SoundCloud_Upload_Pack_2026-07-23` and confirmed directory identity, WAV hash, and `afinfo` properties. |

## Completion Notes

- 출력 WAV: stereo 44.1kHz signed PCM 24-bit, 103.15초, peak -3.000dBFS, RMS -19.832dBFS
- 출력 SHA-256: `be2713ccc4aaebc4f8bd1e2146e06e91b5fe23bcf6d7418484de50ba6cf38654`
- 24-bit lower-byte activity: 9,062,277 samples (99.609%); 단순 16-bit zero-padding이 아님
- 기존 전달 16-bit WAV와 현재 렌더러 16-bit 결과가 byte-identical임
- SoundCloud 제목, Artist, BPM, Key, 장르, 분위기, 영어 태그, 설명, artwork, 권리·공개 체크리스트를 패키지에 포함함
