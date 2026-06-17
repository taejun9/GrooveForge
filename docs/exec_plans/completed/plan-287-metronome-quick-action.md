# plan-287-metronome-quick-action

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Expose the existing realtime metronome toggle through Quick Actions so users can enable or disable the click from command search while arranging or programming patterns.

## Scope

- Add one Quick Actions Transport command for the existing metronome toggle.
- Route the command only through the current `toggleMetronome` handler.
- Show current on/off state, BPM, and realtime-only/export-free click behavior in command detail and result feedback.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- Do not change metronome synthesis, accent timing, playback scheduling, BPM handling, manual metronome button behavior, save/load migration, render/export, MIDI export, Handoff, or project schema.
- Do not add count-in, click level controls, audio recording, audio input, beat detection, tempo automation, sampling, imported audio, remote AI, plugin hosting, accounts, analytics, cloud sync, or command chains.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for metronome Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Create task branch and worktree.
- [x] Create active exec plan.
- [x] Inspect existing metronome toggle and Quick Actions patterns.
- [x] Add Metronome Quick Action using the existing toggle handler.
- [x] Update docs and static QA.
- [x] Run QA before review.
- [x] Move this plan to completed and create a review mirror.
- [ ] Merge to `main`, push, delete branch, and remove worktree.

## Validation

Run:

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run harness:smoke
npm run typecheck
npm run build
npm run qa
npm run verify
git diff --check
```

Browser smoke if environment allows localhost: Quick Actions shows a Metronome command, command detail reflects current on/off state and BPM, running the command toggles the existing metronome state, playback still follows realtime click semantics, WAV/stem export remains click-free, the project remains sample-free, and no console errors occur.

## Review

QA completed before review.

Findings: no blocking issues found. Metronome Quick Action is an explicit Transport command, reflects current on/off BPM state, routes only through `toggleMetronome`, and keeps the existing realtime-only/export-free metronome contract. The change does not add count-in, click level controls, audio input, beat detection, tempo automation, hidden generation, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or command chains.

Residual risk: browser smoke could not run because the sandbox rejected local Vite listen on `127.0.0.1:5311` with `EPERM`, and the escalated retry was rejected by environment policy. CLI coverage passed, including sample-free all-style runtime smoke.

QA results:

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed for 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large-chunk warning for `dist/assets/index-Cv2S5PdP.js` at 514.67 kB.
- `npm run qa` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser smoke blocked: `npm run dev -- --host 127.0.0.1 --port 5311` failed with `listen EPERM`; escalated retry was rejected by environment policy.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Expose the existing metronome toggle through Quick Actions instead of adding new click behavior. | The app already has a realtime metronome; command search improves timing-reference access for beginners and reduces transport-panel hunting for producers without changing audio/export contracts. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Started plan-287 from `main` in `.worktree/plan-287-metronome-quick-action`. |
| 2026-06-18 | repo_cartographer | Confirmed existing metronome behavior is a realtime-only project toggle with export-free click behavior. |
| 2026-06-18 | harness_builder | Added a Transport Quick Action that routes only through `toggleMetronome` and reports on/off BPM state. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed after implementation. |
| 2026-06-18 | quality_runner | Full CLI QA passed; browser smoke blocked by sandbox localhost bind policy. |
| 2026-06-18 | review_judge | Reviewed after QA; no blocking findings. |
| 2026-06-18 | doc_gardener | Moved plan to completed and created `docs/reviews/plan-287-metronome-quick-action-review.md`. |
