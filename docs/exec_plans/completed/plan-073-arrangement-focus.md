# plan-073-arrangement-focus

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add an Arrangement Focus helper that makes the selected song block easier to judge and reshape without turning GrooveForge into a sampling-first workflow. The helper should summarize the selected block's section, Pattern A/B/C assignment, bars, energy, and muted tracks, then offer explicit Focus presets that update only the selected arrangement block through existing undoable arrangement edit paths.

## Non-Goals

- No sampling, sample import, chopping, audio clip, plugin hosting, remote AI, accounts, analytics, or cloud sync work.
- No schema change unless the existing arrangement block model is insufficient.
- No hidden automation or automatic mutation from read-only analysis.
- No changes to Pattern A/B/C musical event data, mixer state, sound design state, master state, or export paths.

## Context Map

- `src/ui/App.tsx` owns the workstation UI, arrangement edit handlers, Next Move actions, and local derived summaries.
- `src/domain/workstation.ts` owns arrangement block types, section labels, mute targets, move preset labels, and arrangement bounds.
- `src/styles.css` owns panel and arrangement UI styling.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md` describe the beat-first product boundary and QA expectations.
- `harness/scripts/run_qa.py` enforces key wording and code-level guardrails.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep Arrangement Focus deterministic, local, explicit, undoable, and focused on direct beat arrangement.

## Implementation Plan

- [x] Add Arrangement Focus preset definitions and selected-block summary helpers.
- [x] Add an `ArrangementFocusPanel` to the Arrangement panel.
- [x] Route Focus preset clicks through existing undoable project update paths and keep selected pattern aligned.
- [x] Style the Focus panel for compact desktop use without nested cards or layout overflow.
- [x] Update product docs, quality rules, and QA script expectations.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke test local Arrangement Focus rendering and one preset click/undo path if the local browser/dev server is available.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Build Arrangement Focus as explicit selected-block presets, not an automatic arranger. | Beginners need guidance, producers need speed, and the product boundary requires local explicit beat arrangement rather than hidden automation or sampling-first flow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from main after plan-072. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `npm run build`, and `python3 harness/scripts/run_qa.py` passed after implementation. |
| 2026-06-16 | quality_runner | Browser click smoke was attempted with Playwright, but bundled Chromium was unavailable and system Chrome headless launch was blocked by sandbox permissions; HTTP 200 on the dev server was verified with `curl -I`. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_quality_gate.py` and `npm run verify` passed after documentation and QA updates. |
| 2026-06-16 | review_judge | Ready for review mirror and main merge. |

## Completion Notes

Arrangement Focus now appears in the Arrangement panel with a selected-block summary and five explicit presets: Intro Space, Verse Pocket, Hook Peak, Bridge Drop, and Outro Release. Preset clicks update only the selected block's section, Pattern assignment, bars, energy, and muted tracks through existing undoable arrangement update paths, then align playback to arrangement mode. Quick Actions includes Hook Peak Focus for keyboard-driven editing. Product docs, quality rules, and QA expectations now describe and enforce the feature.

Validation passed:

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `curl -I http://127.0.0.1:5181/` returned HTTP 200 for the worktree dev server.

Residual risk: full browser click smoke could not complete in this environment because the Playwright bundled Chromium executable was unavailable, shell Node could not import Playwright from the repo, and system Chrome headless launch from the Node REPL was blocked by sandbox process permissions.
