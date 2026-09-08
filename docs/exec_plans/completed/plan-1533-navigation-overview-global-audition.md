# plan-1533-navigation-overview-global-audition

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard / doc_gardener

## User Request

앱의 정보 구조와 가시성을 높이기 위해 화면을 메인 분류 탭과 해당 메인의 서브 분류 탭으로 명확히 나눈다. 프로젝트 전체 상태를 한눈에 확인할 수 있는 종합 페이지를 만들고, 그 페이지에서 전체 음악을 재생해 들어볼 수 있게 한다.

추가 확인된 핵심 의도는 기능별 탭으로 긴 문서 스크롤을 대체하는 것이다. 데스크톱 작업 화면은 페이지 전체 세로 스크롤 없이 고정된 앱 프레임 안에서 동작해야 하며, Export와 자주 쓰는 프로젝트 기능은 우측 상단 고정 도크에서 hover 또는 click으로 선택지를 열 수 있어야 한다.

## Goal

- Compose, Arrange, Mix, Deliver의 최상위 작업 흐름을 명확한 main category tab으로 유지·개선한다.
- 선택한 main category에 속하는 도구와 화면만 두 번째 계층의 subcategory tab으로 노출한다.
- 프로젝트의 곡 정보, 길이와 구조, 트랙·이벤트, 믹스·마스터, 전달 준비도를 한 화면에 요약하는 Overview main page를 추가한다.
- Overview에서 기존 오디오 엔진과 transport 상태를 재사용해 현재 프로젝트 전체 arrangement를 처음부터 재생·정지하고 진행 상태를 확인한다.
- 상단 프로젝트 바, main/sub tab, 하단 전역 플레이어를 고정한 no-document-scroll 데스크톱 프레임으로 전환한다.
- 우측 상단 고정 action dock에 프로젝트·편집·도움말·설정과 Export 메뉴를 정리하고 mouse hover, click, keyboard에서 같은 선택지를 제공한다.
- plan-1532 리뷰에서 확인된 wide-layout의 큰 세로 공백과 브랜드·긴 제목 truncation을 같은 정보 구조 개선 범위에서 닫는다.

## Non-Goals

- 새로운 오디오 엔진, 샘플러 중심 흐름, 외부 스트리밍, 클라우드 동기화, 계정, 분석 또는 원격 AI를 추가하지 않는다.
- Overview를 별도 프로젝트 데이터 원본으로 만들지 않는다. 모든 값은 현재 project 및 기존 derived analysis에서 읽는다.
- 전체 음악 재생을 WAV 파일 생성·업로드·공개와 연결하지 않는다.
- 기존 프로젝트 파일 schema나 음악적 결과를 불필요하게 변경하지 않는다.

## Context Map

- 앱 shell과 작업 흐름: `src/ui/App.tsx`, `src/ui/workstation*`
- 전역 및 workflow 스타일: `src/styles.css`
- project·arrangement·mixer 상태: `src/domain/workstation.ts`
- transport·audio engine: `src/audio/`, `src/ui/`
- renderer/actual-app 검증: `harness/scripts/`
- UI·품질 계약: `docs/architecture/`, `docs/quality/rules.md`, `docs/release/readiness.md`

## Constraints

- QA and review are separate loops; review starts only after QA completes.
- Do not implement, commit, or push directly on `main`.
- Use `codex/plan-1533-navigation-overview-global-audition` and `.worktree/plan-1533-navigation-overview-global-audition`.
- Scope or approach changes must be recorded in the Decision Log.
- Main/sub navigation must retain keyboard tab semantics, visible focus, exactly one selected tab, and exactly one visible panel per level.
- Overview playback must use the existing project transport lifecycle, avoid duplicate simultaneous engines, stop cleanly, and never mutate musical data merely by opening the page.
- Responsive layouts must keep navigation and essential project identity readable without horizontal overflow at documented desktop and narrow widths.
- 901px 이상 데스크톱에서는 document vertical overflow가 0이어야 한다. 시퀀서처럼 본질적으로 큰 편집 surface만 선택된 tab panel 내부 overflow를 사용할 수 있고, 좁은 화면은 접근 가능한 responsive fallback을 유지한다.
- Header action menus must keep one popup open at most, expose `aria-haspopup`/`aria-expanded`/menu relationships, support hover, click, Arrow/Home/End/Escape, close on outside interaction, and preserve every existing action callback/test id.

## Implementation Plan

- [x] 현재 main tabs, per-workflow page tabs, transport, layout CSS, derived readouts와 smoke coverage를 감사한다.
- [x] 사용자 정보 구조를 main category와 workflow별 subcategory로 정리하고 Overview content/audition contract를 정의한다.
- [x] Overview main tab과 전체 프로젝트 요약·구조·트랙·믹스·delivery readout을 구현한다.
- [x] Overview의 전체 arrangement 재생·정지·진행 표시를 기존 transport/audio engine에 연결한다.
- [x] 모든 main category에서 subcategory tab strip과 panel relationship을 명확히 하고 키보드 탐색을 보존한다.
- [x] desktop shell을 no-document-scroll app frame으로 재배치하고 고정 top action dock·bottom player·tab-contained editor overflow를 구현한다.
- [x] Utility/Export 메뉴를 hover, click, keyboard, outside-dismiss 및 viewport containment 계약으로 구현한다.
- [x] wide-layout 빈 공간과 브랜드·긴 제목 truncation을 수정하고 responsive 가시성을 검증한다.
- [x] renderer smoke, workflow smoke, focused UI tests, build, actual production Electron visual/input QA를 통과한다.
- [x] 전체 회귀와 release gate를 통과한 뒤 독립 review, 완료 plan/review, main 병합·푸시와 worktree 정리를 수행한다.

## QA Plan

- Static: `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, `npm run build`.
- Focused DOM/state: five main categories including Overview, per-main subcategory ownership, selected/tab-stop/panel invariants, ARIA relationships, keyboard Home/End/Arrow navigation, route and focus transfer.
- Overview: project identity, duration/arrangement, tracks/events, mix/master, delivery state and warnings match the current derived project; opening does not mutate project state.
- Audition: Overview full-arrangement play/stop uses existing transport, exposes progress/current section, prevents duplicate engines, stops on project switch/unmount, and preserves export/save state.
- Visual: documented wide/minimum/narrow viewports have no horizontal overflow; main/sub hierarchy, project title, brand, Overview summaries and essential controls remain visible and readable.
- Actual app: production Electron native click/keyboard path opens Overview, traverses subcategories, starts/stops full arrangement, switches every main category, and captures evidence.
- Regression: existing renderer, workflow, persona, harness, project I/O, package/launch and release gates remain green.

## Review Plan

QA 완료 후 review_judge가 two-level information architecture, Overview correctness, playback lifecycle, accessibility, responsive visibility, legacy route compatibility, project immutability, local-first/privacy boundaries and actual-app evidence를 독립 검토했다. 전체 working diff와 16장르 delivery를 승인했고 P0–P3 finding은 없었다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-09-08 | Use plan 1533 and a dedicated branch/worktree from current `main`. | 활성 plan이 없고 저장소 정책이 `main` 직접 구현을 금지한다. |
| 2026-09-08 | Treat Overview as a first-class main category and existing workflow pages as contextual subcategories. | 한눈에 보는 종합 화면과 두 단계 탐색 구조를 가장 직접적으로 표현한다. |
| 2026-09-08 | Reuse the current arrangement transport/audio engine for Overview audition. | 별도 재생 구현으로 인한 상태 분기와 중복 오디오를 피하고 실제 프로젝트 재생과 일치시킨다. |
| 2026-09-08 | Include the two pre-existing wide-layout findings from plan 1532 in scope. | 사용자가 요구한 가시성과 직접 관련되고 실제 앱 증거에서 재현됐다. |
| 2026-09-08 | Keep the four-step `WorkflowZoneId` domain intact and add a separate `WorkspaceMainTabId` navigation type for Overview. | Overview는 읽기 전용 종합 화면이며 제작 단계 점수·spotlight·quick-action 그래프에 포함되면 안 된다. |
| 2026-09-08 | Add Overview summary/song map/readiness subpages and Deliver export/check subpages while reusing the shared tab component. | 모든 main category에서 실제 내용 단위의 두 번째 탐색 계층과 동일한 ARIA·키보드 계약을 제공한다. |
| 2026-09-09 | Keep the desktop document fixed from 901px upward and give only the selected workspace panel an internal scroll owner. | 긴 문서 스크롤을 기능별 탭으로 대체하되 시퀀서처럼 본질적으로 큰 편집 화면은 접근 가능한 내부 스크롤을 유지한다. |
| 2026-09-09 | Keep Undo/Redo direct and group project/help/settings plus export choices into a single-open fixed header dock. | 자주 쓰는 동작은 한 번에 실행하고 선택지가 필요한 동작은 hover, click, keyboard에서 같은 메뉴와 명확한 focus lifecycle을 제공한다. |
| 2026-09-09 | Treat “all bugs” as the complete documented gates plus production Electron navigation/menu/playback coverage and exhaustive 16-style actual-app generation. | 유한 테스트로 미발견 결함의 부재를 증명할 수 없으므로 재현 가능한 범위와 실제 증거를 명시한다. |
| 2026-09-09 | Generate a fresh 16-style private-first package and leave SoundCloud account actions to the user. | 로컬 결과와 업로드 준비 자료는 제공하되 로그인, 업로드, 공개, 수익화 또는 계정 상태를 변경하지 않는다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-09-08 | project_lead | Started plan 1533 on the dedicated branch/worktree and folded the prior wide-layout whitespace and truncation findings into the user's visibility scope. |
| 2026-09-08 | harness_builder | Added the first-class Overview, contextual sub-tabs for all five main categories, existing-transport full-song audition, fixed desktop frame, bottom player, and fixed Utility/Exports action dock. |
| 2026-09-09 | harness_builder | Added deterministic hover/click open-pinned state, first/last menu focus, Arrow/Home/End navigation, disabled-item skip, Escape/Tab focus transfer, outside dismissal, ARIA relationships, and modal-layer coverage. |
| 2026-09-09 | quality_runner | Production Electron launch smoke passed five main screens, Overview play/stop, 901/1024/1180/1440px zero document vertical overflow, the persistent player, and every fixed header menu evidence field. |
| 2026-09-09 | quality_runner | Found and corrected an Electron-native test adapter key-name mismatch (`ArrowUp`/`ArrowDown` versus native `Up`/`Down`); the rerun passed the real keyboard wrap and disabled-item skip path. |
| 2026-09-09 | quality_runner | Production Electron all-style QA passed 16/16 Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen paths and produced 48 independently audited screenshots plus 16 unique WAV files. |
| 2026-09-09 | doc_gardener | Copied the verified 147-file delivery into a fresh Downloads folder; the copy has no symlink or `.DS_Store`, and all 146 recorded SHA-256 checks pass. |
| 2026-09-09 | quality_runner | Final repository QA, quality gate, comments, typecheck, build, renderer, workflow, Quick Actions bundle, persona, and runtime harness batches passed. |
| 2026-09-09 | review_judge | Independently reviewed the entire working diff, playback lifecycle, accessibility, layout, actual-app evidence, package contract, and local-first boundaries with no P0–P3 findings. |
| 2026-09-09 | plan_keeper | Marked plan 1533 completed and prepared the review mirror after QA and independent review. |

## Completion Notes

- Overview is a first-class main category with At a glance, Song map, and Readiness sub-tabs. It derives project identity, duration, structure, tracks/events, mix/master, and delivery posture from existing state and can play or stop the complete arrangement through the existing transport without mutating the project.
- Compose, Arrange, Mix, and Deliver retain contextual sub-tabs with one selected/tab-stop/visible panel at each level. A persistent bottom player exposes current position, Play/Stop, Actions, Undo, Redo, and Save on every main page.
- At desktop widths of 901px and above the app uses a fixed shell with zero document vertical overflow. The header, main/sub navigation, and bottom player stay visible; only the active workspace panel owns internal overflow when needed.
- Undo/Redo remain direct fixed actions. Utility and Exports are fixed at the upper right and support hover, click, Enter, Space, Arrow keys, Home, End, disabled-item skip, Escape, deterministic Tab exit, outside dismissal, one-menu-only behavior, viewport containment, and dialog layering.
- Production Electron launch smoke passed at 901, 1024, 1180, and 1440px, including all five main screens, Overview full-song audition, native keyboard/pointer routes, fixed action menus, bottom player, modal focus, Korean locale, and project/history immutability.
- Production Electron all-style QA passed all 16 current StyleProfiles. Every song completed visible Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen, and all 64 execution stages passed. The 16 unique WAVs are 106.681–127.500 seconds, stereo 44.1kHz signed PCM 24-bit; all 48 Arrange/Mix/Deliver PNGs were independently inspected with no P0–P3 finding.
- The verified 147-file package is `/Users/taejungkim/Downloads/GrooveForge_16장르_SoundCloud_업로드_패키지_2026-09-09`. It contains 16 batch-select WAVs, per-style editable projects, Korean private-first upload sheets, QA metadata, sanitized actual-app reports, and screenshots. It has 0 symlinks, 0 `.DS_Store`, and 146/146 recorded checksums pass.
- The prior seven-track original hip-hop package remains at `/Users/taejungkim/Downloads/GrooveForge_오리지널_힙합_7곡_SoundCloud_업로드_패키지_2026-09-07`; it uses broad non-imitative production lanes rather than reproducing a named living artist or album.
- SoundCloud login, upload, publication, download enablement, monetization, distribution, Content ID, and account changes were not performed. Human end-to-end listening, accidental-similarity review, mastering judgment, artwork, rights, credits, and final metadata approval remain user steps.
- Finite automated and actual-app coverage cannot prove that unknown bugs do not exist. The complete documented scope passed, and the post-QA independent review reported no P0–P3 finding.
| 2026-09-08 | Replace the long desktop document with a fixed-height app frame; keep only inherently large editor canvases internally scrollable. | 사용자가 기능 탭을 요청한 목적이 페이지 스크롤 제거임을 명시했으며, DAW형 고정 작업 공간과 접근 가능한 편집 범위를 함께 보존한다. |
| 2026-09-08 | Add a fixed upper-right action dock with a Utility menu and a primary Export menu, while keeping Undo/Redo direct. | 자주 쓰는 기능과 export를 항상 같은 위치에서 찾게 하고 hover·click·keyboard 사용자에게 동일한 선택지를 제공한다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-09-08 | project_lead | Started plan 1533 from clean pushed `main` after the user requested two-level navigation, a global overview, and full-song audition. |
| 2026-09-08 | project_lead | Expanded the active plan after the user clarified that tabs must eliminate document scrolling and requested fixed upper-right hover/click Export utilities. Interrupted the superseded launch smoke before implementation. |

## Completion Notes

진행 중 — repository audit and implementation remain.
