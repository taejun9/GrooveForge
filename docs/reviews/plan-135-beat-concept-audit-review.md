# plan-135-beat-concept-audit-review

## Summary

Reviewed the concept audit changes for GrooveForge's product framing. The update keeps GrooveForge centered on direct all-genre beat production and makes sampling an accessory module that belongs in an optional later phase.

## QA

- `python3 harness/scripts/run_qa.py` passed.
- `npm run qa` passed.
- `git diff --check` passed.
- `npm run verify` passed with the existing Vite chunk-size warning.

## Findings

No blocking findings.

## Review Notes

- The change is documentation and harness-only.
- The README now states that sampling references are not the main workflow.
- Product docs now require feature drafts to explain the beat event, instrument, arrangement, mix/master, or export outcome they improve before any sampling phase.
- Architecture docs now keep sampling modules as leaf-level source or instrument devices rather than root project architecture.
- Quality rules now fail brief alignment if GrooveForge can be summarized as a sampling app, sample-chopping tool, sample-pack workflow, or sampler setup surface.
- No runtime code, project schema, playback, save/load, export, remote AI, cloud, or optional sampling implementation was added.

## Residual Risk

Historical completed plans still mention sampling in guardrail and non-goal contexts. They were not rewritten because this plan is scoped to current durable framing and future QA expectations.
