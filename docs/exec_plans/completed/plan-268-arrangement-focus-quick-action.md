# plan-268-arrangement-focus-quick-action

## Goal

Make Arrangement Focus usable from Quick Actions as a selected-block aware command, so beginners can reshape the current block from command search and producers can quickly target intro, verse, hook, bridge, or outro block posture without hunting through the dense Arrangement panel.

## Non-Goals

- Do not change Arrangement Focus preset definitions, selected-block editing semantics, Arrangement Arc, Arrangement Template, Pattern Chain, playback, export, save/load, or Handoff behavior.
- Do not add automatic arrangement, hidden generation, modal confirmations, command chains, auto-playback, auto-save, or auto-export.
- Do not mutate Pattern A/B/C musical event content, sampler state, imported audio, or audio clips.
- Do not add sampling, remote AI, analytics, accounts, payments, cloud sync, plugin hosting, platform claims, or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, Arrangement Focus summary/preview/result helpers, and Quick Action result metrics/follow-up text.
- `README.md`: desktop command and arrangement feature summary.
- `docs/product/product.md`: Arrangement view and command-palette product framing.
- `docs/quality/rules.md`: Arrangement Focus and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Plan

- [x] Derive the active selected-block Arrangement Focus preview inside Quick Actions.
- [x] Replace the fixed Hook Peak command with a `arrangement-focus` command that applies the previewed preset through the existing handler.
- [x] Add Arrangement Focus-specific Quick Action metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will use the same selected-block suggestion as the visible Arrangement Focus preview, and it will call the existing `applyArrangementFocusPreset` path instead of adding a separate arrangement mutation path.
- The command is disabled when the selected block already matches the suggested focus preset, keeping Quick Actions explicit and avoiding automatic arrangement changes.

## QA Log

- Passed `python3 harness/scripts/run_qa.py`.
- Passed `git diff --check`.
- Passed `npm run typecheck`.
- Passed `npm run qa`.
- Passed `python3 harness/scripts/run_quality_gate.py`.
- Passed `npm run harness:smoke`.
- Passed `npm run build`.
- Passed `npm run verify`.
- Local browser smoke was attempted with `npm run dev`, but sandboxed localhost listen failed with `EPERM` on `127.0.0.1:5173`; the required escalation retry was rejected by the environment, so no workaround was used.

## Review

- No issues found after QA. The command now uses the selected-block Arrangement Focus preview target, routes through the existing undoable focus handler, keeps result/follow-up feedback UI-only, and preserves the sample-free beat workstation direction.
