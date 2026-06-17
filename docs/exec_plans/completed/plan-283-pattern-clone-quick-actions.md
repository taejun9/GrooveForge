# plan-283-pattern-clone-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Add command-palette access to existing Pattern Clone Pads so users can quickly create editable A/B/C variations without hunting through the Pattern panel.

## Scope

- Add Quick Actions for the existing Pattern Clone Pad options.
- Route each command only through the existing `cloneSelectedPatternVariation` handler.
- Keep clone commands explicit, undoable, local, and editable after creation.
- Add local Quick Action result metric/follow-up text for Pattern Clone runs.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- Do not add new variation presets or alter existing `createPatternVariation` behavior.
- Do not change Pattern Clone Pad UI behavior.
- Do not change Pattern A/B/C schema, arrangement block assignments, playback, render/export, MIDI export, Handoff, snapshots, save/load, or Pattern Stack behavior.
- Do not add sampling, imported audio, hidden generation, remote AI, plugin hosting, accounts, analytics, cloud sync, or command chains.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for Pattern Clone Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Create task branch and worktree.
- [x] Create active exec plan.
- [x] Inspect existing Pattern Clone Pads and Quick Actions patterns.
- [x] Add Pattern Clone Quick Actions using existing clone handlers.
- [x] Update docs and static QA.
- [x] Run QA before review.
- [x] Move this plan to completed and create a review mirror.
- [ ] Merge to `main`, push, delete branch, and remove worktree.

## Validation

Run:

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run harness:smoke
npm run typecheck
npm run build
npm run qa
npm run verify
git diff --check
```

Browser smoke if environment allows localhost: Quick Actions shows Pattern Clone commands for the available target Pattern A/B/C slots, command details name the target and variation preset, running a command switches editing focus to the target pattern, the project remains sample-free, and no console errors occur.

## QA Results

- Passed `python3 harness/scripts/run_qa.py`.
- Passed `npm run typecheck`.
- Passed `python3 harness/scripts/run_quality_gate.py`.
- Passed `npm run harness:smoke`; all 10 Beat Blueprints and all 10 style profiles produced sample-free all-style 8-bar beats.
- Passed `npm run build`; Vite reported the existing large chunk warning for `dist/assets/index-Bxq5NUDE.js`.
- Passed `npm run qa`.
- Passed `npm run verify`; Vite reported the same existing large chunk warning.
- Passed `git diff --check`.
- Browser smoke was attempted with `npm run dev -- --host 127.0.0.1 --port 5307`, but the sandbox blocked localhost binding with `listen EPERM: operation not permitted 127.0.0.1:5307`. The escalated retry was rejected by the environment policy, so no in-browser smoke result is recorded.

## Review

QA completes before review starts. Review checks that Pattern Clone Quick Actions are explicit, route only through existing clone handlers, preserve Pattern A/B/C independence, do not alter arrangement assignments unless users separately choose that, keep results editable, and avoid sampling/cloud/remote scope.

Review completed after QA. No findings. Source inspection confirms Quick Actions are built from the existing `patternCloneOptions`, route only through `cloneSelectedPatternVariation`, apply the existing deterministic preset values, and do not alter Pattern Clone Pads, schema, arrangement assignments, playback, export, sampling, remote AI, accounts, analytics, or cloud behavior.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Expose existing Pattern Clone Pads through Quick Actions instead of adding new variation logic. | The product already has local clone-and-vary pads; command search improves beginner discoverability and producer speed without changing musical generation contracts. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Started plan-283 from `main` in `.worktree/plan-283-pattern-clone-quick-actions`. |
| 2026-06-18 | harness_builder | Added Pattern Clone Quick Actions that map existing clone pad options to Create-scope commands and route only through `cloneSelectedPatternVariation`. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed after implementation. |
| 2026-06-18 | quality_runner | Full QA passed: static harness, quality gate, smoke harness, typecheck, build, qa, verify, and diff check. Browser smoke was blocked by sandbox localhost `listen EPERM`. |
| 2026-06-18 | review_judge | Review completed after QA with no findings. Pattern Clone Quick Actions preserve existing clone pad behavior and keep sampling/remote/cloud out of scope. |
| 2026-06-18 | doc_gardener | Moved the plan to completed, created the review mirror, and reran `python3 harness/scripts/run_qa.py` successfully. |
