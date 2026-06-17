# plan-285-key-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Expose existing key retargeting through Quick Actions so users can change the project key from command search without hunting for the setup control.

## Scope

- Add Quick Actions for every existing supported project key option.
- Route each command only through the existing `applyProjectKey` handler and `retargetProjectKey` domain path.
- Keep key commands explicit, local, undoable, searchable, and result-labeled after each command run.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- Do not add or change scales, modes, pitch spelling, or retargeting algorithms.
- Do not change Key Compass focus behavior, key dropdown UI behavior, selected-note/chord edit tools, Keyboard Capture, MIDI Input, Beat Blueprints, Style Quick Picks, playback, render/export, MIDI export, Handoff, snapshots, or save/load semantics.
- Do not add sampling, imported audio, hidden generation, remote AI, plugin hosting, accounts, analytics, cloud sync, or command chains.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for Key Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Create task branch and worktree.
- [x] Create active exec plan.
- [x] Inspect existing key dropdown, retarget handler, and Quick Actions patterns.
- [x] Add Key Quick Actions using the existing retarget handler.
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

Browser smoke if environment allows localhost: Quick Actions shows Key commands for supported keys, command details name the current and target key, running a command retargets Pattern A/B/C 808, melody, and chord-root event data through the existing undoable path, Key Compass reflects the new key, the project remains sample-free, and no console errors occur.

## QA Results

- Passed `python3 harness/scripts/run_qa.py`.
- Passed `npm run typecheck`.
- Passed `python3 harness/scripts/run_quality_gate.py`.
- Passed `npm run harness:smoke`; all 10 Beat Blueprints and all 10 style profiles produced sample-free all-style 8-bar beats.
- Passed `npm run build`; Vite reported the existing large chunk warning for `dist/assets/index-Bocyga33.js`.
- Passed `npm run qa`.
- Passed `npm run verify`; Vite reported the same existing large chunk warning.
- Passed `git diff --check`.
- Browser smoke was attempted with `npm run dev -- --host 127.0.0.1 --port 5309`, but the sandbox blocked localhost binding with `listen EPERM: operation not permitted 127.0.0.1:5309`. The escalated retry was rejected by the environment policy, so no in-browser smoke result is recorded.

## Review

QA completes before review starts. Review checks that Key Quick Actions are explicit, route only through the existing key retarget handler, preserve Key Compass and editor behavior, keep all outputs local/sample-free, and avoid hidden generation, sampling, remote/cloud scope, or command chains.

Review completed after QA. No findings. Source inspection confirms Key Quick Actions are derived from the existing local `keys` options, route only through the existing `applyProjectKey` handler and domain `retargetProjectKey` path, allow the current key to be explicitly reapplied through that same path, and do not alter scale definitions, retarget algorithms, Key Compass focus behavior, selected-note/chord editing, Keyboard Capture, MIDI Input, schema, playback, export, sampling, remote AI, accounts, analytics, or cloud behavior.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Expose existing key retargeting through Quick Actions instead of adding new key logic. | The product already has a key dropdown and undoable retarget path; command search improves setup speed for producers and makes the first-run BPM/key/style flow easier for beginners without changing musical data contracts. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Started plan-285 from `main` in `.worktree/plan-285-key-quick-actions`. |
| 2026-06-18 | repo_cartographer | Confirmed the Key dropdown routes through `applyProjectKey`, which calls the domain `retargetProjectKey` path. |
| 2026-06-18 | harness_builder | Added Key Quick Actions for every local key option, with result metric and follow-up text after explicit command runs. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed after implementation. |
| 2026-06-18 | quality_runner | Full QA passed: static harness, quality gate, smoke harness, typecheck, build, qa, verify, and diff check. Browser smoke was blocked by sandbox localhost `listen EPERM`. |
| 2026-06-18 | review_judge | Review completed after QA with no findings. Key Quick Actions preserve existing retarget behavior and keep sampling/remote/cloud out of scope. |
| 2026-06-18 | doc_gardener | Moved the plan to completed, created the review mirror, and reran `python3 harness/scripts/run_qa.py` successfully. |
