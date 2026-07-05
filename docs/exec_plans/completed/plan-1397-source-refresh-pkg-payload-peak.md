# plan-1397-source-refresh-pkg-payload-peak

## Objective

Reduce `release:source-evidence-refresh-smoke` peak disk usage around PKG payload verification so completion evidence can regenerate on low-space workstations.

## Scope

- Keep the change limited to local release evidence harness behavior.
- Preserve the 21 source artifact coverage, command order semantics, value redaction, and non-claiming external release posture.
- Do not record private values, probe networks, upload releases, sign with Developer ID, notarize, or write ignored private env files.
- Prove the app still launches through the actual Electron screen test.

## Changes

- Added post-command cleanup support to the source evidence refresh harness so the packaged app bundle can be removed after `desktop:pkg-smoke` and before PKG payload expansion.
- Added a value-free restore step that copies the verified PKG payload app back to the packaged app path before DMG and manifest evidence continue.
- Added value-free restore row reporting to JSON, Markdown, console output, and self-checks.
- Updated QA coverage so the static harness check requires restore rows and restore validation messages.
- Updated harness and release readiness docs to describe the PKG payload cleanup/restore behavior.

## Validation

- `node --check harness/scripts/run_release_source_evidence_refresh_smoke.mjs` passed.
- `npm run qa` passed before review.
- `git diff --check` passed before review.
- `npm run release:source-evidence-refresh-smoke` passed with 44 commands, 7 cleanup rows, 1 restore row, and 21/21 source artifacts present.
- `npm run desktop:launch-smoke` passed against the live Electron app screen with first-time composer and professional producer paths verified.

## Decision Log

- Started after `npm run release:source-evidence-refresh-smoke` failed on `desktop:pkg-payload-smoke` because the local disk had insufficient space to keep the packaged app, PKG payload archive, and extracted payload app at the same time.
- Chose a narrow harness-only fix: remove the package app after PKG creation, verify the payload, restore the verified payload app, then allow DMG and manifest evidence to run unchanged.
- Kept private release values, network checks, Developer ID signing, notarization, and external distribution claims out of scope.
