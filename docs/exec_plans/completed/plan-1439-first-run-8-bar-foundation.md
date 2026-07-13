# plan-1439-first-run-8-bar-foundation

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Align the actual first-run project with GrooveForge's sample-free 8-bar direct-composition target: a playable Guided beat with drums, bass, chords, melody, compact arrangement, mix/master posture, and an explicitly changeable starting style instead of a Trap-centered 26-bar demo.

## Non-Goals

- Removing Trap, any other style profile, the professional producer starter, or full-song arrangement templates.
- Adding a new genre, protected-style imitation, sampling, imported audio, remote generation, accounts, or cloud state.
- Changing project schema, event types, realtime scheduling, render/export algorithms, file format, or Handoff contents.
- Making the beginner starter and producer starter routes redundant or removing explicit user choice.

## Context Map

- `src/domain/workstation.ts`: actual `starterProject`, style pattern generators, arrangement templates, delivery targets, mix/master defaults.
- `src/ui/App.tsx`: first visible transport setup and style selector context.
- `harness/scripts/run_renderer_smoke.mjs`: exact first-render identity and both audience paths.
- `harness/scripts/run_runtime_smoke.mjs`: real starter roundtrip, render, stems, MIDI, Handoff, and download evidence.
- `harness/scripts/run_workflow_smoke.mjs` and persona evidence: beginner/pro starter workflows derived from the shared base.
- `docs/product/product.md`, `docs/architecture/product-architecture.md`, and `docs/quality/rules.md`: all-genre, sample-free, 8-bar first-product invariants.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Initial project must total exactly 8 bars and use only editable drum, bass, melody, chord, arrangement, mixer/master, and automation project data.
- Initial Pattern A/B/C data must match the selected style/key instead of relabeling the prior Trap/F-minor events.
- Style copy must say the initial profile is a changeable starting point and preserve access to all 14 profiles.
- Beginner and professional producer starter projects must retain their established 8-bar Lo-fi and 26-bar House acceptance contracts.

## Implementation Plan

- [x] Rebase `starterProject` on generated Lo-fi/A-minor Pattern A/B/C data, an 8 Bar Loop arrangement, Starter Sketch delivery, and Clean Demo master posture.
- [x] Expose concise first-run style context that says the selected profile is a changeable starting point across all 14 styles.
- [x] Update renderer/runtime evidence from the old Trap/26-bar identity to the new 8-bar foundation.
- [x] Preserve both Audience Starter projects, full-song producer workflow, save/load, audio/stem, MIDI, and Handoff evidence.
- [x] Update durable product/quality documentation and QA contracts.
- [x] Run focused/full QA and desktop evidence, then perform a separate review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, and `npm run harness:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run build`.
- Run `npm run quick-actions:bundle-smoke`, `npm run desktop:launch-smoke`, and `npm run desktop:project-io-smoke`.
- Run `git diff --check`; inspect exact initial title/mode/BPM/key/style/bars/target/master/pattern posture and both Audience Starter contracts.

## Review Plan

Review starts only after QA. It checks first-read genre posture, exact 8-bar/sample-free/editable project data, selected style/key pattern consistency, first-run copy, beginner and producer starter preservation, audio/export/project durability, and all project invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Use the existing Lo-fi profile at 82 BPM in A minor as the initial foundation and label it as changeable across 14 styles. | A slower compact beat is approachable for first-time editing, uses an existing first-class profile rather than inventing a neutral pseudo-genre, and remains one starting point rather than product identity. |
| 2026-07-13 | Use Starter Sketch, 8 Bar Loop, and Clean Demo for the initial delivery/master posture. | These existing data contracts match the explicit first-product target and keep the initial project complete enough to audition, edit, mix, save, and export. |
| 2026-07-13 | Generate Pattern A/B/C from the selected Lo-fi/A-minor profile rather than only changing metadata. | Style/key labels must describe the actual editable musical events users hear and edit. |
| 2026-07-13 | Restore dark text on the mint Local Draft Restore button. | Live first-screen visual review found the banner's generic span color overrode the primary button's intended contrast. |
| 2026-07-13 | Require exact loop-template and Clean Demo ceiling evidence, and render style context at 10px with stronger contrast. | Counts alone could accept a different 8-bar structure, while first-run explanatory copy must remain readable rather than merely present. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Current first render and runtime QA explicitly lock Untitled Beat to Guided, 145 BPM, F minor, Trap, and 26 bars despite the repository's 8-bar/all-genre first-product invariant. |
| 2026-07-13 | quality_runner | Isolated live-browser review confirmed the new 82 BPM/A-minor/Lo-fi/8-bar state and 14-style starting-point copy in one viewport, then found and corrected low-contrast Restore Draft text in the existing recovery banner. |
| 2026-07-13 | harness_builder | Renderer and runtime evidence now require exact first-run identity, 4-block loop template, 8 bars, generated style/key-matched Pattern A/B/C, matching sound preset, Starter Sketch, Clean Demo, master ceiling, 14-style copy, and sample-free export paths. |
| 2026-07-13 | quality_runner | Type, renderer, base QA, runtime, workflow, persona, production build, bundle boundary, live Electron launch, native project I/O, and whitespace validation passed. |
| 2026-07-13 | review_judge | Separate post-QA review removed the obsolete hand-authored Trap starter data, strengthened exact arrangement/master evidence and style-copy readability, and found no remaining blocker. |

## Completion Notes

GrooveForge now opens on an actual sample-free 8-bar composition foundation rather than a Trap-centered 26-bar demo. `starterProject` is Guided, 82 BPM, A minor, Lo-fi, Pattern A selected, four-block 8 Bar Loop, Starter Sketch, and Clean Demo. Pattern A/B/C and the sound preset are generated from the selected Lo-fi/A-minor rules, while the visible Style label explains that this is one starting point across 14 editable profiles. The obsolete hand-authored F-minor Trap starter patterns were removed, reducing the audio-engine production chunk by about 3.4 KB. The established first-time composer 8-bar project and professional producer 26-bar project remain distinct and pass workflow, persona, project I/O, production Electron, local audio/stem, MIDI, Handoff, and bundle evidence.
