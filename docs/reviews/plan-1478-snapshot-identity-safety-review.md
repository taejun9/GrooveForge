# plan-1478-snapshot-identity-safety review

## Verdict

Approved. No blocking, major, or moderate findings remain after the post-QA fix and reruns.

## Reviewed Scope

- Domain-owned snapshot-id syntax, 64-character bound, deterministic normalization, collection-wide uniqueness, and later safe authored-id reservation.
- Current wrapped, bare, serialized, saved, renamed, deleted, restored, and direct malformed-state paths.
- Source immutability, canonical collection identity reuse, snapshot order, names, timestamps, and project-core preservation.
- Runtime and decoded sample-WAV evidence for duplicate, unsafe, empty, overlong, and colliding imported identities.

## Findings and Resolutions

1. The initial normalizer stripped leading and trailing `-` or `_` from every id, including already-safe authored tokens such as `foo-`. That contradicted the plan requirement to preserve safe unique authored ids exactly. The implementation now returns any already-safe bounded token unchanged, performs separator trimming only for sanitized unsafe input, and includes a `-safe_authored-` regression.
2. Duplicate and unsafe repair could have claimed an id used by a later safe authored snapshot. The collection normalizer now reserves all later safe authored ids before allocating deterministic `-2`, `-3`, and subsequent suffixes.
3. Parser normalization alone would not protect direct malformed in-memory operations. Save, rename, delete, restore, and generated-id allocation now defensively normalize identity first; rename and delete then affect exactly one array position.

All findings were fixed before approval. Six malformed identities across six normalization paths, direct malformed-state operations, distinct restore targets, and deterministic sample exports passed afterward.

## QA Evidence

- `npm run qa`: passed before review and after the review fix.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run typecheck`: passed before and after the review fix.
- `npm run build`: passed before and after the review fix.
- `npm run renderer:smoke`: passed the actual first-run React workstation with 104 required test ids and beginner/professional routes.
- `npm run workflow:smoke`: passed beginner and producer composition, save/load, arrangement, mix/master, MIDI, export, and Handoff paths.
- `npm run harness:smoke`: passed snapshot identity repair from `6→6` unique safe bounded ids, `2→1` single-target rename, `6→5` single-target delete, distinct 140/90 BPM restore, and 6/6 normalization paths.
- Randomized property smoke: passed 10,000/10,000 collections for uniqueness, safe syntax, length, immutability, idempotence, original canonical array reuse, and unique safe-id preservation.
- `npm run sample-audio:qa`: schema 11 passed with 34/34 valid WAVs and 26/26 full mixes retaining post-boundary content and ending at digital zero.
- `npm run release:check` passed QA, quality gate, runtime, renderer, workflow, persona, local delivery/reopen, native/packaged/PKG payload/installed project IO, app packaging, ad-hoc signing, DMG, PKG, payload launch, and simulated install launch. Its final PTY-only setup-wizard refresh was intentionally closed without private inputs; the affected completion-summary chain was then rerun non-interactively and passed with fresh 21/21 proof artifacts.
- `git diff --check`: passed.

## Sample Evidence

- `snapshot-identity-safety/스냅샷-복구-빠른-비트-demo.wav`: 14.4643 seconds, 2,551,544 bytes, peak -4.1251 dBFS, RMS -22.3692 dBFS, 1,268,309 non-zero PCM samples, 61,959 post-boundary non-zero samples, SHA-256 `9d2f2ce4f8100f30edbd7abe20b592976b5c759a6b37db52aede3c65f333fb2a`.
- `snapshot-identity-safety/스냅샷-복구-느린-비트-demo.wav`: 22.3333 seconds, 3,939,644 bytes, peak -4.5738 dBFS, RMS -23.8389 dBFS, 1,951,905 non-zero PCM samples, 79,179 post-boundary non-zero samples, SHA-256 `e7ac24a912de0bf4bb759ee6b0a1601120ed574be31f45ca1020f06bd4951708`.

Both files come from snapshots that originally shared the unsafe id `shared snapshot`; repair assigned `shared-snapshot` and `shared-snapshot-2`, and each restored its own tempo and sound state before deterministic export.

## Residual Boundaries

- Automated PCM, header, hash, and tail validation do not replace human listening on representative audio hardware.
- External distribution readiness still depends on private Developer ID signing, notarization/stapling, Gatekeeper acceptance, release-channel metadata, and manual channel approval evidence and is not claimed by this plan.
