
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
npm run desktop:hardened-runtime-readiness-smoke
npm run desktop:dmg-smoke
npm run desktop:install-smoke
npm run desktop:gatekeeper-readiness-smoke
npm run desktop:release-manifest-smoke
npm run desktop:release-notes-smoke
npm run desktop:update-feed-config-smoke
npm run desktop:update-metadata-policy-smoke
npm run desktop:auto-update-readiness-smoke
npm run desktop:developer-id-readiness-smoke
npm run desktop:developer-id-signing-smoke
npm run desktop:notarization-smoke
npm run desktop:notarized-gatekeeper-smoke
npm run desktop:distribution-channel-qa-smoke
npm run qa
npm run verify
npm run release:check
```

These commands validate the base structure, documentation rules, first-run React renderer surface, first-session workflow smoke, runtime first-run starter project smoke, sample-free all-style export, legacy chord-event migration, `.grooveforge.json` roundtrip smoke, Handoff Sheet text deliverable smoke, mocked browser download-path smoke, TypeScript contracts, production build, Electron desktop entry plus native menu bridge contract, live production Electron visual launch smoke, packaged desktop app smoke, local ad-hoc signing smoke, hardened runtime readiness smoke, local DMG smoke, simulated install-path smoke, Gatekeeper readiness smoke, release artifact manifest smoke, release notes artifact smoke, update feed config smoke, update metadata policy smoke, auto-update readiness smoke, Developer ID readiness smoke, Developer ID signing smoke, notarization smoke, notarized Gatekeeper smoke, and distribution-channel QA smoke. `npm run verify` runs the strict quality gate, renderer smoke, workflow smoke, runtime smoke, typecheck, build, desktop entry smoke, desktop visual launch smoke, packaged desktop smoke, desktop ad-hoc signing smoke, desktop hardened runtime readiness smoke, desktop DMG smoke, desktop install smoke, desktop Gatekeeper readiness smoke, desktop release manifest smoke, desktop release notes smoke, desktop update feed config smoke, desktop update metadata policy smoke, desktop auto-update readiness smoke, Developer ID readiness smoke, Developer ID signing smoke, notarization smoke, notarized Gatekeeper smoke, and distribution-channel QA smoke. `npm run release:check` is the release-readiness gate and runs both `npm run qa` and `npm run verify`.

Release readiness evidence is maintained in `docs/release/readiness.md`. It maps the current professional-producer, beginner, direct-composition, all-style, local export, privacy, and desktop-readiness requirements to source/docs evidence and automated gates.

`npm run renderer:smoke` uses Vite SSR to server-render the actual first-run React `App` without binding localhost. It verifies the default starter transport, beginner guide path, producer scan path, direct compose/sound/arrange/mix/master/export panels, Handoff surface, and sampling-free first-run copy while avoiding browser automation, Electron windows, network calls, imported audio, and sampler scope.

`npm run workflow:smoke` starts from `starterProject` and creates two concrete local first-session projects: a beginner guided first beat and a producer fast-pass beat. It verifies setup changes, event density across drums/808/melody/chords, arrangement, delivery target, mix/master posture, `.grooveforge.json` save/load, export and stem analysis, MIDI bytes, Handoff Sheet sections, and sampling-free output without writing media artifacts.

`npm run desktop:smoke` runs after build artifacts exist. It checks that `dist-electron/main.js` and `dist-electron/preload.cjs` were built, the production Electron main entry loads `dist/index.html` through `loadFile`, the compiled CommonJS preload exposes the bounded `grooveforge` desktop bridge in Electron's sandboxed preload environment, native menu commands stay validated, the renderer `NativeMenuCommand` declaration and `handleNativeMenuCommand` switch cover every allowlisted command through existing workstation handlers, and core BrowserWindow security settings remain enabled.

`npm run desktop:launch-smoke` runs after build artifacts exist. It starts the production Electron app with `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1`, keeps the BrowserWindow hidden, waits for the built renderer to mount under `#root`, verifies the live `window.grooveforge` preload bridge, checks the production `file:` renderer URL, confirms the first-run desktop DOM contains the beginner guided path, producer studio path, direct compose/sound/arrange/mix/master/export controls, Handoff Pack, and no sampling-first language, then captures the rendered page without saving media artifacts and verifies screenshot dimensions, PNG byte size, opacity, contrast, sampled color diversity, and non-background UI pixel coverage.

`npm run desktop:package-smoke` runs after build artifacts exist. On macOS it assembles an ignored `build/desktop/GrooveForge-darwin-*/GrooveForge.app` portable app from the installed Electron runtime, copies the built renderer plus Electron main/preload output into `Contents/Resources/app`, writes a minimal production `package.json`, generates `GrooveForge.icns` from `assets/brand/grooveforge-icon.svg`, replaces the Electron default icon reference, removes the Electron default icon file, validates root/helper bundle naming plus `Info.plist` privacy posture, then launches that packaged app with `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1` to reuse the live beginner, producer, direct workstation, preload bridge, sampling-free copy, and screenshot pixel evidence checks. Hidden-window launch smoke waits for `ready-to-show` and retries visual evidence until the smoke deadline before failing. This smoke proves a local portable app bundle, not installer creation, Developer ID signing, notarization, auto-update, or distribution-channel QA.

`npm run desktop:adhoc-sign-smoke` runs after `npm run desktop:package-smoke`. On macOS it applies a local ad-hoc signature to the packaged `GrooveForge.app` with `codesign --force --deep --options runtime --entitlements harness/fixtures/macos-hardened-runtime-entitlements.plist --sign -`, verifies it with `codesign --verify --deep --strict`, confirms `Signature=adhoc`, the `app.grooveforge.desktop` identifier, hardened runtime flags on both the app bundle and main executable, and the Electron runtime entitlements `com.apple.security.cs.allow-jit`, `com.apple.security.cs.allow-unsigned-executable-memory`, and `com.apple.security.cs.disable-library-validation`, rejects Developer ID authority claims, then launches the signed app with `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1` to reuse the live beginner, producer, direct workstation, preload bridge, sampling-free copy, and screenshot pixel evidence checks. This smoke proves only local ad-hoc signing with hardened runtime option and entitlement compatibility plus signed-app launch integrity, not Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.

`npm run desktop:hardened-runtime-readiness-smoke` runs after `npm run desktop:adhoc-sign-smoke`. On macOS it inspects the packaged app bundle and main executable with local `codesign --display --verbose=4` plus strict verification, writes an ignored `build/desktop/GrooveForge-*-hardened-runtime-readiness.json` summary with signature identifiers, runtime-flag evidence, ad-hoc/Developer ID authority posture, readiness blockers, `networkSubmissionAttempted: false`, `releaseGateClaimedHardenedRuntime: false`, `releaseGateClaimedNotarization: false`, `releaseGateClaimedGatekeeperApproval: false`, and `releaseGateClaimedExternalDistribution: false`. The local ad-hoc artifact should now expose runtime flags, while ad-hoc signing and missing Developer ID authority remain readiness blockers because local artifacts should not be reported as notarization-ready.

`npm run desktop:dmg-smoke` runs after `npm run desktop:hardened-runtime-readiness-smoke`. On macOS it creates an ignored local UDZO DMG from the validated ad-hoc signed `GrooveForge.app`, mounts it read-only, verifies that the image contains only `GrooveForge.app` plus an Applications shortcut, checks the mounted app payload for the GrooveForge bundle id, executable, `GrooveForge.icns`, packaged renderer/main assets, and absence of `electron.icns`, then detaches the image. This smoke proves a local disk-image artifact, not Developer ID signing, notarization, auto-update, app-store submission, or external distribution-channel QA.

`npm run desktop:install-smoke` runs after `npm run desktop:dmg-smoke`. On macOS it mounts the local DMG read-only, copies `GrooveForge.app` into an ignored simulated Applications directory under `build/desktop/.../install-smoke/Applications/`, verifies the copied app keeps the GrooveForge bundle id, branded icon, packaged renderer/main/preload assets, no `electron.icns`, and `Signature=adhoc`, then launches the installed copy with `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1` to reuse the live beginner, producer, direct workstation, preload bridge, sampling-free copy, and screenshot pixel evidence checks. This smoke proves a local DMG copy-and-launch path without touching the real `/Applications` directory and without claiming Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.

`npm run desktop:gatekeeper-readiness-smoke` runs after `npm run desktop:install-smoke`. On macOS it uses local `spctl` assessment for the simulated installed app and generated DMG, writes an ignored `build/desktop/GrooveForge-*-gatekeeper-readiness.json` summary with acceptance booleans, `spctl` output, readiness blockers, `networkSubmissionAttempted: false`, `releaseGateClaimedGatekeeperApproval: false`, and `releaseGateClaimedExternalDistribution: false`. Rejection is recorded as a readiness blocker rather than hidden, because local ad-hoc/not-notarized artifacts should not be reported as Gatekeeper-approved.

`npm run desktop:release-manifest-smoke` runs after `npm run desktop:gatekeeper-readiness-smoke`. On macOS it writes an ignored `build/desktop/.../GrooveForge-*-release-manifest.json` with app and DMG paths, byte sizes, SHA-256 checksums, GrooveForge bundle metadata, key app payload checksums, local ad-hoc signed distribution scope, ad-hoc signature evidence, and explicit false flags for Developer ID signing, notarization, auto-update, and external distribution-channel QA. This smoke makes local release artifacts traceable without claiming external certificate signing or distribution completion.

`npm run desktop:release-notes-smoke` runs after `npm run desktop:release-manifest-smoke`. On macOS it writes ignored `build/desktop/.../GrooveForge-*-release-notes.md` and `GrooveForge-*-release-notes.json` artifacts from the local release manifest, names the all-genre direct-composition product scope, audience posture, app/DMG/checksum evidence, local privacy posture, and current external-distribution blockers, and records no release URLs, support URLs, feed values, credentials, tokens, or channel values.

`npm run desktop:update-feed-config-smoke` runs after `npm run desktop:release-notes-smoke`. It imports the shared Electron update feed policy, validates feed URL/channel env keys, verifies missing, valid, fallback, non-HTTPS, credential-bearing, fragment-bearing, and invalid-channel configurations without contacting a feed, writes an ignored `build/desktop/GrooveForge-*-update-feed-config.json` with only redacted env-key names, validation booleans, and blockers, and records `networkProbeAttempted: false`, `releaseGateClaimedAutoUpdate: false`, and `releaseGateClaimedExternalDistribution: false`.

`npm run desktop:update-metadata-policy-smoke` runs after `npm run desktop:update-feed-config-smoke`. On macOS it writes an ignored `build/desktop/.../GrooveForge-*-update-metadata-policy.json` with the local release manifest input, required `latest-mac.yml`, `app-update.yml`, and DMG blockmap policy, feed/channel environment-key names without values, and Developer ID signing, notarization, Gatekeeper acceptance, and distribution-channel prerequisites. It records `networkProbeAttempted: false`, `releaseGateClaimedAutoUpdate: false`, `releaseGateClaimedDeveloperIdSigning: false`, `releaseGateClaimedNotarization: false`, `releaseGateClaimedGatekeeperApproval: false`, and `releaseGateClaimedExternalDistribution: false`.

`npm run desktop:auto-update-readiness-smoke` runs after `npm run desktop:update-metadata-policy-smoke`. On macOS it writes an ignored `build/desktop/GrooveForge-*-auto-update-readiness.json` summary, inspects the Electron built-in `autoUpdater` Help > Check for Updates integration, release manifest metadata, update feed config policy, update metadata policy, local update metadata files, and bounded update feed/channel environment-key presence without recording feed or channel values or probing a remote feed. It records `networkProbeAttempted: false`, `releaseGateClaimedAutoUpdate: false`, and `releaseGateClaimedExternalDistribution: false`, then reports missing or unsafe provider/feed/channel metadata and unsigned or not-notarized update artifacts as readiness blockers instead of claiming automatic updates.

`npm run desktop:developer-id-readiness-smoke` writes an ignored `build/desktop/GrooveForge-*-developer-id-readiness.json` summary. On macOS it checks `codesign`, `security find-identity`, valid Developer ID Application identities, `xcrun notarytool`, `xcrun stapler`, and bounded notary credential signal presence through environment key names without printing credential values. It records `networkSubmissionAttempted: false`, `releaseGateClaimedExternalDistribution: false`, readiness booleans, and blockers so the local release gate can pass while still making missing external-distribution prerequisites explicit. This smoke does not submit to Apple notary services and does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.

`npm run desktop:developer-id-signing-smoke` writes an ignored `build/desktop/GrooveForge-*-developer-id-signing.json` summary. On macOS it requires explicit `GROOVEFORGE_DEVELOPER_ID_IDENTITY`, inspects keychain Developer ID Application identities, and signs only an isolated copied app under `build/desktop/.../developer-id-signing-smoke/` when a matching identity exists. It verifies Developer ID authority, `app.grooveforge.desktop`, hardened runtime flags, and the required Electron runtime entitlements, while keeping `networkSubmissionAttempted: false`, `releaseGateClaimedDeveloperIdSigning: false`, `releaseGateClaimedNotarization: false`, `releaseGateClaimedGatekeeperApproval: false`, and `releaseGateClaimedExternalDistribution: false`. Without a matching configured identity it records blockers and does not attempt signing.

`npm run desktop:notarization-smoke` writes an ignored `build/desktop/GrooveForge-*-notarization.json` summary. On macOS it requires explicit `GROOVEFORGE_NOTARY_SUBMIT=1` before Apple notary submission, checks the Developer ID signing summary and isolated signed app copy, checks `xcrun notarytool submit`, `xcrun stapler`, `hdiutil`, and bounded credential signals, then prepares an isolated notarization DMG under `build/desktop/.../notarization-smoke/` only when a Developer ID signed app copy exists. If explicit submission and credentials are present, it submits with `notarytool --wait --output-format json`, staples accepted tickets, and validates the staple. Default QA does not submit to Apple services; missing identity, credentials, signed copy, or submit flag are recorded as blockers while `releaseGateClaimedDeveloperIdSigning: false`, `releaseGateClaimedNotarization: false`, `releaseGateClaimedGatekeeperApproval: false`, and `releaseGateClaimedExternalDistribution: false` remain explicit.

`npm run desktop:notarized-gatekeeper-smoke` writes an ignored `build/desktop/GrooveForge-*-notarized-gatekeeper.json` summary. On macOS it reads the notarization summary, requires `notarizationReady`, `notarizationAccepted`, `stapled`, `stapleValidationPassed`, and the isolated notarization DMG path before assessment, then uses local `spctl` checks for the stapled DMG plus the mounted app and detaches the read-only mount deterministically. Default QA does not submit to Apple services and records missing notarized/stapled artifacts as blockers while `releaseGateClaimedDeveloperIdSigning: false`, `releaseGateClaimedNotarization: false`, `releaseGateClaimedGatekeeperApproval: false`, and `releaseGateClaimedExternalDistribution: false` remain explicit.

`npm run desktop:distribution-channel-qa-smoke` writes an ignored `build/desktop/GrooveForge-*-distribution-channel-qa.json` summary after the notarized Gatekeeper path. On macOS it reads the local release manifest, release notes artifact, update feed config, update metadata policy, auto-update readiness, Developer ID signing, notarization, and notarized Gatekeeper summaries; validates redacted distribution channel metadata environment-key presence and URL safety; records `networkProbeAttempted: false`, `releaseUploadAttempted: false`, and false release claims; and reports blockers when channel metadata, release notes, Developer ID signing, notarization, Gatekeeper acceptance, auto-update, update metadata, or manual channel QA is missing. It never records release URLs, support URLs, credentials, tokens, or private feed values.

Production build validation depends on Vite 8 / Rolldown output code splitting, not warning suppression. `vite.config.ts` keeps `base: "./"` so Electron `file:` loading resolves built assets relative to `dist/index.html`, keeps `outDir: "dist"` and `sourcemap: true`, then uses `build.rolldownOptions.output.codeSplitting.groups` for `react-vendor`, `icons-vendor`, remaining `vendor`, `audio-engine`, `workstation-core`, `workstation-ui-model`, `workstation-editor-audition`, `workstation-selected-actions`, `workstation-pattern-tools`, `workstation-mix-panels`, `workstation-compose-panels`, `workstation-guidance-panels`, `workstation-shell-panels`, `workstation-snapshot-compare`, `workstation-analysis`, `workstation-app-helpers`, `workstation-app-quick-action-route-labels`, `workstation-app-quick-action-palette`, `workstation-app-quick-actions`, and `workstation-app-derivations` paths so eligible modules split when present and stable dependencies plus audio engine, workstation UI helper code, quick-action route-label helpers, quick-action command-palette helpers, quick-action result/metric code, editor audition code, selected-event action code, render-only mix/master panels, render-only compose/editor panels, render-only Guided/Studio workflow panels, render-only shell panels, Snapshot Compare derivation code, app derivation code, and shared analysis helpers do not stay in one large client chunk.
