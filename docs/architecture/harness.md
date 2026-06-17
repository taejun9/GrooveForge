
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
npm run qa
npm run verify
```

These commands validate the base structure, documentation rules, runtime sample-free all-style export smoke, TypeScript contracts, and production build. `npm run verify` runs the strict quality gate, runtime smoke, typecheck, and build.

Production build validation depends on Vite 8 / Rolldown output code splitting, not warning suppression. `vite.config.ts` keeps `outDir: "dist"` and `sourcemap: true`, then uses `build.rolldownOptions.output.codeSplitting.groups` for `react-vendor`, `icons-vendor`, remaining `vendor`, `audio-engine`, and `workstation-core` paths so eligible modules split when present and stable dependencies plus audio engine code do not stay in one large client chunk.
