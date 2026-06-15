# plan-022-ignore-worktree-quality-scan

## Status

completed

## Owner

harness_builder / quality_runner

## User Request

plan-021을 main에 병합한 뒤 `npm run verify`가 루트 아래 남아 있는 작업용 `.worktree/plan-020-sidechain-ducking`의 템플릿 placeholder까지 검사해 실패했다. 기존 작업 워크트리를 삭제하지 않고 검증이 통과하도록 하네스를 수정한다.

## Goal

Make the strict quality gate ignore local `.worktree/` checkouts so active or paused task worktrees do not make the root repository verification fail.

## Non-Goals

- Do not delete, modify, or complete the existing plan-020 sidechain worktree.
- Do not relax placeholder checks for committed repository docs outside ignored generated/worktree paths.
- Do not change product behavior.

## Context Map

- `harness/scripts/run_qa.py`: strict placeholder scan implementation.
- `harness/scripts/run_quality_gate.py`: strict gate wrapper.
- `docs/quality/rules.md`: quality expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-022-ignore-worktree-quality-scan` and `.worktree/plan-022-ignore-worktree-quality-scan` for git repository work.
- Preserve strict placeholder enforcement for repository docs and source-controlled plan/review artifacts.

## Implementation Plan

- [x] Add `.worktree/` to strict placeholder ignored prefixes.
- [x] Add a static QA expectation so the ignore rule remains present.
- [x] Run QA and verification.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review checks that the quality gate still enforces placeholder markers in committed docs while excluding local task worktree copies.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Ignore `.worktree/` during strict placeholder scanning. | Task worktrees are local repository copies and can contain active template placeholders that should not block root verification. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | harness_builder | Plan created after root `npm run verify` failed on `.worktree/plan-020-sidechain-ducking` template placeholders. |
| 2026-06-15 | harness_builder | Added `.worktree/` to the strict Markdown scan ignored prefixes and added a static expectation for that rule. |
| 2026-06-15 | doc_gardener | Documented that strict quality scans ignore local worktree checkouts while still checking committed docs. |
| 2026-06-15 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |

## Completion Notes

The strict quality gate now ignores local `.worktree/` checkouts, so active task worktrees do not block root repository verification. Committed docs and completed plan/review artifacts remain covered by the strict placeholder scan.
