
# GrooveForge

GrooveForge is a web-first, event-based mini DAW for composing drums, 808/bass, melody/chords, arrangement, mixing, mastering, and WAV/stem export; sampling is an optional later module.

Project type: `web-first TypeScript mini DAW / beat workstation`.

This repository includes an agent-readable project base: concise root docs, durable project knowledge under `docs/`, and a local harness under `harness/`.

Agent team: `Team Forge`. See `AGENTS.md`.

## Product Spine

GrooveForge is a code-driven beat workstation with a programmable project format and style engine. The core flow is:

```text
BPM/key -> drums -> 808/bass -> melody/chords -> arrangement -> mixing -> mastering -> export
```

Sampling can be added later as an optional module, but the MVP must work without imported samples.

## MVP Target

The first usable result is a browser project that can create a sample-free 8-bar beat and export it as WAV:

- 145 BPM / F minor starter project.
- Kick, snare/clap, hat, 808, and synth melody tracks.
- Pattern A/B/C storage and arrangement blocks.
- Basic mixer volume/pan, master limiter, and WAV export.

No app runtime has been installed yet. This repository currently contains the project base, durable docs, and validation harness.

## Core Direction

- Keep product behavior grounded in the project brief and official sources where applicable.
- Keep sensitive real user, customer, credential, and production data out of samples, tests, docs, and screenshots.
- Keep validation commands current as the stack becomes concrete.

## Agent Harness

All implementation work starts from an active exec plan:

```text
docs/exec_plans/active/plan-NNN-<task>.md
```

Do not create or use `docs/plan`.

Completed plans move to `docs/exec_plans/completed/`, and completion reviews go in `docs/reviews/`.

## Git Flow

Do not work directly on `main`. Use a `codex/plan-NNN-<task>` branch and `.worktree/plan-NNN-<task>` checkout for feature work. After QA and review, merge to `main`, push `main`, delete the merged branch with `git branch -d`, and remove the worktree.

## Commands

Current base validation:

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
```

When the web app stack is installed, add real package commands for test, lint, typecheck, build, QA, and verification. Do not document commands that do not run.

## Layout

```text
AGENTS.md
README.md
docs/
  architecture/
    product-architecture.md
  exec_plans/
    active/
    completed/
  meetings/
  privacy/
  product/
  quality/
  references/
  reviews/
harness/
  scripts/
  templates/
```
