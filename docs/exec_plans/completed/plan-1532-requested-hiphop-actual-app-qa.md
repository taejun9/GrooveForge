# plan-1532-requested-hiphop-actual-app-qa

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

실제 앱에서 전체 버그 검증을 실행한다. 1분 30초~3분 길이의 테스트 음원을 최소 7곡 만들되, 요청된 세 아티스트·앨범 계열을 그대로 모사하지 않고 각각 넓은 제작 특성으로 번역한 3곡·2곡·2곡 이상의 독창적인 샘플 없는 힙합 instrumentals로 검증한다. 결과는 SoundCloud에 바로 선택할 수 있는 형태로 Downloads에 정리한다.

## Goal

현재 `main`의 전체 로컬 QA와 16개 StyleProfile actual-app UI 경로를 다시 실행하고, 요청을 다음 세 개의 비모사 production lane으로 번역한 7곡을 production Electron 앱에서 열기·편집·Arrange·Mix·Deliver·WAV export·Save·reopen까지 검증한다.

- 서울 언더그라운드형의 건조하고 거친 랩 포켓: 3곡 이상
- 어둡고 미니멀한 분할 벌스 포켓: 2곡 이상
- 신스 드라이브와 질주감을 가진 펑크 랩형 포켓: 2곡 이상

각 곡은 90~180초, sample-free editable events, stereo 44.1kHz signed PCM 24-bit WAV, reopenable GrooveForge project, 한국어 SoundCloud private-first upload sheet, technical QA, actual-app screenshots/report, manifest와 SHA-256을 갖는다. 최종 검증본은 새 고유 Downloads 폴더에 복사한다.

## Non-Goals

- 특정 현존 아티스트의 인식 가능한 멜로디, 코드 진행, 가사, 보컬 정체성, 프로듀서 태그, 녹음, 앨범 아트 또는 작품별 편곡을 모사하지 않는다.
- SoundCloud 로그인, 업로드, 공개·예약 공개, 수익화, 배급, Content ID 또는 계정 설정 변경을 수행하지 않는다.
- 자동·actual-app 검사를 무결점 보증, 사람의 전곡 청음, 예술적 승인, LUFS/true-peak mastering, 권리·메타데이터 승인과 동일하게 주장하지 않는다.
- 사용자 프로젝트나 기존 Downloads 전달물을 덮어쓰지 않는다.

## Context Map

- 앱과 UI: `src/ui/App.tsx`, `electron/main.ts`
- 프로젝트·스타일·arrangement: `src/domain/workstation.ts`
- audio render와 SoundCloud sheet: `src/audio/render.ts`, `src/audio/soundcloud.ts`
- actual-app 장르 QA: `harness/scripts/run_desktop_multigenre_actual_app_qa.mjs`
- 전체 품질 계약: `docs/quality/rules.md`, `harness/scripts/run_qa.py`, `harness/scripts/run_quality_gate.py`
- 기존 16장르 장곡 delivery: `docs/exec_plans/completed/plan-1531-install-all-genre-soundcloud.md`

## Constraints

- QA and review are separate loops; review starts only after QA completes.
- Do not implement, commit, or push directly on `main`.
- Use `codex/plan-1532-requested-hiphop-actual-app-qa` and `.worktree/plan-1532-requested-hiphop-actual-app-qa`.
- Scope or approach changes must be recorded in the Decision Log.
- 모든 음악은 built-in synthesis와 editable musical events로 로컬 생성한다.
- Downloads 복사는 검증된 source directory에서 아직 존재하지 않는 정확한 새 destination으로만 수행한다.

## Implementation Plan

- [x] 실제 앱·QA·기존 장곡 delivery 경로와 미병합 과거 초안을 감사한다.
- [x] 3+2+2 original production lane과 7곡의 제목, BPM, key, arrangement, sound/mix 방향을 정의한다.
- [x] 현재 actual-app runner에 전용 7곡 mode와 fail-closed 90~180초 delivery 계약을 구현한다.
- [x] 곡별 production brief, SoundCloud upload sheet, technical QA, report/screenshots, project/WAV와 전체 manifest/checksum을 생성한다.
- [x] focused self-test와 production Electron actual-app 7곡 suite를 통과한다.
- [x] 전체 정적·runtime·release QA와 16장르 actual-app 회귀를 통과한다.
- [x] 검증본을 새 Downloads 폴더로 복사하고 inventory, hash, WAV, project reopen을 독립 검증한다.
- [x] QA 후 별도 review를 수행하고 plan/review를 완료한다.

## QA Plan

- Static: `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, `npm run build`.
- Focused: 전용 runner self-test, 7/7 lane/style/title identity, 90~180초, project serialize/reopen, WAV header/frame/lower-byte/signal/ceiling/full-scale/tail/determinism, unique hashes, exact manifest/checksum set.
- Actual app: production Electron에서 7곡 각각 Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen, download receipt, visible input, screenshot/report 증거를 확인한다.
- Regression: `npm run desktop:all-genres-qa`, `npm run release:check`.
- Downloads: source/copy exact inventory and SHA-256 parity, no escaping symlink, all batch WAVs and projects independently reopen.

## Review Plan

QA 완료 뒤 review_judge가 3+2+2 coverage, 비모사 경계, actual-app 증거, 오디오 길이·포맷·신호, SoundCloud private-first 준비, Downloads 안전성, manifest/checksum 완전성과 잔여 인간 검토 항목을 독립 검사했다. 계획 범위는 승인했고 변경·전달물 finding은 없었다. 기존 wide-layout에는 stage 본문이 첫 viewport 아래로 밀리는 P2 사용성 문제와 브랜드·긴 제목이 잘리는 P3 표시 문제가 남아 별도 UI 후속 대상으로 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-09-07 | Use plan 1532 and a dedicated branch/worktree from current `main`. | 활성 plan이 없고 저장소 정책이 `main` 직접 작업을 금지한다. |
| 2026-09-07 | Translate the three named references into three broad, original production lanes and exclude names from public upload identity. | 테스트 목적과 요청한 대비는 유지하면서 특정 현존 아티스트·앨범의 인식 가능한 스타일 모사를 피한다. |
| 2026-09-07 | Treat “all bugs” as the full documented repository gate plus exhaustive 16-style actual-app regression and the new 7-song focused suite. | 유한 테스트로 발견되지 않은 버그가 전혀 없다고 증명할 수는 없으므로, 재현 가능한 최대 문서화 범위를 명시한다. |
| 2026-09-07 | Use built-in Synth/Chord events and drive for the high-energy lane rather than guitar recordings or samples. | 현재 앱의 sample-free first-class event 모델 안에서 편집 가능성과 재현성을 유지한다. |
| 2026-09-07 | Harden public-metadata rejection with NFKC compact matching and expanded secret-key fields after privacy QA found bypass fixtures. | 현재 delivery는 깨끗했지만 구두점·공백 변형 이름과 camelCase credential을 fail-closed로 거부해야 문서화한 계약과 일치한다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-09-07 | project_lead | Clean current `main`, empty active-plan directory, existing 16-style actual-app QA, and old unmerged hip-hop pack draft were identified; plan 1532 started. |
| 2026-09-07 | harness_builder | Added the opt-in `desktop:requested-hiphop-qa` mode, exact 3+2+2 matrix, 90–180 second audio contract, private-first delivery metadata, evidence, manifest, checksums, and hardened negative fixtures. |
| 2026-09-07 | quality_runner | The focused production Electron run passed 7/7 Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen paths; its corrected 73-file delivery passed 72/72 checksums and deterministic project rerender. |
| 2026-09-07 | privacy_guard | Independent privacy/rights audit passed after correcting the reference-date/checklist wording and closing NFKC/credential rejection gaps; no named reference, credential, private path, or imported audio remained. |
| 2026-09-07 | quality_runner | Exhaustive production Electron regression passed all 16 current StyleProfiles and assembled 147 verified local evidence artifacts. |
| 2026-09-07 | doc_gardener | The final 73-file, 408 MB package was copied to a fresh Downloads folder; source/copy diff was empty and independent checksum, WAV, project reopen, and byte-identical rerender audits passed. |
| 2026-09-07 | quality_runner | Passed final static gates, all 16 StyleProfile actual-app paths, and `npm run release:check` with repository QA plus all 91 ordered verify entries. Expected external Developer ID, notarization, update-feed, and distribution-channel blockers remained truthful and fail-closed. |
| 2026-09-07 | review_judge | Approved plan-1532 after independently checking code, 7/7 actual-app evidence, deterministic audio/projects, Downloads identity, privacy, and 16-style regression. Recorded one pre-existing P2 wide-layout usability issue and one pre-existing P3 truncation issue for later UI work. |
| 2026-09-07 | plan_keeper | Marked the plan completed and created the review mirror after QA and independent review. |

## Completion Notes

- `desktop:requested-hiphop-qa`는 서로 다른 StyleProfile/Beat Blueprint 일곱 개의 exact 3+2+2 lane을 production Electron에서 Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen까지 7/7 통과했다.
- 일곱 WAV는 모두 고유한 stereo 44.1kHz signed PCM 24-bit이며 106.681043~118.333333초다. full-scale/click-risk sample은 0이고 저장 프로젝트의 재렌더는 전달 WAV와 7/7 byte-identical이다.
- 검증된 사용자 전달 경로는 `/Users/taejungkim/Downloads/GrooveForge_오리지널_힙합_7곡_SoundCloud_업로드_패키지_2026-09-07`이다. source/copy 차이는 0, regular files 73개, symlink 0개, recorded checksums 72/72가 통과했다.
- `00-SoundCloud-WAV/`에는 일괄 선택용 WAV 7개가 있고, 각 곡 폴더에는 editable project, private-first upload sheet, production brief, technical QA, sanitized actual-app report, Arrange/Mix/Deliver PNG가 있다.
- `desktop:all-genres-qa`는 16/16 actual-app 회귀와 147개 증거 파일을 통과했다. 최종 static QA, quality gate, comments check, typecheck, build와 `release:check`의 전체 91 verify entries도 통과했다.
- 개인정보·권리 감사에서 이름 레퍼런스, 모사·제휴·미확인 권리 주장, credential, 개인 경로, imported audio는 0건이었다. Private, Downloads Off, 수익화·배급·Content ID Off가 7/7 시트에 기록됐다.
- 독립 리뷰는 계획 범위를 승인했다. 다만 기존 wide-layout의 P2 세로 공백/본문 below-fold와 P3 브랜드·긴 제목 잘림은 별도 UI 후속으로 남는다.
- SoundCloud 로그인·업로드·공개는 수행하지 않았다. 사람의 전곡 청음, 우연한 유사성 검토, LUFS/true-peak mastering, 실제 아티스트·권리자·기여자·라이선스·아트워크 입력, Private 변환 스트림 승인은 사용자 단계다.
