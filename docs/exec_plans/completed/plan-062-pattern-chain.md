# plan-062-pattern-chain

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족하고 작곡을 처음 해보는 사람도 쓰기 쉬운 데스크탑앱으로 완성시켜 달라는 장기 목표를 이어간다.

## Goal

Add a local Pattern Chain sketch tool so beginners can quickly turn Pattern A/B/C variations into an 8-bar song outline, and working producers can audition/export simple A/B/C section orders without manually editing every arrangement block. The chain should remain explicit, editable, and arrangement-based.

## Non-Goals

- No AI arrangement generation, random structure generation, remote calls, or hidden automation.
- No sampling, imported audio, audio clips, sampler tracks, plugin hosting, accounts, analytics, or cloud sync.
- No new audio engine or render format changes beyond existing arrangement playback/export behavior.
- No drag-and-drop timeline in this slice.

## Context Map

- `src/domain/workstation.ts`: arrangement blocks, pattern slots, arrangement templates, normalization, project save/load.
- `src/ui/App.tsx`: arrangement editor, Quick Actions, Next Move, playback/export controls.
- `src/styles.css`: compact tool row styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA wording.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Pattern Chain commands must replace only arrangement blocks, preserve Pattern A/B/C musical event data, preserve mixer/master/sound state, reset selection safely, and remain undoable.
- Chain results must follow existing arrangement playback, WAV export, stem export, and MIDI export paths.

## Implementation Plan

- [x] Add deterministic Pattern Chain presets that create editable arrangement blocks from Pattern A/B/C sequences.
- [x] Add a compact Pattern Chain UI near arrangement tools with preset buttons and a current-chain readout.
- [x] Wire Pattern Chain actions through existing undoable project update paths and align the selected pattern to the first chain block.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Verify browser behavior: apply a chain preset, confirm arrangement pattern order and total bars, playback/export controls remain usable, undo restores the previous arrangement, console errors stay empty, and layout has no desktop overflow.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- Browser smoke test over the local dev server.

## Review Plan

QA completes before review starts. Review checks that Pattern Chain is local, deterministic, explicit-click driven, undoable, arrangement-only, preserves musical Pattern A/B/C event data and mix/master state, uses existing playback/export paths, and does not introduce sampling/remote AI/automation scope drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Pattern Chain as an arrangement sketch tool. | The app has strong Pattern A/B/C editing but users still need a faster way to turn variations into a usable song outline. |
| 2026-06-16 | Keep Pattern Chain as arrangement-block presets instead of new project data. | Existing playback, save/load, WAV/stem/MIDI export, and undo paths already follow arrangement blocks, so this keeps the feature explicit and low-risk. |
| 2026-06-16 | Fix Quick Actions panel row sizing while adding the Pattern Chain command. | The added command exposed that the default Quick Actions list could extend below the viewport; the list now scrolls inside the palette. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added Pattern Chain ids, labels, deterministic chain blocks, and `createPatternChain` helpers. |
| 2026-06-16 | harness_builder | Added Pattern Chain UI, current A/B/C readout, Quick Actions command, and undoable `applyPatternChain` wiring. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations. |
| 2026-06-16 | quality_runner | Ran static QA, quality gate, npm QA, npm verify, diff whitespace checks, and browser smoke tests. |
| 2026-06-16 | review_judge | Reviewed the completed slice for arrangement-only scope, undoability, existing export path reuse, and no sampling/remote AI drift. |

## Completion Notes

Pattern Chain now provides three deterministic 8-bar arrangement sketches from existing Pattern A/B/C variations. Applying a chain replaces only arrangement blocks, preserves Pattern A/B/C musical event data plus mixer/sound/master state, selects the first block, aligns the selected pattern to that block, remains undoable, and continues using existing realtime playback plus WAV/stem/MIDI export paths.

QA passed:

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- `git diff --check`

Browser smoke passed at `http://127.0.0.1:5176/`: applying Break Turn produced `A-A-C-C-B-B-A-B` with eight 1-bar blocks, selected block 1, set status to `Applied Break Turn`, enabled undo, Play/Stop worked, undo restored the previous `A-A-B-A-B-C-B-A` arrangement, desktop overflow was absent, and console error logs were empty. Quick Actions smoke also passed: the `pattern-chain` command applied `8 Bar Chain`, closed the palette, kept overflow absent, and produced no console errors.
