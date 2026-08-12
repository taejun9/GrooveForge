# plan-1524-functional-tabs-ui-qa Review

## Summary

Plan 1524 reorganized the workstation into four persistent, keyboard-accessible functional tabs: Compose, Arrange, Mix, and Deliver. The change preserves project and child-panel state, keeps Master within Mix, routes Quick Actions and Guide destinations through visible panels, and prevents hidden Compose controls from receiving editing shortcuts, MIDI input, or native Delete commands.

## QA

- Passed: `git diff --check`
- Passed: `npm run qa`
- Passed: `npm run typecheck`
- Passed: `npm run build`
- Passed: renderer, workflow, persona, runtime, sample-audio, SQLite workspace, Quick Actions bundle, desktop entry, crash, and close-flow checks
- Passed: live in-app browser screen QA at 1440×960, 1180×760, and 390×844 using pointer and keyboard input, with six SHA-256-receipted PNG captures and zero fresh console errors or warnings
- Passed: displayed production Electron functional-tab smoke with native pointer/keyboard input, four tab captures, per-key hidden Compose guards, viewport focus, and sticky-navigation clearance
- Passed: displayed source, packaged, simulated-installed, and PKG-payload project Open/Save roundtrips with rendered fingerprints and SQLite integrity/recovery checks
- Passed: the functional screen contract in portable packaged, ad-hoc signed, simulated-installed, and unsigned PKG-extracted app copies
- Passed individually: remaining local release reports after the isolated aggregate `npm run release:check` encountered `ENOSPC` while creating its DMG; the aggregate command itself is not recorded as a final zero exit

## Findings

- Actual screen QA found and fixed mobile Style-field horizontal overflow and excessive Deliver summary wrapping.
- Hidden Compose number/Delete/MIDI/native-menu inputs could mutate invisible data; the guards now re-check the active tab at event time and the Electron harness verifies every key independently.
- Quick Actions could reveal hidden or collapsed targets before React committed their tab/details state, and focus could fall to `body`; centralized reveal helpers now open, scroll, and focus Review Queue, Finish Checklist, Guide routes, and Transport targets.
- At 1180px, the sticky Workflow Navigator could cover nested route targets; workspace reveal now uses the navigator's computed sticky posture and live bottom edge.
- Project-I/O screen checks could inherit a recovery draft or pass with a DOM `.click()` without proving rendered project content; the harness now uses an isolated session, native pointer hit-testing, and exact rendered fingerprints.
- Screenshot cleanup previously accepted a broadly resolved recursive target; evidence output now overwrites only the four known PNG files.
- Independent post-QA review found no remaining P0–P2 issues after the follow-up loop.

## Residual Risk

- Screen testing was performed by live renderer/Electron automation with native pointer and keyboard input, not by a human manually exercising every possible state combination.
- Real `/Applications` installation, Developer ID signing, Apple notarization, Gatekeeper acceptance, live update-feed publication, and external distribution require private credentials or external-channel authority and were not performed or claimed.
- The full `release:check` orchestration did not produce one final zero exit because the isolated test copy exhausted disk space during DMG creation; the affected artifact was rebuilt and verified, and subsequent local checks were run individually.

## Follow-Ups

- Preserve the four-tab information architecture when adding future panels; add a new tab only when the workflow domain genuinely changes rather than extending `WorkflowZoneId` casually.
- Run the external distribution checklist only when Developer ID, notarization, release-channel metadata, and manual approval inputs are available.
