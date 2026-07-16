# plan-1484-snapshot-runtime-safety review

## Verdict

Approved. No blocking, major, or moderate findings remain after QA, separate review, exhaustive bounded-value testing, actual WAV/MIDI/Handoff generation, and the full release-check rerun.

## Reviewed Scope

- Domain-owned project-core normalization at snapshot capture, restore, and summary boundaries.
- Direct parser-bypass state, durable import parity, source immutability, snapshot ID behavior, and canonical stability.
- BPM, key, swing, master ceiling, arrangement bars/energy, Session Brief line fields, and note bounds.
- Audible deterministic PCM, MIDI/Handoff byte parity, post-boundary content, digital-zero endings, and Korean sample identity.

## Findings and Resolutions

Separate post-QA review found no product defect requiring a follow-up change. The review specifically confirmed:

1. Snapshot capture stores the same normalized project core as durable serialization, so raw `0 BPM / H major`, swing `99`, and ceiling `+999 dB` cannot be reintroduced later as contradictory runtime state.
2. Snapshot restore repairs legacy or direct snapshot project cores before they re-enter the workstation.
3. Snapshot summaries report repaired BPM, key, and bounded arrangement length instead of displaying impossible producer-facing identity.
4. Direct and imported repaired projects create byte-identical WAV, MIDI, and Handoff output without mutating caller-owned project or snapshot state.
5. Canonical projects preserve their project core and summary identity, while snapshot ID collision repair and existing structural rejection boundaries remain intact.

## QA Evidence

- `npm run qa`: passed before review and in the full release chain.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run renderer:smoke`: passed the first-run React workstation and live UI contract.
- `npm run workflow:smoke`: passed beginner and producer composition, arrangement, mix/master, save/load, snapshots, WAV/MIDI export, and Handoff workflows.
- `npm run persona:smoke`: passed both user personas, 14/14 style profiles, local delivery packages, package reopen, and audience acceptance rows.
- `npm run harness:smoke`: passed normalized snapshot paths 11/11, direct/imported WAV, MIDI, and Handoff parity, repaired summary identity, and source immutability.
- Deterministic property smoke: passed 20,001 scalar values and all 1,449 supported BPM/key combinations for bounded capture, canonical core stability, repaired summaries, restore parity, and source immutability.
- `npm run sample-audio:qa`: schema 17 passed 41/41 playable WAVs, 41/41 digital-zero endings, 33/33 full mixes retaining post-boundary content, and 11/11 render-isolation checks.
- `npm run release:check`: passed quality, renderer, workflow, persona, runtime, sample audio, local delivery/reopen, native/packaged/PKG payload/installed project I/O, live app launch, packaging, ad-hoc signing, hardened-runtime readiness, DMG, PKG, simulated install, privacy, and release-readiness checks.
- `git diff --check`: passed.

## Sample Evidence

- `snapshot-runtime-safety/스냅샷-복구-비트/스냅샷-복구-비트-demo.wav`: 5.50 seconds, peak -3.9583 dBFS, RMS -24.4511 dBFS, 970,244 bytes, SHA-256 `4631b667252ca5f7ff41bced6a344436b247de944270e59e26b547a55352ffc9`.
- `snapshot-runtime-safety/스냅샷-복구-비트/스냅샷-복구-비트-arrangement.mid`: 469 bytes, SHA-256 `92e0e6e827bd0517b65293d2fa5cc8c36cf88868201748ee3f7c10ef6380d60e`.
- `snapshot-runtime-safety/스냅샷-복구-비트/스냅샷-복구-비트-handoff.txt`: 1,372 bytes, SHA-256 `83649e72a72088d48e4bce3ef2d3eaa75b35d9be2441360313cd88b9817e311e`.

The sample starts from a valid direct in-memory project deliberately set to `0 BPM / H major`, swing `99`, master ceiling `+999 dB`, one `0 bars / 9900%` arrangement block, multiline brief fields, and a 600-character note. Snapshot capture, restore, and summary repair this to `60 BPM / A minor`, swing `0.24`, ceiling `0 dB`, `1 bar / 100%`, single-line brief fields, and a 240-character note. Direct and durable-import paths produce identical WAV, MIDI, and Handoff bytes; the WAV remains audible, retains post-boundary content, rerenders byte-identically, and ends at digital zero.

## Residual Boundaries

- Automated snapshot, PCM, MIDI, text, hash, level, tail, and deterministic-render validation do not replace human listening or hands-on snapshot workflow review on representative hardware and tools.
- External distribution readiness still depends on private Developer ID signing, notarization/stapling, Gatekeeper acceptance, live release-channel metadata, and manual channel approval evidence and is not claimed by this plan.
