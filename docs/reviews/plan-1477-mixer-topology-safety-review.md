# plan-1477-mixer-topology-safety review

## Verdict

Approved. No blocking, major, or moderate findings remain after the post-QA fixes and reruns.

## Reviewed Scope

- Domain-owned required mixer ids, canonical order, first-occurrence deduplication, missing-channel fallback, and finite capacity.
- Current wrapped, bare, legacy, snapshot, and durable serialization normalization.
- Parser-bypass offline render, editor audition, and realtime playback defenses.
- Canonical mixer identity reuse, repaired-project caching, and caller-source immutability.
- Runtime and decoded sample-WAV evidence for empty, partial, duplicate, and inert FX-return inputs.

## Findings and Resolutions

1. The initial topology retained one optional `fx_return` row. Because the current sound engine uses an internal Space bus rather than an editable return source, an FX-return-only Solo activated global solo filtering while no audible source channel was soloed, turning the full mix silent. The current topology now discards inert FX-return rows until a matching editor and audio path exist; render and scheduler Solo detection also use only the four audible source ids.
2. Realtime playback cached repaired mixer channels by array reference but still created a new repaired project wrapper on every scheduled step for a stable malformed project. It now caches that wrapper by current project reference and invalidates it only when the project or mixer source changes.
3. Required-channel fallback values initially duplicated the starter mixer literals. The starter now derives from the same fallback map, preventing future default-project and repair-default drift while preserving the existing five-channel sound byte-for-byte.

All findings were fixed before approval. Empty, partial, duplicate, inert FX-return, canonical identity, direct render, and durable normalization checks passed afterward.

## QA Evidence

- `npm run qa`: passed before review and after review fixes.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed before and after review fixes.
- `npm run build`: passed before and after review fixes.
- `npm run renderer:smoke`: passed with the actual first-run React workstation.
- `npm run workflow:smoke`: passed beginner and producer save/load, composition, arrangement, mix/master, MIDI, and Handoff paths.
- `npm run harness:smoke`: passed 30/30 project roundtrips, 0→5 required-channel repair, 1,000→5 duplicate/inert-row repair, partial authored Synth/Master preservation, canonical identity reuse, FX-return-only Solo safety, and direct playable WAV output across 7/7 normalization paths.
- `npm run desktop:project-io-smoke`: passed outside the restricted GUI sandbox with a native 26,198-byte exact roundtrip and 2/2 audience starter roundtrips.
- `npm run sample-audio:qa`: schema 10 passed with 32/32 valid WAVs and 24/24 full mixes retaining tail content.
- `git diff --check`: passed.

## Sample Evidence

The repaired empty-mixer project rendered `mixer-topology-safety/믹서-복구-비트/믹서-복구-비트-demo.wav` after restoring Drums, 808/Bass, Synth, Chord, and Master. The decoded file is 21.3830 seconds and 3,772,004 bytes, peaks at -4.4827 dBFS, has -23.6837 dBFS RMS, contains 1,873,199 non-zero PCM samples, retains 78,567 non-zero samples after the musical boundary, ends at digital zero, and rerenders byte-identically. Direct parser-bypass render matches imported repair SHA-256 `c28beca90a7c633668f16098fdadfeda1505b1ba2a8378318efb49f17224969d`.

## Residual Boundaries

- The current product has an internal deterministic Space-return bus but no editable FX-return channel; inert imported `fx_return` rows are therefore dropped rather than displayed with controls that do not match audio behavior.
- Automated PCM and header validation do not replace human listening on representative playback hardware.
- External distribution readiness still depends on private signing, notarization, channel metadata, and manual approval evidence and is not claimed by this plan.
