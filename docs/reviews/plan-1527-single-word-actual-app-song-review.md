# plan-1527-single-word-actual-app-song Review

## Outcome

Approved. The independent post-QA verdict is **P0 0 / P1 0 / P2 0 / P3 0** with no open findings.

The requested deliverable is an original 137 BPM / F-sharp minor electronic track whose only semantic lyric word is `틈`. Its instrumental was created, arranged, exported, saved, and reopened through the visible GrooveForge Electron app. A deterministic local non-human formant layer was added transparently after the app render. The final 1:52.87 stereo PCM24 WAV and Korean SoundCloud handoff package are present under `~/Downloads/틈_Electronic_Vocal_Mix_SoundCloud_패키지`.

## Actual App And Creative Evidence

- A fresh visible Electron session created the 137 BPM / F-sharp minor / Experimental seed and applied distinct Pattern A/B/C timing moves.
- A fresh isolated native-UI movement run opened that seed, authored seven arrangement blocks totaling 64 bars, applied first/last-bar automation, exported WAV through Deliver, saved, and reopened the project.
- The run reported `ok: true`, `failures: []`, native pointer/keyboard input, source SHA-256 preservation, preserved musical core, and exact live reopened arrangement plus automation.
- The packaged editable project SHA-256 is `df28d39f90b7b0e37697e322288efd226947b40b6dba06540a7fa7ccc2203710`, matching the actual-app result.
- Only the broad idea of a compact electronic track with a repeated short-language hook was retained from the public reference. The new work uses a different Korean word, tempo, key, pattern design, arrangement, synthesis, and harmony. Reference PCM, melody, lyric cadence, vocal timbre, and signature production were not used.
- The synthetic `/tʰɯm/` layer uses only pulse, seeded noise, and fixed formant filters. It uses no person recording, TTS, voice model, reference audio, sampling, or network call and remains explicitly identified as post-render work outside the GrooveForge project schema.

## Audio And Delivery Evidence

- `틈_Electronic_Vocal_Mix_24bit.wav`: 112.866802721 seconds, stereo 44.1kHz signed PCM 24-bit, 4,977,426 frames, SHA-256 `a6e4161878e9c286045ea871b71d3e05afcdd6169e790fdd0454183e6ef0f853`.
- Final mix sample peak: -1.200002542 dBFS; RMS: -19.364697984 dBFS; full-scale samples: 0; DC mean: 2.94477e-9; terminal frame: L/R 0; active 24-bit lower bytes: 99.6149%.
- Isolated effected vocal stem SHA-256: `57d4946dd3fbd19f91e2f18ebb6c1b7ca79ae53df7637214e706ed2db6c33755`.
- Instrumental source SHA-256 remained `1cb0ab2f77d6971f1789ec16886d11ef1f63da461f41feac4f22d7d5fe90e059` before and after synthesis.
- Three original renders and the post-review rerender produced byte-identical final mix and vocal hashes.
- The package contains exactly eight regular files with no directory, symlink, special file, local absolute path, worktree path, reference title, reference artist, or video-id leakage. Its manifest verifies all seven non-manifest payloads.
- The Korean upload sheet provides copy-ready title, genre, tags, description, credits, exact structure timecodes, artist/date/contact placeholders, rights checks, Private-first guidance, Downloads Off, and processed-stream/full-track listening steps without claiming an actual upload.

## QA

- Passed: `node --check harness/scripts/render_formant_word_overlay.mjs`.
- Passed: `node harness/scripts/render_formant_word_overlay.mjs --safety-self-test`, with exact 39,690,044-byte / 150-second boundary acceptance and pre-allocation oversized rejection.
- Passed: a real 50,996,402-byte input fail-closed test with no mix, vocal, or report output.
- Passed: `npm run typecheck`, `npm run build`, `npm run renderer:smoke`, `npm run workflow:smoke`, and `npm run desktop:smoke`.
- Passed: `npm run desktop:manual-qa -- --safety-self-test` in the initial QA loop.
- Passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, and `git diff --check` before and after review fixes.
- Passed: independent PCM24/provenance parsing, `afinfo`, final/stem `afclip`, exact file-set check, privacy scan, staging/destination byte comparison, and destination `SHA256SUMS.txt` verification.

## Findings And Fixes

1. Initial review found that the renderer allowed a 1GB file before checking the 150-second duration, which could allocate excessive decode memory. The renderer now caps input at the exact canonical 150-second PCM24 byte length, validates the 44-byte header and duration before a full read or channel allocation, reads through a bounded file handle, and has both synthetic-boundary and real oversized-input regressions.
2. Initial architecture, quality, and plan wording called the delivered vocal stem `dry`, while the stem intentionally includes double, room, pre-echo, and beat delays. All scoped wording now accurately calls it an isolated effected synthetic stem.

Both fixes passed targeted and repository QA. Final re-review closed every finding.

## External Boundaries And Residual Risks

- Automated spectral and PCM checks do not prove that a Korean listener hears the synthesized token as `틈`, nor do they replace a complete musical listen on headphones, phone, speakers, and mono.
- LUFS and true peak were not measured, and the SoundCloud-transcoded stream has not been auditioned.
- No SoundCloud login, upload, publication, download permission, monetization, distribution, or Content ID action was performed.
- Before publication, the user must replace the artist/date/contact placeholders, confirm rights, listen to the isolated effected vocal stem and final mix from start to finish, upload privately first, inspect the processed stream, and only then decide whether to publish.
