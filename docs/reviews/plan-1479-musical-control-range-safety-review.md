# plan-1479-musical-control-range-safety review

## Verdict

Approved. No blocking, major, or moderate findings remain after QA, separate review, deterministic property testing, and post-review reruns.

## Reviewed Scope

- Structural recognition versus bounded repair for sound design, drum velocity/timing/probability/repeats, bass/melody/chord length and dynamics, mixer volume/pan/processing, and arrangement bars/energy.
- Current wrapped, bare, serialized, snapshot, legacy, offline WAV, MIDI, realtime playback, editor audition, and parser-bypass paths.
- Wrong-type, non-finite, invalid-enum/pitch/quality, and malformed-array rejection boundaries.
- Source immutability, reopen/save/reopen idempotence, canonical sound-object identity, realtime normalization caching, and deterministic audio output.

## Findings and Resolutions

Separate post-QA review found no product defect requiring a follow-up change. The review specifically confirmed:

1. Validators still reject malformed structure and semantics while allowing only recognized finite musical controls to reach normalizers.
2. Chord velocity now follows the same bounded normalization contract as bass and melody velocities.
3. Direct offline render, realtime scheduling, and editor audition normalize sound and note dynamics even when callers bypass project parsing.
4. Already-canonical sound controls preserve object identity, while repaired values do not mutate caller-owned objects.
5. Direct parser-bypass WAV and MIDI output match the imported repaired project, so storage and audio paths cannot silently disagree.

The first deterministic property-test invocation used an incorrect review-side pan assumption of `-1..1`; the authoritative domain contract is `-100..100`. Correcting the test oracle, without changing product code, produced 1,000/1,000 passing cases.

## QA Evidence

- `npm run qa`: passed before review and after review.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed before review and after review.
- `npm run build`: passed before review and after review.
- `npm run renderer:smoke`: passed the actual first-run React workstation, 104 required live UI identifiers, minimum-window layout, keyboard grids, modal focus, and beginner/professional routes.
- `npm run workflow:smoke`: passed beginner and producer composition, arrangement, mix/master, save/load, WAV/MIDI export, and Handoff workflows.
- `npm run persona:smoke`: passed both user personas, 14/14 style profiles, local delivery packages, package reopen, and audience acceptance rows.
- `npm run harness:smoke`: passed musical-control normalization across 8/8 wrapped, bare, serialized, snapshot, legacy, normalizer, WAV, and MIDI paths; 3/3 structural rejection cases remained strict; direct WAV and MIDI bypass matched imported repair.
- Deterministic property smoke: passed 1,000/1,000 extreme-value projects for source immutability, bounded output, reopen/save/reopen idempotence, and canonical sound-object identity.
- `npm run sample-audio:qa`: schema 12 passed 35/35 playable WAVs, 35/35 digital-zero endings, 27/27 full mixes retaining post-boundary content, and 11/11 render-isolation checks.
- `npm run release:check`: reached its final external-completion resume packet after passing quality, renderer, workflow, persona, runtime, sample audio, local delivery/reopen, native/packaged/PKG payload/installed project I/O, live app launch, packaging, ad-hoc signing, hardened-runtime readiness, DMG, PKG, simulated install, privacy, and release-readiness checks.
- `git diff --check`: passed.

## Sample Evidence

- `musical-control-range-safety/컨트롤-복구-비트/컨트롤-복구-비트-demo.wav`: 29.0426 seconds, 5,123,152 bytes, peak -5.6214 dBFS, RMS -26.7467 dBFS, 2,556,200 non-zero PCM samples, 82,562 post-boundary non-zero samples, SHA-256 `03ff1a1d1a107d6f64bd61b602779a50ee1498566358b14aea1631e499e4045a`.

The file is rendered from deliberately out-of-range sound, drum, note/chord, mixer, and arrangement controls. Import repair and direct parser-bypass rendering produce the same hash, the decoded audio contains musical content after the nominal boundary, never reaches full scale, and ends at digital zero.

## Residual Boundaries

- Automated PCM, header, hash, tail, and deterministic-render validation do not replace human listening on representative audio hardware.
- External distribution readiness still depends on private Developer ID signing, notarization/stapling, Gatekeeper acceptance, live release-channel metadata, and manual channel approval evidence and is not claimed by this plan.
