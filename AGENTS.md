
# Team Forge Agent Map

This repository is operated by Team Forge for GrooveForge.

`AGENTS.md` is a map, not a handbook. Keep it short. Put detailed rules in `docs/`.

## Team

| id/name | nickname | responsibility |
|---|---|---|
| project_lead | 박자 | coordination, user reports, scope decisions |
| plan_keeper | 구성 | exec plans, status updates, completion moves |
| repo_cartographer | 지도 | repo map, docs structure, agent readability |
| harness_builder | 제작 | scripts, checks, local harness tooling |
| quality_runner | 검증 | QA loop, validation logs, reruns |
| review_judge | 심사 | post-QA review and follow-up recommendations |
| privacy_guard | 수호 | privacy, sensitive data, AI/ads/permission boundaries |
| doc_gardener | 정리 | completed reviews, stale docs, root doc hygiene |

## Reporting

Start, status, and completion reports to the user should use:

```text
<nickname>: <content>
```

Examples:

```text
박자: plan-001-project-base로 작업을 시작합니다.
검증: QA를 실행하고 실패를 기록하겠습니다.
심사: QA 통과 후 리뷰를 시작합니다.
```

Match the user's language in reports unless a referenced artifact is already in another language.

## Project Invariants

- GrooveForge is an all-genre, event-based beat workstation, not a sampling-first app.
- Musical events, patterns, clips, tracks, devices, mixer state, and render state are first-class project data.
- Genre support comes from editable style profiles and generation rules; trap is one profile, not the product identity.
- Sampling is a secondary add-on and should not become the center of the MVP, architecture, or roadmap.
- The first product target is a sample-free 8-bar beat with drums, 808/bass, synth melody, arrangement, mixer/master, and WAV export.
- Keep the app local-first until there is an explicit rationale for cloud sync, remote AI calls, payments, analytics, or account features.

## Start Here

- Product principles: `docs/product/product.md`
- Product architecture: `docs/architecture/product-architecture.md`
- Harness architecture: `docs/architecture/harness.md`
- Quality rules: `docs/quality/rules.md`
- Privacy and safety rules: `docs/privacy/principles.md`
- Official sources: `docs/references/official-sources.md`
- Meetings: `docs/meetings/index.md`
- Active plans: `docs/exec_plans/active/`
- Completed plans: `docs/exec_plans/completed/`
- Reviews: `docs/reviews/`

## No Exec Plan, No Work

Every implementation task starts from:

```text
docs/exec_plans/active/plan-NNN-<task>.md
```

Do not create or use `docs/plan`.

When scope or approach changes, update the plan Decision Log.

When work is complete, move the plan to:

```text
docs/exec_plans/completed/
```

Then create the completion review mirror in:

```text
docs/reviews/
```

## Worktree Flow

Do not implement, commit, or push feature work directly on `main`.

```text
codex/plan-NNN-<task>
.worktree/plan-NNN-<task>
```

Preferred completion flow:

1. QA
2. Review
3. Move active plan to completed
4. Create review mirror
5. Merge to main
6. Push main
7. Delete the completed branch with `git branch -d`
8. Remove the worktree

## QA Before Review

QA and review are separate loops.

Review starts only after QA completes.

Run the validation commands documented in `docs/quality/rules.md`.

## Root Docs

Root Markdown files are limited to:

- `README.md`
- `AGENTS.md`

All other durable knowledge belongs under `docs/`.
