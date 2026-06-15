# plan-033-beat-first-guardrails Review

## Summary

The current draft was already mostly beat-first. This plan strengthened the durable guardrails so GrooveForge is framed as an all-genre beat workstation for direct composition, sound design, arrangement, mixing/mastering, and export. Sampling remains documented only as a later optional supporting module.

## QA

- `rg -n -i "sample|sampling|sampler|audio clip|AudioClip|chop|slice|stretch|샘플|샘플링" README.md AGENTS.md docs harness`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`

All validation passed after removing an active-plan placeholder found by the first strict quality-gate run.

## Findings

- No blocking findings.
- Remaining sampling-related language is constrained to optional-extension boundaries, privacy/licensing safety, QA guardrails, source-code audio-sample-rate terminology, or historical completed-plan context.
- New guardrails now explicitly cover first-run UX, default navigation, roadmap order, architecture dependencies, and static QA expectations.

## Residual Risk

Future feature plans can still drift if UI copy or plan titles introduce sampling as the primary workflow. The updated QA expectations reduce that risk, but product-framing searches should continue whenever sampling, audio clips, or sampler features are discussed.

## Follow-Ups

- Keep optional sampling work in a later plan that explicitly states it is secondary to the beat workstation core.
- If a future UI adds a sample browser, place it behind an opt-in path after pattern, drum, 808/bass, melody/chord, arrangement, mixer/master, and export workflows are already useful.
