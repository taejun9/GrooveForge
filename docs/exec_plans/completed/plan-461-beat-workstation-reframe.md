# plan-461-beat-workstation-reframe

## Status

Completed

## Owner

박자

## User Request

The user clarified that GrooveForge is for making beats across all genres and that sampling is only an add-on. Check whether the current draft still reads like sampling is the main product, then correct it.

## Goal

Tighten the project base so the first-read product definition, product architecture, and QA guardrails all frame GrooveForge as a direct beat-production mini DAW: drums, 808/bass, melody/chords, sound design, arrangement, mixing/mastering, and export first; sampling only as a later optional module.

## Non-Goals

- Do not add sampling UI, audio import, chop pads, sampler tracks, waveform editing, imported audio assets, remote AI, accounts, analytics, cloud sync, or payment scope.
- Do not change runtime beat editing, playback, rendering, export behavior, project schema, or app UI behavior.
- Do not promote `AudioClipEvent`, `audio`, or `sampler` into core MVP event, clip, track, or default device examples.

## Context Map

- `README.md`: public first-read Product Spine and Draft Intake Guardrails.
- `docs/product/product.md`: durable product definition, boundaries, users, roadmap.
- `docs/architecture/product-architecture.md`: architecture layer map and data-model direction.
- `docs/quality/rules.md`: durable QA rules that prevent sampling-first drift.
- `harness/scripts/run_qa.py`: executable checks for required framing and sampling boundaries.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Audit current docs and code for sampling-first framing.
- [x] Add a composition-first acceptance summary to first-read product docs.
- [x] Add explicit MVP core schema and optional sampling extension separation to architecture/product docs.
- [x] Strengthen QA rules and harness expectations so future drafts keep sampling out of core MVP scope.
- [x] Run QA, then review, then complete the plan and review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should confirm that first-read docs lead with beat creation, optional sampling remains visibly subordinate, and no runtime/product schema behavior changed.

## QA Results

- 2026-06-19: `git diff --check` passed.
- 2026-06-19: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-19: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-19: `npm run typecheck` passed.
- 2026-06-19: `npm run build` passed with the existing Vite chunk-size warning.
- 2026-06-19: `npm run qa` passed.
- 2026-06-19: `npm run verify` passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 style profiles.
- 2026-06-19: Post-completion `git diff --check` passed.
- 2026-06-19: Post-completion `python3 harness/scripts/run_qa.py` passed.
- 2026-06-19: Post-completion `python3 harness/scripts/run_quality_gate.py` passed.

## Review

Post-QA review found no blockers. README and product docs now state the first-session beat-workstation acceptance path before optional extension scope, product/architecture docs split core MVP schema examples from optional sampling extension examples, and the harness checks those boundaries. Runtime domain `TrackType` remains `drum_rack | bass_808 | synth | chord | fx_return | master`; no app UI behavior, project schema, playback, rendering, export, remote AI, accounts, analytics, cloud sync, or sampling feature scope changed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Keep the task documentation-first. | The current runtime already centers editable events and sample-free beat creation; the user request is to correct the draft framing. |
| 2026-06-19 | Preserve optional sampling as a later extension instead of deleting all mentions. | The user said sampling can be used as an add-on, so the docs should subordinate it rather than erase it. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created after reading the `$base` skill, required references, and the attached Korean correction brief. |
| 2026-06-19 | repo_cartographer | Confirmed core runtime/domain search does not expose `AudioClipEvent` or core `audio`/`sampler` track types; the remaining correction is first-read framing and guardrail reinforcement. |
| 2026-06-19 | harness_builder | Added composition-first acceptance text, explicit core-vs-optional sampling schema separation, and matching QA expectations. |
| 2026-06-19 | quality_runner | `git diff --check` and `python3 harness/scripts/run_qa.py` passed. |
| 2026-06-19 | quality_runner | Full QA passed: quality gate, typecheck, build, qa, and verify. |
| 2026-06-19 | review_judge | Post-QA review found no blockers. |
| 2026-06-19 | quality_runner | Post-completion diff, QA, and quality gate passed after moving the plan and adding the review mirror. |

## Completion Notes

Completed. Sampling is documented as a later optional sound-source extension, while first-read docs, schema examples, architecture text, QA rules, and harness expectations lead with direct all-genre beat composition, sound design, arrangement, mixing/mastering, and export.
