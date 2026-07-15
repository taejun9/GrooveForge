# plan-1470-unicode-export-filenames review

## Review Result

approved

No blocking, major, or moderate findings remain after QA.

## Scope Reviewed

- Shared project filename stem normalization, Unicode-category preservation, unsafe-separator handling, UTF-8 byte bounding, fallback behavior, and Windows reserved basename protection.
- Project JSON, full-mix/stem WAV, MIDI, Handoff Sheet, Delivery Bundle ZIP, and bundle-root adoption of the shared stem.
- Runtime collision checks across Korean, Japanese, symbol-prefixed, accented, reserved, and long project titles.
- Real Korean-title WAV generation, canonical PCM decoding, deterministic rerendering, export-tail safety, report schema, static contracts, and durable documentation.

## Findings

None.

The implementation centralizes all project-owned filename identities in `projectFileStem`. NFKC normalization and locale-independent lowercasing occur before non-letter/mark/number runs collapse to a single separator. Truncation walks Unicode code points and stops at 120 UTF-8 bytes without splitting a multi-byte character; the remaining suffix budget keeps the longest current delivery filename within common per-component filesystem limits. Symbol-only input falls back to `grooveforge-project`, and Windows device basenames receive a `grooveforge-` prefix.

The previous duplicate ASCII-only helpers are removed from WAV, MIDI, and Delivery Bundle exporters. Runtime coverage proves four representative non-English titles retain four distinct stems across nine deliverables each, while the established `Midnight Drive` output remains `midnight-drive-demo.wav`. Two distinct Korean projects are also written through the actual renderer, decoded, and retained under separate Unicode paths.

## QA Evidence

- `npm run sample-audio:qa`: passed; 26 playable WAVs, 14/14 style matrix, 2/2 Korean filename identities, 26/26 digital-zero endings, 18/18 full mixes with post-boundary content, 11/11 unrelated render edits isolated, target/noise sensitivity, and Drums solo/stem equality.
- `npm run harness:smoke`: passed; 4 distinct non-English titles x 9 deliverables, 120/120 UTF-8 byte bound, English compatibility, canonical accent normalization, Windows reserved-name protection, and symbol-only fallback.
- `npm run qa`, `npm run typecheck`, and `git diff --check`: passed.
- `npm run verify`: exited 0; renderer, workflow, persona, runtime, sample audio, source/packaged/ad-hoc/PKG-payload/installed GUI, native/package/payload/installed project IO, DMG/PKG, delivery package/ZIP, privacy, and value-free release evidence all passed.

## Sample Evidence

- `서울 비트`: `서울-비트-demo.wav`, 24.5122 seconds, -4.3051 dB peak, -24.3501 dB RMS, SHA-256 `9ce2e495f1752a0559a8c228410a85a6aafd35d6ea9c31e9695865347fc4c6df`.
- `부산 비트`: `부산-비트-demo.wav`, 21.3830 seconds, -4.4827 dB peak, -23.6837 dB RMS, SHA-256 `c28beca90a7c633668f16098fdadfeda1505b1ba2a8378318efb49f17224969d`.
- Beginner Guided Lo-fi and professional Studio House reference mixes retain their existing deterministic SHA-256 values `fecc21515edb5b582907943d8081a40ec648801154606c310423cd1b6e9fd420` and `f1e71a1b672fd51d187decf55fd36fe0a2f2b6e9e8ddb59c6c00bf3b07f15b0e`.

## Residual Risk

- Unicode normalization and filename presentation can differ visually across filesystems, although canonical NFKC output and byte-bounded generation prevent the reproduced fallback collision.
- Future exporters must call `projectFileStem`; the static and runtime contracts cover current project-owned artifacts but cannot automatically govern a newly added exporter that bypasses them.
- Numeric PCM checks and deterministic hashes do not replace human listening and mastering review across playback systems.
- Developer ID signing, notarization, Gatekeeper approval, real release-channel metadata, update-feed publication, and manual external-distribution approval still require private operator inputs and are not claimed.
