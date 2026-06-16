# plan-177-handoff-send-order

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Handoff Pack Send Order readout that tells beginners which explicit deliverable action to handle next and gives producers a compact send sequence for WAV, stems, MIDI, and Handoff Sheet without auto-exporting or changing file contents.

## Non-Goals

- Do not change WAV, stem, MIDI, or Handoff Sheet export handlers, file contents, file names, render behavior, download behavior, Handoff Pack item scoring, route readout scoring, file manifest scoring, project schema, save/load, snapshots, playback, arrangement, mixer, master, Delivery Target, or Session Brief data.
- Do not auto-export, background render, auto-download, package zip files, upload media, create accounts, add analytics, add cloud sync, claim platform compliance, claim licensing readiness, claim publishing readiness, or add mastering guarantees.
- Do not add sampling, imported audio, sample browsing, chopping, stretching, or sampler setup.

## Context Map

- `src/ui/App.tsx`: Handoff Pack item types, route summary, file manifest, component rendering.
- `src/styles.css`: Handoff Pack layout and responsive rules.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and MVP capability text.
- `docs/quality/rules.md`: Handoff Pack Send Order guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs, source tokens, and CSS selectors.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-177-handoff-send-order` and `.worktree/plan-177-handoff-send-order` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Handoff Pack item derivation, route readout, file manifest, docs, and QA expectations.
- [x] Add a deterministic send-order summary derived only from existing Handoff Pack items and local target/brief/stem state.
- [x] Render the send-order readout in Handoff Pack without changing action buttons, export handlers, scoring, file contents, or project data.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, review, move the plan to completed, merge, push, and clean up the worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: Handoff Pack Send Order renders, reflects the next non-green deliverable, preserves all explicit Handoff Pack action buttons, does not trigger downloads on render, and has no desktop/mobile horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Send Order derives from existing Handoff Pack items, stays UI-local, preserves export click semantics and file outputs, avoids auto-export/background render/upload, and keeps sampling optional.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add Handoff Pack Send Order instead of changing export actions. | Users need delivery sequencing guidance, but final file creation must remain explicit and unchanged. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Handoff Pack Send Order. |
| 2026-06-17 | harness_builder | Added Handoff Pack Send Order summary, readout, responsive styling, docs, quality guardrail, and QA expectations. |
| 2026-06-17 | quality_runner | Ran QA, typecheck, quality gate, verify, diff check, and static source/dist token checks. Browser smoke was blocked by localhost listen EPERM and escalation rejection. |
| 2026-06-17 | review_judge | Reviewed the implementation after QA; no blocking issues found. |

## Completion Notes

Implemented Handoff Pack Send Order as a UI-local readout derived from existing Handoff Pack item ids and statuses. It identifies the next non-ready deliverable and shows the WAV -> Stems -> MIDI -> Sheet sequence without calling export handlers or changing file contents, file names, render/download behavior, project data, playback, scoring, route readout, or file manifest behavior.

Validation passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, `git diff --check`, and static source/dist token checks. Browser smoke could not run because the dev server failed with `listen EPERM` and the escalated retry was rejected by the environment policy. `npm run verify` still reports the existing Vite large chunk warning.
