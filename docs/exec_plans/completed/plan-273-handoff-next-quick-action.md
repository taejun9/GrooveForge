# plan-273-handoff-next-quick-action

## Goal

Add a Quick Actions command that exports the next Handoff Pack deliverable from the existing Send Order so beginners can follow WAV, stems, MIDI, and Handoff Sheet delivery sequence without guessing, and producers can repeat handoff packaging from command search without hunting through the Deliver panel.

## Non-Goals

- Do not change Handoff Pack item definitions, file names, file contents, render/download handlers, MIDI bytes, Handoff Sheet contents, Handoff Pack scoring, route readout, manifest audit, receipt contents, save/load, playback, or project data.
- Do not auto-export in the background; the next handoff export runs only after an explicit Quick Actions command click and exports only one deliverable.
- Do not add zip packaging, retries, remote collaboration, media upload, cloud sync, accounts, analytics, payments, platform compliance claims, publishing/licensing claims, plugin hosting, remote AI, or remote analysis.
- Do not add sampling-first framing or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing export handlers, Handoff Pack item/status helpers, Send Order derivation, command result metrics, and follow-up text.
- `README.md`: desktop command, Handoff Pack, and export feature summaries.
- `docs/product/product.md`: Handoff Pack and command-palette product framing.
- `docs/quality/rules.md`: Quick Actions, Handoff Pack Send Order, and Handoff Export Receipt guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Plan

- [x] Derive the current next Handoff Pack item inside Quick Actions from existing local Handoff Pack item statuses and Send Order helpers.
- [x] Add a `handoff-next-export` Quick Actions command that runs exactly one existing export handler for the current next item.
- [x] Add Handoff-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command does not chain all deliverables; it exports only the current Send Order next item after an explicit command click.
- If all Handoff Pack items are ready, the command is disabled and tells the user the handoff pack is already ready.
- The command reuses `createHandoffPackItems` and `createHandoffPackSendOrderSummary` so command search and the Deliver panel derive the same next item.

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
