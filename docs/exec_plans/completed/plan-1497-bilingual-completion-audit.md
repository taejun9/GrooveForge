# plan-1497-bilingual-completion-audit

## Status

completed

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge

## User Request

Follow up on the Korean-primary README change so the repository's completion evidence continues to recognize the bilingual documentation layout.

## Goal

Make completion-audit evidence validate the Korean public README and the preserved exhaustive English reference together, then regenerate the interrupted release evidence chain.

## Non-Goals

- Product, audio, project-schema, UI, or external-distribution changes.
- Editing private release metadata or weakening any release gate.
- Replacing or expanding the completed Korean README content.

## Context Map

- Korean primary entry: `README.md`
- English exhaustive reference: `readme-en.md`
- Completion evidence: `harness/scripts/run_desktop_completion_audit_smoke.mjs`
- Static QA: `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Work only in `codex/plan-1497-bilingual-completion-audit` and its worktree.
- Preserve the current local-first and value-free release evidence contract.

## Implementation Plan

- [x] Reproduce and isolate the stale English-primary completion-audit assumptions.
- [x] Validate Korean primary markers and English exhaustive markers explicitly.
- [x] Add static regression coverage and rerun focused/full documentation QA.
- [x] Prepare and validate the focused source-evidence refresh chain for the post-merge run.
- [x] Complete review and cleanup flow.

## QA Plan

- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run desktop:completion-audit-smoke`
- `npm run desktop:completion-progress-smoke`
- `git diff --check`
- Post-merge `npm run release:source-evidence-refresh-smoke`
- Post-merge `npm run release:completion-summary-refresh-smoke`

## Review Plan

QA completes before review starts. Review marker accuracy, bilingual source separation, evidence-count stability, privacy/value-redaction posture, and release-gate strength.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-20 | Treat the completion-audit failure as a focused follow-up plan. | Plan-1496 was already merged and pushed when the deeper 44-step source refresh exposed runtime English-primary assumptions outside static QA. |
| 2026-07-20 | Audit both README layers instead of duplicating exhaustive English content into the Korean entry. | The Korean README is the public starting point; `readme-en.md` preserves the exhaustive reference and its established evidence markers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-20 | project_lead | Created plan-1497 after the source refresh passed packaged GUI paths but failed completion progress because completion audit marked Korean README evidence unready. |
| 2026-07-20 | harness_builder | Added Korean-primary and English-reference completion-audit checks plus static regression expectations. |
| 2026-07-20 | quality_runner | `npm run qa`, the quality gate, completion audit, completion progress, and `git diff --check` passed. Local release readiness remains 100.0%; external distribution remains gated separately. |
| 2026-07-20 | review_judge | Completed post-QA review with no blocking findings and no privacy, release-gate, or evidence-count regression. |

## Completion Notes

The bilingual README layout is now understood by both static QA and generated completion evidence. The focused source-evidence chain was regenerated through completion progress successfully; the final completion-summary refresh will be repeated on `main` after merge.
