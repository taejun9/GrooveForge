# plan-1536-rock-hiphop-usability

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

UI/UX를 개선하고 실제 앱에서 90~180초 길이의 한요한 스타일 곡을 5곡 이상 제작·검증해 Downloads에 SoundCloud 업로드용으로 정리한다.

## Goal

곡 제작·편곡·내보내기 흐름의 구체적 사용성 문제를 개선한다. 기타를 연상시키는 합성 리프, 강한 백비트, 멜로딕한 신스와 록·힙합의 넓은 특성을 갖춘 오리지널 instrumental 5곡을 실제 production Electron 앱에서 편집·재생·WAV 내보내기·저장·재열기해 전달한다.

## Constraints

- 전용 branch/worktree에서 작업한다. 기존 프로젝트와 Downloads 파일을 덮어쓰지 않는다.
- 샘플 없는 내장 합성과 편집 가능한 이벤트를 사용한다. 특정 곡·멜로디·가사·보컬을 복제하지 않는다.
- WAV는 stereo 44.1 kHz signed PCM 24-bit, 각 90~180초로 검증한다.
- QA 뒤 독립 리뷰를 진행하고 계획 완료본과 review mirror를 남긴다.
- 사용자 요청은 Downloads 새 폴더 저장까지 포함한다. SoundCloud 실제 업로드는 범위 밖이다.

## Implementation Plan

- [x] 현행 UI와 제작/내보내기 경로를 검사하고 구체적인 개선을 구현한다.
- [x] 서로 다른 키·템포·리프·구성의 록/힙합 5곡을 준비한다.
- [x] 실제 앱 편집·재생·내보내기·저장·재열기와 오디오 검증을 수행한다.
- [x] 검증된 WAV·프로젝트·업로드 안내·체크섬을 Downloads에 새로 저장한다.
- [x] QA 후 독립 리뷰 및 계획 완료/통합 준비를 수행한다.

## QA Plan

`git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, `npm run renderer:smoke`, `npm run build`, `npm run sample-audio:qa`, `npm run desktop:launch-smoke` 및 요청형 actual-app QA를 실행한다. 최종 Downloads 위치에서 포맷·길이·무음/클리핑·해시·프로젝트 재렌더 일치를 확인한다.

## Review Plan

QA 완료 후 별도 reviewer가 UI 변경, 회귀, 테스트 증거와 5곡 전달 무결성을 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-09-17 | 5곡 모두 신규 록/힙합 instrumental로 구성한다. | 이전의 랩 포켓 전달물을 재사용하지 않고 이번 음악적 요청을 반영한다. |
| 2026-09-17 | 전체곡 전환 1클릭, 구간 시간/편집 이동, 내보내기 범위/길이/규격을 개선한다. | 길이 안내는 이미 존재하며 실제 장곡 작업의 탐색과 재생 전환 비용을 줄이는 것이 유용하다. |
| 2026-09-17 | actual-app movement QA에 arrangement 진행과 Electron audible 신호, WAV 미리듣기를 추가한다. | 기존 경로의 Open/edit/export/save/reopen만으로 실제 재생을 주장하지 않도록 한다. |
| 2026-09-17 | 설치 앱 갱신 시 기존 번들을 고유 이름으로 백업한다. | 사용자가 개선된 UI를 실제 앱에서도 바로 사용할 수 있게 하며 이전 설치본 복구 경로를 유지한다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-09-17 | project_lead | 깨끗한 main에서 전용 worktree와 계획을 생성했다. |
| 2026-09-17 | quality_runner | sample-audio QA에서 43개 WAV, 16개 스타일, 무음/ceiling/잔향/재렌더 회귀를 통과했다. |
| 2026-09-17 | harness_builder | 기존 desktop entry smoke의 Save path 문자열 기대값이 이전 launch-smoke fallback 변경을 따라가지 못한 baseline 회귀를 발견해 실제 네 경로를 검증하도록 갱신한다. |
| 2026-09-17 | quality_runner | 첫 실제 앱 실행은 5/5 편곡·재생·WAV·저장·재열기를 통과했으나 최종 감사에서 Intro mute 배열 순서가 canonical 순서와 달라 실패했다. 원래 증거를 보존하고 새 입력으로 재실행한다. |
| 2026-09-17 | harness_builder | 새 composition의 mute 배열을 canonical 순서로 수정하고 실행 전 순서 검사를 추가했다. 기존/신규 네 모드 self-test와 한글 주석·QA·quality gate가 통과했다. |
| 2026-09-17 | quality_runner | typecheck/build/renderer smoke/workflow/persona/harness/desktop entry/bundle/Korean comments와 기본/전체/요청/록 모드 self-test를 통과했다. 새 앱 패키지는 deep strict ad-hoc 서명·의존성 검증을 통과했다. |
| 2026-09-17 | quality_runner | 별도 full-PCM 검사에서 5곡 모두 full-scale 샘플 0, terminal zero, 양채널 신호와 WAV header 정합을 확인했다. sample peak −4.070~−1.297 dBFS, 내부 digital silence 최대 0.272ms이며 파일별 SHA와 1초 RMS를 기록했다. |
| 2026-09-17 | quality_runner | production desktop:launch-smoke exit 0. 전체곡 1클릭 전환, 다섯 작업 화면, 25개 disclosure, 드럼/노트 키보드, 메뉴/모달 포커스, 한국어/390px/1180px 및 고정 피드백 검사를 통과했다. |
| 2026-09-17 | quality_runner | 새 actual-app batch 5/5 및 최종 전달 감사 exit 0. 저장 프로젝트 재렌더와 실제 WAV 일치, 독립 전곡 PCM 검증 대상과도 SHA 5/5 일치. CUA로 Song map의 Hook 편집 버튼이 Arrange Timeline 3번 블록 선택과 포커스로 연결되는 것을 확인했다. |
| 2026-09-17 | plan_keeper | Downloads/GrooveForge_록힙합_5곡_SoundCloud_2026-09-17_145917에 54개 파일·305,250,055바이트를 저장했다. source/copy 54/54 SHA와 최종 checksums 53/53을 확인했고 로컬 청취 페이지 및 제목 포함 batch WAV를 제공했다. 실패 입력·보고서와 최종 QA 증거는 ignored build/desktop/plan-1536-completion-evidence에 보존했다. |
| 2026-09-17 | review_judge | QA 완료 후 독립 리뷰에서 남은 P0~P3 지적 0개. 원본 actual-app report 5/5, 재생/진행/WAV preview, source/build provenance, Downloads 54/54 SHA, checksums 53/53 및 청취 페이지 로컬 링크 16개를 확인했다. |
| 2026-09-17 | harness_builder | /Applications/GrooveForge.app을 검증된 번들로 갱신했다. 기존 앱은 /Applications/GrooveForge Backup plan-1536 2026-09-17-150439.app에 보존했으며, deep strict 서명과 테스트 패키지 주요 산출물 SHA 3/3 일치를 확인했다. |
| 2026-09-17 | plan_keeper | 계획을 completed로 옮기고 독립 리뷰·검증·전달 내역의 review mirror를 작성했다. 완료 문서 검사 뒤 main 통합·push와 전용 branch/worktree 정리를 수행한다. |

## Source Evidence

SoundCloud [Upload Requirements](https://help.soundcloud.com/hc/en-us/articles/360039171614-Upload-Requirements)를 2026-09-17 확인했다. 스테레오 무손실 형식과 16-bit/44.1 kHz 이상의 소스를 권장하며, 본 전달본은 스테레오 PCM24/44.1 kHz WAV를 사용한다.
