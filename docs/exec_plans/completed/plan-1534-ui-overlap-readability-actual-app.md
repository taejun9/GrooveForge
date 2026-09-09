# plan-1534-ui-overlap-readability-actual-app

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

실제 설치 앱에서 확인된 영역 겹침과 낮은 가독성을 다시 UI/UX 관점에서 수정한다. 수정 후 새 앱을 실제 `/Applications`에 다시 설치해 수동·자동 검증하고, 기존 방식대로 모든 현재 장르의 1분 30초~3분 테스트 음원과 SoundCloud 업로드 준비 자료를 Downloads에 정리한다.

## Goal

- 고정 상단 탐색과 하단 플레이어를 유지하면서 선택된 작업 화면의 콘텐츠가 플레이어·상태 영역과 겹치지 않게 한다.
- 실제 지원 최소 데스크톱 크기에서 주요 텍스트, 버튼, 카드, 시퀀서와 편곡 화면을 읽고 조작하기 쉽게 만든다.
- 불필요한 빈 공간과 과도한 정보 밀도를 줄이고, 내부 스크롤이 필요한 화면에서도 현재 스크롤 영역과 가려지지 않는 끝 여백을 명확히 한다.
- Review Queue와 같은 Quick Action 목적지가 실제 viewport에 나타나도록 focus/scroll 라우팅을 교정한다.
- 새 production 앱을 패키징해 실제 `/Applications`에 안전하게 재설치하고 핵심 UI 경로를 직접 검증한다.
- 현재 전체 StyleProfile에 대해 실제 앱 경로로 90~180초 WAV와 SoundCloud private-first 메타데이터·검증 자료를 생성해 새 Downloads 폴더에 정리한다.

## Non-Goals

- 프로젝트 스키마, 음악 생성 규칙, 오디오 엔진, 샘플링 중심 흐름, 클라우드 기능 또는 외부 계정 연동을 변경하지 않는다.
- SoundCloud 로그인, 업로드, 공개, 수익화, Content ID 또는 계정 설정을 대신 수행하지 않는다.
- 기존 사용자 프로젝트, recovery draft, 기존 `/Applications` 설치본 또는 이전 Downloads 결과물을 삭제하지 않는다.
- 이번 시각 개선 범위를 전체 한글화 재작성으로 확대하지 않는다. 단, 수정하는 UI의 한글 가독성과 기존 번역은 보존한다.

## Context Map

- 앱 shell·탭·플레이어·Quick Actions: `src/ui/App.tsx`, `src/ui/HeaderActionDock.tsx`, `src/ui/WorkspacePageTabs.tsx`, `src/ui/workstationAppQuickActions.tsx`
- 작업 화면 패널: `src/ui/workstationComposePanels.tsx`, `src/ui/workstationMixPanels.tsx`, `src/ui/workstationShellPanels.tsx`, `src/ui/WorkspaceOverview.tsx`
- 레이아웃과 반응형 스타일: `src/styles.css`
- 실제 앱·전체 장르·패키지 검증: `harness/scripts/`
- 제품·품질 계약: `docs/product/product.md`, `docs/architecture/product-architecture.md`, `docs/quality/rules.md`

## Constraints

- QA와 review는 별도 단계이며 review는 QA 완료 후 시작한다.
- `main`에서 구현·커밋·푸시하지 않고 `codex/plan-1534-ui-overlap-readability-actual-app` 및 전용 worktree를 사용한다.
- 901px 이상 데스크톱에서 document 세로 overflow를 만들지 않는다. 본질적으로 큰 editor surface만 선택 패널 내부 스크롤을 사용한다.
- fixed player와 header/action dock은 유지하되 콘텐츠 hit target, focus ring, status text 및 마지막 행을 가리지 않는다.
- 실제 `/Applications` 재설치는 기존 앱을 복구 가능한 백업으로 보존한 뒤 정확한 새 빌드만 대상으로 한다.
- 생성 음원은 현재 앱의 내장 이벤트·악기만 사용하고 90~180초, stereo 44.1kHz signed PCM 24-bit WAV 계약을 만족해야 한다.
- 외부 업로드나 네트워크 계정 작업 없이 local-first private-first 패키지만 만든다.

## Implementation Plan

- [x] 실제 앱에서 재현된 겹침·잘림·빈 공간·작은 글자·Quick Action viewport 문제를 소스와 smoke 계약에 매핑한다.
- [x] shell 높이 계산, panel scroll ownership, player safe area와 카드 밀도를 수정한다.
- [x] Compose·Arrange·Mix·Deliver·Guide에서 실제 최소 창 크기의 가독성과 하단 접근성을 개선한다.
- [x] Quick Action destination의 disclosure, focus 및 scroll-into-view 순서를 안정화한다.
- [x] renderer/desktop smoke가 실제 반응형 조건과 bounded settle을 검증하도록 관련 stale 계약을 갱신한다.
- [x] focused QA, production build, desktop package/install smoke와 실제 앱 수동 UI 검증을 수행한다.
- [x] 새 앱을 실제 `/Applications`에 안전하게 재설치하고 정확한 bundle 경로·버전·서명을 확인한다.
- [x] 실제 앱 전체 장르 generation/export/save/reopen 경로로 90~180초 WAV를 생성하고 SoundCloud 업로드 자료를 Downloads에 검증된 묶음으로 정리한다.
- [x] QA 후 독립 review를 수행하고 plan/review를 완료한 뒤 main 병합·푸시와 worktree 정리를 수행한다.

## QA Plan

- Static: `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, `npm run build`.
- Focused renderer: 모든 main/sub tab, fixed header/player, internal scroll safe area, minimum/wide viewport overflow, font and control readability, Quick Action route visibility.
- Desktop: production Electron 901/1024/1180/1440px visual and keyboard paths; Review Queue must be visibly in viewport after routing.
- Package/install: packaged app and simulated install smokes, then a separately verified real `/Applications` installation without losing the previous app.
- Audio: every current StyleProfile completes actual-app Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen; WAV duration, format, audibility, distinctness and checksum metadata are validated.
- Download package: no symlink or `.DS_Store`, manifest checksums match, upload sheets remain private-first and contain no credentials or upload claims.

## Review Plan

QA 완료 후 review_judge가 fixed-shell geometry, focus/scroll accessibility, minimum-window readability, regression risk, actual installed-app evidence, all-style audio artifact integrity, local-first/privacy boundaries를 독립 검토했다. 최초 P3 한 건이었던 1180px Quick Action 후속 문장 잘림은 2줄 표시·전체 문장 tooltip·renderer 계약으로 닫혔고, 재검토에서 신규 P0–P3 finding은 없었다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-09-09 | Use plan 1534 and a dedicated branch/worktree from `main@7c9321ec`. | 활성 plan이 없고 저장소 정책상 feature work는 main에서 직접 수행할 수 없다. |
| 2026-09-09 | Treat the prior real-app overlap/readability audit as the acceptance baseline. | 사용자가 같은 실제 증상을 확인했고 재현 지점과 실패 smoke가 이미 확보되어 있다. |
| 2026-09-09 | Preserve the existing real install and previous Downloads packages while producing timestamped replacements. | 실제 재설치·결과 정리 요청을 충족하면서 사용자 데이터와 비교 가능한 이전 증거를 보존한다. |
| 2026-09-09 | Interpret “평소처럼” as the established 16-style, 90–180 second, SoundCloud private-first package contract. | 바로 전 완료 작업에 동일한 전 장르 산출물 구조와 검증 기준이 기록되어 있다. |
| 2026-09-09 | Reserve a distinct bottom result lane only while workflow, workspace, draft, or mode feedback is present. | 고정 결과 스트립을 플레이어 위에 겹쳐 띄우지 않고 활성 editor 높이를 동적으로 줄여 결과와 조작부를 모두 읽고 누를 수 있게 한다. |
| 2026-09-09 | Use `overflow: clip` for structural disclosures and keep scrolling on the selected workspace panel. | `scrollIntoView()`가 닫힌 details 안에 숨은 scroll offset을 만들던 실제 native-click 클리핑 원인을 막으면서 편집 화면의 의도된 내부 스크롤은 유지한다. |
| 2026-09-09 | Close Guide and synchronously open the required review disclosures before bounded two-frame focus/reveal. | Review Queue 목적지가 화면에 나타나도 Guide 또는 fixed 영역에 가려지는 race를 제거하고 `elementFromPoint`로 실제 hit visibility를 증명한다. |
| 2026-09-09 | Replace fixed desktop resize sleeps with a bounded viewport and media-query settle. | 901/1024/1180/1440px 실제 창 resize에서 오래된 고정 대기 시간 때문에 생기던 비결정적 smoke 실패를 없앤다. |
| 2026-09-10 | Install only after source, packaged, ad-hoc signed, PKG payload, and simulated-installed launches plus project I/O pass. | 실제 `/Applications` 교체 전에 동일 payload의 UI, 서명, dyld 의존성, 저장·재열기를 여러 경로에서 검증한다. |
| 2026-09-10 | Preserve the prior canonical app as `GrooveForge Backup 2026-09-10 plan-1534.app` and keep the separate QA app unchanged. | 재설치를 복구 가능하게 수행하고 사용자의 이전 설치 자산을 삭제하지 않는다. |
| 2026-09-10 | Keep the fresh all-style run's plan-1531 provenance inside its manifest and omit plan numbering from the outer Downloads folder. | 실제 생성 runner와 manifest 계약은 plan-1531을 정확히 기록하되 전달 폴더가 다른 plan 소유권을 암시하지 않게 해 추적성 혼동을 제거한다. |
| 2026-09-10 | Render only the newest of six transient feedback owners in one bounded 82px lane and arbitrate delayed completions with a monotonically increasing intent epoch. | 모드, 프로젝트, 복구본, 작업 흐름, 실행 취소, Quick Action 결과가 동시에 겹치거나 오래된 비동기 저장 결과가 최신 사용자 동작을 덮는 문제를 함께 막는다. |
| 2026-09-10 | Give launch smoke a process-specific temporary project workspace and non-persistent browser partition, and explicitly close the first-run launchpad before testing direct mode controls. | 실제 native click과 지연 저장 회귀를 사용자 프로젝트·draft와 분리하고, locale reload로 다시 열린 안내 레이어가 테스트 대상 버튼을 가리는 전제 오류를 제거한다. |
| 2026-09-10 | Reinstall the post-feedback-fix package at the canonical `/Applications/GrooveForge.app` path and preserve the displaced app as `GrooveForge Backup 2026-09-10 plan-1534-pre-feedback-fix.app`. | 최종 소스와 실제 설치본을 byte-identical하게 맞추면서 직전 설치도 복구 가능한 상태로 남긴다. |
| 2026-09-10 | Re-audit the already fresh 16-style Downloads payload instead of generating duplicate audio after UI/harness-only changes. | 최종 변경은 audio domain·renderer를 바꾸지 않았고, 기존 16곡의 길이·PCM·체크섬·메타데이터 계약을 다시 전수 확인해 같은 결과를 중복 생성할 이유가 없다. |
| 2026-09-10 | Close the post-QA P3 by allowing fixed Quick Action follow-up copy to use a two-line clamp and exposing the complete sentence through `title`. | 82px 결과 행과 no-scroll 계약을 유지하면서 1180px에서 `Audition`·`Next check`가 한 줄 말줄임으로 거의 읽히지 않던 가독성 문제를 줄인다. |
| 2026-09-10 | Preserve the displaced canonical app again as `GrooveForge Backup 2026-09-10 plan-1534-pre-two-line-fix.app` before activating the final package. | 독립 리뷰 후 반영된 CSS와 실제 `/Applications` 설치본의 바이트를 일치시키면서 각 설치 시점을 복구 가능하게 유지한다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-09-09 | project_lead | Started plan 1534 after confirming the user's expanded scope includes UI refinement, real app reinstall, and a fresh all-style SoundCloud-ready Downloads package. |
| 2026-09-09 | repo_cartographer | Mapped the overlap failures to the 114px transport, 40px main tabs, 56px sub-tabs, selected panel scroll owner, fixed player, and dynamically reserved result lane. |
| 2026-09-09 | harness_builder | Corrected shell geometry, transport alignment, page density, structural overflow, stale result arbitration, Review Queue reveal/focus, loop-scope hit-size threshold, and bounded Electron resize settling. |
| 2026-09-09 | quality_runner | Repository QA, quality gate, Korean comments, typecheck, renderer/workflow/persona/harness/project-workspace/Quick Actions/desktop smokes, build, sample-audio QA, and 16-style self/audio-self tests passed. |
| 2026-09-09 | quality_runner | Production Electron launch smoke passed five main tabs, all contextual sub-tabs, 901/1024/1180/1440px zero document overflow, fixed Export/Utility, bottom player, Review Queue visibility, Korean locale persistence, grids, starters, and project-state preservation. |
| 2026-09-09 | quality_runner | Production Electron all-style QA passed 16/16 visible Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen paths; 16 WAVs are 106.681–127.500 seconds and canonical stereo 44.1kHz signed PCM 24-bit. |
| 2026-09-09 | doc_gardener | Copied the verified 147-file result to `GrooveForge_16장르_SoundCloud_업로드_패키지_2026-09-09_234901`; 16 batch WAVs and all 146 recorded SHA-256 checks passed with no symlink or `.DS_Store`. |
| 2026-09-10 | doc_gardener | Removed the ambiguous plan suffix from the outer Downloads folder after review identified a traceability P3 candidate; payload bytes stayed unchanged and 146/146 checksums passed again. |
| 2026-09-10 | quality_runner | Project I/O, guarded close flow, package launch, packaged I/O, ad-hoc signed launch, hardened-runtime readiness, DMG, PKG, PKG payload launch/I/O, simulated install launch/I/O all passed. |
| 2026-09-10 | quality_runner | Reinstalled the byte-identical 654-entry app at `/Applications/GrooveForge.app`, retained the 654-entry previous app backup, and verified bundle id/version plus strict deep ad-hoc signature. |
| 2026-09-10 | quality_runner | Direct CUA inspection of the installed path confirmed the bundled file URL, Korean UI, Overview, all main and representative sub-tabs, unobscured Review Queue, Export choices, and global Play/Stop without deleting the retained local draft. |
| 2026-09-10 | harness_builder | Consolidated mode, project, local-draft, workflow, undo/redo, and Quick Action feedback into one fixed lane, added latest-intent suppression for delayed async results, and wrapped the direct recovery-clear handler so React SyntheticEvent cannot become an intent epoch. |
| 2026-09-10 | quality_runner | The final production launch and simulated-install smokes passed the six-owner fixed-feedback replacement sequence, stale Save suppression, zero-overflow 901/1024/1180/1440 frames, native menu/tab/player paths, project I/O, DMG launch, and installed-app launch. |
| 2026-09-10 | quality_runner | Reinstalled the final byte-identical app at `/Applications/GrooveForge.app`, retained both earlier backups, verified strict deep ad-hoc signing, bundle id/version/arm64 identity, and directly exercised Overview, Compose, Arrange, Mix, Deliver, representative sub-tabs, both upper-right menus, and global Play/Stop in the canonical installed path. |
| 2026-09-10 | doc_gardener | Re-audited the timestamped Downloads package: 147 regular files, 16 unique batch WAVs plus 16 byte-identical per-genre copies, 106.681–127.500-second stereo 44.1kHz signed PCM 24-bit audio, 146/146 checksums, 16 private-first upload sheets, and no symlink, `.DS_Store`, empty file, or upload claim. |
| 2026-09-10 | quality_runner | Final `git diff --check`, repository QA, quality gate, Korean comment coverage, typecheck, renderer smoke, and production build passed. The sole initial repository-QA failure was an obsolete three-argument call-string contract, which was updated to the new intent-aware four-argument calls before the clean rerun. |
| 2026-09-10 | review_judge | Post-QA review found no P0–P2 issue and one P3: long fixed Quick Action follow-up sentences remained visually truncated at 1180px. |
| 2026-09-10 | harness_builder | Closed the P3 with stacked follow-up labels, two-line visual copy, full-text hover titles, and renderer contract coverage without expanding the 82px lane. |
| 2026-09-10 | quality_runner | After the P3 fix, repository QA, quality gate, Korean comments, diff, typecheck, renderer smoke, build, production launch smoke, packaged-app smoke, fresh DMG smoke, and DMG simulated-install smoke all passed again. |
| 2026-09-10 | quality_runner | Activated the final package at `/Applications/GrooveForge.app`; package/install `rsync` diff is empty, strict deep ad-hoc signing passes, the app is arm64 with bundle id `app.grooveforge.desktop` and version `0.1.0`, and installed/package renderer hashes both equal `bae9be31cec54707b5340592b2b04825c82de69a14e9c05b05c93ddbc93327c1`. |
| 2026-09-10 | quality_runner | Direct CUA on the final canonical install confirmed the bundled file URL, retained Korean UI and draft deferral, two-line Quick Action follow-up display, no result/editor/player overlap, and clean shutdown without restoring or clearing the user's draft. |
| 2026-09-10 | quality_runner | Final `git diff --check`, repository QA, quality gate, Korean comment coverage, typecheck, renderer smoke, and production build passed. The sole initial repository-QA failure was an obsolete three-argument `loadProjectText` source-string assertion; updating it to the new intent-aware four-argument calls made the rerun pass. |
| 2026-09-10 | review_judge | Closed the original P3 after verifying the two-line Quick Action text and full-text tooltip contract; the final working diff, installed-app evidence, and delivery audit produced no new P0–P3 finding. |
| 2026-09-10 | plan_keeper | Marked plan 1534 completed and prepared the review mirror after clean post-fix QA and independent review. |

## Completion Notes

- Desktop widths from 901px now use a fixed, no-document-scroll shell with the header, two-level navigation, one bounded feedback lane, and bottom player kept outside the active panel's internal scroll owner. Production Electron checks reported zero document vertical overflow at 901, 1024, 1180, and 1440px.
- Six transient result sources—mode, project, recovery draft, workflow, undo/redo, and Quick Action—share one structurally exclusive 82px lane. A latest-intent epoch prevents delayed save/open completions from overwriting newer user feedback.
- Review Queue closes conflicting disclosures before a bounded two-frame reveal/focus, then verifies native hit visibility. The fixed Quick Action follow-up copy uses two readable lines and exposes its complete text on hover without increasing the reserved lane.
- The upper-right Utility and Exports controls and the bottom global player remained visible and operable across Overview, Compose, Arrange, Mix, and Deliver. Production native pointer/keyboard coverage passed all main and contextual tabs, menus, Review Queue, modal focus, Korean locale persistence, and global Play/Stop.
- The final package was activated at `/Applications/GrooveForge.app` and launched from that exact executable. Package/install byte comparison is empty; strict deep ad-hoc signature verification passes; it is arm64 with bundle ID `app.grooveforge.desktop`, version `0.1.0`, and matching renderer and main-process hashes. Displaced installs remain recoverable as timestamped backups.
- The installed app retained the user's recovery draft and the manual check selected “Not now”; no existing project or draft was restored, cleared, or overwritten. Core navigation, controls, menus, and feedback remain Korean; conventional project/style/track names and DAW abbreviations remain within the declared localization boundary.
- The existing fresh actual-app 16-style payload was re-audited rather than duplicated after UI/harness-only changes. `/Users/taejungkim/Downloads/GrooveForge_16장르_SoundCloud_업로드_패키지_2026-09-09_234901` contains 147 regular files, 16 batch WAVs plus 16 byte-identical per-genre copies, 146/146 verified checksums, and 16 Korean private-first upload sheets. Every unique track is stereo 44.1kHz signed PCM 24-bit and 106.681–127.500 seconds long.
- Final `git diff --check`, `npm run qa`, quality gate, Korean comment coverage, typecheck, renderer smoke, production build, production launch, packaged-app, DMG, and simulated-install runs passed. The initial post-QA P3 was fixed and the independent re-review found no P0–P3 issue.
- SoundCloud login or upload was not performed. Human end-to-end listening, accidental-similarity review, LUFS/true-peak mastering judgment, artwork, rights, credits, license, and final metadata approval remain required before a Private, Downloads Off first upload.
- The app remains ad-hoc signed; Developer ID signing, notarization, and external Gatekeeper distribution were not claimed. Finite QA cannot prove that no unknown defect exists, but every documented plan-1534 acceptance path passed.
