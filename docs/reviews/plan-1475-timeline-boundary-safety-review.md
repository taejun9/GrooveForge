# plan-1475-timeline-boundary-safety review

## Verdict

Approved. No blocking, major, or moderate findings remain after the post-QA fixes and reruns.

## Reviewed Scope

- Domain-owned 64-bar total arrangement and 16-step event-end boundaries.
- Current wrapped, bare, legacy, snapshot, and durable serialization normalization.
- Ordered arrangement preservation, partial boundary-block trimming, and caller-source immutability.
- Built-in style generation plus bass, melody, and chord event normalization.
- UI bar editing, duplication, and paste limits.
- Defensive realtime playback, offline render, MIDI export, and direct-total behavior.
- Runtime, native project IO, and repaired-project decoded WAV evidence.

## Findings and Resolutions

1. Realtime playback initially capped `startBar` and `bars` independently. A parser-bypass request such as 16 bars starting at bar 63 could therefore schedule beyond the total project boundary. A shared domain helper now clamps the start first and limits playback to the remaining project bars; non-finite values recover to a one-bar range at bar zero.
2. Direct `arrangementTotalBars` and `arrangementTotalSteps` calls capped the returned value but still reduced every entry in an oversized caller-owned array. A bounded loop now returns immediately once 64 bars are reached, avoiding unnecessary traversal after the safe answer is known.

Both findings were fixed before approval. The affected static, type, runtime, diff, and production-build checks passed afterward.

## QA Evidence

- `npm run qa`: passed before and after review fixes.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed before and after review fixes.
- `npm run build`: passed before and after review fixes.
- `npm run renderer:smoke`: passed with the first-run 8-bar workstation and arrangement surface rendered from the actual React app.
- `npm run workflow:smoke`: passed both beginner and producer save/load, arrangement, MIDI, mix, and handoff paths.
- `npm run harness:smoke`: passed after review with 30/30 project roundtrips, 1,600→64 bar repair across 5/5 paths, 1/2/1 repaired event lengths, realtime remaining-range recovery, and a 15,241-byte bounded direct MIDI artifact.
- `npm run desktop:project-io-smoke`: passed outside the restricted GUI sandbox with a native 26,198-byte exact roundtrip and 2/2 audience starter roundtrips.
- `npm run sample-audio:qa`: schema 8 passed with 30/30 valid WAVs and 22/22 full mixes retaining tail content.
- `git diff --check`: passed.

## Sample Evidence

The repaired event project rendered `timeline-boundary-safety/타임라인-복구-비트/타임라인-복구-비트-demo.wav` after bass, melody, and chord lengths of 16 steps were clamped to 1, 2, and 1 remaining steps. The decoded file is 21.3830 seconds and 3,772,004 bytes, peaks at -5.9527 dBFS, has -23.9701 dBFS RMS, contains 1,871,633 non-zero PCM samples, retains 78,192 non-zero samples after the musical boundary, ends at digital zero, and rerenders byte-identically. SHA-256: `aa525e6e0cb0e7027467e3738a2472f48cc1a5eb590882e3b4ffdd54acf4940e`.

## Residual Boundaries

- The current MVP intentionally caps projects at 64 arrangement bars and patterns at 16 steps; longer-form or variable-resolution work requires an explicit future model change.
- Imported content after bar 64 is dropped deterministically rather than stored as hidden inactive material.
- Automated PCM and header validation do not replace human listening on representative playback hardware.
- External distribution readiness still depends on private signing, notarization, channel metadata, and manual approval evidence and is not claimed by this plan.
