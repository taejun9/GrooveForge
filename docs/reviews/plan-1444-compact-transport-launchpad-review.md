# plan-1444-compact-transport-launchpad review

## Outcome

Approved with no remaining blockers.

## Scope Reviewed

- Desktop first-run transport density and visual hierarchy.
- Beginner, professional producer, and existing-project entry actions.
- Setup, transport, command, project, and disclosure visibility.
- Initial Workflow Navigator exposure at 1280×720 and production Electron size.
- Beginner Pattern and producer Review Queue focus landings.
- Mobile isolation and project/audio/export invariants.

## Findings

### Confirmed: desktop space is used for decisions rather than empty area

The original 1280×720 transport occupied 424px, with the 55px setup row centered at y=200 and Workflow Navigator beginning below the viewport at y=752. The new named-grid layout is 284.49px high, aligns setup at y=31, and starts Workflow Navigator at y=612.59. The first screen now communicates both audience choices and the compose-to-deliver route without removing capability.

### Confirmed: compactness did not hide professional controls

Start beat, Studio pass, existing project, Play, Actions, Help, Undo, Redo, Open, and Save remain directly rendered. Session Context and Exports remain compact disclosures with their existing Guided/Studio lifecycle. The command strip uses four-column groups rather than hiding actions.

### Confirmed: both audience promises still complete after the click

Live browser evidence showed the beginner action closing the launchpad and focusing Pattern editor at y=148 below the sticky navigator. The producer action created `Producer Fast Pass`, opened the required Review disclosures, and focused Review Queue at y=148. Production Electron passed the same two landing routes.

### Strengthened during review: capture initial geometry before interaction

The first Electron report observed the navigator at its later sticky 12px position because earlier smoke actions had scrolled the page. The collector now restores top origin and freezes geometry before subsequent interactions, producing the authoritative initial y=612.59 value that agrees with live browser evidence.

### Confirmed: mobile and behavior boundaries remain intact

All layout additions live inside `@media (min-width: 1221px)`. No markup, label, handler, shortcut, project field, playback path, export behavior, or remote boundary changed.

No additional findings remain.

## Evidence

- Live in-app browser 1280×720 geometry, screenshot, and both starter landings
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

Runtime evidence retained 30/30 project roundtrips, all 14 styles, both audience workflows, delivery packages, and native save/open roundtrips. Production Electron retained 104 required test ids, direct Play/Save, launchpad lifecycle, button-theme evidence, and the complete workstation path.
