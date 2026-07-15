# plan-1471-project-title-integrity review

## Review Result

approved

No blocking, major, or moderate findings remain after QA.

## Scope Reviewed

- Direct Title input bounds, input-time safety, blur-time finalization, and ordinary multi-word typing.
- Project import, active project serialization, snapshot serialization, local draft recovery, legacy project migration, and shared filename derivation.
- Handoff Sheet and Delivery Manifest JSON/Markdown single-line metadata safety.
- Korean, Japanese, accented, ZWJ emoji, blank, symbol-only, control-character, multiline, and oversized title behavior.
- Runtime regression coverage, real malformed-import WAV generation and decoding, report schema, static contracts, and durable documentation.

## Findings

None.

The implementation defines one domain-owned title contract capped at 80 Unicode code points. Input-time sanitization preserves ordinary trailing spaces so users can type multi-word titles naturally, while compatibility normalization replaces unsafe controls and line whitespace with visible spaces. Blur and durable boundaries collapse and trim whitespace and use `Untitled Beat` when nothing visible remains.

Project parsing normalizes current and legacy data plus nested snapshot titles. Serialization defensively normalizes the active title and every snapshot before writing, so local drafts inherit the same behavior. Handoff and Delivery Manifest creation normalize at their own text boundaries as defense in depth; direct Manifest Markdown creation also re-normalizes its title. Shared filename generation consumes the normalized title before applying the existing Unicode-safe filename rules.

The post-QA review identified one defense-in-depth improvement: normalize the title again in exported Manifest Markdown even when a caller bypasses `createDeliveryBundleManifest`. That change was applied, a direct malformed-manifest regression was added, and repository QA, typecheck, build, renderer smoke, runtime smoke, and Delivery Bundle ZIP smoke passed again.

## QA Evidence

- `npm run sample-audio:qa`: passed; schema 5, 27 playable WAVs, 14/14 style matrix, 2/2 Korean filename identities, 1/1 malformed-import title case, 27/27 digital-zero endings, 19/19 full mixes with post-boundary content, deterministic rerenders, and render-isolation checks.
- `npm run harness:smoke`: passed; 30/30 project roundtrips, four Unicode title identities across nine deliverables each, 80-code-point title bound, save/snapshot stability, blank fallback, accent/Japanese/ZWJ emoji preservation, and single-line Handoff/Manifest metadata.
- `npm run renderer:smoke`: passed; rendered Title input exposes the safety bound and source contracts for input-time sanitization and blur-time finalization.
- `npm run qa`, `npm run typecheck`, `npm run build`, `npm run delivery:bundle-zip-smoke`, and `git diff --check`: passed after the review fix.
- `npm run verify`: exited 0 before the review fix; renderer, workflow, persona, runtime, sample audio, source/packaged/ad-hoc/PKG-payload/installed GUI, native/package/payload/installed project IO, DMG/PKG, delivery package/ZIP, privacy, and value-free release evidence all passed. The review fix was restricted to additional Manifest Markdown normalization and covered by the post-review targeted rerun.

## Sample Evidence

- Malformed imported `  서울\n야간\t비트\0  ` normalized to `서울 야간 비트` and wrote `서울-야간-비트-demo.wav`.
- Delivered duration: 24.5122 seconds; peak: -4.3051 dB; RMS: -24.3501 dB; terminal frame: digital zero; immediate rerender: byte-identical.
- SHA-256: `9ce2e495f1752a0559a8c228410a85a6aafd35d6ea9c31e9695865347fc4c6df`.

## Residual Risk

- The 80-code-point bound is code-point based rather than grapheme-cluster based, so an extremely long title can end between components of a complex emoji sequence. It remains valid bounded Unicode and cannot inject metadata lines, but the final glyph may render incompletely.
- Numeric PCM checks and deterministic hashes do not replace human listening, mastering judgment, or manual IME testing across every operating-system input method.
- Future project metadata exporters must use `normalizeProjectTitle`; current Handoff and Delivery Bundle text boundaries are covered, but a new exporter could bypass the contract until its static/runtime coverage is added.
- Developer ID signing, notarization, Gatekeeper approval, real release-channel metadata, update-feed publication, and manual external-distribution approval still require private operator inputs and are not claimed.
