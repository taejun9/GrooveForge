# plan-1535-usability-hiphop-delivery

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

앱의 사용 편의성을 높이고, 1분 30초~3분 길이의 블랙넛 스타일 테스트 음원 3곡 이상을 SoundCloud 업로드용으로 Downloads에 정리한다.

## Goal

현재 곡 길이를 90~180초 목표와 바로 비교하고 편곡 화면으로 이동할 수 있는 읽기 전용 안내를 추가한다. 샘플 없는 편집 가능 이벤트와 내장 합성으로 건조하고 거친 서울 언더그라운드 랩 포켓의 오리지널 instrumental 3곡 이상을 실제 production Electron 앱에서 내보내고, WAV·프로젝트·업로드 시트·검증 자료를 새 Downloads 폴더에 정리한다.

## Non-Goals

- 특정 아티스트의 인식 가능한 멜로디, 코드, 가사, 보컬, 플로우, 태그 또는 녹음을 모사하지 않는다.
- SoundCloud 로그인, 업로드, 공개, 계정 설정 변경을 수행하지 않는다.
- 길이 안내를 SoundCloud의 필수 길이 규격으로 주장하지 않는다.
- 기존 프로젝트, 설치 앱, Downloads 전달물을 덮어쓰지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 화면과 번역: `src/ui/WorkspaceOverview.tsx`, `src/ui/App.tsx`, `src/ui/localization.tsx`, `src/styles.css`
- 오디오와 전달: `src/audio/render.ts`, `src/audio/soundcloud.ts`, `harness/scripts/run_desktop_multigenre_actual_app_qa.mjs`
- 품질 규칙: `docs/quality/rules.md`

## Constraints

- `codex/plan-1535-usability-hiphop-delivery`와 `.worktree/plan-1535-usability-hiphop-delivery`에서 구현한다.
- QA가 완료된 뒤 독립 review를 진행한다.
- 화면 안내는 프로젝트 schema나 undo 기록을 바꾸지 않는다.
- 모든 곡은 90~180초, stereo 44.1 kHz signed PCM 24-bit WAV로 검증한다.
- 최종 복사는 아직 존재하지 않는 고유 Downloads 폴더에만 수행한다.

## Implementation Plan

- [x] Overview에 현재 BPM 기준 목표 범위·필요 마디 수·Arrange 이동 안내를 추가한다.
- [x] 번역과 접근성·반응형 화면 계약을 검증한다.
- [x] 실제 production Electron 앱에서 요청형 힙합 QA를 재실행하고 건조한 랩 포켓 3곡을 선별한다.
- [x] 검증된 7곡 전달본에서 첫 3곡만 새 manifest와 체크섬으로 재패키징한다.
- [x] WAV, 재열기 가능한 프로젝트, 업로드 시트, 무결성 검증 자료를 Downloads 새 폴더에 정리한다.
- [x] QA 뒤 독립 리뷰를 수행하고 계획 완료본과 review mirror를 작성한다.

## QA Plan

- `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, `npm run renderer:smoke`, `npm run build`.
- 곡 길이 경계(미달/범위 안/초과), BPM별 마디 계산, 안내 버튼의 Arrange 라우팅을 확인한다.
- `npm run desktop:requested-hiphop-qa`의 actual-app Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen 결과를 확인한다.
- `npm run sample-audio:qa`와 production `npm run desktop:launch-smoke`로 render·화면·키보드 회귀를 확인한다.
- 최종 파일 위치에서 WAV 포맷·길이·signal·해시·프로젝트 재열기·시트 기본값을 확인한다.

## Review Plan

QA 후 별도 reviewer가 길이 계산, 프로젝트 불변성, 키보드 접근성, 가독성, 오디오 검증 증거, 전달 폴더 무결성, 아티스트 비모사·local-first 경계를 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-09-15 | 현재 코드에 없는 길이 목표 안내를 사용성 개선 범위로 정한다. | 최신 UI 리뷰에서 이전 레이아웃 결함은 닫혔고 이번 긴 곡 제작 경로의 남은 수동 계산을 줄일 수 있다. |
| 2026-09-15 | 요청된 스타일을 건조하고 거친 랩 포켓이라는 넓은 제작 특성으로 해석한다. | 현재 앱은 샘플 없는 비트 workstation이며 오리지널 instrumental로 검증할 수 있다. |
| 2026-09-15 | 기존 7곡 actual-app runner에서 해당 포켓의 3곡을 선별한다. | 실제 UI export와 재열기, 길이·PCM 검증을 이미 한 경로로 증명하며 요구 곡 수를 정확히 충족한다. |
| 2026-09-15 | 7곡 검증 산출물의 첫 3곡만 고유한 로컬 산출물에 새 manifest와 체크섬으로 재패키징한다. | 원본 7곡 manifest를 일부 파일과 함께 복사하면 4곡의 누락 경로가 남으므로, SoundCloud 파일 선택 폴더와 무결성 기록을 정확한 3곡 집합에 맞춘다. |
| 2026-09-15 | 목표 길이는 음악 구간에 템포별 잔향과 실제 WAV frame ceil을 더해 계산한다. | 사용자에게 보이는 목표 상태와 내보낸 WAV 파일의 90~180초 경계를 일치시키기 위해서다. |
| 2026-09-15 | 90~180초 길이 안내를 기본으로 펼치지 않는 선택형 장곡 목표로 바꾼다. | 독립 리뷰가 정상 첫 사용자의 8마디 MVP를 목표 미달로 표시하는 P2 회귀를 발견했기 때문이다. |
| 2026-09-15 | 장곡 목표의 시간 표시는 판정과 같은 centisecond 정수로 만들고, 미달은 내림·초과는 올림한다. | 89.980771초를 `1:30`으로 표시해 ‘미달’ 판정과 충돌하던 P2 경계 오류를 해소한다. |
| 2026-09-15 | production launch smoke의 native disclosure inventory를 25개(기본 열림 1, 닫힘 24)로 갱신한다. | 새 Overview 안내가 정상적으로 25번째 disclosure가 되어 기존 24/23 예상값이 QA를 실패시켰다. |

## Progress Log

| date | role | note |
|---|---|
| 2026-09-15 | project_lead | 깨끗한 main과 이전 실제 앱 QA 경로를 확인하고 전용 branch/worktree 및 활성 계획을 열었다. |
| 2026-09-15 | harness_builder | Overview 목표 길이 안내, 한영 번역, Arrange 라우팅, 경계 renderer 계약 및 3곡 선별 스크립트를 구현했다. |
| 2026-09-15 | quality_runner | static QA, quality gate, comments, typecheck, renderer smoke, production build, sample-audio QA(16 style/43 WAV)와 production Electron launch smoke(901~1440px fixed-frame·메뉴·키보드·초점)를 통과했다. |
| 2026-09-15 | quality_runner | 요청형 실제 Electron 앱 QA가 7/7 Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen을 마치고 73개 파일 전달본을 조립했다. |
| 2026-09-15 | plan_keeper | 3곡 선별본을 `/Users/taejungkim/Downloads/GrooveForge_오리지널_랩비트_3곡_SoundCloud_2026-09-15_174311`에 새로 복사했다. 30개 파일·97,455,998바이트, source/copy 30/30 SHA, 최종 위치 29/29 체크섬, 3/3 WAV·project·sheet 및 project byte-identical 재렌더를 통과했다. |
| 2026-09-15 | review_judge | 최초 post-QA 리뷰가 정상 8마디 starter를 장곡 목표 미달로 판단하는 P2를 지적했다. 기본으로 접힌 선택형 안내로 수정한 뒤 집중 QA와 재리뷰를 수행한다. |
| 2026-09-15 | quality_runner | 두 번째 리뷰의 90/180초 표시 경계 P2를 수정했다. `git diff --check`, `npm run qa`, quality gate, Korean comments, typecheck, renderer smoke가 최종 수정본에서 통과했다. production Electron launch smoke와 build를 마무리한다. |
| 2026-09-15 | quality_runner | 수정본의 production launch smoke는 새 접힘 안내로 disclosure 수가 25개가 되었는데 기존 harness가 24개를 기대해 실패했다. actual DOM 전체 count 계약과 성공 로그를 갱신한 뒤 rerun한다. |
| 2026-09-15 | quality_runner | 최종 build, typecheck, renderer smoke, 정적 QA, quality gate, Korean comments가 통과했다. Production Electron launch smoke도 5개 작업 화면·25개 disclosure 내용/Tab 누출 0·한국어/390/1180px·메뉴/모달/키보드를 통과했다. |
| 2026-09-15 | review_judge | QA 후 독립 리뷰에서 남은 P0~P3 결함이 없다고 판정했다. 8마디 첫 비트와 길이 표시 경계 P2가 닫혔고 Downloads 30개 파일·29/29 체크섬·3개 WAV와 project 재렌더를 확인했다. |

## Completion Notes

독립 리뷰 통과, 남은 P0~P3 없음. 세 WAV는 118.333초, 115.761초, 113.298초이고 stereo 44.1 kHz signed PCM 24-bit다. 음원은 원본 instrumental이며 업로드 시트의 아티스트·권리자·기여자·라이선스·아트워크 자리표시자와 사람의 전곡 청음, LUFS/true-peak 판단은 사용자 확인 항목이다. SoundCloud 로그인·업로드·공개는 수행하지 않았다.
