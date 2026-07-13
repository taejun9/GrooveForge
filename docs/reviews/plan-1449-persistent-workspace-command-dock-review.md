# plan-1449-persistent-workspace-command-dock review

## Outcome

Passed. Once the full transport header leaves the viewport, a compact Workspace Command Dock keeps Play/Stop, Actions, Undo, Redo, Save, and the live transport position reachable. It disappears when the header returns, projects the existing command state without owning a second subsystem, and preserves first-run space for direct composition.

## QA

- `npm run typecheck` passed.
- `npm run renderer:smoke` passed observer ownership, stable hooks, shared-handler and disabled-state contracts, bounded fixed styling, initial absence, and focus clearance.
- `npm run build` passed.
- `npm run qa` passed.
- Live browser QA at 1180×720 passed initial absence, deep-editor appearance, 660×64 viewport containment, zero horizontal overflow, five labeled controls, shared Play/Stop state, Quick Actions opening, exact Escape focus restoration, and return-to-header hiding.
- `npm run desktop:launch-smoke` passed at the real 1180px minimum with zero horizontal overflow plus conditional dock show/hide, five controls, viewport containment, transport and Undo/Redo parity, shortcut metadata, focusability, native Play/Stop, native Actions, and Escape restoration.
- Full `npm run verify` passed with exit code 0 across quality gate, typecheck/build, renderer/workflow/persona/runtime smokes, native Electron launch and project IO, app/DMG/PKG assembly, extracted and isolated-installed launch/project IO, privacy-safe release evidence, and external-distribution boundary checks.
- `git diff --check` passed.

## Review Findings

No blocking, high, medium, low, or follow-up findings.

The observer disconnects on unmount and owns only conditional UI visibility. Dock controls read existing transport and history state and call the existing handlers; no project or audio state is duplicated. Fixed width remains viewport-bounded, responsive presentation retains all five commands, conditional bottom padding and focus scroll margin prevent editor targets from being obscured, and the modal lifecycle restores the dock Actions control exactly. Native evidence uses actual pointer input for ordinary buttons and native Escape for restoration while retaining bounded collectors below the app and parent timeouts.

## Residual Risk

External distribution remains outside this plan and requires private release-channel metadata, Developer ID credentials, notarization, Gatekeeper evidence, and manual channel approval. Local release readiness remains 100%; this plan does not claim external distribution completion.

## Follow-up

Continue the product-completion sequence from the next active plan while preserving direct composition, all-genre editability, local-first behavior, and the separate beginner/professional acceptance paths.
