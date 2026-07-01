# plan-1271-completion-summary-git-context

## Goal

Make the after-work completion summary refresh receipt record value-free git/worktree context so stale ignored build evidence can be distinguished from the current checked-out code after feature worktrees are merged or removed.

Also fold in the attached macOS Electron Crash Reporter log follow-up by strengthening the existing restricted GUI/AppKit launch diagnostics for desktop launch-bearing scripts.

## Scope

- Add branch, HEAD SHA, dirty-state, and worktree path context to `npm run release:completion-summary-refresh-smoke`.
- Classify Electron child-process AppKit `SIGABRT` exits as restricted/non-GUI launch diagnostics across desktop launch-bearing smokes.
- Validate that the receipt was generated from the current checkout and that no private values or external distribution claims are introduced.
- Update README, release readiness, harness architecture, quality rules, and QA text expectations.
- Run QA and completion summary refresh before/after moving the plan to completed.

## Out of Scope

- Filling private release-channel metadata.
- Changing completion percentage math.
- Developer ID signing, notarization, Gatekeeper approval, update feed publishing, release upload, or remote channel probing.

## Validation

- Passed `node --check` for changed desktop launch guard, launch-bearing smoke, entry smoke, and completion-summary refresh scripts.
- Passed Python compile check for `harness/scripts/run_qa.py`.
- Passed `git diff --check`.
- Passed `npm run build`.
- Passed `npm run desktop:smoke`.
- Passed `npm run qa`.
- Passed `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify` with approved macOS GUI/AppKit launch access.
- Passed `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke` before plan completion; receipt recorded branch `codex/plan-1271-completion-summary-git-context`, short HEAD `a22995ea`, worktree basename `plan-1271-completion-summary-git-context`, dirty state `yes`, dirty file count `19`, and no git status paths.
- Passed `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke` after moving the plan to completed; receipt recorded latest plan `plan-1271`, 10-plan progress `1271-1280: 1/10`, checkpoint status `not-due`, overall completion `99.999999%`, remaining `0.000001%`, and the same value-free git context without git status paths.

## Decision Log

- 2026-07-02: Started after discovering the root ignored build evidence still reflected older completed-plan checkpoints while main had already advanced to plan-1270.
- 2026-07-02: User attached a macOS Electron `SIGABRT` Crash Reporter log from launch under the Codex process. Keep the pre-Electron guard, and add shared child-process abort classification so any launch-bearing smoke that sees the AppKit registration crash reports a targeted normal-GUI/approved-GUI rerun action.
