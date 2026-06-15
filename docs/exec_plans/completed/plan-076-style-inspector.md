# plan-076-style-inspector

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add a compact Style Inspector to the workstation so users can understand the selected style's BPM range, swing, bass role, melody role, and Pattern A/B/C event density before or after applying a genre. This improves beginner comprehension and producer evaluation without moving the product toward sampling.

## Non-Goals

- No sample import, chopping, sampler tracks, audio warping, imported loops, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No new project schema fields.
- No style generation rewrite beyond read-only summaries derived from existing local style and Pattern A/B/C data.
- No platform loudness/compliance claims.

## Context Map

- `src/domain/workstation.ts` owns `styleProfiles`, `StyleProfile`, Pattern A/B/C data, and style generation.
- `src/ui/App.tsx` owns the style selector, workstation top-level layout, and project summary UI.
- `src/styles.css` owns compact workstation layout and control styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- The Style Inspector must remain read-only, local, deterministic, and sample-free.

## Implementation Plan

- [x] Add derived Style Inspector summary helpers for BPM range/default, swing, bass/melody roles, selected style color, and Pattern A/B/C event densities.
- [x] Render the Style Inspector near the transport/style controls without adding a nested card-heavy layout.
- [x] Add accessible/testable style selection hooks such as explicit labels or stable test IDs.
- [x] Update docs and QA expectations for the new read-only style explanation surface.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke: confirm Style Inspector text and style selector options render on the local app.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add read-only Style Inspector before deeper generation controls. | The product already has editable style profiles; users now need fast local explanation and density feedback that helps both beginners and working producers judge genre starts without adding hidden automation. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from clean main after plan-075. |
| 2026-06-16 | harness_builder | Added read-only Style Inspector summary UI, accessible `style-select`, and compact style/pattern density styling. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for Style Inspector behavior. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `npm run build`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | Worktree dev server returned HTTP 200 at `http://127.0.0.1:5184/`; browser DOM smoke confirmed Style Inspector, Pattern A/B/C density rows, `style-select` aria label, style options, and no horizontal overflow. Native select automation still timed out in this environment. |

## Completion Notes

Style Inspector is implemented as a read-only workstation band derived from local `StyleProfile` and current Pattern A/B/C project data. It shows selected style name, BPM active/range, active/default swing, bass role, melody role, local sound preset, and Pattern A/B/C density without adding schema fields, hidden generation, imported audio, or sampling workflow.

Validation passed:

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `curl -I http://127.0.0.1:5184/` returned HTTP 200 for the worktree dev server.
- Browser DOM smoke confirmed `style-inspector`, Pattern A/B/C density rows, `style-select` aria/test ID, style options, and no horizontal overflow. Native select change automation still timed out in this environment.
