# plan-216-layer-starter-pads

## Status

Complete.

## Goal

Add Layer Starter Pads that show the selected Pattern's Drums, 808, Chords, and Synth readiness, then route explicit pad clicks into existing style-aware direct composition paths.

## User Value

- Beginners can see which musical layer is missing and click one safe starter action without searching the dense editor.
- Working producers can quickly seed or replace a selected Pattern layer while keeping every event manually editable afterward.
- The app gains more direct composition speed without moving sampling into the core workflow.

## Non-Goals

- Do not add sampling, imported audio, audio clips, sampler devices, plugin hosting, remote AI, hidden generation, autoplay, auto-arrangement, auto-export, accounts, analytics, or cloud sync.
- Do not add new project schema fields, saved UI state, new audio assets, or new render algorithms.
- Do not replace existing Drum Foundation, 808 Bassline, Chord Progression, Melody Motif, Pattern Stack, Composer Actions, Next Move, Beat Blueprint, or direct editing behavior.

## Scope

- Add a local Layer Starter summary for Drums, 808, Chords, and Synth from the selected Pattern.
- Recommend one existing starter path per layer from the current style and selected Pattern state.
- Render Layer Starter Pads near the top of the Compose/Pattern editor.
- Route pad clicks through existing undoable composition handlers so downstream result strips and selection behavior remain intact.
- Update README/product/quality docs and static QA expectations.

## Outcome

- Added Layer Starter Pads for Drums, 808, Chords, and Synth in the Compose/Pattern editor.
- Derived readiness from selected Pattern event counts plus local style action goals and cues.
- Routed pad clicks through existing undoable Drum Foundation, 808 Bassline, Chord Progression, and Melody Motif handlers.
- Kept Layer Starter state UI-local with no project schema, render, asset, sampling, plugin, remote, autoplay, or auto-export changes.
- Updated README, product docs, quality rules, and static QA expectations.

## QA

- Pass: `npm run typecheck`
- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `git diff --check`
- Pass: `npm run qa`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `npm run verify`
- Blocked: Browser smoke. `npm run dev -- --host 127.0.0.1 --port 5306` failed with `listen EPERM`, and the required escalated retry was rejected by environment policy.

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-17 | Add Layer Starter Pads as a selected-Pattern composition accelerator. | It improves first-beat clarity for beginners and fast layer seeding for producers while preserving local, editable, sample-free event workflows. |
| 2026-06-17 | Route Layer Starter clicks through existing composition handlers. | This keeps downstream result strips, selections, undo history, and manual editability aligned with existing direct-composition behavior. |
