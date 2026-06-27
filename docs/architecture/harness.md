
# Harness Architecture

The harness exists to make the repository readable and enforceable for coding agents.

## Principles

- Plans are first-class artifacts.
- `AGENTS.md` is a map, not a full manual.
- Durable knowledge lives in `docs/`.
- Validation is encoded as scripts when practical.
- Feature work does not happen directly on `main`.
- Work happens on task branches and worktrees for git repositories.
- QA and review are separate loops.

## Bootstrap Note

This repository was initialized from an unborn `main` branch with no existing project files. The base scaffold is the initial repository foundation. Future implementation tasks should use the worktree lifecycle below.

## Worktree Lifecycle

```text
main
  -> git fetch
  -> create codex/plan-NNN-task branch
  -> create .worktree/plan-NNN-task checkout
  -> create active exec plan
  -> implement
  -> run QA
  -> run review
  -> complete plan and review mirror
  -> merge to main
  -> push main
  -> delete merged branch with git branch -d
  -> remove worktree
```

## Agent Readability

Agents should be able to answer these questions from repo files alone:

- What is the product?
- What work is active?
- What has been completed?
- How do I validate a change?
- What is prohibited?
- Where do meeting notes and reviews go?

If an answer only exists in chat, move it into an exec plan, meeting note, review, or product/quality document.

## Current Harness Commands

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run harness:smoke
npm run typecheck
npm run build
npm run desktop:smoke
npm run qa
npm run verify
```

These commands validate the base structure, documentation rules, runtime sample-free all-style export plus `.grooveforge.json` roundtrip smoke, TypeScript contracts, production build, and Electron desktop entry plus native menu bridge contract. `npm run verify` runs the strict quality gate, runtime smoke, typecheck, build, and desktop entry smoke.

`npm run desktop:smoke` runs after build artifacts exist. It checks that `dist-electron/main.js` and `dist-electron/preload.js` were built, the production Electron main entry loads `dist/index.html` through `loadFile`, the compiled preload exposes the bounded `grooveforge` desktop bridge, native menu commands stay validated, the renderer `NativeMenuCommand` declaration and `handleNativeMenuCommand` switch cover every allowlisted command through existing workstation handlers, and core BrowserWindow security settings remain enabled.

Production build validation depends on Vite 8 / Rolldown output code splitting, not warning suppression. `vite.config.ts` keeps `outDir: "dist"` and `sourcemap: true`, then uses `build.rolldownOptions.output.codeSplitting.groups` for `react-vendor`, `icons-vendor`, remaining `vendor`, `audio-engine`, `workstation-core`, `workstation-ui-model`, `workstation-editor-audition`, `workstation-selected-actions`, `workstation-pattern-tools`, `workstation-mix-panels`, `workstation-compose-panels`, `workstation-guidance-panels`, `workstation-shell-panels`, `workstation-snapshot-compare`, `workstation-analysis`, `workstation-app-helpers`, `workstation-app-quick-action-route-labels`, `workstation-app-quick-action-palette`, `workstation-app-quick-actions`, and `workstation-app-derivations` paths so eligible modules split when present and stable dependencies plus audio engine, workstation UI helper code, quick-action route-label helpers, quick-action command-palette helpers, quick-action result/metric code, editor audition code, selected-event action code, render-only mix/master panels, render-only compose/editor panels, render-only Guided/Studio workflow panels, render-only shell panels, Snapshot Compare derivation code, app derivation code, and shared analysis helpers do not stay in one large client chunk.
