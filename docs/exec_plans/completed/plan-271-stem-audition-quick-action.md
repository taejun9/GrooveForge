# plan-271-stem-audition-quick-action

## Goal

Add Quick Actions commands for Stem Audition pads so beginners can quickly hear Full Mix, Drums, 808, Synth, or Chords from command search, and producers can repeat stem checks while mixing without hunting through the dense mixer panel.

## Non-Goals

- Do not change Stem Audition pad definitions, manual mixer mute/solo controls, Stem Audition Readout derivation, Mix Balance, Mix Snapshot A/B, Mix Coach, Master Finish, export rendering, save/load, or Handoff behavior.
- Do not add rendered stem playback, stem separation, audio import, sampler tracks, plugin hosting, remote analysis, remote AI, accounts, analytics, payments, or cloud sync.
- Do not add automatic mixing, automatic mastering, hidden generation, command chains, autoplay, auto-save, or auto-export.
- Do not introduce sampling-first framing or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing `applyStemAuditionPad` handler, Stem Audition pad options/readout helpers, command result metrics, and follow-up text.
- `README.md`: desktop command and mixer feature summary.
- `docs/product/product.md`: mixer/master and command-palette product framing.
- `docs/quality/rules.md`: Stem Audition and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Plan

- [x] Route current Stem Audition pad options and apply handler into Quick Actions.
- [x] Add `stem-audition-*` Quick Actions commands that apply Stem Audition pads through `applyStemAuditionPad`.
- [x] Add Stem Audition-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The commands mirror existing Stem Audition pad options, disable any pad whose mixer solo/mute audition state is already selected, and apply only through the current undoable Stem Audition handler.
- Stem Audition commands are ordered before Mix Balance and Space FX in the Mix command group so command search matches the mixer-check flow: hear stems first, then balance and ambience.
- Quick Action result feedback uses the current Stem Audition Readout plus a short audition cue and next-check text, without adding saved schema or undo state.

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
