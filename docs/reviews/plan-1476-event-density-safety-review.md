# plan-1476-event-density-safety review

## Verdict

Approved. No blocking, major, or moderate findings remain after the post-QA performance fix and reruns.

## Reviewed Scope

- Domain-owned 128-event bass/melody track, 16-step chord, and 16-event master-automation collection limits.
- First-occurrence note-location, chord-step, and exact automation-event repair.
- Current wrapped, bare, legacy, snapshot, and durable serialization normalization.
- UI chord creation after partial and full 16-step occupancy.
- Defensive realtime playback, offline render, MIDI export, and direct parser-bypass behavior.
- Runtime, native project IO, and repaired-project decoded WAV evidence.

## Findings and Resolutions

1. The initial direct render and MIDI defenses normalized the same oversized source Pattern once per arrangement bar. Realtime playback normalized it once per scheduled step, so a parser-bypass array was musically bounded but still paid repeated source-scan cost. Offline render and MIDI now normalize Pattern A/B/C once per operation, while realtime playback caches normalized immutable Pattern and automation array references for the playback session.
2. Offline rendering previously evaluated master automation separately for the left and right channel and allocated filtered arrays through the generic gain helper. It now normalizes automation once, computes one automation/fade gain per frame, and applies that shared value to both channels without changing rendered PCM.

Both findings were fixed before approval. Static, type, runtime, sample-audio, diff, and production-build checks passed afterward.

## QA Evidence

- `npm run qa`: passed before and after review fixes.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed before and after review fixes.
- `npm run build`: passed before and after review fixes.
- `npm run renderer:smoke`: passed with the first-run 8-bar workstation rendered from the actual React app.
- `npm run workflow:smoke`: passed beginner and producer save/load, arrangement, MIDI, mix, and handoff paths.
- `npm run harness:smoke`: passed after review with 30/30 project roundtrips; 512/512/512/64 source events repaired to 1/1/1/16 across 6/6 paths; note capacity 128; chord grid 16/16; direct MIDI 1,903 bytes; and direct WAV 4,323,996 bytes.
- `npm run desktop:project-io-smoke`: passed outside the restricted GUI sandbox with a native 26,198-byte exact roundtrip and 2/2 audience starter roundtrips.
- `npm run sample-audio:qa`: schema 9 passed after review with 31/31 valid WAVs and 23/23 full mixes retaining tail content.
- `git diff --check`: passed.

## Sample Evidence

The repaired event-density project rendered `event-density-safety/이벤트-밀도-복구-비트/이벤트-밀도-복구-비트-demo.wav` after Pattern A/B/C duplicate bass, melody, and chord collections of 256 events were reduced to one first-location event each and 64 automation events were bounded to 16. The decoded file is 21.3830 seconds and 3,772,004 bytes, peaks at -4.6264 dBFS, has -25.7009 dBFS RMS, contains 1,858,910 non-zero PCM samples, retains 78,797 non-zero samples after the musical boundary, ends at digital zero, and rerenders byte-identically. SHA-256: `09b90be45d730d0ef532b23cf9f7269dd33b6c35082e86f169bd9e287b78af7a`.

## Residual Boundaries

- The current 16-step editor intentionally caps each bass/melody track at 128 events, chords at one event per step, and master automation at 16 distinct events; larger grids or automation lanes require an explicit future model change.
- When a corrupted collection exceeds capacity, later source events are dropped deterministically rather than stored as hidden inactive data.
- Automated PCM and header validation do not replace human listening on representative playback hardware.
- External distribution readiness still depends on private signing, notarization, channel metadata, and manual approval evidence and is not claimed by this plan.
