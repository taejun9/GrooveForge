# plan-711-export-format-readout-command-reference review

## Status

passed

## Scope Reviewed

- `src/ui/workstationShellPanels.tsx`
- `src/ui/App.tsx`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/completed/plan-711-export-format-readout-command-reference.md`

## Checks

- Confirmed Command Reference already lists Export Format Readout in Deliver as `Quick Actions / Readout` with the existing `WAV / stems / MIDI / sheet` target.
- Confirmed README/product/quality/harness coverage describes Export Format Readout command-map discoverability for WAV sample-rate/channel format, duration, full-mix filename, stem count/audible stems, MIDI scope, Handoff Sheet context, focus command, direct metric commands, and Handoff Pack follow-up.
- Confirmed Export Format Readout derivation, focus routing, Handoff Pack status, deterministic export/stem analysis, export handlers, file names, file contents, playback, render/export, project schema, remote behavior, and sampling boundaries were not changed.

## QA

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run qa`
- `npm run verify`

Runtime smoke passed with 14/14 blueprints and 14/14 style profiles. Build passed with the existing Vite chunk-size warning.

## Findings

No findings.
