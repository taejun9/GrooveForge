# plan-1394-launch-smoke-handoff

## Objective

Fix the live Electron launch smoke failure where the Command Reference spotlight handoff to Quick Actions can time out during the actual production desktop screen test.

## Scope

- Keep the fix limited to the Command Reference to Quick Actions handoff path.
- Preserve the existing Command Reference search, spotlight, and Quick Actions UI behavior.
- Do not change project data, release env files, private values, distribution state, or external release claims.
- Prove the fix with the real Electron `npm run desktop:launch-smoke` screen test.

## Changes

- Deferred the Command Reference Quick Actions handoff by one browser tick so the click event can return before the heavier Quick Actions surface renders.
- Routed both the Command Reference header Quick Actions button and the Spotlight Quick Actions button through the same handoff helper.

## Validation

- `npm run qa` passed.
- `npm run build` passed.
- `git diff --check` passed.
- `npm run desktop:launch-smoke` passed with a live production Electron app process, mounted renderer DOM, Command Reference search, Quick Actions handoff, and visual screenshot evidence.

## Decision Log

- Started after main validation exposed a live desktop launch smoke timeout at `Command Reference Quick Actions handoff`.
- Chose a one-tick UI handoff deferral instead of weakening the launch smoke because the app should keep the same user-facing behavior while allowing the clicked handler to return promptly.
