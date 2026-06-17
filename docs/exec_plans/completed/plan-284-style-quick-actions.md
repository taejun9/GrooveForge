# plan-284-style-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Expose existing Style Quick Picks through Quick Actions so users can switch genre profiles from command search without hunting through the Style Inspector.

## Scope

- Add Quick Actions for every existing local `styleProfiles` entry.
- Route each command only through the existing undoable style-selection handler used by the Style dropdown and Style Quick Picks.
- Keep style commands explicit, local, searchable, and result-labeled after each command run.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- Do not add, remove, or rewrite style profiles.
- Do not change `createStylePatternSet`, `styleSoundPreset`, Beat Blueprint behavior, Style Inspector focus behavior, or Style Quick Pick UI behavior.
- Do not change project schema, save/load, snapshots, undo/redo semantics beyond the existing style-selection path, playback, render/export, MIDI export, Handoff, or mixer/master behavior.
- Do not add sampling, imported audio, hidden generation, remote AI, plugin hosting, accounts, analytics, cloud sync, or command chains.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for Style Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Create task branch and worktree.
- [x] Create active exec plan.
- [x] Inspect existing Style Quick Picks, Style dropdown, and Quick Actions patterns.
- [x] Add Style Quick Actions using the existing style-selection handler.
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

Browser smoke if environment allows localhost: Quick Actions shows Style commands for supported genre profiles, command details name BPM/swing/bass/melody posture, running a command applies the style through the existing undoable style-selection path, Style Inspector reflects the new style, the project remains sample-free, and no console errors occur.

## QA Results

- Passed `python3 harness/scripts/run_qa.py`.
- Passed `npm run typecheck`.
- Passed `python3 harness/scripts/run_quality_gate.py`.
- Passed `npm run harness:smoke`; all 10 Beat Blueprints and all 10 style profiles produced sample-free all-style 8-bar beats.
- Passed `npm run build`; Vite reported the existing large chunk warning for `dist/assets/index-CRjbNKLA.js`.
- Passed `npm run qa`.
- Passed `npm run verify`; Vite reported the same existing large chunk warning.
- Passed `git diff --check`.
- Browser smoke was attempted with `npm run dev -- --host 127.0.0.1 --port 5308`, but the sandbox blocked localhost binding with `listen EPERM: operation not permitted 127.0.0.1:5308`. The escalated retry was rejected by the environment policy, so no in-browser smoke result is recorded.

## Review

QA completes before review starts. Review checks that Style Quick Actions are explicit, route only through the existing style-selection handler, preserve Style Quick Picks and Style Inspector behavior, keep all outputs local/sample-free, and avoid hidden generation, sampling, remote/cloud scope, or command chains.

Review completed after QA. No findings. Source inspection confirms Style Quick Actions are derived from local `styleProfiles`, route only through the existing `selectStyle` handler used by the Style dropdown and Style Quick Picks, allow the current style to be explicitly reapplied through that same path, and do not alter style profile definitions, Style Inspector focus behavior, current-style starter behavior, schema, playback, export, sampling, remote AI, accounts, analytics, or cloud behavior.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Expose existing Style Quick Picks through Quick Actions instead of adding new style logic. | The product already has local style profiles and an undoable selection path; command search improves all-genre access for beginners and speed for experienced producers without changing style generation contracts. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Started plan-284 from `main` in `.worktree/plan-284-style-quick-actions`. |
| 2026-06-18 | repo_cartographer | Confirmed Style dropdown and Style Quick Picks already route through `selectStyle`, and Quick Actions could reuse that path without new style logic. |
| 2026-06-18 | harness_builder | Added Style Quick Actions for every local `styleProfiles` entry, with result metric and follow-up text after explicit command runs. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed after implementation. |
| 2026-06-18 | quality_runner | Full QA passed: static harness, quality gate, smoke harness, typecheck, build, qa, verify, and diff check. Browser smoke was blocked by sandbox localhost `listen EPERM`. |
| 2026-06-18 | review_judge | Review completed after QA with no findings. Style Quick Actions preserve existing style selection behavior and keep sampling/remote/cloud out of scope. |
| 2026-06-18 | doc_gardener | Moved the plan to completed, created the review mirror, and reran `python3 harness/scripts/run_qa.py` successfully. |
