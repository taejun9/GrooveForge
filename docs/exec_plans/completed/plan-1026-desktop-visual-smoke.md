# plan-1026-desktop-visual-smoke

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue building GrooveForge until it is usable by working producers and first-time composers, with progress reported after each completed work item.

## Goal

Extend the live production Electron smoke with screenshot and pixel evidence so the release gate proves the first-run desktop workstation is not only mounted in the DOM, but also visually rendered as a nonblank, content-rich surface.

## Non-Goals

- Do not add installer packaging, code signing, notarization, app-store submission, auto-update, accounts, cloud sync, analytics, payments, remote AI, or sampling-first scope.
- Do not store screenshot artifacts in the repository.
- Do not require manual visual inspection to pass the release gate.

## Context Map

- `electron/main.ts` owns the smoke-only launch path and can capture the hidden BrowserWindow with `webContents.capturePage()`.
- `harness/scripts/run_desktop_launch_smoke.mjs` validates structured live Electron evidence from the production app.
- `docs/release/readiness.md` currently proves live DOM mounting but still does not claim visible/manual GUI inspection.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge all-genre and direct-composition-first; sampling remains optional and outside the MVP spine.

## Implementation Plan

- [x] Add visual screenshot evidence to the smoke-only Electron launch result.
- [x] Validate screenshot dimensions, PNG byte size, nonblank pixel sample, color diversity, and visible alpha/coverage posture without saving media artifacts.
- [x] Extend the launch smoke harness to assert visual evidence and report it in the success summary.
- [x] Update README, harness architecture, quality rules, release readiness, and QA expectations.

## QA Plan

- `git diff --check`
- `npm run build`
- `npm run desktop:launch-smoke`
- `python3 harness/scripts/run_qa.py`
- `npm run release:check`

## Review Plan

QA completes before review starts. Review the visual smoke for deterministic hidden-window capture, bounded evidence size, no committed media artifacts, no normal desktop behavior changes outside smoke mode, and preservation of local-first and sampling-secondary constraints.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-28 | Extend `desktop:launch-smoke` instead of adding a second Electron launch command. | The existing smoke already starts the production app and produces structured evidence; adding capture evidence there keeps the release gate simpler and avoids duplicate launches. |
| 2026-06-28 | Keep screenshot evidence as numeric pixel statistics instead of writing a PNG artifact. | The gate needs proof of nonblank visual rendering without committing generated media or exposing screenshot data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-28 | project_lead | Plan created. |
| 2026-06-28 | harness_builder | Added hidden-window capture evidence for PNG size, bitmap bytes, opacity, contrast, color diversity, bright/dark samples, and non-background UI coverage. |
| 2026-06-28 | quality_runner | `git diff --check`, `python3 harness/scripts/run_qa.py`, and `npm run release:check` passed; `desktop:launch-smoke` reported 2880x1856, 420029 PNG bytes, 69 sampled colors, and 4391/12012 non-background samples. |

## Completion Notes

Extended `desktop:launch-smoke` so it still verifies the production Electron preload bridge and first-run beginner/pro DOM, then captures the rendered page through `webContents.capturePage()` and validates visual evidence without saving screenshot artifacts. README, harness architecture, quality rules, release readiness, and QA expectations now treat live desktop visual launch smoke as release evidence.
