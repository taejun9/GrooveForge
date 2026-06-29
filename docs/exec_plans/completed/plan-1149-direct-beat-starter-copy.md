# plan-1149-direct-beat-starter-copy

## Goal

Rewrite remaining user-visible `sample-free` starter copy to direct beat-writing language so GrooveForge reads as a beat composition workstation first, with sampling only as optional add-on scope.

## Scope

- Update visible Beat Blueprint, Review Queue, Hook, Quick Actions, and next-check copy that currently says `sample-free starter`, `sample-free signal`, or `sample-free Hook section`.
- Add a QA guard for those visible `sample-free` starter phrases while leaving non-visible search keywords and durable docs alone.
- Preserve command routing, project data, playback, export, release gates, and optional sampling boundaries.

## Out of Scope

- Removing all documentation mentions of sample-free validation.
- Changing Quick Actions search keywords where `sample free` is used only for command discovery.
- Adding or removing sampling features.
- Changing project schema, style generation, playback, render/export, package creation, or release gate ordering.
- Filling `.env.distribution.local` private values, attempting Developer ID signing, notarization, Gatekeeper approval, upload, remote feed probing, payments, analytics, accounts, app-store submission, or external distribution completion claims.

## Plan

1. Inspect visible `sample-free` starter/signal/section copy in UI source.
2. Rewrite visible text to direct beat/editable beat language.
3. Add QA coverage for the specific visible phrases.
4. Run QA, typecheck, diff checks, complete the plan, create the review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- `rg -n "sample-free starter|sample-free signal|sample-free Hook section|sample-free hook section|sample-free drums|edit the sample-free starter|Sample-free starts|Sample-Free Style Starts" src/ui` passed with no matches after the copy rewrite.
- Initial `npm run qa` caught the stale `Project already matches this sample-free starter.` expectation and additional Shell panel/Beat Terms visible `sample-free` wording; those were updated to direct beat language.
- `npm run qa` passed.
- `npm run typecheck` passed.
- `git diff --check` passed.
- Post-review `npm run qa` passed.
- Post-review `git diff --check` passed.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-30 | Replace visible sample-free starter wording with direct beat wording. | The product should first read as a beat-making workstation, not as an app defined by the absence of sampling. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-30 | project_lead | Started after source search showed visible `sample-free` starter/signal/section copy remained in UI strings. |
| 2026-06-30 | repo_cartographer | Found visible Beat Blueprint, Review Queue, Hook, Quick Actions, Command Reference, and Beat Terms starter copy that still led with `sample-free`. |
| 2026-06-30 | harness_builder | Extended the composition-first QA guard to reject visible `sample-free` starter/signal/section phrases. |
| 2026-06-30 | quality_runner | Verified source grep, QA, typecheck, and diff check after updating stale expectations. |
| 2026-06-30 | plan_keeper | Moved the plan to completed, prepared the review mirror, and confirmed post-review QA. |
