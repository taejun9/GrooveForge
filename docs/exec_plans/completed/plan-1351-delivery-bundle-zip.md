# plan-1351-delivery-bundle-zip

## Goal

Add a first-class local delivery bundle ZIP path so first-time composers and working producers can export one transferable package containing the project JSON, full mix WAV, four stem WAVs, arrangement MIDI, Handoff Sheet, and checksum manifest from the same sample-free local project evidence.

## Scope

- Add a reusable browser-safe ZIP writer for the delivery bundle without adding a runtime dependency.
- Expose explicit app export behavior and receipt feedback for a local delivery bundle ZIP.
- Add focused smoke coverage proving the bundle contents, manifest, checksums, and value-free/local-first posture.
- Update README, architecture, release readiness, and quality docs so the completion evidence includes the in-app delivery bundle path.

## Non-Goals

- Do not upload files, publish update feeds, run distribution channel probes, sign artifacts, submit notarization, approve manual QA, or claim external distribution completion.
- Do not add cloud sync, accounts, analytics, payment, remote AI, sample import, audio chopping, sampler setup, or user-audio dependency.
- Do not record private release values, real user audio, external URLs, credentials, tokens, or identity labels.

## Validation

- [x] `node --check harness/scripts/run_delivery_bundle_zip_smoke.mjs`
- [x] `npm run typecheck`
- [x] `npm run delivery:bundle-zip-smoke`
- [x] `npm run renderer:smoke`
- [x] `npm run build`
- [x] `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- [x] `git diff --check`
- [x] `npm run verify`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-04: Created plan-1351 after plan-1350 completed the `1341-1350` reporting boundary. The next product-aligned gap is making handoff deliverables easier for both audiences by bundling the already-proven sample-free project, audio, MIDI, Handoff Sheet, and manifest into one local ZIP without changing the external release gate.
- 2026-07-04: Implemented the browser-safe delivery bundle ZIP writer, wired Bundle export into the toolbar, Handoff Pack, and Quick Actions, and added smoke coverage for ZIP structure, CRC-32 values, source deliverables, manifest posture, and value-free local-first evidence.
