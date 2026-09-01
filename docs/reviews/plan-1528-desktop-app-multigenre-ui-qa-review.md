# plan-1528-desktop-app-multigenre-ui-qa Review

## Outcome

Approved. The independent post-QA verdict is **P0 0 / P1 0 / P2 0 / P3 0** with no open findings.

GrooveForge now has reproducible commands for a Finder-launchable macOS `GrooveForge.app` and local DMG, while `npm run desktop` remains the source-development path. The formerly dense single canvas is split into mutually exclusive Compose, Arrange, Mix, and Deliver pages, with focused Compose and Mix sub-pages. Six original 90-to-150-second genre projects were edited, arranged, mixed, exported, saved, and reopened through the visible Electron app, then assembled into a private-first local SoundCloud handoff package without performing an upload.

## Application And Page Evidence

- `npm run desktop:app` creates a branded arm64 `GrooveForge.app`; `npm run desktop:dmg` creates the local DMG from the current app payload.
- The verified runtime is Electron 43.5.0, Node 24.19.0, Chromium 150.0.7871.250, arm64, with a macOS 12.0 minimum.
- The app and all three runtime frameworks pass local ad-hoc `codesign --verify --deep --strict`; no Developer ID or notarization claim is made.
- The final DMG is 136,761,876 bytes with SHA-256 `deeb62211fe1ffda5ce20ed7e8f19d08302fc4aae5bba6219e8aa319725f91e0`. A read-only mount contains only `GrooveForge.app` and the Applications shortcut. Its 317 files and 14 symlinks match the final app payload.
- Final packaged `dist` and `dist-electron` trees are byte-identical to the current production build. Source, app, and DMG timestamps establish the required source -> app -> DMG build order.
- Compose, Arrange, Mix, and Deliver render as one visible page at a time. Compose provides Drums, Bass / Melody, and Chords & Sound pages; Mix provides Mixer and Master & Review pages.
- Native pointer and Arrow/Home/End traversal, `tab`/`tabpanel` semantics, roving tab stops, focus restoration, route-driven page reveal, local page-state roundtrip, hidden-page shortcut guards, and zero document horizontal overflow passed in Electron.
- Packaged-app visual QA captured a 2880x1856 screen and also checked the minimum 1180x760 layout contract. Direct app inspection confirmed the larger full-width Chords & Sound and Master & Review pages.
- Packaged project I/O reopened an exact 26,399-byte project roundtrip at 132 BPM / A minor / 8 bars, plus 2/2 audience-starter roundtrips.

## Multi-Genre Actual-App Evidence

| genre | title | BPM | duration | bass voice | peak dBFS | RMS dBFS |
|---|---|---:|---:|---|---:|---:|
| Ballad | 유리창의 새벽 | 72 | 121.250 s | minimal | -8.165 | -32.958 |
| Hip-Hop | 골목의 좌표 | 90 | 118.333 s | walking | -6.665 | -26.111 |
| Trap | 네온 중력 | 145 | 106.681 s | 808 | -4.252 | -22.481 |
| R&B | 느린 대화 | 76 | 127.500 s | sub | -6.875 | -28.254 |
| House | 새벽 네 시의 빛 | 124 | 124.621 s | pluck | -4.686 | -22.585 |
| Experimental | 경계의 파동 | 110 | 123.000 s | reese | -9.156 | -28.538 |

- Every genre passed visible native Open, edit, Arrange, Mix, Master, Deliver WAV, Save, and live reopen flows in a fresh isolated workspace.
- Every final WAV is stereo 44.1kHz signed PCM24, within 90 to 150 seconds, audible, frame-complete, limiter-safe, free of full-scale samples, terminal digital zero, and byte-identical on deterministic rerender.
- The six bass-voice families and distinct arrangement/mix movements passed; the separate short-form regression retained all 16 editable style profiles.
- The delivery contains 51 regular files: six sets of WAV, editable project, Korean upload sheet, QA JSON, and four sanitized actual-app evidence files, plus top-level README, manifest, and checksums.
- `shasum -a 256 -c checksums.sha256` passes all 50 payload rows. The final package contains no local absolute path, credential marker, user audio, account value, or external upload result.

## QA

- Passed: `git diff --check`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, and `npm run build`.
- Passed: `npm audit --json` with zero vulnerabilities after replacing the affected Electron 39 line with exact Electron 43.5.0.
- Passed: `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run harness:smoke`.
- Passed: `npm run desktop:smoke`, source launch, project-I/O, close-flow, full functional-tab GUI, final `npm run desktop:package-smoke`, and final `npm run desktop:packaged-project-io-smoke`.
- Passed: final `npm run desktop:dmg-smoke` create, mount, content, payload-freshness, framework-loadability, and signature checks.
- Passed: multi-genre runner safety self-test and six-of-six actual-app runs, 16-of-16 genre rotation delivery, and sample-audio QA with 43-of-43 playable terminal-zero WAV artifacts.
- Passed: independent delivery audit, exact file-set and checksum verification, privacy/path scan, source-preservation checks, and explicit network-evidence wording review.

## Findings And Fixes

1. The existing workspace selector was visual rather than page-isolating. It now controls true full-width pages and focused sub-pages with accessible native navigation, route reveal, focus restoration, responsive grids, and hidden-page guards.
2. Actual-screen QA exposed nested-page resets, React batched-state posture loss, hidden-route focus errors, stale hidden-panel geometry, compressed note/chord actions, Review Queue wrapping, and missing Mix/Master route preparation. Each issue was fixed and the same native path was rerun.
3. Electron 43 changed macOS native-select Arrow behavior. The runner now uses trusted printable type-ahead input after closing the AppKit popup and verifies real input/change events across all six genre runs.
4. Package-only creation could remove sibling evidence artifacts. Packaging now preserves unrelated outputs and separates build-only from launch validation.
5. Electron 39 introduced an audited vulnerable dependency path. Exact Electron 43.5.0 removes the advisory while retaining the macOS 12 minimum; audit, build, runtime, and package checks pass.
6. The first delivery wording overstated network evidence and path filtering. The final manifest distinguishes “no external operation requested” from “runtime traffic not instrumented,” fails closed on unknown local paths, and provides a checksum verification command.
7. Final review found that the tab scroll effect depended on a freshly allocated inline `items` array. It now derives a stable `activeIndex`, avoiding redundant effect checks. The same review then found that the DMG predated that correction; the app and DMG were rebuilt in order, the full packaged GUI and mount smokes were rerun, and payload equality closed the only completion blocker.

## External Boundaries And Residual Risks

- No SoundCloud login, upload, publication, download-permission change, monetization, distribution, or Content ID action was performed.
- Automated PCM and UI tests do not replace listening to every complete WAV on representative systems, checking mono compatibility, or auditioning SoundCloud's transcoded stream after a private upload.
- LUFS and true peak were not measured. Before publication, the user must finish that mastering review and replace the artist, rightsholder, date, contact, license, and artwork placeholders.
- The app is locally ad-hoc signed. Developer ID signing, Apple notarization, Gatekeeper approval on another Mac, auto-update, App Store submission, and external distribution-channel QA remain release work.
