# plan-511-beat-readiness-focus-readout

## Goal

Add a read-only Beat Readiness focus readout that shows the current highest-priority readiness check before the user clicks a focus command.

## Why

Beat Readiness already exposes focus buttons, Quick Actions commands, and post-click Focus Result feedback. The default panel still makes users scan all checks to find the most important issue. A small readout can make the next direct composition step visible for beginners while giving experienced producers a fast blocker/review/ready scan.

## Scope

- Derive the default readout from the same Beat Readiness priority used by Quick Actions: danger, then warn, then first check.
- Show blocker/review/ready status, check label/status, destination, and detail.
- Respect an explicitly focused check when one exists.
- Keep readout state UI-local and out of project save data.
- Update product docs, quality rules, and harness expectations.

## Non-Goals

- Do not change Beat Readiness check derivation, tone thresholds, order, or Quick Actions behavior.
- Do not alter focus button behavior, Focus Result click timing, playback, export, save/load, undo/redo, mixer, master, or arrangement semantics.
- Do not add sampling-first workflow, imported-audio requirements, cloud sync, analytics, account, remote AI, or payment behavior.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run typecheck`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Blocked by environment: `npm run dev -- --host 127.0.0.1` failed with `listen EPERM: operation not permitted 127.0.0.1:5173`; escalated retry was rejected by policy, so no browser/dev-server verification was run.

## Decision Log

- plan-511 starts after plan-510 completed, main clean, and 510 completed plans recorded.
- Beat Readiness is the next candidate because Pattern DNA already has a priority-aligned default focus readout, while Beat Readiness has priority-aligned Quick Actions and post-click Focus Result but no always-visible default readout.
- Keep the improvement centered on direct beat composition readiness: drums, 808/bass, harmony, arrangement, and export. Sampling remains outside this scope.
- Implemented the readout as UI-local state derived from visible checks and the existing focused check id; no project schema or saved data changes.
- Shared the Beat Readiness priority helper with Quick Actions so the command palette and readout select the same danger, warn, then first-check target.
