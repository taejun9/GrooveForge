# plan-1250-readme-progress-refresh-readout review

## Summary

Aligned the public README and harness architecture command descriptions with the current `release:progress-refresh-smoke` contract: update-feed checkpoint first, then progress, current-blocker, completion-packet, freshness, and operator completion brief. The public command map now also documents `release:operator-completion-brief-smoke` and the strict proof chain's private-value leak audit step.

## Findings

No blocking findings remain.

## Review Notes

- README no longer describes the old four-command progress refresh.
- `docs/architecture/harness.md` no longer describes the old four-command progress refresh or the old strict-proof success-smoke evidence shape.
- `harness/scripts/run_qa.py` now checks the updated public and harness documentation strings.
- The worktree `release:progress-refresh-smoke` attempt failed only because ignored `build/desktop` source evidence is not present in the isolated worktree. The same command passed from the main workspace with existing evidence and made no private/external claim.

## QA

| command | result |
|---|---|
| `npm run qa` | pass before and after plan move |
| `git diff --check` | pass before and after plan move |
| `npm run release:progress-refresh-smoke` in isolated worktree | expected source-evidence failure |
| `npm run release:progress-refresh-smoke` in main workspace | pass |
| direct completed-plan count | pass |

## Completion

- Overall completion: `99.999999%`
- Remaining completion: `0.000001%`
- Pre-move current 10-plan progress: `1241-1250: 9/10`
- Final post-move completed-plan progress: `1241-1250: 10/10`
- 10-plan report due: yes
- Latest completed plan: `plan-1250`
- Refresh command count: `6`
- Operator release-channel posture: blocked `yes`, cleared `no`, ready rows `0/4`, placeholders `4/4`
- Private/feed/channel values recorded: no
- External distribution claimed: no
