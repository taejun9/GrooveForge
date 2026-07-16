# plan-1480-swing-playback-timing review

## Verdict

Approved. No blocking, major, or moderate findings remain after QA, separate review, deterministic property testing, and full release-check reruns.

## Reviewed Scope

- Domain-owned BPM normalization, odd-sixteenth Swing offsets, even-grid anchors, bar boundaries, and event ordering.
- Realtime scheduling and visible step feedback, offline full-mix/stem rendering, and arrangement MIDI export.
- Drum microtiming addition, hat repeats, arrangement start bars and loops, note/chord duration posture, and end-of-track clamping.
- Direct parser-bypass BPM/Swing recovery, imported-state parity, source immutability, and deterministic 0% output preservation.

## Findings and Resolutions

Separate post-QA review found no product defect requiring a follow-up change. The review specifically confirmed:

1. One normalized domain contract drives realtime, WAV/stem, and MIDI onset timing.
2. Positive Swing delays only odd sixteenth onsets; even sixteenths, every 16-step bar boundary, total bars, and WAV frame counts stay fixed.
3. The maximum 24% delay remains well before the following even step, so events never invert order.
4. Realtime feedback uses the same audible timestamp as scheduled audio, including arrangement loops and start bars whose 16-step offsets preserve parity.
5. Authored drum timing remains additive after Swing, while note and chord lengths remain unchanged.
6. A direct excessive Swing value and zero BPM use the same bounded values as imported repair, without mutating caller-owned project state.

## QA Evidence

- `npm run qa`: passed before review and in the final release chain.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run renderer:smoke`: passed the first-run React workstation and live UI contract.
- `npm run workflow:smoke`: passed beginner and producer composition, arrangement, mix/master, save/load, WAV/MIDI export, and Handoff workflows.
- `npm run persona:smoke`: passed both user personas, 14/14 style profiles, local delivery packages, package reopen, and audience acceptance rows.
- `npm run harness:smoke`: passed distinct straight/swung WAV and MIDI output, 30 ms odd-step timing, and 4/4 normalized direct/import paths.
- Deterministic property smoke: passed 8,333,000 BPM/Swing/step cases for finite monotonic starts, fixed even steps and bar boundaries, exact bounded odd offsets, and no event-order inversion.
- `npm run sample-audio:qa`: schema 13 passed 37/37 playable WAVs, 37/37 digital-zero endings, 29/29 full mixes retaining post-boundary content, and 11/11 render-isolation checks.
- `npm run release:check`: reached its final external-completion resume packet after passing quality, renderer, workflow, persona, runtime, sample audio, local delivery/reopen, native/packaged/PKG payload/installed project I/O, live app launch, packaging, ad-hoc signing, hardened-runtime readiness, DMG, PKG, simulated install, privacy, and release-readiness checks.
- `git diff --check`: passed.

## Sample Evidence

- `swing-playback-timing/straight/스트레이트-타이밍-비트-demo.wav`: 2.75 seconds, 485,144 bytes, first onset frame 5,513, peak -10.8121 dBFS, RMS -30.0991 dBFS, SHA-256 `66f7ef80e60dce5e6e922401c05ebbcbb83748c95f55c23027b7bc8e797b6b49`.
- `swing-playback-timing/swung/스윙-타이밍-비트-demo.wav`: 2.75 seconds, 485,144 bytes, first onset frame 6,836, peak -10.8121 dBFS, RMS -30.0991 dBFS, SHA-256 `03074d5a143caee233272e51ac8622521d52926f9bc50052a5c7c9ca7ee5fe73`.

The two files use the same one-bar 120 BPM event project except for 0% versus 24% Swing. They have equal delivered length and level statistics but distinct PCM; the odd onset moves exactly 1,323 frames / 30 ms, both retain post-boundary content, rerender byte-identically, and end at digital zero. Direct `swing=99` rendering matches imported 24% repair.

## Residual Boundaries

- Automated PCM, MIDI, timing, header, hash, tail, and deterministic-render validation do not replace human listening on representative audio hardware.
- External distribution readiness still depends on private Developer ID signing, notarization/stapling, Gatekeeper acceptance, live release-channel metadata, and manual channel approval evidence and is not claimed by this plan.
