# plan-1502-switchback-soundcloud

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

MINAMI 타기팅 곡 `스위치백 (Switchback)`을 WAV 24-bit로 만들고, SoundCloud 업로드에 필요한 BPM, 분위기, 장르, 태그 등의 정보를 함께 작성한다.

## Goal

기존 GrooveForge 프로젝트에서 믹스를 float 버퍼로 다시 렌더링해 stereo 44.1kHz signed PCM 24-bit WAV를 만들고, 2026-07-23 기준 SoundCloud 공식 업로드 안내에 맞춘 게시 메타데이터·설명·권리 경계·체크리스트를 한글 문서로 전달한다.

## Non-Goals

- 기존 16-bit WAV를 단순히 24-bit 컨테이너로 변환해 해상도가 늘어난 것처럼 표현하지 않는다.
- SoundCloud 계정에 실제 업로드하거나 공개 상태·수익화를 변경하지 않는다.
- MINAMI 또는 RESCENE의 공식 발매, 승인, 참여 보컬로 오인시키지 않는다.
- 기존 멜로디·가사·편곡을 변경하거나 새 보컬을 합성하지 않는다.

## Context Map

- 원본 완료 계획: `docs/exec_plans/completed/plan-1500-rescene-member-songs.md`
- 원본 리뷰: `docs/reviews/plan-1500-rescene-member-songs-review.md`
- GrooveForge 오디오 렌더러: `src/audio/render.ts`
- 프로젝트 파서: `src/domain/workstation.ts`
- 원본 프로젝트: `/Users/taejungkim/Downloads/06_MINAMI_스위치백_Switchback/06_MINAMI_스위치백_Switchback.grooveforge.json`

## Constraints

- QA와 review를 분리한다.
- `codex/plan-1502-switchback-soundcloud`와 `.worktree/plan-1502-switchback-soundcloud`에서 저장소 작업을 수행한다.
- 사용자 WAV와 메타데이터 패키지는 Downloads에만 두고 커밋하지 않는다.
- 임시 렌더 도구는 ignored `build/`에 두고 제품 코드를 변경하지 않는다.
- SoundCloud의 현재 기술·메타데이터 안내는 공식 도움말로 확인한다.

## Implementation Plan

- [x] SoundCloud 공식 업로드 형식, 트랜스코딩, 메타데이터·장르·태그 안내를 조사한다.
- [x] 원본 프로젝트를 현재 파서로 재열기하고 float 믹스에서 24-bit PCM WAV를 직접 인코딩한다.
- [x] 제목, 아티스트 표기, BPM, Key, 장르, 분위기, 태그, 설명, 권리·공개 설정 제안을 작성한다.
- [x] WAV header, 샘플 해상도, 음량, 클리핑, 무음, 길이와 원본 음악 상태의 동일성을 검증한다.
- [x] QA 뒤 독립 review를 작성하고 계획을 완료로 이동한 다음 Downloads에 전달한다.

## QA Plan

- WAV가 RIFF/WAVE format 1, stereo 44.1kHz, 24 bits per sample, 6 bytes per frame인지 파싱한다.
- 데이터 청크 크기·프레임 수·duration이 헤더와 일치하는지 검증한다.
- 24-bit 양자화 값에 16-bit 단순 업컨버전에서 생기는 하위 8비트 전부 0 패턴이 아닌지 확인한다.
- peak/RMS, nonzero sample, full-scale sample, terminal zero를 계산한다.
- 같은 프로젝트에서 렌더한 기존 16-bit 믹스와 프레임 수·샘플레이트·채널·음악 상태가 일치하는지 확인한다.
- 메타데이터 문서에 BPM, Key, genre, mood, tags, title, description, rights boundary, upload checklist가 있는지 확인한다.
- `python3 harness/scripts/run_qa.py`와 `python3 harness/scripts/run_quality_gate.py`를 실행한다.

## Review Plan

QA 완료 후 24-bit가 실제 float 렌더에서 생성됐는지, SoundCloud 메타데이터가 검색 가능성과 오인 방지를 함께 충족하는지, 권리·공개 설정 제안과 기술적 한계가 명확한지 검토하고 `docs/reviews/plan-1502-switchback-soundcloud-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-23 | 사용자 표현의 `RPM`은 곡 속도를 뜻하는 `BPM`으로 해석한다. | 음악 업로드 메타데이터에서 사용되는 표준 속도 단위는 BPM이기 때문이다. |
| 2026-07-23 | 기존 프로젝트를 float 단계에서 다시 렌더링해 24-bit signed PCM으로 직접 양자화한다. | 16-bit 파일을 24-bit로 포장하는 가짜 해상도 증가를 피하기 위해서다. |
| 2026-07-23 | 실제 SoundCloud 업로드는 수행하지 않고 업로드 준비 파일과 문서만 전달한다. | 사용자가 정보 작성을 요청했으며 외부 공개는 별도 권한과 최종 확인이 필요한 상태 변경이기 때문이다. |
| 2026-07-23 | 마지막 128프레임의 sub-16-bit 잔향은 제거하지 않고 final stereo frame만 digital zero인지 검증한다. | 최대 41/8,388,608의 float 렌더 잔향을 임의로 잘라내지 않으면서 파일 종료의 정확한 0을 보장하기 위해서다. |
| 2026-07-23 | SoundCloud 기본값은 `Electronic`, Private, All Rights Reserved, Downloads Off로 제안한다. | 검색 가능한 장르 하나를 유지하고 비공식 아티스트 타기팅 데모의 오인·원본 재배포 위험을 낮추기 위해서다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-23 | project_lead | Plan created. Located the user-moved Switchback source folder directly under Downloads. |
| 2026-07-23 | repo_cartographer | Reviewed current official SoundCloud upload, transcoding, genre/tag, metadata, artwork, privacy, and licensing help pages. |
| 2026-07-23 | harness_builder | Reopened the original 146 BPM D minor project, rendered the float mix, and encoded a 28,035,866-byte stereo 44.1kHz signed PCM 24-bit WAV. |
| 2026-07-23 | quality_runner | The current-renderer 16-bit reference matched the delivered 16-bit WAV byte-for-byte. `file`, `afinfo`, and an independent PCM parser confirmed the 24-bit output; 9,308,437 samples use nonzero lower-byte data. |
| 2026-07-23 | quality_runner | Peak/RMS measured -3.041/-20.485 dBFS with zero full-scale samples and an exact-zero final stereo frame. `python3 harness/scripts/run_qa.py` and `python3 harness/scripts/run_quality_gate.py` passed. |
| 2026-07-23 | review_judge | Post-QA review found no blocking audio, metadata, identity, or rights-boundary issue. Placeholder replacement and private transcoded-playback review remain required. |
| 2026-07-23 | project_lead | Copied the four-file pack to `/Users/taejungkim/Downloads/Switchback_SoundCloud_Upload_Pack_2026-07-23`; destination diff, WAV SHA-256, and `afinfo` checks passed. |

## Completion Notes

- Final WAV: `Switchback_MINAMI_Target_Pitch_Demo_24bit_44k1.wav`.
- Format: RIFF/WAVE signed integer PCM, stereo, 44.1kHz, 24-bit, six bytes per frame.
- Duration: 105.955488 seconds across 4,672,637 frames.
- Peak/RMS: -3.041/-20.485 dBFS; zero full-scale samples; final stereo frame is digital zero.
- SHA-256: `dfa98ec045aeb45757f1336e222dffb1505eaeb7538d609270e187ff8dc0a93e`.
- Source/current 16-bit parity: exact SHA-256 match, proving unchanged musical render state before 24-bit quantization.
- 24-bit lower-byte activity: 9,308,437 samples (99.606%), proving the file is not zero-padded 16-bit audio.
- Metadata pack includes SoundCloud-ready title, uploader Artist guidance, 146 BPM, D minor, genre, mood, tags, description, license/privacy/download defaults, artwork guidance, and upload checklist.
- Final user package: `/Users/taejungkim/Downloads/Switchback_SoundCloud_Upload_Pack_2026-07-23`.
