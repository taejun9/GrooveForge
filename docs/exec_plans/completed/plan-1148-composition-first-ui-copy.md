# plan-1148-composition-first-ui-copy

## Goal

Remove remaining sampling-first phrasing from user-facing UI copy so first-run and genre guidance continue to read as direct beat composition, arrangement, sound design, mix/master, and export.

## Scope

- Audit current user-facing source copy for sample/chop/crate wording that can make sampling feel like the main workflow.
- Rewrite those labels/descriptions toward event-based beat writing, pattern arrangement, groove, hook, and section contrast.
- Update QA expectations or docs only if the contract changes.
- Preserve all playback, project data, export, release gate, and optional sampling extension boundaries.

## Out of Scope

- Adding or removing sampling features.
- Changing project schema, style generation, playback, render/export, package creation, or release gate ordering.
- Filling `.env.distribution.local` private values, attempting Developer ID signing, notarization, Gatekeeper approval, upload, remote feed probing, payments, analytics, accounts, app-store submission, or external distribution completion claims.

## Plan

1. Inspect current UI copy hits for sample/chop/crate wording in source files.
2. Rewrite user-facing copy that implies sample-first workflow.
3. Run focused checks, QA, and diff validation.
4. Complete the plan, create the review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- `rg -n "sample pocket|crate-dig|chops hit|chop energy|rendered samples|No rendered samples" src/ui` passed with no matches after the copy rewrite.
- `python3 -m py_compile harness/scripts/run_qa.py` passed; the generated tracked `__pycache__` bytecode was restored to `HEAD` and not included.
- `node --check src/ui/workstationAppDerivations.tsx` was not applicable and failed because Node does not directly syntax-check `.tsx` files; TypeScript validation was used instead.
- `npm run qa` passed.
- `npm run typecheck` passed.
- `git diff --check` passed.
- Post-review `npm run qa` passed.
- Post-review `git diff --check` passed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Treat sampling-first UI wording as product-alignment debt. | The user explicitly clarified that GrooveForge is for making beats across genres and sampling is only an add-on. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started after the product docs were aligned but source copy still contained sample/chop/crate phrasing in visible section guidance. |
| 2026-06-30 | repo_cartographer | Found the remaining sampling-first wording in Pattern Contrast section-fit labels and limiter detail copy. |
| 2026-06-30 | harness_builder | Added a QA guard that fails if the sampled/chop/crate phrasing returns to UI source files. |
| 2026-06-30 | quality_runner | Verified source grep, QA, typecheck, and diff check. |
| 2026-06-30 | plan_keeper | Moved the plan to completed, prepared the review mirror, and confirmed post-review QA. |
