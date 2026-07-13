# plan-1445-minimum-window-transport review

## Outcome

Approved with no remaining blockers.

## Scope Reviewed

- Reachable 1180–1220px BrowserWindow range.
- Setup, audience launchpad, command, project, and disclosure reflow.
- Horizontal document overflow and required-action viewport geometry.
- Resize preflight isolation from normal 1440px launch smoke.
- Starter, project, audio, export, privacy, and sampling invariants.

## Findings

### Confirmed: the real minimum window no longer falls through a responsive gap

GrooveForge enforces `minWidth: 1180`, while the previous compact rules began at 1221px. The new intermediate named grid handles that reachable edge. Production Electron measured an exact 1180px viewport with zero horizontal document overflow and a 456.49px transport header.

### Confirmed: fit is achieved by reflow, not feature removal

Brand and setup occupy row one, the two audience choices remain side by side on row two, and command groups occupy row three. Start beat, Studio pass, existing project, Play, Actions, Help, Undo, Redo, Open, Save, Session Context, and Exports all had non-zero rects fully inside the minimum viewport.

### Confirmed: edge-width and normal-width evidence are independent

The launch smoke resizes the hidden production BrowserWindow to 1180×800, records edge geometry, restores 1440×960 in a `finally` block, waits for layout settlement, and only then runs the established full launch sequence. The restored path retained the 284.49px normal header, initial Workflow Navigator at y=612.59, both starter landings, 104 required test ids, and the complete workstation path.

### Strengthened during review: disclosures are part of direct usability

Initial evidence covered project and command buttons but not Session Context or Exports. Review added both summary toggles to the viewport-required list. That first rerun caught a mistyped `transport-exports-toggle` id; after correction to the real `transport-export-toggle`, the strengthened production test passed.

No additional findings remain.

## Evidence

- `npm run qa`
- `npm run typecheck`
- `npm run renderer:smoke`
- `npm run harness:smoke`
- `npm run workflow:smoke`
- `npm run persona:smoke`
- `npm run build`
- `npm run quick-actions:bundle-smoke`
- `npm run desktop:launch-smoke`
- `npm run desktop:project-io-smoke`
- `git diff --check`

Runtime evidence retained 30/30 project roundtrips, all 14 styles, both audience workflows, delivery packages, and native save/open roundtrips. No labels, shortcuts, handlers, project state, playback, export behavior, remote behavior, or sampling scope changed.
