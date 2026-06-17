# plan-270-space-fx-quick-action

## Goal

Add Quick Actions commands for Space FX pads so beginners can quickly choose dry, room, wide, or wash ambience from command search, and producers can reshape shared send space without hunting through the dense mixer panel.

## Non-Goals

- Do not change Space FX pad definitions, manual Space sliders, mixer channel controls, Mix Balance, Stem Audition, Mix Coach, Master Finish, export rendering, save/load, or Handoff behavior.
- Do not add automatic mixing, automatic mastering, hidden generation, modal confirmations, command chains, autoplay, auto-save, or auto-export.
- Do not introduce new audio assets, impulse responses, imported audio, sampler state, audio clips, plugin hosting, or remote analysis.
- Do not add sampling, remote AI, analytics, accounts, payments, cloud sync, platform loudness claims, or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing `applySpaceFxPad` handler, Space FX pad options/result helpers, command result metrics, and follow-up text.
- `README.md`: desktop command and mixer feature summary.
- `docs/product/product.md`: mixer/master and command-palette product framing.
- `docs/quality/rules.md`: Space FX and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Plan

- [x] Route current Space FX pad options and apply handler into Quick Actions.
- [x] Add `space-fx-*` Quick Actions commands that apply Space FX pads through `applySpaceFxPad`.
- [x] Add Space FX-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The commands mirror existing Space FX pad options, disable any pad whose send posture is already selected, and apply only through the current undoable Space FX handler.
- Quick Action result feedback uses the current Space FX track posture plus a short audition cue and next-check text, without adding saved schema or undo state.

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
