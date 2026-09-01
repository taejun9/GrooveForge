# plan-1529-korean-code-comments-downloads

## Status

completed

## Owner

project_lead / plan_keeper / repo_cartographer / harness_builder / quality_runner / review_judge / doc_gardener

## User Request

저장소의 모든 코드에 자세한 한글 주석을 추가하고, 직전 작업에서 만든 여섯 장르 음악을 다운로드 폴더로 옮겨 다시 정리한다.

## Goal

의존성·생성물·바이너리·주석을 허용하지 않는 데이터 파일을 제외한 1차 관리 코드 전체에, 파일 역할과 주요 제어 흐름, 상태/부작용, 실패 경계와 유지보수 주의를 설명하는 한글 주석을 일관되게 추가한다. 코드 동작은 유지하고 주석 적용 범위를 자동 검증한다. 검증된 여섯 장르 SoundCloud 전달 패키지는 원본 증거를 보존한 채 사용자가 찾기 쉬운 다운로드 전용 폴더에 다시 배치하고, 파일 수와 SHA-256 체크섬을 재검증한다.

## Comment Coverage Contract

- 범위는 `src/`, `electron/`, `harness/scripts/`, 루트 `vite.config.ts`와 `index.html`의 `.ts`, `.tsx`, `.cts`, `.mjs`, `.py`, `.css`, `.html` 179개 1차 코드 파일이다. 이 수에는 재발 방지를 위해 이번 계획에서 추가한 커버리지 검사기 자체도 포함한다.
- `node_modules/`, `build/`, `dist/`, `dist-electron/`, 바이너리, 이미지, PDF, 생성 캐시, JSON/lockfile처럼 주석이 문법적으로 불가능하거나 데이터 무결성을 바꾸는 파일은 제외한다.
- 모든 대상 파일에는 최소한 모듈 역할, 핵심 흐름, 중요한 경계/부작용을 설명하는 한글 주석 블록이 있어야 한다.
- 복잡한 오디오, 프로젝트 저장, Electron IPC/수명주기, UI 상태/접근성, 배포·보안·실제 앱 QA 흐름에는 국소 한글 주석을 추가한다.
- 코드를 그대로 한국어로 다시 읽는 행별 주석이나 자명한 변수 설명은 피하고, “왜 필요한가”와 실패 시 안전 동작을 중심으로 쓴다.
- 제품 앱의 실행 토큰, 타입, 패키징, 오디오 출력과 제품/런타임 테스트 의미는 변경하지 않는다. Tooling 변경은 한글 주석 검사기와 npm 진입점 추가, 주석 문장을 잠그는 정적 기대 문자열의 동등한 한글 갱신, 오프라인 렌더의 기존 결정론 의도를 더 정확히 지키는 `Math.random` 참조 guard 강화로 제한한다.

## Downloads Delivery Contract

- 원본 검증 패키지는 `build/desktop/plan-1528-multigenre-actual-app-qa-20260831T133251Z-51729/delivery`에 보존한다.
- 다운로드 대상은 `/Users/taejungkim/Downloads/GrooveForge_6장르_SoundCloud_업로드_패키지_2026-09-01`로 한다.
- 여섯 장르별 WAV, 재편집 프로젝트, 한글 업로드 시트, QA와 실제 앱 증거, 최상위 README/manifest/checksums를 그대로 보존한다.
- 대상은 정확히 51개 regular file이어야 하며 `checksums.sha256`의 50개 payload row가 전부 통과해야 한다.
- 기존 다운로드 자료를 덮어쓰지 않는다. 동일 경로가 이미 존재하면 내용을 먼저 비교하고, 불일치하면 중단한다.

## Non-Goals

- 외부 라이브러리, 설치된 패키지, 빌드 결과물, 생성된 음원/이미지/보고서 내부에 주석을 삽입하지 않는다.
- 모든 문장이나 모든 실행 행에 장황한 주석을 반복하지 않는다.
- SoundCloud 로그인, 업로드, 공개, 권리/아트워크 입력을 수행하지 않는다.
- 검증 원본 패키지를 삭제하거나 이동해 기존 증거 경로를 깨뜨리지 않는다.

## Implementation Plan

- [x] 코드 파일 인벤토리와 기존 주석 상태를 기록하고 자동 한글 주석 커버리지 규칙을 추가한다.
- [x] 핵심 제품, 오디오, UI, Electron 코드에 상세 모듈/국소 한글 주석을 추가한다.
- [x] 하네스와 배포/QA 스크립트 전체에 파일 역할·흐름·안전 경계 한글 주석을 추가한다.
- [x] diff를 검사해 제품 앱 실행 토큰이 바뀌지 않고 tooling 변경이 합의한 검사기·정적 기대값·결정론 guard 범위에 한정되는지 확인한 뒤 타입·빌드·정적/동적 회귀 테스트를 실행한다.
- [x] 51개 전달물을 다운로드 폴더의 새 전용 경로로 복사·정리하고 원본/대상 파일 및 체크섬을 검증한다.
- [x] 독립 리뷰 후 계획을 completed로 이동하고 review mirror를 만든다.

## QA Plan

- Comment scope: 새 커버리지 검사에서 대상 파일 수, 한글 주석 존재, 최소 설명 항목, shebang/doctype/triple-slash 보존을 확인한다.
- Static: `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`.
- Product regression: `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run harness:smoke`, `npm run desktop:smoke`.
- Change-boundary audit: 제품 앱 실행 토큰은 불변이고, 새/변경 tooling 토큰은 커버리지 검사기·npm 진입점·정적 기대값·결정론 guard로만 한정되는지 확인한다.
- Downloads: 원본/대상 regular-file 집합과 SHA-256을 비교하고 대상에서 `shasum -a 256 -c checksums.sha256`를 실행한다.

## Review Plan

QA 뒤 review_judge가 대상 누락, 부정확하거나 장황한 주석, 코드 동작 변경, 한글 가독성, 다운로드 패키지 파일/체크섬/경로 안전성을 독립 검사한다. 열린 P0/P1/P2는 완료를 막는다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-09-01 | Use plan 1529 and `codex/plan-1529-korean-code-comments-downloads` in a dedicated worktree. | The request changes the whole first-party code surface and repository policy forbids implementation directly on `main`. |
| 2026-09-01 | Interpret “모든 코드” as all 179 comment-capable first-party source/harness/config files, including the new checker but not dependencies, generated artifacts, or JSON data. | Comments must remain maintainable and cannot be inserted into formats that reject comments without corrupting them. |
| 2026-09-01 | Preserve the verified build delivery and create a byte-identical organized copy in Downloads. | The user needs an easy-to-find package, while removing the only local evidence copy would weaken reproducibility and break the prior handoff path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-09-01 | project_lead | Confirmed clean synchronized `main`, created the plan branch/worktree, inventoried 176 pre-existing files under `src/`, `electron/`, and `harness/scripts/` plus root `vite.config.ts` and `index.html`; the new checker raises the final scope from 178 to 179. |
| 2026-09-01 | quality_runner | Strengthened the new coverage checker after review: it accepts only consecutive comments at the true file start after a required shebang/doctype, rejects comments or Korean strings after imports/execution, rejects CSS `//` pseudo-comments, verifies every pre-existing harness shebang by path, and passes six embedded parser fixtures plus all 179 real files. |
| 2026-09-01 | doc_gardener | Added substantive Korean module headers to all 179 files and localized reasoning comments around audio math, deterministic rendering, project persistence, React state/focus, Electron IPC/lifecycle, release safety, privacy, native-app QA, and PCM24 validation. Product/runtime behavior remains unchanged; only comment-linked smoke expectations and the QA guard described below changed. |
| 2026-09-01 | quality_runner | Passed Node syntax 119/119 including the new checker, Python syntax 3/3, `comments:ko:check` 179/179, `git diff --check`, repository QA, strict quality gate, typecheck, build, renderer smoke, workflow smoke, runtime harness smoke, desktop entry smoke, and delivery bundle ZIP smoke. |
| 2026-09-01 | quality_runner | Corrected the deterministic-render guard exposed by translated comments: Korean source expectations are explicit and the forbidden `Math.random` reference matcher now catches direct, aliased, whitespace-separated, and comment-separated references through four self-test fixtures; the render comment avoids the forbidden API literal. |
| 2026-09-01 | project_lead | Copied the byte-identical final six-genre delivery to `/Users/taejungkim/Downloads/GrooveForge_6장르_SoundCloud_업로드_패키지_2026-09-01`; destination verification found 51 regular files, zero symlinks, and 50/50 valid checksum rows while preserving the original evidence package. |
| 2026-09-01 | quality_runner | Final rerun passed all 13 checks: coverage 179/179, Node 119/119, Python 3/3, diff, QA, strict gate, typecheck, build, renderer/workflow/harness/desktop smokes, and delivery ZIP smoke; Downloads recheck remained 51 files and 50/50 checksums. |
| 2026-09-01 | review_judge | Independent review closed every accuracy and guard finding, verified the product execution boundary and byte-identical delivery, and approved completion with P0/P1/P2/P3 all zero. |
