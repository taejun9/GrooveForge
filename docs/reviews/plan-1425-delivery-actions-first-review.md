# plan-1425-delivery-actions-first review

## Summary

Handoff Pack now prioritizes explicit WAV, stem, MIDI, sheet, and bundle exports before delivery status and proof detail. The surface is part of the actual workstation flow rather than the optional Guide & Review Center, so beginners can reach it without opening a diagnostic container while professional producers retain all handoff evidence.

## QA Evidence

- `npm run qa`: passed.
- `npm run typecheck`: passed.
- `npm run renderer:smoke`: passed with Delivery outside optional guidance and direct actions before proof.
- `npm run workflow:smoke`: passed for Guided first-beat and Studio fast-pass workflows.
- `npm run persona:smoke`: passed for first-time composer and professional producer readiness, packages, reopen, and local export.
- `npm run build`: passed; existing nonfatal chunk-size warning remains.
- `npm run desktop:launch-smoke`: passed at 1440×928 with 82 required test IDs, direct Delivery outside Guide, Guided proof collapsed, Studio proof expanded, and visual evidence.
- `npm run desktop:project-io-smoke`: passed native save/open and 2/2 audience starter roundtrips.
- `npm run delivery:bundle-zip-smoke`: passed 10-entry ZIP, headers, CRC-32, safe names, manifest, project, WAV, four stems, MIDI, and sheet verification.
- `git diff --check`: passed.

## Findings

### Fixed: Handoff Pack was clipped by the collapsed Guide parent

The first implementation preserved the existing Handoff Pack location inside `Guide & Review Center`. Browser visual review showed that its direct actions were therefore not actually visible in Guided mode even though internal source order and element rectangles looked correct. Handoff Pack was moved after the workstation grid, `deliverPanelRef` now targets that visible surface, and Electron evidence rejects a Delivery surface inside optional guidance or any closed details ancestor.

### Fixed: loaded-GUI Command Reference IPC boundary was too narrow

Two feature runs and a freshly rebuilt main baseline all met the same initial Command Reference IPC timeout at 10 seconds. The DOM readiness condition and every subsequent evidence criterion remain unchanged; only the initial IPC response allowance was expanded to 30 seconds and the outer collection allowance to 120 seconds. The full live smoke then passed.

## Preservation Checks

- Mix WAV, stem WAVs, arrangement MIDI, Handoff Sheet, and Delivery Bundle actions remain explicit and local.
- Existing route, send order, receipt, manifest, format metrics, package check, planned file manifest, Quick Actions, and test IDs remain present.
- Export bytes, ZIP contents, project schema, save/load, playback, render behavior, and file naming were not changed.
- Guided collapses proof detail; Studio expands it; export receipts and targeted proof actions reveal the relevant surface.
- No sampling-first scope, remote services, uploads, accounts, analytics, payments, private values, or external-distribution claims were added.

## Residual Risk

The existing large frontend chunk warning remains. Handoff Pack follows the full workstation grid to preserve composition-first startup, so direct header exports remain the fastest always-on shortcut while the richer delivery desk appears later in the document flow.

## Verdict

Approved. No blocking findings remain.
