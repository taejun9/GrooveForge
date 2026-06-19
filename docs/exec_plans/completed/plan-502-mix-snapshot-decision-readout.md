# plan-502-mix-snapshot-decision-readout

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily. Report progress every 10 completed plans.

## Goal

Add a read-only Mix Snapshot Decision Readout so users know whether to capture the missing slot, recall the safer pass, or listen closely when A/B passes are close.

## Non-Goals

- Do not change Mix Snapshot capture, recall, or clear handlers.
- Do not change Mix Snapshot scoring, stored slot payloads, mixer/master recall behavior, Quick Actions command behavior, project schema, playback, render/export, save/load, or Handoff behavior.
- Do not auto-recall, auto-capture, auto-export, import reference audio, add sampling workflows, use remote AI, add accounts, analytics, or cloud sync.
- Do not persist decision readout state in project data, localStorage, or exported files.

## Context Map

- `src/ui/workstationAnalysis.ts`: Mix Snapshot comparison summary derivation.
- `src/ui/workstationMixPanels.tsx`: Mix Snapshot A/B panel rendering.
- `src/ui/workstationUiModel.ts`: Mix Snapshot comparison summary type.
- `src/styles.css`: Mix Snapshot A/B layout.
- `README.md`, `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge framed as an all-genre direct beat-production workstation; sampling stays optional and secondary.

## Implementation Plan

- [x] Inspect current Mix Snapshot comparison model, panel rendering, CSS, docs, and harness checks.
- [x] Extend the comparison summary with read-only decision labels derived from current A/B slot state and scores.
- [x] Render a compact decision readout in the Mix Snapshot A/B panel without adding new actions.
- [x] Style the readout for desktop and mobile layouts.
- [x] Update docs and harness expectations.
- [x] Run QA, review, complete plan, and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should confirm the readout is read-only, derived only from UI-local Mix Snapshot slot state and deterministic comparison data, preserves explicit capture/recall/clear behavior, and does not introduce sampling, imported audio, remote AI, schema, playback, or export changes.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a decision readout instead of another Mix Snapshot action. | A/B comparison should guide listening decisions while keeping capture and recall explicit. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make Mix Snapshot A/B decisions clearer for producers and beginners. |
| 2026-06-20 | harness_builder | Added UI-local Mix Snapshot decision fields, panel readout, responsive styling, and matching docs/harness checks. |
| 2026-06-20 | quality_runner | QA passed; local dev server preview is blocked by sandbox localhost listen policy. |
| 2026-06-20 | review_judge | Review found no follow-up changes before completion. |

## QA Results

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large chunk warning.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 style profiles.
- `npm run dev -- --host 127.0.0.1` was blocked by `listen EPERM: operation not permitted 127.0.0.1:5173`; escalated retry was rejected by the environment policy, so no browser preview was performed.

## Review

Review confirmed the decision readout is read-only, derived from UI-local Mix Snapshot slot state and deterministic comparison data, and does not add new capture/recall/clear actions. Capture, clear, and recall still use the existing explicit handlers; recall remains undoable and limited to mixer/master posture. The change does not alter project schema, playback, render/export, save/load, Handoff behavior, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Completion Notes

Added a compact Mix Snapshot Decision Readout for missing-slot capture guidance, close-pass listening guidance, and safer-pass recall guidance. Updated docs and harness expectations to keep the feature framed as a local direct beat-production mix aid.
