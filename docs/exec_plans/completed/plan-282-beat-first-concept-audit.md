# plan-282-beat-first-concept-audit

## Objective

Audit the current GrooveForge base against the user's corrected concept: GrooveForge is an all-genre beat-production mini DAW for direct composition, sound design, arrangement, mixing/mastering, and export. Sampling remains an optional supporting module, not the product identity, MVP proof, default UI, or architecture spine.

## Scope

- Review the attached concept brief and current durable docs for sampling-first drift.
- Strengthen `README.md`, `docs/product/product.md`, `docs/architecture/product-architecture.md`, and `docs/quality/rules.md` where the corrected concept needs to be easier for future agents to apply.
- Update `harness/scripts/run_qa.py` so the same concept boundary is statically checked.
- Keep sampling allowed only as a clearly labeled optional extension.

## Out Of Scope

- No product feature implementation.
- No runtime UI changes.
- No audio import, sampler, chopping, slicing, loop stretching, one-shot mapping, waveform, or audio-clip implementation.
- No schema changes that add `AudioClipEvent`, `audio`, or `sampler` to the MVP model.
- No remote AI, cloud sync, accounts, analytics, ads, payments, or plugin hosting.

## Constraints

- Do not work directly on `main`.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.
- QA must complete before review.
- Review must happen before moving this plan to completed.
- Preserve unrelated worktree changes, including plan-281.

## Validation

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Checklist

- [x] Create task branch and worktree.
- [x] Create active exec plan.
- [x] Audit current sampling-related durable docs.
- [x] Update docs to keep beat composition first and sampling optional.
- [x] Update QA harness expectations for the corrected concept.
- [x] Run validation.
- [x] Complete review.
- [x] Move plan to completed and create review mirror.
- [ ] Merge to `main`, push, delete branch, and remove worktree.

## QA Results

- `python3 harness/scripts/run_qa.py`: passed.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run harness:smoke`: passed; 10/10 Beat Blueprints and 10/10 style profiles produced sample-free 8-bar smoke outputs without writing media artifacts.
- `npm run typecheck`: passed.
- `npm run build`: passed with the existing Vite large-chunk warning.
- `npm run qa`: passed.
- `npm run verify`: passed with the existing Vite large-chunk warning.
- `git diff --check`: passed.

## Review

No findings. The change is limited to durable docs and static QA expectations. It reinforces beat-first framing, source-wording boundaries for built-in one-shots/sample 808 references, and mix/master separation without adding sampling features, schema changes, UI changes, or runtime behavior.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Treat the user's attached draft as a concept correction, not a request to add sampling features. | The brief explicitly says GrooveForge is not a sampling app; sampling is only an optional module inside a direct beat-making workstation. |
| 2026-06-18 | Strengthen docs and static QA instead of editing runtime code. | The current code and docs already center sample-free beat creation; the risk is future draft drift from external examples that mention sampler defaults or `AudioClipEvent`. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Started plan-282 from `main` in `.worktree/plan-282-beat-first-concept-audit`. |
| 2026-06-18 | repo_cartographer | Confirmed current top-level docs already state beat-first direction and identified places to make future draft handling stricter. |
| 2026-06-18 | doc_gardener | Added source-wording, synth-808 default, and mix/master separation rules to durable docs and harness expectations. |
| 2026-06-18 | quality_runner | Ran full validation; all required commands passed, with only the existing build chunk warning. |
| 2026-06-18 | review_judge | Reviewed scope and found no runtime, schema, optional-sampling, cloud, privacy, or UI behavior drift. |
