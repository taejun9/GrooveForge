# plan-022-ignore-worktree-quality-scan-review

## Summary

The strict quality gate now excludes local `.worktree/` checkouts from Markdown placeholder scanning. This keeps active or paused task worktrees from breaking root verification while preserving checks for committed repository docs.

## QA

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`

All validation passed.

## Findings

No blocking findings.

## Notes

- The fix is scoped to `harness/scripts/run_qa.py` and `docs/quality/rules.md`.
- The existing plan-020 worktree was not deleted or modified.
- The QA script now checks that the `.worktree/` ignore rule remains present.

## Residual Risk

The ignore is prefix-based, so it assumes local task worktrees stay under `.worktree/`. That matches the repository worktree flow documented in `AGENTS.md`.
