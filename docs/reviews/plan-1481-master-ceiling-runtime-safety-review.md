# plan-1481-master-ceiling-runtime-safety review

## Verdict

Approved. No blocking, major, or moderate findings remain after QA, separate review, deterministic property testing, actual sample rendering, and the full release-check rerun.

## Reviewed Scope

- Domain-owned master Ceiling normalization and its -6–0 dB runtime contract.
- Offline limiting and analysis, realtime playback, editor audition, and Handoff Sheet output.
- Direct parser-bypass low/high values, imported-state parity, caller-owned source immutability, and canonical WAV byte stability.
- Audible PCM, deterministic rendering, post-boundary content, digital-zero endings, and sample identity.

## Findings and Resolutions

Separate post-QA review found no product defect requiring a follow-up change. The review specifically confirmed:

1. One normalized domain value drives offline render gain and analysis, realtime playback, audition, and local handoff readouts.
2. Direct `masterCeilingDb=-900` uses the same -6 dB repair as imported state and no longer renders digital silence.
3. Direct `masterCeilingDb=18` uses the same 0 dB repair as imported state and no longer reports impossible Ceiling or headroom values.
4. The helper is bounded, idempotent, and matches durable normalization for every tested value without mutating caller-owned project state.
5. Canonical -6 dB and 0 dB projects retain their previous deterministic WAV bytes and analysis.
6. Non-finite and structurally malformed durable projects remain governed by their existing import boundaries.

## QA Evidence

- `npm run qa`: passed before review and in the full release chain.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run renderer:smoke`: passed the first-run React workstation and live UI contract.
- `npm run workflow:smoke`: passed beginner and producer composition, arrangement, mix/master, save/load, WAV/MIDI export, and Handoff workflows.
- `npm run persona:smoke`: passed both user personas, 14/14 style profiles, local delivery packages, package reopen, and audience acceptance rows.
- `npm run harness:smoke`: passed normalized runtime paths 8/8, bounded low/high analysis and Handoff values, audible low-Ceiling PCM, and direct/import WAV parity.
- Deterministic property smoke: passed 2,000,001 values for bounded, idempotent behavior matching the durable normalizer; non-finite direct values resolved to the existing -1 dB default.
- `npm run sample-audio:qa`: schema 14 passed 38/38 playable WAVs, 38/38 digital-zero endings, 30/30 full mixes retaining post-boundary content, and 11/11 render-isolation checks.
- `npm run release:check`: passed quality, renderer, workflow, persona, runtime, sample audio, local delivery/reopen, native/packaged/PKG payload/installed project I/O, live app launch, packaging, ad-hoc signing, hardened-runtime readiness, DMG, PKG, simulated install, privacy, and release-readiness checks.
- `git diff --check`: passed.

## Sample Evidence

- `master-ceiling-runtime-safety/마스터-천장-복구-비트/마스터-천장-복구-비트-demo.wav`: 4.02 seconds, 709,948 bytes, peak -6.00 dBFS, RMS -24.71 dBFS, 330,229 non-zero PCM samples, SHA-256 `5a5ffa1fe6d7a06c1656282511a6ea047db6c9bb0dd9c77b98af545fb8c85503`.

The sample starts from a valid direct in-memory project whose Ceiling was deliberately set to -900 dB. Runtime repair produces the same bytes and -6 dB analysis as imported repair, remains audible, retains content after the project boundary, rerenders byte-identically, and ends at digital zero. Direct +18 dB likewise matches canonical/imported 0 dB output with SHA-256 `4dba45a6ac8f90a84b75c14761658c62ae005c930221124c35d2134e2b761350`.

## Residual Boundaries

- Automated PCM, header, hash, level, tail, and deterministic-render validation do not replace human listening on representative audio hardware.
- External distribution readiness still depends on private Developer ID signing, notarization/stapling, Gatekeeper acceptance, live release-channel metadata, and manual channel approval evidence and is not claimed by this plan.
