# plan-1450-minimum-width-studio-transport review

## Outcome

Passed. Studio preserves professional workspace height at GrooveForge's real 1180px minimum by keeping Session Context and Exports compact on entry and collapsing them once when a wide Studio window crosses into the 901–1220px range. Wide Studio entry still expands both groups, either compact disclosure remains manually reopenable, Guided stays compact, and all other professional panels retain their existing mode-aware behavior.

## QA

- Live browser QA passed at 1280×720 for both audience starter landings with zero horizontal overflow, then at 1180×720 for compact Studio entry and manual Session Context reopen.
- `npm run typecheck`, `npm run renderer:smoke`, `npm run build`, and `npm run qa` passed.
- `npm run desktop:launch-smoke` passed at the real 1180px minimum. Native evidence measured a 456.4921875px compact Studio transport versus 695.4921875px with Exports manually expanded, with zero horizontal overflow, wide auto-expansion, resize collapse, compact entry, and individual manual reopen all ready.
- The first full verify and standalone package retry exposed stale 480-second package parent limits below the app's 520-second collector. After aligning package, ad-hoc, PKG-payload, and simulated-install parents at 540 seconds, standalone `npm run desktop:package-smoke` passed.
- Full `npm run verify` then passed with exit code 0 across quality gate, renderer/workflow/persona/runtime checks, typecheck/build, native app launch and project IO, packaged and signed app launch, DMG, PKG payload and simulated-install launch/project IO, privacy-safe release evidence, and external-distribution boundary checks.
- The interactive release setup refresh received four empty values and correctly recorded a value-free blocked external-distribution state without modifying the local env or using the network.
- `git diff --check` passed.

## Review Findings

No blocking, high, medium, low, or follow-up findings.

The compact decision shares the existing 1220px transport boundary and has an `innerWidth` fallback. The mode transition changes only the two secondary transport disclosure states; the media-query listener closes them only on entry into the compact range and cleans itself up on unmount, leaving later manual toggles authoritative. The launch-smoke hook is typed, UI-only, synchronously flushed for deterministic evidence, and removed during cleanup. Production evidence resets Guided mode and restores the standard window size in a `finally` path. All four launch-bearing parent harnesses now share one bounded 540-second ceiling above the 520-second app collector.

## Residual Risk

The compact breakpoint is width-based rather than content-measured, so future additions to the transport must preserve the documented 901–1220px layout and native overflow gate. External distribution remains outside this plan and still requires private release-channel metadata, Developer ID credentials, notarization, Gatekeeper evidence, and manual channel approval; no external completion is claimed.

## Follow-up

Continue product-completion work while preserving the shared breakpoint, direct-composition priority, all-genre editability, local-first behavior, and separate beginner/professional acceptance paths.
