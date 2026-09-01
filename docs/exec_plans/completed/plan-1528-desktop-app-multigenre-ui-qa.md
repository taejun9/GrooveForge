# plan-1528-desktop-app-multigenre-ui-qa

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

현재 `npm run desktop`으로 실행하는 GrooveForge를 Finder에서 직접 열 수 있는 응용 프로그램 앱으로 만들고, 실제 앱 화면에서 전체 버그를 점검한다. 여러 장르를 테스트하며 각 테스트 음원을 1분 30초~2분 30초 길이로 만들고 SoundCloud에 바로 업로드할 수 있는 형태로 정리한다.

추가로 현재 모든 작업 도구가 한 긴 화면에 작게 몰려 보이는 구성을 실제 페이지형 탭으로 나눠, 선택한 작업을 더 큰 면적과 더 읽기 쉬운 크기로 사용할 수 있게 바꾼다.

## Goal

개발 명령 없이 Finder에서 열 수 있는 branded macOS `GrooveForge.app`과 로컬 설치용 DMG를 한 명령으로 재현 가능하게 만들고, 작업 도구를 실제 독립 페이지형 탭으로 재구성해 선택한 화면이 넓고 읽기 쉽게 보이도록 한다. source Electron과 packaged app의 실제 표시 화면에서 핵심 제작·재생·저장·재열기·전달 경로를 검증한다. 서로 다른 대표 장르 여섯 곡을 실제 앱의 native UI 경로로 90~150초 편곡·WAV export·Save·reopen하고, SoundCloud private-first 업로드 시트·재편집 프로젝트·기술 QA·checksum manifest와 함께 로컬 전달 패키지로 정리한다.

## Non-Goals

- SoundCloud 로그인, 실제 업로드, 공개, 예약 공개, 다운로드 허용, 수익화, 배급 또는 Content ID 설정을 변경하지 않는다.
- 사용자 정상 GrooveForge workspace, SQLite, recovery draft, 기존 프로젝트 또는 기존 Electron 세션을 읽거나 수정하지 않는다.
- Developer ID 서명, Apple notarization, Gatekeeper 외부 배포 승인, App Store 제출 또는 자동 업데이트 공개를 완료로 주장하지 않는다.
- 자동 PCM·UI 검증을 사람의 전곡 청취, LUFS/true-peak mastering, SoundCloud 변환 스트림 승인과 동일하게 주장하지 않는다.
- 특정 현존 아티스트의 멜로디·가사·편곡·음색·인식 가능한 스타일을 모사하지 않는다.
- 샘플 import를 MVP 중심으로 확장하거나 sampling-first 제품 방향으로 변경하지 않는다.

## Application Packaging Boundary

- `npm run desktop`은 개발용 source Electron 실행으로 유지한다.
- 새 사용자용 명령은 current build에서 branded, local ad-hoc signed `GrooveForge.app`과 unsigned local DMG를 만든다.
- 산출물은 ignored `build/desktop/` 아래에 두고, exact 경로·bundle id·아이콘·실행 파일·renderer/main/preload·framework dependency·code-signature posture를 검증한다.
- 앱은 Finder/double-click 가능한 로컬 결과물이지만 Developer ID/notarized 외부 배포본으로 표시하지 않는다.

## Audio Delivery Contract

- 대표 장르는 Ballad, Hip-Hop, Trap, R&B, House, Experimental 여섯 종류로 정해 여섯 Bass Voice를 모두 통과시키고, 전체 16-style rotation은 별도 회귀 검증으로 유지한다.
- 각 대표 곡은 90~150초, stereo 44.1kHz signed PCM 24-bit, frame-complete, audible, limiter-safe, full-scale sample 0, terminal digital zero여야 한다.
- 각 곡은 actual-app Open/edit/Deliver WAV/Save/reopen 증거, 재편집 `.grooveforge.json`, final WAV, 한글 SoundCloud upload sheet, 기술 QA row를 가진다.
- 최상위 README, machine-readable manifest, SHA-256 checksums는 파일 집합·형식·길이·장르·권리/업로드 경계를 재검증할 수 있어야 한다.

## Page Tab UX Contract

- Compose, Arrange, Mix, Deliver는 단순한 상태 카드가 아니라 상호 배타적인 실제 작업 페이지로 보이고 동작해야 한다.
- 선택한 페이지의 제목·설명·주요 작업은 넓은 단일 콘텐츠 면적을 사용하며, 다른 페이지의 대형 작업 패널은 동시에 보이거나 레이아웃 공간을 차지하지 않는다.
- Compose처럼 한 페이지 안에서도 편집기가 과도하게 3열로 압축되는 영역은 의미 있는 하위 작업 탭으로 나누되, 프로젝트 데이터와 선택 상태는 왕복해도 유지한다.
- 포인터와 키보드 Arrow/Home/End로 이동 가능하고, `tab`/`tabpanel`, `aria-selected`, `aria-controls`, roving tab stop, focus restoration을 지킨다.
- 1180×760 기준 글자·패드·편집 격자의 실사용 크기, 한 개 visible page, document horizontal overflow 0, 숨은 페이지 shortcut/mutation 0을 실제 Electron 화면에서 증명한다.

## Context Map

- 데스크톱 패키징: `package.json`, `harness/scripts/run_desktop_package_smoke.mjs`, `harness/scripts/run_desktop_dmg_smoke.mjs`
- 실제 화면 QA: `electron/main.ts`, `harness/scripts/run_desktop_manual_qa.mjs`
- 페이지형 탭과 레이아웃: `src/ui/App.tsx`, `src/ui/workstation*Panels.tsx`, `src/styles.css`
- 음악 모델·장르: `src/domain/workstation.ts`
- 렌더·SoundCloud: `src/audio/render.ts`, `src/audio/soundcloud.ts`, `src/audio/deliveryBundle.ts`
- 기존 장르 회귀: `harness/scripts/run_genre_rotation_delivery.mjs`
- 제품/품질 규칙: `docs/product/product.md`, `docs/architecture/harness.md`, `docs/quality/rules.md`, `docs/privacy/principles.md`

## Constraints

- QA and review are separate loops; review starts only after QA completes.
- Do not implement, commit, or push directly on `main`.
- Use `codex/plan-1528-desktop-app-multigenre-ui-qa` and `.worktree/plan-1528-desktop-app-multigenre-ui-qa`.
- Scope or approach changes must be recorded in the Decision Log.
- Actual-app work must use fresh plan-owned workspace roots, nonpersistent partitions, isolated Electron userData, workspace-only projects/exports, and source-preservation checks.
- App-screen automation must fail closed on missing/stale builds, unsafe paths, inaccessible controls, operation timeouts, project mismatch, WAV mismatch, or reopen mismatch.

## Implementation Plan

- [x] Add clear user-facing commands that build a Finder-launchable `GrooveForge.app` and local DMG without requiring `npm run desktop` for normal use.
- [x] Keep existing package/disk-image smokes compatible while separating artifact creation from launch-only test semantics.
- [x] Replace the dense all-tools canvas with mutually exclusive, large page-style workspace tabs and appropriate Compose/Mix sub-tabs where editors were compressed.
- [x] Preserve project/editor state, routes, page-aware shortcuts, focus, and existing project/audio boundaries across tab changes; final actual-app regression remains in QA.
- [x] Add a reproducible multi-genre actual-app QA/delivery runner with strict 90~150-second acceptance.
- [x] Generate six original representative genre source projects and strict native movement specifications.
- [x] Run each genre through visible Electron Open, native edit, Arrange, Mix/Deliver, WAV export, Save, and live reopen.
- [x] Validate UI reports/screenshots, project state, WAV signal/format/duration, deterministic metadata, and external-source preservation.
- [x] Assemble Korean SoundCloud private-first packages and a top-level manifest/checksum/readme without performing an upload.
- [x] Fix every reproducible in-scope P0/P1/P2 product or harness defect found, then rerun the same path.
- [x] Run repository/package/audio regression gates, complete independent post-QA review, move this plan to completed, and create its review mirror.

## QA Plan

- Static/repository: `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`.
- Product: `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run harness:smoke`, `npm run sample-audio:qa`, `npm run genre-rotation:delivery`.
- Source app: `npm run desktop:smoke`, `npm run desktop:launch-smoke`, `npm run desktop:project-io-smoke`, `npm run desktop:close-flow-smoke`.
- Page tabs: renderer/source assertions plus visible Electron pointer/keyboard traversal, one-visible-page checks, state roundtrip, hidden mutation guards, focus restoration, responsive 1180×760 and large-window screenshots, control-size/readability metrics, and zero-overflow inspection.
- Packaged app: new application build command, `npm run desktop:package-smoke`, `npm run desktop:packaged-project-io-smoke`, local DMG build/smoke, and direct visible packaged-app inspection.
- Multi-genre: run the new actual-app suite on six fresh isolated workspaces and independently audit every report, screenshot, project, WAV, upload sheet, manifest, checksum, path, symlink, and source hash.
- Audio: parse RIFF/WAVE chunks and PCM24; check duration 90~150 seconds, channels/rate/depth, frames, lower-byte activity, peak/RMS/DC, full-scale samples, end silence, click/transition bounds, distinct genre hashes, and exact artifact checksums.
- External boundary: confirm no external-service operation was requested, runtime traffic instrumentation is not claimed, and no account action, upload, user-audio access, private value, Developer ID/notarization, or external-distribution claim exists.

## Review Plan

After QA, review_judge independently checks application usability, source/packaged actual-screen evidence, workspace isolation, native input provenance, representative genre separation, every 90~150-second WAV contract, SoundCloud readiness copy, manifest completeness, privacy, unclaimed external steps, and any fixed bug regression. Open P0/P1/P2 findings block completion.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-08-31 | Use plan 1528 and a dedicated branch/worktree. | The repository has no active plan and plan 1527 is the latest completed work; repository policy forbids feature work on `main`. |
| 2026-08-31 | Treat `.app` plus local unsigned DMG as the requested application outcome, while preserving explicit signing/notarization limits. | The repository already has validated Electron bundle foundations; the missing user outcome is a clear reproducible application command and delivered artifact, not an unsupported external-distribution claim. |
| 2026-08-31 | Use six representative long-form genres plus the existing 16-style short rotation. | Six actual-app projects cover every Bass Voice family and deep UI/audio movement, while the existing matrix retains breadth across every supported style. |
| 2026-08-31 | Do not upload to SoundCloud. | Publication and rights-holder metadata require the user's account action and final human approval; this plan prepares upload-ready local files only. |
| 2026-08-31 | Expand the existing stage selector into true page-style tabs and add focused Compose sub-pages where editors are currently compressed. | The attached 3420×2214 screen shows the current stage strip exists, but the active Compose workspace still places drums, bass/melody, and instruments in a dense three-column long canvas; the user's request is for materially larger pages, not another decorative selector. |
| 2026-08-31 | Use six visible long-form genre runs: Ballad 72 BPM/36 bars, Hip-Hop 90/44, Trap 145/64, R&B 76/40, House 124/64, Experimental 110/56. | All stay within 90~150 seconds including GrooveForge's tempo-aware tail, span six distinct genre/bass-voice families, and remain within the 64-bar product limit. |
| 2026-08-31 | Upgrade Electron from the EOL 39 line to exact 43.5.0 instead of 44. | `npm audit` found the Electron 39 installation path affected by GHSA-jmr9-qjv8-65gv. An isolated 43.5.0 build removes the vulnerable extractor, keeps audit at zero, passes type/build/package/signature checks, and preserves the existing macOS 12 minimum that Electron 44 would raise to macOS 13. |
| 2026-09-01 | Keep outer Compose/Arrange/Mix/Deliver tabs and split the densest editors into three Compose pages and two Mix pages. | This preserves the production workflow hierarchy while giving each major editor a full-width page, one visible panel, page-aware shortcuts, and predictable keyboard navigation. |
| 2026-09-01 | Drive macOS native `<select>` controls with a unique printable type-ahead prefix after closing the AppKit popup. | Electron 43 routes Arrow Up/Down to popup behavior on macOS; the printable `char` path produced trusted keypress/input/change events and passed all six visible genre runs. |
| 2026-09-01 | Treat network status as an execution posture, not traffic telemetry. | The delivery manifest now records that no external-service operation was requested and explicitly says runtime traffic was not instrumented, avoiding an unsupported negative network claim. |
| 2026-09-01 | Rebuild the app and DMG from the current source after every final review fix, then require payload identity and packaged GUI/I-O/mount evidence before completion. | Independent review correctly treated a DMG older than the last tab-effect correction as a P2 completion blocker even though the source fix itself was P3. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-08-31 | project_lead | Confirmed `main` is clean, created `codex/plan-1528-desktop-app-multigenre-ui-qa`, and opened this execution plan. |
| 2026-08-31 | repo_cartographer | Initial audit found existing package, DMG, PKG, launch, project-I/O, 16-style rotation, actual-song, and movement-QA foundations; current `npm run desktop` remains a source-build launch command. |
| 2026-08-31 | project_lead | Added the attached-screen requirement: true mutually exclusive workspace pages plus larger focused editors and actual Electron readability/overflow/state QA. |
| 2026-08-31 | repo_cartographer | Added `desktop:app` and `desktop:dmg`, branded ad-hoc signed app/unsigned local DMG validation, and sibling-evidence preservation; app and DMG build smokes pass before the later UI rebuild. |
| 2026-08-31 | harness_builder | Added full-width Compose Drums/Bass & Melody/Chords & Sound pages and Mix Mixer/Master & Review pages with ARIA roving tabs, route reveal, and visible-page shortcut guards; typecheck and renderer smoke pass. |
| 2026-08-31 | privacy_guard | Confirmed Electron 39's install-time ZIP extractor advisory, validated exact Electron 43.5.0 in isolation with zero audit findings and unchanged macOS 12 minimum, then applied the exact dependency for full current-app regression. |
| 2026-09-01 | quality_runner | Passed source launch, project-I/O, close-flow, and full functional-tab GUI smokes. Verified one visible full-width page, zero document horizontal overflow, native pointer/keyboard navigation, hidden-page guards, state restoration, route focus, and 2880×1856 screenshots. |
| 2026-09-01 | harness_builder | Fixed actual-screen defects found by QA: nested page state reset, React batching during posture restore, hidden-page route focus, stale hidden-panel geometry collection, compressed note/chord action grids, Review Queue wrapping, and macOS Electron 43 native-select automation. |
| 2026-09-01 | quality_runner | Completed six visible actual-app genre runs and independent audits: Ballad 121.250s, Hip-Hop 118.333s, Trap 106.681s, R&B 127.500s, House 124.621s, Experimental 123.000s; all PCM24 stereo 44.1kHz, saved/reopened, deterministic, and checksum-valid. |
| 2026-09-01 | privacy_guard | Regenerated the 51-artifact private-first delivery with an unknown-local-path fail gate, explicit non-instrumented network posture, consumer checksum command, no local absolute paths, and 50/50 checksum payload rows passing. |
| 2026-09-01 | quality_runner | Passed 16/16 genre rotation, sample-audio QA with 43/43 terminal-zero WAV artifacts, packaged GUI smoke, packaged project-I/O, exact Electron/Node/Chromium/arm64 runtime checks, ad-hoc signature checks, direct computer-use page inspection, and DMG create/mount/content checks. |
| 2026-09-01 | quality_runner | Rebuilt the final app after replacing the inline tab-items effect dependency with stable `activeIndex`, then reran the full packaged GUI smoke: native tab traversal, hidden-page guards, route focus, modal focus, grid keyboard input, starter safety, visual capture, and packaged project save/open roundtrip all passed. The packaged `dist` and `dist-electron` trees are byte-identical to the final build. |
| 2026-09-01 | quality_runner | Regenerated and mounted the final 136,761,876-byte DMG after the app rebuild. It contains only `GrooveForge.app` plus the Applications shortcut; all 317 files and 14 symlinks match the final app, strict deep codesign passes, and its SHA-256 is `deeb62211fe1ffda5ce20ed7e8f19d08302fc4aae5bba6219e8aa319725f91e0`. |
| 2026-09-01 | review_judge | Independent post-QA re-review closed the stale-DMG finding after regeneration and reported final P0 0 / P1 0 / P2 0 / P3 0, with no completion blocker. |
| 2026-09-01 | plan_keeper | Marked the plan completed and created `docs/reviews/plan-1528-desktop-app-multigenre-ui-qa-review.md`; repository QA and the quality gate passed after the documentation move. |

## Completion Notes

- Finder-launchable `GrooveForge.app` and a current local DMG are reproducible through `desktop:app` and `desktop:dmg`.
- The production surface is divided into large mutually exclusive workflow pages and focused Compose/Mix sub-pages.
- Six representative 106.681-to-127.500-second actual-app projects and PCM24 WAVs passed strict UI, project, audio, deterministic-render, and checksum checks.
- The final private-first SoundCloud handoff contains 51 regular files with 50 verified checksum payload rows and no upload or account action.
- Final independent review is P0 0 / P1 0 / P2 0 / P3 0. Developer ID signing, notarization, human listening/mastering approval, metadata ownership, and actual publication remain explicit external steps.
