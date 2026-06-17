# plan-205-mix-balance-preview

## Status

Completed.

## Goal

Add a UI-local Mix Balance Preview above Mix Balance Pads so users can see the suggested rough-balance pad, Drums/808/Synth/Chords target posture, audition posture, and pre-click mix move count before applying a balance.

## User Value

- Beginners can see what a rough-balance pad will change before clicking it.
- Producers can scan channel posture quickly while mixing and stay in control of manual mixer edits.
- The workflow stays local-first and direct beat-production focused.

## Non-Goals

- Do not change Mix Balance Pad definitions or apply behavior.
- Do not change saved project schema, undo history, playback, render/export, MIDI export, or file formats.
- Do not add auto-mixing, hidden mastering, LUFS/true-peak guarantees, remote analysis, imported audio, or sampling workflow.

## Scope

- Add `MixBalancePreviewSummary` derived only from current local mixer state and existing Mix Balance Pad definitions.
- Render the preview in the Mixer panel before the existing Mix Balance Pad row.
- Update README/product/quality docs and static QA expectations.
- Preserve existing Mix Balance Result behavior after explicit pad clicks.

## QA

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke if localhost dev server is available in this environment. Blocked: `npm run dev -- --host 127.0.0.1 --port 5295` failed with `listen EPERM`, and the escalated retry was rejected by the environment policy.

## Completion Notes

- Added a UI-local Mix Balance Preview summary above Mix Balance Pads.
- Preview labels show the suggested pad, Drums/808/Synth/Chords target volume/pan/send posture, audition posture, and pre-click channel/control move counts.
- Preview derivation uses current local mixer state plus existing Mix Balance Pad definitions and leaves saved project schema, undo history, pad apply behavior, playback, and export behavior unchanged.
- Updated README, product docs, quality rules, and static QA expectations.

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-17 | Add preview before Mix Balance Result. | The rough-balance pads are high-impact mix actions; pre-click clarity helps beginners and speeds producer decisions. |
| 2026-06-17 | Show volume, pan, and send posture in the channel preview label. | Mix Balance pads can shape more than volume, so the pre-click target posture should reflect the main audible mixer controls without changing apply behavior. |
| 2026-06-17 | Record browser smoke as blocked in this environment. | Localhost dev server binding failed with `listen EPERM`, and the escalated retry was rejected by environment policy. |
