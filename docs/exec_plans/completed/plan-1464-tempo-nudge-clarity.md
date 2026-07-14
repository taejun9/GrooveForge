# plan-1464-tempo-nudge-clarity

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the four direct Tempo Nudge controls explain the edit and its resulting BPM before activation. First-time composers should not have to interpret `1/2` or `x2` shorthand; working composers should scan the exact target tempo without opening Quick Actions or hovering, while retaining the same explicit one-click, undoable tempo path.

## Evidence and Motivation

Live Browser audit on clean `main` at `b28352bd` found the four BPM-adjacent controls named only `-1`, `+1`, `1/2`, and `x2`. They have no explicit accessible names and expose only generic hover titles; none shows the target BPM. At 1280×720 each button measured 34px by 16px inside a 72px by 36px two-column group, with zero group/document horizontal overflow. Clicking `-1` changed 82 BPM to 81 BPM through the existing focused button and enabled Undo; Undo restored 82 BPM with Redo available. The behavior is correct, but the 16px target and symbolic labels make an essential tempo adjustment hard to understand and operate.

## Non-Goals

- Changing `tempoNudgePadBpm`, `applyTempoNudgePad`, BPM bounds, rounding, Tap Tempo reset, update history, manual BPM entry, playback, metronome, loop scope, save/load, render, MIDI, export, or Quick Actions execution.
- Disabling clamped no-op pads or adding press-and-hold, keyboard shortcuts, tempo automation, beat detection, audio input, recording, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Restructuring the full Transport, changing style/key fields, or expanding the setup row beyond its existing compact header contract.

## Constraints

- QA completes before a separate review starts.
- Preserve the four pad ids, order, definitions, titles, click handler, target calculation, Tap Tempo reset, project mutation, history labels, and explicit one-click behavior.
- Replace unexplained visual shorthand with complete action vocabulary and show the exact derived target BPM on every button.
- Expose a unique accessible name that states action, current BPM, and target BPM.
- Keep a contained two-by-two producer scan with at least 24px button height, readable two-line content, zero internal/document horizontal overflow, and no compact Transport height increase at 1280px or the supported 1180px minimum.
- Renderer and production Electron evidence cover ids, order, visible copy, accessible names, titles, derived targets, dimensions, readability, focusability, columns, rows, and containment; Browser proves actual target updates, focus retention, and Undo.

## Implementation Plan

- [x] Add UI-local complete pad labels, live target BPM details, and unique current-to-target accessible names.
- [x] Expand the two-by-two pad surface to readable 50px by at least 24px controls while preserving the compact setup row.
- [x] Add renderer and production Electron regression evidence and update durable product, architecture, and quality contracts.
- [x] Run Browser at 1280px and the supported minimum evidence path, production Electron, full QA, and full verify.
- [x] Run a separate post-QA review, complete the plan/review mirror, and merge through the required worktree flow.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-14 | Make Tempo Nudge clarity the plan-1464 target. | The current behavior is correct, but four 34px by 16px symbolic controls hide both meaning and target tempo from both audiences. |
| 2026-07-14 | Keep model labels and history wording unchanged; add presentation labels only at the direct UI. | Existing Quick Actions, search tokens, result copy, and undo labels already use the established pad definitions, while the readability problem is local to the tiny Transport surface. |
| 2026-07-14 | Show exact target BPM derived by `tempoNudgePadBpm` before activation. | Professionals can predict the edit instantly and beginners can understand half/double behavior including BPM clamping without changing calculation ownership. |
| 2026-07-14 | Use 50px by 25px two-line controls and rebalance only the setup-row columns. | The larger hit targets preserve the 298px compact header and 1180px minimum-window contract; the style field remains fully readable with no setup-row or document overflow. |
| 2026-07-14 | Approve the post-QA review with no blocking, major, or moderate findings. | Browser, production Electron, QA, and full verify independently confirmed the presentation-only boundary and retained behavior. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-14 | project_lead | Plan created in a dedicated feature worktree from clean `main` at `b28352bd`; the unrelated plan-085 worktree and its existing untracked active plan remain untouched. |
| 2026-07-14 | repo_cartographer | Browser audit at 1280×720 measured four 34px by 16px controls in a 72px by 36px two-column group. Visible and accessible names were only `-1`, `+1`, `1/2`, and `x2`; target BPM was absent, titles were generic, and group/document overflow was zero. |
| 2026-07-14 | quality_runner | Browser interaction proved the existing behavior: `-1` changed 82 BPM to 81 BPM, kept focus on the same symbolic control, and created an undo entry; Undo restored 82 BPM with Redo available. |
| 2026-07-14 | harness_builder | Added UI-local complete labels, exact target BPM details, current-to-target names/titles, 50px by 25px controls, and renderer/Electron regression evidence while keeping the existing calculation and update paths unchanged. |
| 2026-07-14 | quality_runner | Browser at 1280×720 measured a 104px by 54px group with four 50px by 25px controls, two columns and two rows, readable labels/details, zero internal/document overflow, and the unchanged 298px header. Clicking down changed 82 to 81 BPM, retained focus, recalculated all four targets and names, and Undo restored 82 BPM. |
| 2026-07-14 | quality_runner | Production Electron confirmed 4/4 complete actions, target details, unique names/titles, focusability, containment, and the two-by-two layout; the supported 1180px minimum remained at zero horizontal overflow. `git diff --check`, typecheck, renderer smoke, build, two standalone/full-chain Electron passes, full QA, and full verify passed. |
| 2026-07-14 | review_judge | Separate post-QA review approved with no blocking, major, or moderate findings. Calculation ownership, ids/order, click handler, Tap Tempo reset, project mutation, history wording, project schema, persistence, render, MIDI, and export boundaries remain unchanged. |
