# plan-320-export-quick-action-results

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Make direct export Quick Actions feel like reliable delivery tools by showing WAV, stems, MIDI, and Handoff Sheet-specific post-run result metrics and follow-up guidance instead of only generic export scan feedback.

## Non-Goals

- Do not change export file contents, file names, render/download handlers, MIDI bytes, Handoff Sheet contents, Handoff Pack receipt semantics, Handoff Next Export behavior, project schema, save/load, undo/redo, playback, or sampling scope.
- Do not add auto-export, retry loops, zip packaging, background rendering, media upload, platform compliance claims, publishing/licensing flows, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: direct export Quick Actions, Quick Action result metric snapshots/follow-up, export filename helpers, Handoff Sheet summary helpers.
- `README.md`: Quick Actions and export feature summaries.
- `docs/product/product.md`: export and Handoff Pack product behavior.
- `docs/quality/rules.md`: Quick Actions and export guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-320-export-quick-action-results` and `.worktree/plan-320-export-quick-action-results` for repository work.

## Implementation Plan

- [x] Inspect existing direct export Quick Action ids, generic result metric path, and follow-up path.
- [x] Add local helpers mapping direct export Quick Action ids to WAV, stems, MIDI, and Handoff Sheet deliverable metadata.
- [x] Return deliverable-specific Quick Action result metrics derived from current local project/export/stem/brief/arrangement state.
- [x] Return deliverable-specific audition cue and next check for exported WAV, stems, MIDI, and Handoff Sheet.
- [x] Update durable docs and QA expectations so direct export Quick Action feedback remains explicit, local, deterministic, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run export WAV/stems/MIDI/Handoff Sheet Quick Actions, and confirm result metrics/follow-up copy identify the deliverable without autoplay, auto-export chaining, sampling, upload, or cloud behavior.

## Review Plan

QA completes before review starts. Review checks that direct export Quick Action result metrics derive only from explicit export command ids plus current local project, deterministic export/stem analysis, Session Brief, and existing filename helpers; preserve export handlers and file contents; and avoid auto-export chains, upload/cloud scope, sampling, platform-compliance claims, or project-data mutation.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add deliverable-specific direct export Quick Action result metrics and follow-up copy. | Direct export commands already exist, but generic post-run feedback weakens delivery confidence for beginners and slows producers checking WAV/stem/MIDI/sheet outputs. |
| 2026-06-18 | Record Browser smoke as blocked by localhost policy after static QA passed. | Vite failed with `listen EPERM` on `127.0.0.1:5344`, and the required escalated retry was rejected by the environment policy. |

## QA Results

| date | command | result |
|---|---|---|
| 2026-06-18 | `npm run typecheck` | passed |
| 2026-06-18 | `python3 harness/scripts/run_qa.py` | passed |
| 2026-06-18 | `git diff --check` | passed |
| 2026-06-18 | `python3 harness/scripts/run_quality_gate.py` | passed |
| 2026-06-18 | `npm run build` | passed with existing Vite large chunk warning |
| 2026-06-18 | `npm run qa` | passed |
| 2026-06-18 | `npm run verify` | passed with existing Vite large chunk warning |
| 2026-06-18 | `npm run dev -- --host 127.0.0.1 --port 5344` | blocked by `listen EPERM`; escalated retry rejected by environment policy |

## Review Results

No blocking findings. The direct export Quick Action result path maps only explicit WAV, stems, MIDI, and Handoff Sheet command ids to local deterministic metric strings and follow-up copy. Existing export handlers, file naming helpers, project data, Handoff Next Export behavior, and sample-free/local-first constraints are preserved.

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming direct export Quick Actions use generic Export result feedback. |
| 2026-06-18 | harness_builder | Added direct export target/posture helpers, deliverable-specific result metrics, and exported status for successful direct export Quick Actions. |
| 2026-06-18 | repo_cartographer | Updated README, product docs, quality rules, and harness expectations to keep direct export feedback explicit and local. |
| 2026-06-18 | quality_runner | Static QA, typecheck, build, full QA, and verify passed; browser smoke was blocked by localhost policy. |
| 2026-06-18 | review_judge | Reviewed post-QA changes with no blocking findings. |
