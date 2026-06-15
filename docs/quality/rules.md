
# Quality Rules

These rules should be enforced by the local harness where practical.

## Planning

- Every implementation task starts from `docs/exec_plans/active/plan-NNN-<task>.md`.
- Completed plans move to `docs/exec_plans/completed/`.
- Completed plans require review mirrors in `docs/reviews/`.
- Plan filenames use `plan-NNN-<task>.md`.
- `docs/plan` is prohibited.
- Update the Decision Log when scope or approach changes.

## Git Flow

- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` branches for implementation work.
- Use `.worktree/plan-NNN-<task>` checkouts for git repository work.
- After QA and review, merge the task branch to `main`, push `main`, delete the merged branch with `git branch -d`, and remove the worktree.

## QA And Review

- QA and review are separate loops.
- Review starts only after QA completes.
- Failed validation must be reported and fixed or explicitly documented.
- Completion reviews go in `docs/reviews/` and should summarize QA, findings, residual risk, and follow-ups.

## Documentation Hygiene

- Root Markdown files are limited to `README.md` and `AGENTS.md`.
- Durable documentation belongs under `docs/`.
- `AGENTS.md` should stay a concise repository map.
- `README.md` is the current public entry point and must stay aligned with code behavior.

## Safety

- Sensitive real user, customer, startup, credential, and production data must not appear in samples, tests, docs, or screenshots.
- Broad permissions, remote AI calls, trackers, ads, payment flows, and destructive automations require explicit project rationale.
- Real user audio, copyrighted sample packs, unreleased beats, credentials, and private project files must not be committed.

## Commands

Current commands:

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run typecheck
npm run build
npm run qa
npm run verify
```

Desktop app manual check:

```sh
npm run desktop
```

## Product QA Gates

P0 scheduler work must prove stable play/stop/loop behavior, BPM changes, current-step feedback, and separation between UI timing and audio timing.

Drum, bass, melody, and arrangement work must preserve editable project state without losing event timing, pitch, velocity, glide, track routing, or mixer state.

Export work must verify a non-silent WAV with expected duration, expected sample rate/channel count, no audio frames above the selected ceiling, and reproducibility from saved project data.

Product framing work must preserve the core boundary: GrooveForge is for all-genre beat creation first; sampling is an optional extension and should not dominate MVP docs, UI copy, architecture, or plan titles.

Mixer/master work must keep mixing and mastering separate. Loudness presets are targets and checks, not automatic proof that a beat is platform-safe.
