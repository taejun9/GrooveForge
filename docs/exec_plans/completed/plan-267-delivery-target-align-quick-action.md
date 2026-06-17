# plan-267-delivery-target-align-quick-action

## Goal

Add a Quick Actions command for the active Delivery Target Alignment so beginners can match arrangement length, master posture, and mix posture from command search, and producers can quickly re-target a session for starter, vocal, beat-store, club, or custom delivery.

## Non-Goals

- Do not change Delivery Target selection, custom target editing, alignment scoring, arrangement templates, mixer/master presets, export rendering, or Handoff Pack behavior.
- Do not add automatic exports, background rendering, auto-save, command chains, modal workflows, or hidden arrangement generation.
- Do not mutate musical event content, sampler state, imported audio, or audio clips outside the existing Delivery Target alignment handler.
- Do not add sampling, remote AI, analytics, accounts, payments, cloud sync, platform compliance claims, or genre-specific trap-first behavior.

## Context Map

- `src/ui/App.tsx`: Quick Actions creation, existing `alignDeliveryTarget` handler, Delivery Target Alignment preview/result summaries, command result metrics, and follow-up copy.
- `README.md`: desktop command summary and Delivery Target feature description.
- `docs/product/product.md`: target-aware workflow and delivery framing.
- `docs/quality/rules.md`: Quick Actions and Delivery Target guardrails.
- `harness/scripts/run_qa.py`: static text/source expectations.

## Plan

- [x] Route the active Delivery Target alignment state and existing align handler into Quick Actions.
- [x] Add a `delivery-target-align` Quick Actions command that applies the active target through `alignDeliveryTarget`.
- [x] Add Delivery Target-specific Quick Action result metric and follow-up text.
- [x] Update README, product docs, quality rules, and harness expectations.
- [x] Run documented QA before review.

## Decision Log

- The command will align only the currently active Delivery Target and will call the same handler as the visible Align buttons, keeping target selection and custom target editing separate from alignment.
- The command is disabled when the active Delivery Target is already aligned, so Quick Actions exposes the same explicit Align path without introducing automatic export, hidden generation, or command chaining.

## QA Log

- Passed `python3 harness/scripts/run_qa.py`.
- Passed `git diff --check`.
- Passed `npm run typecheck`.
- Passed `npm run qa`.
- Passed `python3 harness/scripts/run_quality_gate.py`.
- Passed `npm run harness:smoke`.
- Passed `npm run build`.
- Passed `npm run verify`.
- Local browser smoke was attempted with `npm run dev`, but sandboxed localhost listen failed with `EPERM` on `127.0.0.1:5173`; the required escalation retry was rejected by the environment, so no workaround was used.

## Review

- No issues found after QA. The command routes through the existing `alignDeliveryTarget` handler, uses local active target state, keeps result/follow-up feedback UI-only, and preserves the sample-free beat workstation direction.
