# plan-1265-update-metadata-publish-packet

## Goal

Add a value-free update metadata publish packet so the `auto-update-feed` path has an operator-facing proof checklist for the final metadata files, source artifact selection, publish blockers, and post-edit verification sequence without exposing feed URLs, channel values, credentials, or release identities.

## Scope

- Add a `release:update-metadata-publish-packet-smoke` command that refreshes local update metadata artifacts and auto-update readiness, then writes a compact Markdown/JSON packet under ignored `build/desktop/`.
- Include required update metadata files, source DMG selection, signed/notarized artifact readiness, publish blocker rows, feed/channel proof commands, private value leak audit command, hard-gate command, and current completion/10-plan context.
- Update package scripts, release readiness docs, harness docs, quality command catalog, README completion citation, and QA expectations so the publish packet is durable evidence.
- Keep the report value-free and local-first: no feed URLs, channel values, release/support URLs, credentials, tokens, Developer ID identities, private beats, real user audio, network probes, uploads, feed publishing, signing, or Apple notary submission.

## Out Of Scope

- Editing `.env.distribution.local` or any configured private distribution env file.
- Publishing update feeds or release metadata.
- Claiming auto-update readiness, external distribution, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external release completion.
- Adding accounts, analytics, cloud sync, remote AI calls, payment flows, sampling-first workflows, or imported-audio scope changes.

## QA

- `node --check harness/scripts/run_release_update_metadata_publish_packet_smoke.mjs`
- `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:update-metadata-publish-packet-smoke`
- `npm run qa`
- `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`
- `git diff --check`

## Decision Log

- 2026-07-01: After plan-1264, the next public completion path still depends on operator-owned release-channel and update-feed values plus signed/notarized artifacts. A publish packet moves the app closer to completion by making the update metadata handoff explicit, value-free, and locally verifiable before any real feed publish.
- 2026-07-01: Keep the publish packet outside `npm run verify` while private placeholders remain expected; it is operator-facing evidence to run after feed/channel or signed artifact refreshes, not a hard-gate replacement.

## Completion Notes

- Added `release:update-metadata-publish-packet-smoke`, which writes ignored Markdown/JSON artifacts for required `latest-mac.yml`, `app-update.yml`, and DMG blockmap rows, selected source artifact posture, signed/notarized update artifact readiness, publish blocker rows, operator proof order, hard-gate boundary, completion percentage, and 10-plan context.
- The command refreshes update metadata policy/artifacts when release manifest prerequisites exist, then refreshes update-feed post-edit proof and auto-update readiness. It records no feed/channel/private values and does not probe feeds, publish metadata, upload releases, sign artifacts, submit to Apple, or claim auto-update/external distribution.
- Updated package scripts, README, release readiness docs, harness architecture docs, quality rules, and QA expectations to make the packet part of durable release evidence and completion citation.
- Passed `node --check harness/scripts/run_release_update_metadata_publish_packet_smoke.mjs`.
- Passed `npm run qa`.
- Passed `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`.
- Passed `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:update-metadata-publish-packet-smoke` after full release evidence existed; the packet reported publish packet ready `yes`, update metadata files ready `yes`, update metadata publish ready `no`, signed update artifacts ready `no`, update feed live check ready `no`, publish blocker rows `7`, completion `99.999999%`, and remaining `0.000001%`.
- Passed `git diff --check`.
