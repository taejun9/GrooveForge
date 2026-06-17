# plan-269-arrangement-move-quick-action

## Goal

Make Arrangement Move usable from Quick Actions as a selected-block aware command, so beginners can quickly create section contrast and producers can reshape block energy/mutes from command search without manually picking Drop, Build, or Hook Lift every time.

## Non-Goals

- Do not change Arrangement Move preset definitions, manual arrangement controls, Arrangement Focus, Arrangement Arc, Arrangement Template, Pattern Chain, playback, export, save/load, or Handoff behavior.
- Do not add automatic arrangement, hidden generation, modal confirmations, command chains, auto-playback, auto-save, or auto-export.
- Do not mutate Pattern A/B/C musical event content, sampler state, imported audio, or audio clips.
- Do not add sampling, remote AI, analytics, accounts, payments, cloud sync, plugin hosting, platform claims, or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing `applyArrangementMoveToSelected` handler, selected arrangement block state, Quick Action result metrics, and follow-up text.
- `src/domain/workstation.ts`: Arrangement Move preset ids, labels, and preset application behavior.
- `README.md`: desktop command and arrangement feature summary.
- `docs/product/product.md`: Arrangement workflow and command-palette product framing.
- `docs/quality/rules.md`: Arrangement Move and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Plan

- [x] Derive the active selected-block Arrangement Move preset inside Quick Actions.
- [x] Replace the fixed `hook-lift` command with an `arrangement-move` command that applies the selected-block move through the existing handler.
- [x] Add Arrangement Move-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will derive a conservative section-role move from the selected arrangement block: Hook blocks use Hook Lift, Verse blocks use Build, and Intro/Bridge/Outro blocks use Drop. Manual buttons still expose every move preset.
- The command is disabled when the selected block already matches the suggested move's energy and muted-track posture, keeping Quick Actions explicit and avoiding automatic arrangement changes.

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

- No issues found after QA. The command derives only from local selected-block section state, routes through the existing undoable Arrangement Move handler, keeps result/follow-up feedback UI-only, and preserves the sample-free beat workstation direction.
