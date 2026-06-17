# plan-272-mix-snapshot-quick-actions

## Goal

Add Quick Actions commands for Mix Snapshot A/B so beginners can capture and clear mix comparison points from command search, and producers can repeat A/B headroom, balance, master, and stem posture checks without hunting through the dense mixer panel.

## Non-Goals

- Do not change Mix Snapshot A/B summary math, capture payloads, comparison metrics, manual mixer controls, Mix Balance, Stem Audition, Mix Coach, Mix Fix, Master Finish, export rendering, save/load, or Handoff behavior.
- Do not make Mix Snapshot A/B saved project data, undo history, auto-save data, or exported artifact content.
- Do not add reference audio, rendered reference imports, stem separation, audio uploads, automatic mixing, automatic mastering, autoplay, auto-export, command chains, modal confirmations, plugin hosting, remote AI, accounts, analytics, payments, or cloud sync.
- Do not add sampling-first framing or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing `captureMixSnapshot` and `clearMixSnapshots` handlers, Mix Snapshot A/B state and comparison helpers, command result metrics, and follow-up text.
- `README.md`: desktop command and mixer feature summary.
- `docs/product/product.md`: mixer/master and command-palette product framing.
- `docs/quality/rules.md`: Mix Snapshot A/B and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Plan

- [x] Route Mix Snapshot A/B state plus capture and clear handlers into Quick Actions.
- [x] Add `mix-snapshot-capture-a`, `mix-snapshot-capture-b`, and `mix-snapshot-clear` Quick Actions commands through existing handlers.
- [x] Add Mix Snapshot-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The commands mirror existing Mix Snapshot A/B buttons, keep slots UI-local, disable clear when both slots are empty, and route only through the current Mix Snapshot handlers.
- Quick Action result feedback treats Mix Snapshot capture/clear as successful UI-local actions, uses current export/stem-spread posture as the metric, and does not add saved schema or undo state.

## QA Log

- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run typecheck` passed.
- `npm run qa` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed.
- `npm run build` passed.
- `npm run verify` passed.
- `npm run dev` was blocked by sandbox localhost bind permission (`listen EPERM 127.0.0.1:5173`); the required escalated retry was rejected by environment policy, so browser smoke was not run.

## Review

- Post-QA review found no required follow-up fixes.
- Residual risk: browser smoke could not run because the environment rejected localhost dev server escalation.
