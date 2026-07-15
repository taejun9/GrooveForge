# plan-1474-pitch-boundary-safety review

## Verdict

Approved. No blocking, major, or moderate findings remain after the post-QA fixes and reruns.

## Reviewed Scope

- Standard MIDI 0–127 (C-1–G9) pitch boundaries and finite frequency conversion.
- Current wrapped, bare, legacy, snapshot, and durable serialization normalization.
- Preservation of valid flat/sharp spelling and compaction of non-canonical numeric octave text.
- Malformed pitch rejection and caller-source immutability.
- Shared domain conversion in MIDI export and defensive parser-bypass behavior.
- Runtime, native project IO, and repaired-project decoded WAV evidence.

## Findings and Resolutions

1. A numerically safe octave such as `C000…004` could retain thousands of leading zeros because the first implementation preserved every in-range source string. This could leave oversized note labels in the project and UI. In-range pitches now preserve musical spelling while canonicalizing only numeric octave text; a 4,096-zero regression case normalizes to `C4`.
2. MIDI export still contained a second pitch parser. It was finite for many extremes through later clamping, but violated the single domain contract and could drift. MIDI export now calls `normalizeProjectPitch` and `projectPitchMidiNumber`, and the runtime smoke proves both repaired projects and parser-bypass extreme pitches produce valid `MThd` output.

Both findings were fixed before approval. The affected runtime, static, build, and sample suites passed afterward.

## QA Evidence

- `npm run typecheck`: passed before and after review fixes.
- `npm run qa`: passed before and after review fixes.
- `npm run build`: passed before and after review fixes.
- `npm run renderer:smoke`: passed.
- `npm run workflow:smoke`: passed.
- `npm run harness:smoke`: passed after review with 30/30 project roundtrips, five pitch-normalization paths, two malformed-pitch rejections, finite 8.18–12,543.85 Hz conversion, and a 2,343-byte MIDI artifact.
- `npm run desktop:project-io-smoke`: passed a native 26,198-byte exact roundtrip and 2/2 audience starter roundtrips.
- `npm run sample-audio:qa`: schema 7 passed after review with 29/29 valid WAVs and 21/21 full mixes retaining tail content.
- `git diff --check`: passed.

## Sample Evidence

The extreme-pitch project rendered `pitch-boundary-safety/음정-복구-비트/음정-복구-비트-demo.wav` after repairing `C-999999` and `C999999` to C-1 and G9. The decoded file is 26.4474 seconds and 4,665,360 bytes, peaks at -5.1235 dBFS, has -25.5685 dBFS RMS, contains 2,255,015 non-zero PCM samples, retains 52,293 non-zero samples after the musical boundary, ends at digital zero, and rerenders byte-identically. SHA-256: `7f17e5b111db7ecd96037504165e75c225f7fda2fb6b956b6bf6e1884596fee3`.

## Residual Boundaries

- The current contract intentionally uses standard MIDI notes only; microtonal pitch is out of scope.
- Extreme inputs repair to the nearest global MIDI endpoint rather than attempting speculative musical intent recovery.
- Automated PCM and header validation do not replace human listening on representative playback hardware.
- External distribution readiness still depends on private signing, notarization, channel metadata, and manual approval evidence and is not claimed by this plan.
