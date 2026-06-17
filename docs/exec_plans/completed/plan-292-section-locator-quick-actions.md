# plan-292-section-locator-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose Section Locator Intro/Verse/Hook/Bridge/Outro cueing through Quick Actions so users can jump command search directly to arrangement section audition using the existing Section Locator pad behavior.

## Non-Goals

- Do not start playback automatically, create marker persistence, change arrangement blocks, mutate Pattern A/B/C event data, change selected-block edit tools, alter render/export, mixer/master, project schema, or Section Locator derivation.
- Do not add hidden generation, command chains, auto-arrangement, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or plugin hosting.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: existing `cueSectionLocator`, `SectionLocatorPads`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary.
- `docs/product/product.md`: Arrangement and Quick Actions product behavior.
- `docs/quality/rules.md`: Section Locator guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-292-section-locator-quick-actions` and `.worktree/plan-292-section-locator-quick-actions` for git repository work.

## Implementation Plan

- [x] Inspect existing Section Locator cueing and Quick Actions wiring.
- [x] Add Section Locator Quick Actions that route through `cueSectionLocator`.
- [x] Add local result metrics and follow-up copy for section Block-loop audition setup commands.
- [x] Update durable docs and QA expectations to keep section cueing scoped to selected-block navigation plus Block loop scope.
- [x] Run QA, review, complete the plan, merge to main, push main, delete branch, and remove worktree.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run Quick Actions Section Locator commands, confirm selected arrangement block and Block loop scope move to the matching first section without autoplay, no arrangement or Pattern event mutation, no console errors, and no desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Section Locator commands reuse the existing Section Locator cue path, switch only selected arrangement block plus Block loop scope, preserve arrangement blocks, Pattern A/B/C event data, playback start/stop, save/load, export semantics, Quick Actions search/results, and avoid sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Section Locator cue commands after transport loop commands. | Section cueing is a transport/arrangement audition action and should sit near Song/Block/Pattern loop controls in command search. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Section Locator Pads already cue Intro/Verse/Hook/Bridge/Outro blocks but Quick Actions lacks section cue commands. |
| 2026-06-18 | harness_builder | Added Section Locator Quick Actions through the existing `cueSectionLocator` path, local result feedback, docs, quality guardrails, and QA expectations. |
| 2026-06-18 | quality_runner | Initial `run_qa.py`, `npm run typecheck`, and `git diff --check` passed before full QA. |
| 2026-06-18 | quality_runner | `npm run verify`, `npm run qa`, and `git diff --check` passed. Browser smoke was attempted, but localhost dev server startup failed with sandbox `listen EPERM`; escalated retry was rejected by environment policy. |
| 2026-06-18 | review_judge | Reviewed diff after QA; no follow-up findings. Section Locator Quick Actions reuse `cueSectionLocator`, preserve arrangement and Pattern data, and add only local result feedback plus guardrails. |

## Completion Notes

Section Locator Intro/Verse/Hook/Bridge/Outro cue commands are available from Quick Actions and route through the existing Section Locator cue handler. They select the first matching arrangement block and Block loop scope for audition while playback is stopped, without autoplay, undo history, arrangement mutation, Pattern event mutation, or export changes.

Validation passed:

- `npm run verify`
- `npm run qa`
- `git diff --check`

Browser smoke was not completed because Vite could not listen on `127.0.0.1:5316` inside the sandbox (`listen EPERM`), and the escalated localhost dev-server retry was rejected by environment policy.
