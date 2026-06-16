# plan-130-arrangement-block-clipboard Review

## Summary

Selected-arrangement-block clipboard adds explicit Copy Block and Paste After controls to the Arrangement panel. Copy stores the selected block's section, Pattern A/B/C assignment, bar length, energy, and muted-track shape in UI-local state only. Paste inserts that block after the currently selected block through the existing undoable project update path, selects the pasted block, aligns the selected Pattern A/B/C, and keeps the pasted block manually editable through the existing arrangement controls.

## QA

- `npm run qa` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Local HTTP smoke passed with `200 text/html` from `http://127.0.0.1:5196/`.

## Findings

- No blocking issues found.

## Residual Risk

- In-app Browser click smoke could not complete because the browser backend disconnected and then reported no available browsers via `agent.browsers.list()`. The implemented path is still covered by TypeScript, production build, QA source-token checks, quality gate checks, and local HTTP response verification.
- Clipboard state intentionally remains session-local and can be pasted after whatever arrangement block is currently selected. This matches the plan, but future multi-block editing should revisit clipboard scope and paste placement.

## Follow-Ups

- Multi-block copy/paste, drag reordering, and range duplication remain out of scope for this plan.
