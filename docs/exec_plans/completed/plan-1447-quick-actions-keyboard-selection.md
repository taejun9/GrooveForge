# plan-1447-quick-actions-keyboard-selection

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make Quick Actions a complete search-first keyboard palette: the current runnable result is explicit, ArrowUp/ArrowDown and Home/End move selection while search focus stays active, and Enter runs the selected command instead of always running the first result.

## Non-Goals

- Changing command definitions, search matching, scope counts, pinning, recents, or command execution semantics.
- Adding multi-select, command chains, macros, fuzzy-search changes, or new shortcuts.
- Changing project schema, playback, save/load, export, remote behavior, or sampling scope.

## Constraints

- QA completes before a separate review starts.
- Keyboard selection is limited to visible enabled results; disabled and truncated results are never selected.
- Query, scope, open, and close changes reset to the first visible runnable result.
- Search input retains DOM focus so typing can continue after arrow navigation.
- Selection changes have both visible styling and a polite textual announcement.
- Production Electron evidence uses native ArrowDown, ArrowUp, Home, End, and Enter input.

## Implementation Plan

- [x] Add deterministic visible-result keyboard selection state and navigation.
- [x] Add selected-row styling and assistive selection status without invalid listbox semantics.
- [x] Run the selected command on Enter while preserving existing mouse and pin behavior.
- [x] Add native Electron keyboard-selection and execution evidence.
- [x] Update durable product, architecture, and quality contracts.
- [x] Run full QA and a separate review.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Keep search input focused and announce selection through a polite status. | Quick Actions rows contain both run and pin buttons, so forcing listbox/option roles would create invalid interactive descendants; input focus plus explicit status preserves typing and truthful semantics. |
| 2026-07-13 | Prove Enter against the existing Enter Studio command after general navigation coverage. | A broad query can prove multi-result Arrow/Home/End behavior, while a narrow deterministic command can prove that the selected title, result title, and actual Studio mode change agree. |
| 2026-07-13 | Poll selection evidence from Electron main-process waits and use native `Down`/`Up` key codes. | Hidden renderer windows throttle renderer timers; Electron native key codes map to DOM `ArrowDown`/`ArrowUp` while main-process polling remains deterministic. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree from clean `main`. |
| 2026-07-13 | repo_cartographer | Source audit found Quick Actions handles Escape and Enter only; Enter targets `firstRunnableAction`, with no ArrowUp/ArrowDown selection state or selected-result announcement. |
| 2026-07-13 | harness_builder | Added visible-enabled selection state, ArrowUp/ArrowDown wrap, Home/End jumps, selected Enter execution, live selection status, explicit row styling, and renderer smoke coverage. |
| 2026-07-13 | quality_runner | Initial launch evidence exposed three harness assumptions: route readout commands can intentionally reopen a modal, a broad result set is truncated before the desired deterministic target, and Electron native keys are `Down`/`Up`. The harness now separates general navigation from a narrow Enter Studio execution proof. |
| 2026-07-13 | quality_runner | Hidden-window renderer timer throttling made renderer-side polling non-deterministic. Evidence collection now uses bounded Electron main-process polling, step diagnostics, and one-time target-index calculation. |
| 2026-07-13 | quality_runner | Production Electron launch smoke passed native ArrowUp/ArrowDown/Home/End focus-retaining navigation and native Enter execution; the selected and result titles both identify `Enter Studio: Professional producer`, and Studio mode was observed then restored. |
| 2026-07-13 | quality_runner | The first full release check exposed stale 300-second parent limits around the now-bounded 400-second production launch smoke. Source, packaged, signed, PKG-extracted, and installed launch parents now allow 480 seconds so structured app results are not masked by harness timeouts. |
| 2026-07-13 | quality_runner | Final `npm run verify` passed after the limit alignment: QA, quality gate, typecheck, renderer, 30/30 project roundtrips, 14/14 styles, both workflows/personas, build, lazy bundle, source/packaged/signed/PKG-extracted/installed Electron launches, native project I/O, package I/O, local delivery artifacts, release evidence, and private-value leak checks passed. |
| 2026-07-13 | review_judge | Separate post-QA review approved visible-enabled selection, reset and wrap behavior, truthful status semantics, existing command routing, and native execution evidence with no remaining blockers. |
