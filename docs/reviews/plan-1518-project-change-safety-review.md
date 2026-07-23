# plan-1518-project-change-safety Review

## Summary

Plan 1518 protects authored work in two high-impact usability paths. Style changes from the header, Style Inspector, and Quick Actions now open one local preview that names BPM, swing, sound, selected-Pattern reset, and Pattern A/B/C event-count changes before explicit Apply. Guided and Studio Starter creation now confirms only when unsaved work, a focused changed Master Ceiling draft, or a local recovery draft could be replaced.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run typecheck`
- Passed: `npm run renderer:smoke`
- Passed: `npm run harness:smoke`
- Passed: `npm run workflow:smoke`
- Passed: `npm run build`
- Passed: `npm run desktop:launch-smoke` in the approved macOS GUI context

Runtime evidence covered 8/8 Open/Starter replacement-guard paths and immutable Style preview derivation across Pattern A/B/C. Production Electron evidence covered Style dialog initial focus, Tab/Shift+Tab wrap, Escape cancellation, opener focus restoration, modal containment above the Workspace Command Dock, explicit Apply, Pattern A selection, Undo restoration, and dirty Starter confirmation cancellation without project or undo-posture changes.

The first sandboxed Electron attempt was correctly blocked by the macOS GUI preflight and was rerun with approved GUI access. Early versions of the new hidden-window collector exceeded its former 150-second bound because animation-frame and timer work was throttled; the collector was separated into synchronous state flushes, `MessageChannel` tasks, and focus-only animation frames, bounded at 280 seconds inside the existing 1,800-second app collector, and the final full production smoke passed.

## Findings

- Final independent review: no P0-P3 findings.
- Review changed Quick Actions from inferred before/after cancellation to explicit `complete`/`canceled` outcomes, keeping canceled status and tone accurate even if another local change occurs.
- Review removed confirm-time Master Ceiling mutation; a focused changed draft contributes to the loss predicate before mutation and resets only after successful Starter replacement.
- Review preserved the native Style select's implicit popup semantics and moved review behavior into descriptive text instead of mislabeling the native popup as a dialog.
- Review added live production interaction evidence instead of relying only on SSR source checks and pure helper tests.
- Review moved the Style modal above the persistent command dock and verified hit-test containment in production.
- Direct-composition-first, local-first, privacy, and sampling-secondary invariants remain unchanged.

## Residual Risk

- Production smoke stubs the OS confirmation result, so the platform-native confirmation's visual presentation remains a manual UI check.
- A previously scheduled Tap Tempo commit or active MIDI input can still create an independent explicit/local project edit while a Style preview is open; the new decision token prevents result misclassification, but concurrent-input behavior is outside this plan's automated interaction matrix.
- A focused Master Ceiling input naturally commits on blur before a later button click; that completed edit is then correctly treated as unsaved by the Starter guard rather than being rolled back on Starter cancellation.

## Follow-Ups

- Add a non-blocking Handoff “Local share boundary” summary for included files and authored metadata.
- Consider a compact Guided selected-note Essentials editor.
- Continue the bounded Bass Voice wording audit where legacy `808` copy is not required for durable compatibility.
