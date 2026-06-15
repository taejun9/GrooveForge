# plan-061-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족하고 작곡을 처음 해보는 사람도 쓰기 쉬운 데스크탑앱으로 완성시켜 달라는 장기 목표를 이어간다.

## Goal

Add a local Quick Actions palette so beginners can discover core commands without scanning the whole workstation, while experienced producers can trigger common edits faster from the keyboard. The palette should expose explicit local actions such as play/stop, snapshot save, blueprint, pattern fills, hook lift, mix fixes, and export commands.

## Non-Goals

- No command scripting, macros, automation recording, remote agents, or AI command execution.
- No global OS shortcut registration.
- No destructive commands that bypass undoable project history.
- No sampling, imported audio, plugin hosting, remote AI, analytics, accounts, or cloud sync.

## Context Map

- `src/ui/App.tsx`: desktop shortcuts, command strip, existing action functions, Next Move, Mix Fix.
- `src/styles.css`: overlay/palette UI and compact command button styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA wording for command discovery.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Quick Actions must not fire while a focused input/textarea/select/contenteditable element is receiving keyboard input.
- Mutating commands must reuse existing explicit, undoable project update paths.

## Implementation Plan

- [x] Add Quick Actions state, keyboard shortcut handling, and command definitions.
- [x] Add a command-strip button and overlay palette with search/filter and primary command execution.
- [x] Wire commands to existing functions for playback, snapshots, blueprints, fills, arrangement moves, mix fixes, and exports.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Verify in browser that keyboard opening, search, command execution, close behavior, console state, and layout work.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- Browser smoke test: open Quick Actions, filter `snapshot`, run Save Slot, reopen/filter `low`, run Low End, verify undo enabled, close with Escape, no console errors, and no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Quick Actions is local, searchable, explicit-click/Enter driven, respects focused editable targets, reuses existing undoable commands, and does not introduce sampling/remote AI/automation scope drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add a local Quick Actions palette. | The app now has many professional controls; discoverable command search helps beginners and speeds up repeated producer workflows. |
| 2026-06-16 | Match Quick Actions search by token prefix instead of arbitrary substrings. | Short queries like `low` must not accidentally run unrelated actions such as Play because of words like `follows`. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added Quick Actions state, Ctrl/Cmd+K opening, command-strip button, searchable overlay, and command definitions for transport, project, creative, arrangement, mix, and export actions. |
| 2026-06-16 | harness_builder | Routed mutating Quick Actions through existing project update paths and added failure handling for async project/open/save/export commands. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for Quick Actions. |
| 2026-06-16 | quality_runner | Ran static QA, quality gate, npm QA, npm verify, diff whitespace checks, and browser smoke. |
| 2026-06-16 | review_judge | Reviewed the completed slice for local-only behavior, focused-input guardrails, undoable mutating commands, and no sampling/remote AI drift. |

## Completion Notes

Quick Actions now provides a local searchable command palette for transport, project, creative, arrangement, mix, and export commands. It opens from the command strip or Ctrl/Cmd+K, respects focused editable controls, closes on Escape, runs commands only through explicit user action, and reuses existing undoable project update paths for mutating beat edits.

QA passed:

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- `git diff --check`

Browser smoke passed at `http://127.0.0.1:5176/`: Ctrl+K opened Quick Actions, `snapshot` filtered to Save Snapshot and saved `1/6 slots`, `low` filtered only to Low End and applied `Applied Low End mix fix`, undo became enabled, Escape closed the palette, desktop viewport had no horizontal overflow, and console error logs were empty.
