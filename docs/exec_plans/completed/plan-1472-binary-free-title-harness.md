# plan-1472-binary-free-title-harness

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Remove the accidental literal NUL byte from the plan-1471 sample-audio harness source while preserving the intended control-character filename assertion, then prove tracked text sources remain binary-free and the title-integrity sample still passes unchanged.

## Evidence and Motivation

The final synchronized-main audit after plan-1471 found `rg` classifying `harness/scripts/run_sample_audio_qa.mjs` as binary. Byte inspection identified one literal `00` byte inside a regular-expression character class that was intended to contain the textual escape `\u0000`. Node accepted and executed the regex, so all QA passed, but a literal NUL in tracked source harms search, review, editor, and agent readability.

## Non-Goals

- Changing project-title behavior, audio content, sample hashes, report schema, project schema, UI, export filenames, or external distribution readiness.
- Modifying the unrelated plan-085 worktree.

## Constraints

- QA completes before separate review.
- Keep the fix to a byte-for-byte source representation correction plus a static binary-free regression.
- Re-run repository QA, runtime smoke, sample-audio QA, and final synchronized-main sample generation.
- Preserve the plan-1471 `서울-야간-비트-demo.wav` hash and metrics.

## Implementation Plan

- [x] Replace the literal NUL with a textual Unicode escape.
- [x] Add a repository static check rejecting literal NUL bytes in tracked project text sources.
- [x] Run targeted QA and sample audio, then separate review.
- [x] Complete, merge, push, regenerate final samples, and clean the worktree.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-15 | Use plan-1472 for the post-merge source-byte correction. | The defect was discovered only after plan-1471 had been merged, pushed, and cleaned; repository rules prohibit direct feature fixes on `main`. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-15 | project_lead | Created plan-1472 from synchronized main `9d557e42`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-15 | review_judge | Final plan-1471 audit found one literal NUL byte in `run_sample_audio_qa.mjs`; runtime behavior passed but source readability failed. |
| 2026-07-15 | harness_builder | Replaced the literal NUL/control endpoints with textual Unicode escapes and added a repository QA scan that rejects literal NUL bytes across project text sources. |
| 2026-07-15 | quality_runner | Repository QA, runtime smoke, sample-audio QA, and `git diff --check` passed. The harness is recognized as UTF-8 text and the title-integrity WAV retained SHA-256 `9ce2e495f1752a0559a8c228410a85a6aafd35d6ea9c31e9695865347fc4c6df`. |
| 2026-07-15 | review_judge | Post-QA review found no blocking, major, or moderate issue; binary-free source coverage is scoped to project text roots and generated/dependency data remains excluded. |
