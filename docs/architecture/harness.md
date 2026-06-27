
# Harness Architecture

The harness exists to make the repository readable and enforceable for coding agents.

## Principles

- Plans are first-class artifacts.
- `AGENTS.md` is a map, not a full manual.
- Durable knowledge lives in `docs/`.
- Validation is encoded as scripts when practical.
- Feature work does not happen directly on `main`.
- Work happens on task branches and worktrees for git repositories.
- QA and review are separate loops.

## Bootstrap Note

This repository was initialized from an unborn `main` branch with no existing project files. The base scaffold is the initial repository foundation. Future implementation tasks should use the worktree lifecycle below.

## Worktree Lifecycle

```text
main
  -> git fetch
  -> create codex/plan-NNN-task branch
  -> create .worktree/plan-NNN-task checkout
  -> create active exec plan
  -> implement
  -> run QA
  -> run review
  -> complete plan and review mirror
  -> merge to main
  -> push main
  -> delete merged branch with git branch -d
  -> remove worktree
```

## Agent Readability

Agents should be able to answer these questions from repo files alone:

- What is the product?
- What work is active?
- What has been completed?
- How do I validate a change?
- What is prohibited?
- Where do meeting notes and reviews go?

If an answer only exists in chat, move it into an exec plan, meeting note, review, or product/quality document.

## Current Harness Commands

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run renderer:smoke
npm run workflow:smoke
npm run harness:smoke
npm run typecheck
npm run build
npm run desktop:smoke
npm run desktop:launch-smoke
npm run desktop:package-smoke
npm run desktop:adhoc-sign-smoke
npm run desktop:dmg-smoke
npm run desktop:release-manifest-smoke
npm run qa
npm run verify
npm run release:check
```

These commands validate the base structure, documentation rules, first-run React renderer surface, first-session workflow smoke, runtime first-run starter project smoke, sample-free all-style export, legacy chord-event migration, `.grooveforge.json` roundtrip smoke, Handoff Sheet text deliverable smoke, mocked browser download-path smoke, TypeScript contracts, production build, Electron desktop entry plus native menu bridge contract, live production Electron visual launch smoke, packaged desktop app smoke, local ad-hoc signing smoke, local DMG smoke, and release artifact manifest smoke. `npm run verify` runs the strict quality gate, renderer smoke, workflow smoke, runtime smoke, typecheck, build, desktop entry smoke, desktop visual launch smoke, packaged desktop smoke, desktop ad-hoc signing smoke, desktop DMG smoke, and desktop release manifest smoke. `npm run release:check` is the release-readiness gate and runs both `npm run qa` and `npm run verify`.

Release readiness evidence is maintained in `docs/release/readiness.md`. It maps the current professional-producer, beginner, direct-composition, all-style, local export, privacy, and desktop-readiness requirements to source/docs evidence and automated gates.

`npm run renderer:smoke` uses Vite SSR to server-render the actual first-run React `App` without binding localhost. It verifies the default starter transport, beginner guide path, producer scan path, direct compose/sound/arrange/mix/master/export panels, Handoff surface, and sampling-free first-run copy while avoiding browser automation, Electron windows, network calls, imported audio, and sampler scope.

`npm run workflow:smoke` starts from `starterProject` and creates two concrete local first-session projects: a beginner guided first beat and a producer fast-pass beat. It verifies setup changes, event density across drums/808/melody/chords, arrangement, delivery target, mix/master posture, `.grooveforge.json` save/load, export and stem analysis, MIDI bytes, Handoff Sheet sections, and sampling-free output without writing media artifacts.

`npm run desktop:smoke` runs after build artifacts exist. It checks that `dist-electron/main.js` and `dist-electron/preload.cjs` were built, the production Electron main entry loads `dist/index.html` through `loadFile`, the compiled CommonJS preload exposes the bounded `grooveforge` desktop bridge in Electron's sandboxed preload environment, native menu commands stay validated, the renderer `NativeMenuCommand` declaration and `handleNativeMenuCommand` switch cover every allowlisted command through existing workstation handlers, and core BrowserWindow security settings remain enabled.

`npm run desktop:launch-smoke` runs after build artifacts exist. It starts the production Electron app with `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1`, keeps the BrowserWindow hidden, waits for the built renderer to mount under `#root`, verifies the live `window.grooveforge` preload bridge, checks the production `file:` renderer URL, confirms the first-run desktop DOM contains the beginner guided path, producer studio path, direct compose/sound/arrange/mix/master/export controls, Handoff Pack, and no sampling-first language, then captures the rendered page without saving media artifacts and verifies screenshot dimensions, PNG byte size, opacity, contrast, sampled color diversity, and non-background UI pixel coverage.

`npm run desktop:package-smoke` runs after build artifacts exist. On macOS it assembles an ignored `build/desktop/GrooveForge-darwin-*/GrooveForge.app` portable app from the installed Electron runtime, copies the built renderer plus Electron main/preload output into `Contents/Resources/app`, writes a minimal production `package.json`, generates `GrooveForge.icns` from `assets/brand/grooveforge-icon.svg`, replaces the Electron default icon reference, removes the Electron default icon file, validates root/helper bundle naming plus `Info.plist` privacy posture, then launches that packaged app with `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1` to reuse the live beginner, producer, direct workstation, preload bridge, sampling-free copy, and screenshot pixel evidence checks. Hidden-window launch smoke waits for `ready-to-show` and retries visual evidence until the smoke deadline before failing. This smoke proves a local portable app bundle, not installer creation, Developer ID signing, notarization, auto-update, or distribution-channel QA.

`npm run desktop:adhoc-sign-smoke` runs after `npm run desktop:package-smoke`. On macOS it applies a local ad-hoc signature to the packaged `GrooveForge.app` with `codesign --force --deep --sign -`, verifies it with `codesign --verify --deep --strict`, confirms `Signature=adhoc` and the `app.grooveforge.desktop` identifier, rejects Developer ID authority claims, then launches the signed app with `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1` to reuse the live beginner, producer, direct workstation, preload bridge, sampling-free copy, and screenshot pixel evidence checks. This smoke proves only local ad-hoc signing and signed-app launch integrity, not Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.

`npm run desktop:dmg-smoke` runs after `npm run desktop:adhoc-sign-smoke`. On macOS it creates an ignored local UDZO DMG from the validated ad-hoc signed `GrooveForge.app`, mounts it read-only, verifies that the image contains only `GrooveForge.app` plus an Applications shortcut, checks the mounted app payload for the GrooveForge bundle id, executable, `GrooveForge.icns`, packaged renderer/main assets, and absence of `electron.icns`, then detaches the image. This smoke proves a local disk-image artifact, not Developer ID signing, notarization, auto-update, app-store submission, or external distribution-channel QA.

`npm run desktop:release-manifest-smoke` runs after `npm run desktop:dmg-smoke`. On macOS it writes an ignored `build/desktop/.../GrooveForge-*-release-manifest.json` with app and DMG paths, byte sizes, SHA-256 checksums, GrooveForge bundle metadata, key app payload checksums, local ad-hoc signed distribution scope, ad-hoc signature evidence, and explicit false flags for Developer ID signing, notarization, auto-update, and external distribution-channel QA. This smoke makes local release artifacts traceable without claiming external certificate signing or distribution completion.

Production build validation depends on Vite 8 / Rolldown output code splitting, not warning suppression. `vite.config.ts` keeps `base: "./"` so Electron `file:` loading resolves built assets relative to `dist/index.html`, keeps `outDir: "dist"` and `sourcemap: true`, then uses `build.rolldownOptions.output.codeSplitting.groups` for `react-vendor`, `icons-vendor`, remaining `vendor`, `audio-engine`, `workstation-core`, `workstation-ui-model`, `workstation-editor-audition`, `workstation-selected-actions`, `workstation-pattern-tools`, `workstation-mix-panels`, `workstation-compose-panels`, `workstation-guidance-panels`, `workstation-shell-panels`, `workstation-snapshot-compare`, `workstation-analysis`, `workstation-app-helpers`, `workstation-app-quick-action-route-labels`, `workstation-app-quick-action-palette`, `workstation-app-quick-actions`, and `workstation-app-derivations` paths so eligible modules split when present and stable dependencies plus audio engine, workstation UI helper code, quick-action route-label helpers, quick-action command-palette helpers, quick-action result/metric code, editor audition code, selected-event action code, render-only mix/master panels, render-only compose/editor panels, render-only Guided/Studio workflow panels, render-only shell panels, Snapshot Compare derivation code, app derivation code, and shared analysis helpers do not stay in one large client chunk.
