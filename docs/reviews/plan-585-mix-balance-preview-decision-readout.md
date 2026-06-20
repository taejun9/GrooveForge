# Review: plan-585-mix-balance-preview-decision-readout

## Summary

Plan 585 adds a UI-local Mix Balance Preview Decision Readout for the current suggested rough-balance pad. The visible decision action is disabled when the mixer already matches the target posture and otherwise routes through the existing undoable Mix Balance apply handler.

## QA Evidence

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run build` passed with the existing Vite large chunk warning.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 supported style profiles.
- Dev server smoke: sandbox `npm run dev -- --host 127.0.0.1` failed with expected `listen EPERM`; approved server started on `127.0.0.1:5173`; sandbox curl could not connect; approved `curl -I http://127.0.0.1:5173/` returned `HTTP/1.1 200 OK`; server was stopped.
- Post-move QA passed: `python3 harness/scripts/run_qa.py` and `git diff --check`.
- Final precommit QA passed: `python3 harness/scripts/run_qa.py` and `git diff --check`.

## Findings

No findings.

## Review Notes

- The decision readout derives readiness from `MixBalancePreviewSummary.changedControls`, not display strings.
- The visible action calls the existing Mix Balance pad apply path and does not introduce project schema, playback, export, cloud, AI, account, audio import, or sampling changes.
- Quick Actions Mix Balance readiness now uses the same `changedControls` value as the visible decision readout.

## Residual Risk

- Visual coverage is limited to dev server HTTP smoke and static/runtime gates; no screenshot assertion was added for this small local readout.

## Follow-Ups

- Continue applying explicit decision readouts only where they clarify direct composition, sound design, arrangement, mix/master, or export decisions without promoting optional sampling.
