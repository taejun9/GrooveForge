# plan-239-sampling-secondary-positioning

## Status

completed

## Owner

project_lead / repo_cartographer

## User Request

The user clarified that GrooveForge is for making beats across all genres, while sampling is a secondary optional feature. Check whether the current draft still reads like sampling is the main product and correct it.

## Goal

Audit the current durable product draft against the attached concept correction and tighten current docs plus static QA so GrooveForge reads first as a direct, all-genre beat-production mini DAW. Sampling should remain allowed only as a later opt-in sound-source extension.

## Non-Goals

- Do not implement sampling, sample import, chopping, sampler tracks, audio clips, waveform editing, or plugin hosting.
- Do not remove every future-sampling reference; the product should still allow sampling as a secondary module.
- Do not rewrite historical completed exec plans unless they are part of the current active surface.
- Do not change runtime behavior unless the audit finds current UI copy that centers sampling.

## Context Map

- User brief attachment: `pasted-text.txt` says the product is a beat-making mini DAW, not a sampling app.
- `README.md`: public product framing and current scope.
- `docs/product/product.md`: durable product definition, boundaries, and data-model examples.
- `docs/architecture/product-architecture.md`: core architecture and optional sampling boundary.
- `docs/quality/rules.md`: product-boundary QA rules.
- `harness/scripts/run_qa.py`: static expectations that keep the draft aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Preserve the project invariant that GrooveForge is an all-genre, event-based beat workstation and not a sampling-first app.

## Implementation Plan

- [x] Search current docs and app copy for sampling-first, sample-browser, sampler, audio-clip, and chop/slice framing.
- [x] Strengthen the current product summary and boundary wording where sampling could still read like a co-equal spine.
- [x] Tighten architecture guidance against copying attached draft examples that place `AudioClipEvent`, `audio`, or `sampler` in core unions.
- [x] Update quality rules and static QA expectations to catch sampler-in-default-panel and audio/sampler-in-core-union drift.
- [x] Run the documented validation loop and a targeted sampling-positioning audit.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- Targeted `rg` audit for sampling/sample/sampler/chop/audio clip/AudioClip terms across current docs, harness, and app copy while excluding historical completed plans.
- `git diff --check`
- `npm run typecheck`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run build`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that current product-facing docs center direct beat composition, that remaining sampling references are explicitly optional/later/secondary, that static QA catches the attached draft's core-union and default-panel mistakes, and that no runtime sampling scope was introduced.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Keep sampling references as optional extension boundaries rather than deleting them. | The user wants sampling as a useful add-on, not erased from the product. |
| 2026-06-17 | Exclude historical completed plans from corrective edits. | Completed plans are work records; the current product surface is README, durable docs, QA rules, and app copy. |
| 2026-06-17 | Add a domain-model QA check for core `TrackType` and `AudioClipEvent`. | The clearest regression risk from the attached draft is optional sampling entering the core model as a first-class MVP dependency. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Created plan from the user's clarified beat-first concept. |
| 2026-06-17 | repo_cartographer | Audited current docs and app/domain copy; current runtime model is not sampling-first, but boundary wording needed stronger external-brief correction rules. |
| 2026-06-17 | harness_builder | Updated README, product docs, architecture docs, quality rules, and static QA expectations to keep sampling secondary. |
| 2026-06-17 | quality_runner | QA passed: run_qa, git diff --check, typecheck, npm qa, quality gate, build, verify, and targeted sampling-positioning audit. |
| 2026-06-17 | review_judge | Reviewed current product-facing docs, app/domain model, and static QA for sampling-first drift. |

## Completion Notes

Completed. The current draft now more explicitly treats GrooveForge as a direct all-genre beat-production mini DAW and sampling as a later optional extension. README, product docs, architecture docs, quality rules, and static QA now reject the attached draft's two risky patterns: copying `AudioClipEvent`/`audio`/`sampler` into core MVP unions and placing `sampler` in the default Instrument Panel. The app/domain model remains sample-free at the core and no sampling runtime feature was added.
