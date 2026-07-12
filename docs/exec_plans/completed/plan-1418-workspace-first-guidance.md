# plan-1418-workspace-first-guidance

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Make the primary beat-editing workspace reachable immediately after the compact first-run and quick-start controls, while preserving the existing guidance, analysis, and delivery tools in a clearly labeled on-demand center.

## Non-Goals

- Removing existing composition, guidance, analysis, handoff, or export capabilities.
- Changing project data, audio rendering, playback, generation, or file formats.
- Adding cloud services, accounts, analytics, remote AI, payments, or sampling-first workflows.
- A broad visual redesign beyond the workspace-first information hierarchy.

## Context Map

- `src/ui/App.tsx`: top-level panel order and workstation interaction state.
- `src/styles.css`: shell, guidance, and responsive layout.
- `src/ui/workstationShellPanels.tsx`: compact guide entry surfaces.
- `harness/scripts/run_renderer_smoke.mjs`: first-run server-render regression coverage.
- `harness/scripts/run_workflow_smoke.mjs`: direct-composition workflow coverage.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve the sample-free, event-based, local-first product spine.

## Implementation Plan

- [x] Group deep guidance, analysis, readiness, and delivery panels into one collapsed-by-default Guide & Review Center.
- [x] Keep mode selection and the compact Guide Quick Start visible before the core workspace.
- [x] Add clear summary copy, current mode context, and accessible disclosure semantics.
- [x] Add focused renderer assertions for the new information hierarchy.
- [x] Run targeted QA, then the documented QA and verification commands.
- [x] Perform a separate review and create completion artifacts.

## QA Plan

- Run `npm run renderer:smoke`.
- Run `npm run workflow:smoke`.
- Run `npm run typecheck` and `npm run build`.
- Run `npm run qa`.
- Run `npm run verify` if focused checks pass.
- Inspect the rendered hierarchy at desktop and narrow widths when browser control is available.

## Review Plan

QA completes before review starts. Review checks beginner discoverability, producer efficiency, keyboard/accessibility semantics, preservation of all existing routes, and direct-composition invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-12 | Prioritize workspace-first progressive disclosure. | More than 30 guide and analysis surfaces precede the actual drum editor, making the main creative action harder to reach for both audiences. |
| 2026-07-12 | Preserve the compact Guide Quick Start outside the disclosure center. | Beginners still need one obvious next-step surface; deeper diagnostics can remain available on demand. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-12 | project_lead | Plan created in the dedicated feature worktree. |
| 2026-07-12 | repo_cartographer | Source audit found the full guidance and delivery stack rendered before the core workspace. |
| 2026-07-12 | harness_builder | Added the collapsed Guide & Review Center, responsive styling, mode-aware copy, and automatic reveal from Guide Quick Start and project/export Quick Actions. |
| 2026-07-12 | quality_runner | Typecheck, renderer smoke, workflow smoke, build, diff check, and standard QA passed; in-app browser visual inspection was unavailable after repeated connection timeouts. |
| 2026-07-12 | quality_runner | Full verification passed through live Electron launch, native and packaged project I/O, app/DMG/PKG assembly, simulated install, 14-style runtime coverage, and persona delivery proof; the final external-release refresh was stopped when it requested operator-owned private distribution input. |
| 2026-07-12 | review_judge | Separate post-QA diff review found no blocking issue; disclosure semantics, quick-start reveal, responsive copy, and direct-composition behavior remain coherent. |

## Completion Notes

Added a collapsed-by-default Guide & Review Center between the compact Guide Quick Start and the core editing workspace. Deep audience guidance, analysis, readiness, snapshot, and delivery panels remain available without dominating the first creative viewport. The summary is keyboard-accessible, mode-aware, responsive, and automatically opens when Guide Quick Start or project/export Quick Actions route into its contents.

`npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run build`, and `git diff --check` passed. The full `npm run verify` chain also passed product, renderer, persona, runtime, audio/export, Electron launch, native/packaged/installed project I/O, app/DMG/PKG, and local signing checks. Its final external-release evidence refresh was intentionally stopped when it entered an interactive wizard for operator-owned private distribution inputs; external distribution is outside this plan and is not claimed.
