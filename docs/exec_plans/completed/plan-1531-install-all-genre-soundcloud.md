# plan-1531-install-all-genre-soundcloud

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

GrooveForge를 macOS 응용 프로그램으로 설치하고 모든 테스트를 실행한다. 생성 음원은 90~180초로 만들고 SoundCloud에 바로 올릴 수 있도록 Downloads에 정리하며, 지원하는 모든 장르를 테스트한다.

## Goal

현재 `main` 기준 Finder 실행용 `GrooveForge.app`과 DMG를 다시 빌드·검증하고 실제 `/Applications/GrooveForge.app`에 설치한다. 지원하는 16개 StyleProfile을 정확히 한 번씩 사용해 각 90~180초의 원본 sample-free 곡을 렌더하고, 44.1kHz stereo signed PCM 24-bit WAV·재편집 프로젝트·SoundCloud private-first 업로드 시트·기술 QA·manifest·SHA-256을 하나의 고유한 Downloads 전달 폴더에 정리한다. 저장소의 전체 로컬 릴리스 게이트, 6장르 actual-app UI QA, 새 16장르 장기 음원 QA를 모두 통과한 뒤 독립 리뷰한다.

## Non-Goals

- SoundCloud 로그인, 실제 업로드, 공개·예약 공개, 다운로드 허용, 수익화, 배급 또는 Content ID 설정을 변경하지 않는다.
- Developer ID 서명, Apple notarization, 다른 Mac의 Gatekeeper 승인 또는 App Store 배포를 완료로 주장하지 않는다.
- 자동 PCM 검사를 사람의 전곡 청취, LUFS/true-peak mastering 또는 SoundCloud 변환 스트림 승인과 동일하게 주장하지 않는다.
- 특정 현존 아티스트의 인식 가능한 멜로디·가사·편곡·음색을 모사하지 않는다.
- 기존 Downloads 결과나 `/Applications`의 불일치 앱을 확인 없이 덮어쓰지 않는다.

## Application Install Contract

- current source에서 `npm run desktop:dmg`로 branded local ad-hoc signed app과 unsigned DMG를 생성한다.
- 패키지·서명·DMG·simulated install·installed project I/O를 전체 게이트에서 먼저 검증한다.
- 실제 설치 전 `/Applications/GrooveForge.app` 존재 여부를 확인한다. 기존 앱이 없을 때만 검증된 app bundle을 `ditto`로 설치한다.
- 설치 후 source package와 실제 설치본의 regular file·symlink 집합 및 SHA-256, `Info.plist`, strict deep code signature를 비교하고 설치본을 격리된 smoke mode로 실행한다.
- 실제 설치본은 로컬 ad-hoc 서명이며 공증·외부 배포용으로 표현하지 않는다.

## All-Genre Audio Contract

- 대상은 현재 `styleProfiles` 16개 전체: Ballad, Hip-Hop, Trap, Drill, Boom Bap, Lo-fi, House, R&B, K-Hip-Hop/R&B, Afrobeats, Amapiano, Reggaeton, Jersey Club, Phonk, Garage, Experimental이다.
- 각 스타일은 전용 Beat Blueprint와 고유 제목을 사용하고, 64마디 상한 안에서 90~180초가 되는 long-form arrangement를 가진다.
- 각 WAV는 canonical RIFF/WAVE PCM format 1, stereo 44.1kHz signed 24-bit, complete frame, real lower-byte activity, audible signal, limiter ceiling 이하, full-scale sample 0, terminal digital zero, deterministic rerender여야 한다.
- 각 장르 폴더에는 final WAV, reopenable `.grooveforge.json`, 한글 SoundCloud Upload Sheet, machine-readable technical QA를 둔다.
- 최상위 README, manifest, `checksums.sha256`은 16/16 coverage, 길이·포맷·신호·권리 경계와 전체 파일 무결성을 독립 재검증할 수 있어야 한다.
- Downloads 대상은 날짜가 포함된 새 전용 폴더로 만들고 기존 결과를 덮어쓰지 않는다.

## Context Map

- 패키지와 앱 설치 기반: `package.json`, `harness/scripts/run_desktop_package_smoke.mjs`, `harness/scripts/run_desktop_dmg_smoke.mjs`, `harness/scripts/run_desktop_install_smoke.mjs`
- 전체 릴리스 QA: `docs/quality/rules.md`, `harness/scripts/run_qa.py`, `harness/scripts/run_quality_gate.py`
- 장르·프로젝트: `src/domain/workstation.ts`
- 렌더·분석: `src/audio/render.ts`
- SoundCloud 준비: `src/audio/soundcloud.ts`, `src/audio/deliveryBundle.ts`
- 기존 장르 회귀: `harness/scripts/run_genre_rotation_delivery.mjs`
- 기존 actual-app 장기 QA: `harness/scripts/run_desktop_multigenre_actual_app_qa.mjs`

## Constraints

- QA and review are separate loops; review starts only after QA completes.
- Do not implement, commit, or push directly on `main`.
- Use `codex/plan-1531-install-all-genre-soundcloud` and `.worktree/plan-1531-install-all-genre-soundcloud`.
- Scope or approach changes must be recorded in the Decision Log.
- 모든 생성·검증은 built-in editable events와 로컬 합성만 사용하며 사용자 오디오·프로젝트·계정·private value를 읽지 않는다.
- 저장소 산출물은 ignored `build/desktop/` 아래로 제한하고, 실제 설치와 Downloads 복사는 검증이 끝난 고유 대상에만 수행한다.

## Implementation Plan

- [x] 현재 앱 패키지·설치·전체 QA·장르·장기 음원·Downloads 상태를 감사하고 전용 plan/worktree를 연다.
- [x] 16개 전체 스타일의 90~180초 SoundCloud 전달물을 생성하는 fail-closed runner와 npm 진입점을 추가한다.
- [x] 장르별 long-form arrangement, 기술 WAV 검사, deterministic rerender, 프로젝트 reopen, manifest/checksum 및 private-first 문서를 구현한다.
- [x] README와 품질 문서를 새 전체 장르 장기 음원 명령·계약에 맞춘다.
- [x] focused QA와 16장르 전체 장기 렌더를 실행하고 결과를 독립 감사한다.
- [x] `npm run release:check`와 6장르 actual-app UI QA를 포함한 전체 회귀를 통과한다.
- [x] current app/DMG를 최종 재생성하고 검증된 앱을 실제 `/Applications`에 설치·검증한다.
- [x] 검증된 16장르 전달 폴더를 새 Downloads 경로에 복사하고 파일 집합·SHA-256을 다시 검증한다.
- [x] QA 완료 후 독립 리뷰하고 모든 P0/P1/P2를 닫은 뒤 plan/review를 완료한다.

## QA Plan

- Static: `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, `npm run build`.
- Focused all-genre: runner self-test, 16/16 style identity, blueprint identity, 90~180-second bound, project serialize/reopen parity, WAV header/frame/lower-byte/signal/peak/RMS/ceiling/full-scale/tail/determinism, unique audio hashes, exact manifest and checksum set.
- Product and UI: `npm run desktop:multigenre-qa` for six representative visible native UI edit/export/save/reopen paths plus the existing 16-style rotation.
- Full local gate: `npm run release:check` exactly once after focused fixes; preserve truthful external release blockers when private signing/notary/channel inputs are unavailable.
- App install: compare packaged and `/Applications` bundle inventory/hashes, validate bundle id/version/icon and strict deep ad-hoc signature, then run the installed executable through isolated smoke mode without opening user projects.
- Downloads: require a new absent destination, byte-identical copy, zero symlinks that escape the package, exact artifact count, and `shasum -a 256 -c checksums.sha256` success.

## Review Plan

QA 뒤 review_judge가 실제 설치본 identity, 실행 증거, 16/16 장르 coverage, 각 90~180초 WAV 계약, 프로젝트 재열기, SoundCloud 업로드 준비성, manifest/checksum 완전성, Downloads 경로 안전성, 외부 행동·권리·공증 경계를 독립 검사했다. 최종 판정은 승인, P0 0 / P1 0 / P2 0 / P3 0이다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-09-03 | Use plan 1531 and a dedicated branch/worktree. | Active plans are empty and plan 1530 is the latest completed plan; repository policy forbids implementation on `main`. |
| 2026-09-03 | Interpret “모든 장르” as all 16 current StyleProfiles, not only the six representative actual-app genres. | The repository exposes 16 supported editable style profiles and the user explicitly asked for every genre. |
| 2026-09-03 | Keep the six-genre visible actual-app suite and add a separate 16-style long-form delivery suite. | The existing actual-app path gives deep native UI coverage while the new suite provides exhaustive style and 90~180-second audio coverage without making the default short rotation impractically large. |
| 2026-09-03 | Install only after the full local QA gate and package verification pass. | This ensures `/Applications` receives the exact reviewed artifact rather than an intermediate build. |
| 2026-09-03 | Do not upload to SoundCloud. | Upload/publication and final metadata, rights, artwork, listening, and account decisions require user-controlled external actions; the requested local files can still be made upload-ready. |
| 2026-09-03 | Refresh the compatible transitive Browserslist dependency set before packaging. | A current registry-backed `npm audit` found two high-severity advisories in Browserslist 4.28.2; the lockfile-only compatible update to 4.28.8 removes them without changing direct dependencies. |
| 2026-09-03 | Preserve a second installed-app launch smoke as a complete stdout log after the first successful run. | The first run proved functionality and retained four PNGs, but its structured result existed only in the command capture; the second isolated run closed the review evidence-retention P3 candidate with one parseable `ok:true` result row and exit 0. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-09-03 | project_lead | Confirmed clean `main`, no active plan, no existing `/Applications/GrooveForge.app`, and existing six-genre Downloads delivery; created the dedicated plan branch/worktree. |
| 2026-09-03 | repo_cartographer | Found existing Finder app/DMG packaging, simulated-install tests, 6-genre 90~150-second actual-app QA, and 16-style short-form rotation; exhaustive 16-style 90~180-second delivery is the remaining gap. |
| 2026-09-03 | privacy_guard | Reproduced one transitive high-severity Browserslist finding against current npm advisory data, updated the compatible lockfile entries, and confirmed a clean `npm ci`, Browserslist 4.28.8, Electron package/runtime 43.5.0, and zero current audit findings. |
| 2026-09-03 | harness_builder | Added the opt-in `desktop:all-genres-qa` path while preserving the six-genre default; all 16 current StyleProfiles now have unique long-form blueprints, batch WAV copies, actual-app evidence, manifest, and checksums. |
| 2026-09-03 | quality_runner | Passed static QA, quality gate, comments, typecheck, build, zero-vulnerability npm audit, both runner self-tests, 16-genre offline audio self-test, six-genre actual-app QA, and 16-genre actual-app QA. The exhaustive run produced 147 artifacts for 16/16 styles at 106.681043~127.500023 seconds. |
| 2026-09-03 | quality_runner | Passed `npm run release:check` end to end: one repository QA plus all 91 ordered verify entries, including 43 playable sample-audio WAVs, 16-style rotation, source/packaged/PKG-payload/simulated-install launches, project I/O, DMG/PKG, privacy redaction, and truthful external-release blockers. |
| 2026-09-03 | project_lead | Installed the reviewed 0.1.0 arm64 ad-hoc bundle at `/Applications/GrooveForge.app`; checksum dry-run showed no source/install difference, both sides had 318 regular files and 14 symlinks, strict deep codesign passed, and an isolated installed-app full launch smoke exited 0. |
| 2026-09-03 | project_lead | Copied the delivery to `/Users/taejungkim/Downloads/GrooveForge_16장르_SoundCloud_업로드_패키지_2026-09-03`; checksum dry-run showed no source/copy difference, the copy has 147 files, zero symlinks, 16 batch WAVs, and all 146 recorded SHA-256 entries passed. |
| 2026-09-03 | review_judge | Independently rechecked the installed app's 654-entry content/link identity and strict signature, the preserved installed-app `ok:true` result log, 146/146 delivery checksums, all 16 RIFF/WAV files, 16 deterministic project rerenders, 48 unique actual-app screenshots, and privacy/private-first boundaries; approved with P0 0 / P1 0 / P2 0 / P3 0. |
| 2026-09-03 | plan_keeper | Marked the plan completed and created the review mirror after QA and independent review. |

## Completion Notes

- `/Applications/GrooveForge.app` now contains the exact reviewed GrooveForge 0.1.0 arm64 app bundle. Source/install checksum inventory, 318 regular files, 14 symlinks, bundle metadata, icon, and strict deep ad-hoc signature all match.
- The installed executable completed the comprehensive production launch smoke twice in isolated temporary workspaces. The retained second log has exactly one parseable `ok:true` result, exit 0, and four Compose/Arrange/Mix/Deliver PNGs.
- `desktop:multigenre-qa` passed 6/6 representative genres. `desktop:all-genres-qa` passed all 16 current StyleProfiles through visible Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen and produced 147 delivery files.
- All 16 final WAVs are unique stereo 44.1kHz signed PCM 24-bit sources, 106.681043~127.500023 seconds long. Independent parsing, signal/tail checks, project reopen, deterministic byte-identical rerender, batch-copy identity, and all 146 package checksums passed.
- The verified user delivery is `/Users/taejungkim/Downloads/GrooveForge_16장르_SoundCloud_업로드_패키지_2026-09-03`; `00-SoundCloud-WAV/` contains the 16 upload-selection copies, and every genre folder includes its editable project, private-first upload sheet, QA JSON, and actual-app evidence.
- Static QA, typecheck, production build, zero-vulnerability npm audit, offline long-form audio self-test, six-genre and all-genre actual-app suites, and the complete local `release:check` passed. The latter covered repository QA plus all 91 ordered verify entries.
- Final independent review is approved with P0 0 / P1 0 / P2 0 / P3 0. SoundCloud login/upload/publication was not performed; Developer ID signing, notarization, another Mac's Gatekeeper acceptance, human full-track listening, LUFS/true-peak review, final metadata/rights/artwork, and transcoded-stream approval remain explicit external or human steps.
