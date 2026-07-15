# plan-1473-project-import-safety review

## Verdict

Approved. No blocking, major, or moderate findings remain after the post-QA fixes and reruns.

## Reviewed Scope

- Versioned GrooveForge wrapper validation and compatibility for current, bare, and legacy project data.
- Domain-owned BPM, key, swing, mixer volume/pan, and master-ceiling normalization.
- Symmetric project source/serialization limits, browser pre-read byte guard, and Electron native open/save IPC guards.
- User-facing recovery messages and preservation of the current project when an import fails.
- F# minor selector compatibility with the existing Jersey Drive blueprint.
- Runtime, renderer, native project IO, and repaired-project WAV evidence.

## Findings and Resolutions

1. Serialization initially had no output limit, so a valid in-memory project could be saved into a file that the parser would later reject. The serializer now canonicalizes and enforces the same character limit, and save serialization runs inside the UI error boundary.
2. Browser `File.text()` and Electron `readFile()` initially ran before the character-size rejection. The browser now checks a conservative UTF-8 byte ceiling before reading; Electron uses `stat` before reading and validates native save payload length at IPC entry.

Both findings were fixed before approval. Targeted smoke suites, the full repository QA contract, production build, sample-audio QA, and diff checks passed after the changes.

## QA Evidence

- `npm run typecheck`: passed.
- `npm run qa`: passed before review and after review fixes.
- `npm run build`: passed before review and after review fixes.
- `npm run renderer:smoke`: passed after review fixes.
- `npm run workflow:smoke`: passed.
- `npm run harness:smoke`: passed.
- `npm run desktop:project-io-smoke`: passed a native 26,198-byte exact save/open roundtrip.
- `npm run sample-audio:qa`: schema 6 passed with 28/28 valid WAVs and 20/20 full mixes retaining tail content.
- `git diff --check`: passed.

## Sample Evidence

The repaired malformed project rendered `project-import-safety/복구된-프로젝트/복구된-프로젝트-demo.wav` with BPM 220, A minor, swing 0, master ceiling -6 dB, mixer volume -36–+3 dB, and pan -100–+100. It is 9.4773 seconds long, peaks at -6.0002 dBFS, has -15.0062 dBFS RMS, ends at digital zero, and is deterministic. SHA-256: `d75c7a5ddb0fe239a5e6cd4a5c06e1054382a927e6bcdc8b918c5f0b788ee550`.

The prior title-integrity sample hash remained unchanged: `9ce2e495e49e9da8e772afc51fda266d2a963d75398ddf33711453d36fc4c6df`.

## Residual Boundaries

- Future project versions require an explicit migration rather than speculative compatibility.
- The native and renderer byte ceilings are intentionally mirrored constants and must move together if the character limit changes.
- Automated decoded-PCM checks do not replace human listening on representative playback hardware.
- External distribution readiness remains dependent on private signing/notarization/channel evidence and is not claimed by this plan.
