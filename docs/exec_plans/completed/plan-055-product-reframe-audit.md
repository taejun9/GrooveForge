# plan-055-product-reframe-audit

## Status

completed

## Owner

project_lead / repo_cartographer

## User Request

일단 컨셉이 비트(모든 장르)를 만드는거고, 샘플링은 부가 기능으로 쓸거야. 지금은 샘플링이 메인인것처럼 초안이 잡혀있는거 같은데 확인해서 수정해줘.

## Goal

Audit and tighten the durable project framing so GrooveForge is unmistakably an all-genre beat-making mini DAW for direct composition, sound design, arrangement, mixing/mastering, and export. Sampling must remain a later optional module, not the center of the MVP, architecture, roadmap, first-run UX, or QA language.

## Non-Goals

- No sampling feature implementation.
- No audio import, chopping, sampler track, waveform, or audio-warping work.
- No UI feature changes beyond documentation and static harness expectations.
- No remote AI, cloud sync, plugin hosting, account, payment, analytics, or tracker work.

## Context Map

- `README.md`: public product summary, MVP target, and core direction.
- `docs/product/product.md`: durable product definition, boundary, MVP, roadmap, and non-goals.
- `docs/architecture/product-architecture.md`: architecture boundary between composition-first core and optional sampling extensions.
- `docs/quality/rules.md`: QA guardrails for future plans.
- `harness/scripts/run_qa.py`: static checks that prevent product-framing drift.
- User-provided brief attachment: direct beat composition, all genres, 808/bass, melody/chords, sound design, arrangement, mixing/mastering, export first; sampling later as optional add-on.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-055-product-reframe-audit` and `.worktree/plan-055-product-reframe-audit` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.
- Preserve necessary sampling mentions only when they define optional-extension, privacy/licensing, or guardrail boundaries.

## Implementation Plan

- [x] Search current docs and harness for sample/sampling wording.
- [x] Compare current framing against the user-provided beat-workstation brief.
- [x] Tighten README/product/architecture/quality language where the optional-sampling boundary can be made clearer.
- [x] Update static QA expectations so future edits keep the same framing.
- [x] Run repository validation commands.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review checks that updated wording centers direct beat composition across all genres, keeps sampling explicitly optional, preserves necessary privacy/licensing guardrails, and does not introduce roadmap or architecture ambiguity.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Keep sampling references only as optional-extension, privacy/licensing, or anti-drift guardrails. | The user corrected the concept: GrooveForge is not a sampling app; it is a beat-making mini DAW where sampling is a supporting option. |
| 2026-06-16 | Make static QA assert the direct-composition product spine. | Future plans should fail fast if product docs drift back toward sampling-first framing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created after auditing the current branch and user-provided brief. |
| 2026-06-16 | repo_cartographer | Tightened README, product, architecture, quality, and static QA wording around the direct beat-workstation spine. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py` passed; quality gate failed once on placeholder text in this active plan. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_quality_gate.py`, `npm run qa`, and `npm run verify` passed after plan cleanup. |
| 2026-06-16 | review_judge | Reviewed the diff and sampling references; no product-boundary issues found. |
| 2026-06-16 | plan_keeper | Moved the plan to completed and created the review mirror. |

## Completion Notes

Completed. GrooveForge docs and static QA now state more explicitly that the product center is direct all-genre beat composition with built-in drums, synth 808/bass, melody/chords, arrangement, mixer/master, and export. Sampling remains a later optional sound-source/workflow extension and must not become the MVP, architecture, roadmap, UI, or QA center.
