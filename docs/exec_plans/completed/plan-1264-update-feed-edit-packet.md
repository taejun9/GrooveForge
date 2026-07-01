# plan-1264-update-feed-edit-packet

## Goal

Add a value-free operator edit packet for the `auto-update-feed` step so the next private update feed/channel edit can be prepared and verified without exposing feed URLs, channel values, credentials, or release metadata.

## Scope

- Add a `release:update-feed-edit-packet-smoke` command that refreshes the real update feed live check and writes a compact Markdown/JSON edit packet for the six update feed/channel keys.
- Include selected-key readiness, placeholder posture, edit locations, expected shapes, strict proof command, post-edit proof command, checkpoint command, hard-gate command, and current completion/10-plan context.
- Update durable release docs, harness docs, quality rules, package scripts, and QA expectations so the `auto-update-feed` handoff is covered by the same value-free proof discipline as release-channel metadata.
- Add a pre-Electron macOS GUI sandbox guard for `npm run desktop` and desktop launch-bearing smokes so Codex sandbox runs stop before Electron triggers the AppKit `SIGABRT` crash report seen in the attached program launch log.
- Keep all output value-free and local-first: no feed URLs, channel values, release URLs, support URLs, credentials, tokens, Developer ID identities, private beats, or real user audio.

## Out Of Scope

- Editing `.env.distribution.local` or any configured private distribution env file.
- Claiming auto-update readiness, external distribution, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or release uploads.
- Probing update feeds, publishing update metadata, uploading releases, signing, Apple notary submission, accounts, analytics, cloud sync, remote AI, or sampling/imported-audio scope changes.

## QA

- `node --check harness/scripts/run_release_update_feed_edit_packet_smoke.mjs`
- `node --check harness/scripts/desktop_gui_launch_guard.mjs`
- `node --check harness/scripts/run_desktop_app.mjs`
- `CODEX_SANDBOX=seatbelt node harness/scripts/run_desktop_app.mjs` (expected preflight failure without launching Electron)
- `npm run release:update-feed-edit-packet-smoke`
- `npm run qa`
- `git diff --check`

## Decision Log

- 2026-07-01: Current completion remains blocked by operator-owned release-channel metadata, but the next priority after that blocker clears is `auto-update-feed`. Preparing a value-free edit packet for update feed/channel keys makes the remaining external completion path more directly executable without storing private values.
- 2026-07-01: User attached a macOS Electron crash report from program launch. The stack aborts before GrooveForge app code, during AppKit application registration under the Codex process coalition, so fix the runnable entry and launch-bearing smokes with a pre-Electron `CODEX_SANDBOX` guard rather than trying to catch it inside Electron main.

## Completion Notes

- Added `release:update-feed-edit-packet-smoke`, which refreshes the real value-free update feed live check, writes ignored Markdown/JSON edit packet artifacts, lists all six update feed/channel keys, selection rows, placeholder edit locations, strict/post-edit/checkpoint/hard-gate commands, and keeps feed/channel/private values unrecorded and auto-update/external distribution unclaimed.
- Added a pre-Electron macOS GUI sandbox guard and routed `npm run desktop` through `harness/scripts/run_desktop_app.mjs`. Launch-bearing desktop smokes now check the same guard so Codex `CODEX_SANDBOX` runs stop before Electron can trigger the AppKit `SIGABRT` Crash Reporter path shown in the attached launch report.
- Passed `node --check` for the new update-feed edit packet script, desktop GUI guard, desktop wrapper, desktop entry smoke, and every modified launch-bearing desktop smoke.
- Passed expected preflight failure: `CODEX_SANDBOX=seatbelt node harness/scripts/run_desktop_app.mjs`; it exited before spawning Electron and printed the restricted macOS GUI context diagnostic.
- Passed `npm run qa`.
- Passed `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:update-feed-edit-packet-smoke`; the artifact reported selected keys ready `0/2`, placeholder keys `6`, placeholder edit locations `6`, current 10-plan progress `1261-1270: 3/10`, completion `99.999999%`, remaining `0.000001%`, and no private values/network/feed publish/release claims.
- Passed `npm run desktop:smoke`.
- Passed `git diff --check`.
