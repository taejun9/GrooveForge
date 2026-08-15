# plan-1526-uploaded-beats-actual-app-soundcloud Review

## Outcome

Approved. The independent post-QA verdict is **P0 0 / P1 0 / P2 0 / P3 0** with no open findings.

The requested deliverable contains two extended tracks made through the visible GrooveForge Electron app from the byte-identical event projects behind the uploaded WAVs. Both tracks are within 2:30–4:30, the original uploads and source projects remain unchanged, and the Korean SoundCloud handoff package is present under `~/Downloads/GrooveForge-업로드비트-확장곡-SoundCloud-2026-08-15`.

## Actual App Evidence

- Four fresh isolated native-UI runs opened the source through the real `Open` action, edited metadata and arrangement controls, applied bounded automation, exported WAV through `Deliver`, saved, and reopened the result.
- The runs produced 64+48 bars for `SUNDAY ENGINE` and 64+16 bars for `문 없는 방`. Every report records `ok: true`, `failures: []`, `preservedSourceCore: true`, exact saved/reopened arrangement and automation, and unchanged copied plus external source hashes.
- `SUNDAY ENGINE` has no master automation. `문 없는 방` has only steps 0–16 fade-in in part 1 and steps 240–256 fade-out in part 2, avoiding the original 20-bar automation endpoint discontinuity.
- The saved movement projects retain the source musical-core digests: Sunday `8a71d36d…`; 문 없는 방 `f36dc50…`.
- The evidence package includes four reports, twelve actual-app screenshots, four editable projects, and two independent final-WAV analysis reports. Local absolute worktree paths were sanitized without removing hashes or measurements.

## Audio And Delivery Evidence

- `05_SUNDAY_ENGINE_Extended_Mix_140BPM_24bit.wav`: 192.730 seconds, stereo 44.1kHz signed PCM 24-bit, SHA-256 `95a7a0fd88f6a1d5e3a3c7f2db0ace396ecad68e67cc48f77b76123ce5897d6b`, sample peak L/R -1.200/-1.241dBFS, full-scale samples 0, terminal zero frame present.
- `문-없는-방_Extended-Mix_110BPM_24bit.wav`: 175.343651 seconds, the same format, SHA-256 `509733bfd6498a835459744f9d0a57efaa8993c87d3b51264a3ca47af16a0f14`, sample peak L/R -1.200/-1.581dBFS, full-scale samples 0, terminal zero frame present.
- Both joins use a 20ms unity-sum seam. Independent PCM parsing matched the packaged analysis JSON; `afinfo` confirmed the headers and frame-derived durations, and `afclip -x -q` reported no clipping.
- The original uploaded WAV hashes remain `e6ebb80c…` and `0a457fb1…`. The external source-project hashes before and after all app runs also match their baselines.
- The manifest contains exactly the 28 non-manifest files, with no missing, extra, duplicate, or symlinked item; every checksum passes. Package-wide scans found no `/Users/`, local username, or `.worktree` disclosure.
- The Korean per-track sheets include titles, BPM/key/genre, English tags, descriptions consistent with the executed arrangements, rights checks, Private-first guidance, Downloads Off, full-track listening, and explicit placeholders for artist/rightsholder data.

## QA

- Passed: `git diff --check` and `git diff --check main...HEAD`.
- Passed: `npm run typecheck` and `npm run build`.
- Passed: `npm run desktop:smoke`, `npm run renderer:smoke`, and `npm run workflow:smoke`.
- Passed: `npm run desktop:manual-qa -- --safety-self-test`.
- Passed: four visible `npm run desktop:movement-qa` runs in fresh isolated workspaces, followed by exact report/project/WAV/source audits.
- Passed: `python3 harness/scripts/run_qa.py` and `python3 harness/scripts/run_quality_gate.py`.
- Passed: staging and destination `shasum -a 256 -c manifest.sha256`, `afinfo`, `afclip`, original-source hashes, file-set comparison, privacy scan, and independent PCM24 analysis.

## Findings And Fixes

1. GrooveForge cannot import WAV audio. The implementation transparently used the byte-identical editable source projects rather than pretending to load the uploaded PCM, preserving the app's event-based scope.
2. Early evidence compared exact arrangement and automation only against the saved file after reopen. The QA path now observes the live reopened renderer state and compares its complete arrangement and automation canonically.
3. Early source protection ended at the workspace fixture. The parent runner now reopens and hashes the original external source after Electron exits and fails closed on type, size, or SHA-256 changes.
4. An earlier Sunday direction described a mid-song breakdown that the executed arrangement did not contain. The plan and both Korean description/checklist passages now describe the actual drive, final peak, bassless afterglow, and sparse outro.
5. QA reports originally contained local worktree paths. The delivery copies replace those paths with `WORKTREE_REDACTED`, and binary-wide privacy scanning confirms no local path disclosure.
6. Repository QA found the new movement command missing from four operator catalogs. `readme-en.md`, harness architecture, quality rules, and release readiness now document the command and its isolation/evidence contract.

All fixes were retested through fresh actual-app runs or the same repository/package QA path. The independent final review confirmed that every earlier finding is closed.

## External Boundaries And Residual Risks

- The app was genuinely used, but through the corresponding editable projects because the current product does not decode or import WAV files.
- Structural and PCM checks do not replace a full human listen on headphones and speakers. LUFS and true peak were not measured, and the SoundCloud-processed stream has not been auditioned.
- No SoundCloud login, upload, publication, download permission, monetization, distribution, or Content ID action was performed.
- Before publication, the user must replace artist/rightsholder placeholders, confirm all rights, upload privately first, listen to the complete processed track, and then decide whether to make it public.
