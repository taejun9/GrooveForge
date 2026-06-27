# GrooveForge Release Readiness Evidence

This matrix is the current proof trail for the local-first GrooveForge MVP. It does not replace QA commands; it explains which current files and gates support each completion requirement.

## Release Gate

Run the local release gate before a completion report:

```sh
npm run release:check
```

`release:check` runs `npm run qa` and `npm run verify`. Together those commands cover documentation/base rules, quality gate checks, runtime export smoke, TypeScript contracts, production build, and Electron desktop entry smoke.

## Evidence Matrix

| Requirement | Current evidence | Automated gate | Status |
|---|---|---|---|
| Direct beat composition is the product spine, not sampling-first workflow. | `README.md`, `docs/product/product.md`, `docs/architecture/product-architecture.md`, `AGENTS.md` lock GrooveForge to BPM/key/style, drums, 808/bass, melody/chords, sound design, arrangement, mix/master, and export before optional sampling. | `npm run qa`, `npm run release:check` | Covered for product framing and repo guardrails. |
| Sampling is secondary and optional. | Product, architecture, quality, and AGENTS invariants keep `audio`, `sampler`, audio clips, sample import, chopping, and sample browsing out of the core MVP path. Runtime smoke rejects sampling/audio-clip language in generated project data and Handoff Sheet text. | `npm run qa`, `npm run harness:smoke`, `npm run release:check` | Covered for current MVP scope. |
| First-time composers get a guided setup -> compose -> arrange -> mix -> deliver path. | README and product docs describe First Beat Path, Guide Quick Start, Mode Focus, Session Pass, Composer Guide, Beat Spine, Workflow Navigator, Beat Terms, and Command Reference discovery. | `npm run qa`, `npm run release:check` | Covered by source/docs contracts; full visual walkthrough is still a target-specific manual or browser-automation pass. |
| Working producers can bypass guidance and edit fast. | README and product docs describe Studio mode, Quick Actions, Command Reference, Pattern A/B/C editing, selected-event tools, arrangement controls, sound design, mix/master controls, snapshots, and handoff checks. | `npm run qa`, `npm run typecheck`, `npm run release:check` | Covered by source/docs contracts and type/build gates. |
| All supported genres have editable starts. | `styleProfiles` and Beat Blueprints cover Trap, Drill, Boom Bap, Lo-fi, House, R&B, K-Hip-Hop/R&B, Afrobeats, Amapiano, Reggaeton, Jersey, Phonk, Garage, and Experimental. Runtime smoke builds 14/14 Beat Blueprint projects and 14/14 style-profile projects. | `npm run harness:smoke`, `npm run release:check` | Covered by runtime smoke. |
| A sample-free 8-bar beat can be generated and exported. | Runtime smoke creates sample-free 8-bar projects from every supported style and blueprint, then checks full mix and stem analysis, WAV headers, file names, MIDI bytes, and Handoff Sheet text. | `npm run harness:smoke`, `npm run release:check` | Covered by runtime smoke. |
| Project save/load is durable for current and legacy local files. | Runtime smoke roundtrips every smoke project through `serializeProjectFile` and `parseProjectFile`; legacy single-pattern chord-event migration is verified 1/1. | `npm run harness:smoke`, `npm run release:check` | Covered by runtime smoke. |
| Delivery package paths are local and useful. | Runtime smoke verifies mix WAV, four stem WAVs, arrangement MIDI, `.grooveforge.json`, and Handoff Sheet filenames and Blob download contracts without media upload or remote services. | `npm run harness:smoke`, `npm run release:check` | Covered by runtime smoke with mocked DOM download APIs. |
| Desktop production entry is valid. | Desktop smoke verifies built renderer assets, Electron main/preload artifacts, production `loadFile`, context-isolated preload bridge, native menu command allowlist, renderer menu handler coverage, and BrowserWindow security posture. | `npm run desktop:smoke`, `npm run verify`, `npm run release:check` | Covered without launching a visible GUI. |
| Local-first privacy boundary is preserved. | Privacy docs and quality rules prohibit cloud sync, accounts, analytics, payments, ads, remote AI, uploads, and imported-audio requirements unless explicitly justified. Runtime smoke and QA stay local. | `npm run qa`, `npm run harness:smoke`, `npm run release:check` | Covered for current MVP scope. |
| Build output is production-ready for local desktop testing. | `npm run build` compiles TypeScript, builds Vite renderer assets, and compiles Electron code with documented chunk hygiene. | `npm run build`, `npm run verify`, `npm run release:check` | Covered for local build artifacts. |

## Not Claimed By This Gate

- Installer packaging, code signing, notarization, auto-update, app-store submission, and distribution-channel QA are not claimed until a distribution target is selected.
- A visible Electron GUI launch is available through `npm run desktop`, but the automated release gate intentionally uses `desktop:smoke` instead of opening windows.
- Real browser download shelf inspection is not claimed; the current gate verifies the browser download contract with mocked DOM and URL APIs.
- Optional sampling, audio import, sample chopping, sampler tracks, plugin hosting, cloud sync, remote AI, payments, analytics, and accounts remain outside the current MVP.

## Completion Use

Completion reports should cite `npm run release:check` plus any target-specific checks that were added after this matrix. If a future plan changes the MVP definition, export targets, desktop distribution target, or optional sampling scope, update this matrix in the same plan.
