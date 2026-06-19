# plan-512-layer-starter-priority-readout

## Goal

Add a read-only Layer Starter priority readout that shows which selected-pattern layer should be started next before the user clicks a pad or Quick Action.

## Why

Layer Starter already has explicit pads and a Quick Actions command for the current missing or thin layer. The panel still makes users compare four pads to infer the next move. A compact priority readout helps beginners start the beat with less guesswork and helps producers scan whether the selected Pattern has a direct composition gap.

## Scope

- Derive the readout from existing Layer Starter options and the same missing/thin priority used by Quick Actions.
- Show missing/thin/ready status, target layer, action label, count, and style cue.
- Keep the readout UI-local and out of saved project data.
- Do not change pad ordering, option derivation, layer-starter handlers, or result feedback.
- Update product docs, quality rules, and harness expectations.

## Non-Goals

- Do not change Drum Foundation, 808 Bassline, Chord Progression, or Melody Motif generation.
- Do not change selected Pattern A/B/C event data except through existing explicit pad clicks.
- Do not add sampling, imported audio, remote AI, cloud sync, analytics, accounts, plugin hosting, or hidden generation.
- Do not change playback, export, save/load, undo/redo, Beat Readiness, Pattern DNA, Review Queue, or Mix Coach semantics.

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

- plan-512 starts after plan-511 completed, main clean, and 511 completed plans recorded.
- Review Queue already has an always-visible focus readout, so the next direct-composition gap is Layer Starter: Quick Actions knows the current missing/thin layer, but the panel does not show that priority as a stable readout.
- Keep this centered on sample-free direct beat composition: drums, 808, chords, and synth layers.
- Implemented `layerStarterPriorityOption` as the shared missing/thin priority helper for Quick Actions and the Layer Starter readout.
- Kept the readout UI-local and derived only from existing Layer Starter options; no project schema, handler, playback, or export changes.
