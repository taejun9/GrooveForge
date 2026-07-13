#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const resultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const timeoutMs = 660000;
const failures = [];
const expectedLiveTestIds = [
  "workflow-target-transport",
  "workflow-target-compose",
  "workflow-target-sound",
  "workflow-target-arrange",
  "workflow-target-mix",
  "workflow-target-master",
  "guide-quick-start",
  "first-run-launchpad",
  "first-run-launchpad-toggle",
  "first-run-launchpad-content",
  "first-run-start-beat",
  "first-run-producer-pass",
  "first-run-open-project",
  "guide-quick-start-headline",
  "audience-session-readout",
  "audience-session-action-beginner",
  "audience-session-action-producer",
  "audience-next-step-rail",
  "audience-next-step-beginner",
  "audience-next-step-producer",
  "audience-completion-checkpoints",
  "audience-completion-checkpoint-beginner",
  "audience-completion-checkpoint-producer",
  "audience-session-acceptance",
  "audience-session-acceptance-beginner",
  "audience-session-acceptance-producer",
  "audience-delivery-snapshot",
  "audience-delivery-snapshot-beginner",
  "audience-delivery-snapshot-producer",
  "audience-delivery-proof-bridge",
  "audience-delivery-proof-bridge-beginner",
  "audience-delivery-proof-bridge-producer",
  "audience-starter-action-beginner",
  "audience-starter-action-producer",
  "audience-route-bridge",
  "audience-route-bridge-readiness-action",
  "audience-route-bridge-completion-action",
  "dual-audience-readiness",
  "dual-audience-readiness-beginner",
  "dual-audience-readiness-producer",
  "audience-completion-route",
  "audience-completion-route-beginner",
  "audience-completion-route-producer",
  "mode-focus",
  "mode-focus-mode",
  "session-pass",
  "session-pass-mode",
  "mode-guided",
  "mode-studio",
  "quick-actions-open",
  "command-reference-open",
  "style-select",
  "pattern-tab-A",
  "pattern-lab",
  "workspace-feedback-anchor",
  "transport-status-controls",
  "transport-essential-controls",
  "transport-play",
  "project-essential-controls",
  "project-open",
  "project-save",
  "transport-session-tools",
  "transport-session-toggle",
  "transport-export-tools",
  "transport-export-toggle",
  "export-wav",
  "workflow-navigator",
  "workflow-jump-compose",
  "workflow-jump-arrange",
  "workflow-jump-mix",
  "workflow-jump-deliver",
  "note-editor-panel",
  "capture-ideas",
  "instrument-direct-chords",
  "chord-event-grid",
  "harmony-moves",
  "sound-design-tools",
  "arrangement-playback-readout",
  "arrangement-timeline",
  "selected-block-editor",
  "block-moves",
  "arrangement-tools",
  "mixer-channel-strips",
  "mixer-processing-drum_rack",
  "mix-moves",
  "mix-review-tools",
  "master-output-controls",
  "master-ceiling-input",
  "master-polish-tools",
  "master-review-tools",
  "handoff-pack-direct",
  "handoff-pack-grid",
  "handoff-status-tools",
  "handoff-status-toggle",
  "handoff-audit-tools",
  "handoff-audit-toggle",
  "export-stems",
  "export-midi",
  "export-handoff-sheet",
  "pattern-chain-current",
  "master-ceiling"
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop launch smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function parseSmokeResult(output) {
  const line = output
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(resultPrefix));

  if (!line) {
    return null;
  }

  try {
    return JSON.parse(line.slice(resultPrefix.length));
  } catch (error) {
    fail(`Could not parse launch smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

function checkBuiltArtifacts() {
  check(existsSync(path.join(root, "dist/index.html")), "dist/index.html is missing; run npm run build before desktop launch smoke");
  check(
    existsSync(path.join(root, "dist-electron/main.js")),
    "dist-electron/main.js is missing; run npm run build before desktop launch smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/preload.cjs")),
    "dist-electron/preload.cjs is missing; run npm run build before desktop launch smoke"
  );
}

function checkResult(result) {
  check(result && typeof result === "object", "launch smoke should return a structured result object");
  check(result?.ok === true, "launch smoke result should be ok");

  const evidence = result?.evidence;
  check(evidence && typeof evidence === "object", "launch smoke result should include evidence");
  check(evidence?.title === "GrooveForge", "live desktop document title should be GrooveForge");
  check(String(evidence?.location ?? "").startsWith("file:"), "live desktop renderer should load production file assets");
  check(evidence?.appKind === "desktop", "live desktop preload bridge should expose appKind desktop");
  check(evidence?.hasPreloadBridge === true, "live desktop preload bridge should exist");
  check(evidence?.hasSaveProject === true, "live desktop preload bridge should expose saveProject");
  check(evidence?.hasOpenProject === true, "live desktop preload bridge should expose openProject");
  check(evidence?.rootChildCount > 0, "live desktop renderer should mount React under #root");
  check(
    evidence?.modalFocus?.closedDetails?.totalCount === 24 &&
      evidence?.modalFocus?.closedDetails?.initiallyOpenCount === 1 &&
      evidence?.modalFocus?.closedDetails?.closedCount === 23 &&
      evidence?.modalFocus?.closedDetails?.leakedContentCount === 0 &&
      evidence?.modalFocus?.closedDetails?.leakedControlCount === 0 &&
      evidence?.modalFocus?.closedDetails?.guideOpenReady === true &&
      evidence?.modalFocus?.closedDetails?.guideReclosedReady === true &&
      evidence?.modalFocus?.closedDetails?.patternLabOpenReady === true &&
      evidence?.modalFocus?.closedDetails?.patternLabReclosedReady === true &&
      evidence?.modalFocus?.closedDetails?.mixerOpenReady === true &&
      evidence?.modalFocus?.closedDetails?.mixerReclosedReady === true &&
      evidence?.modalFocus?.closedDetails?.projectStayedUnchanged === true &&
      evidence?.modalFocus?.closedDetails?.undoPostureUnchanged === true &&
      evidence?.modalFocus?.closedDetails?.playbackStayedStopped === true,
    "live desktop disclosures should contain every closed panel, reopen representative surfaces with native Enter, recontain them, and preserve project posture"
  );
  check(
      evidence?.modalFocus?.drumGrid?.buttonCount === 64 &&
      evidence?.modalFocus?.drumGrid?.pressedSemanticsReady === true &&
      evidence?.modalFocus?.drumGrid?.rovingTabReady === true &&
      evidence?.modalFocus?.drumGrid?.nativeArrowReady === true &&
      evidence?.modalFocus?.drumGrid?.navigationSelectionReady === true &&
      evidence?.modalFocus?.drumGrid?.navigationEventCountUnchanged === true &&
      evidence?.modalFocus?.drumGrid?.enterToggleReady === true &&
      evidence?.modalFocus?.drumGrid?.spaceToggleReady === true &&
      evidence?.modalFocus?.drumGrid?.activationSingleToggleReady === true &&
      evidence?.modalFocus?.drumGrid?.playbackStayedStopped === true &&
      evidence?.modalFocus?.drumGrid?.undoRestored === true,
    "live desktop drum grid should expose one roving Tab stop, pressed state, representative native arrow navigation, single Enter/Space toggles, unchanged playback, and Undo restoration"
  );
  check(
      evidence?.modalFocus?.noteGrid?.bassButtonCount === 144 &&
      evidence?.modalFocus?.noteGrid?.melodyButtonCount === 160 &&
      evidence?.modalFocus?.noteGrid?.pressedSemanticsReady === true &&
      evidence?.modalFocus?.noteGrid?.rovingTabReady === true &&
      evidence?.modalFocus?.noteGrid?.nativeArrowReady === true &&
      evidence?.modalFocus?.noteGrid?.navigationSelectionReady === true &&
      evidence?.modalFocus?.noteGrid?.navigationEventCountUnchanged === true &&
      evidence?.modalFocus?.noteGrid?.enterToggleReady === true &&
      evidence?.modalFocus?.noteGrid?.spaceToggleReady === true &&
      evidence?.modalFocus?.noteGrid?.activationSingleToggleReady === true &&
      evidence?.modalFocus?.noteGrid?.playbackStayedStopped === true &&
      evidence?.modalFocus?.noteGrid?.undoRestored === true,
    "live desktop 808 and Synth grids should expose one Tab stop each, pressed state, representative native spatial navigation, single Enter/Space toggles, unchanged playback, and Undo restoration"
  );
  check(
    evidence?.modalFocus?.quickInitialFocus === "quick-actions-search" &&
      evidence?.modalFocus?.quickForwardWrap === true &&
      evidence?.modalFocus?.quickBackwardWrap === true &&
      evidence?.modalFocus?.quickEscapeClosed === true &&
      evidence?.modalFocus?.quickFocusRestored === true &&
      evidence?.modalFocus?.quickKeyboardArrowDownMoved === true &&
      evidence?.modalFocus?.quickKeyboardArrowUpReturned === true &&
      evidence?.modalFocus?.quickKeyboardEndMovedLast === true &&
      evidence?.modalFocus?.quickKeyboardHomeReturnedFirst === true &&
      evidence?.modalFocus?.quickKeyboardFocusRetained === true &&
      evidence?.modalFocus?.quickKeyboardEnterRanSelected === true &&
      evidence?.modalFocus?.quickKeyboardSelectedTitle === evidence?.modalFocus?.quickKeyboardResultTitle &&
      evidence?.modalFocus?.commandInitialFocus === "command-reference-search-input" &&
      evidence?.modalFocus?.commandForwardWrap === true &&
      evidence?.modalFocus?.commandBackwardWrap === true &&
      evidence?.modalFocus?.commandEscapeClosed === true &&
      evidence?.modalFocus?.commandFocusRestored === true &&
      evidence?.modalFocus?.switchInitialFocus === "command-reference-search-input" &&
      evidence?.modalFocus?.switchFocusRestored === true,
    "live desktop modals should focus search, select and run Quick Actions with native arrow keys and Enter, wrap real Tab/Shift+Tab, close on Escape, restore openers, and preserve the original opener across dialog handoff"
  );
  check(
    evidence?.modalFocus?.dockInitialHidden === true &&
      evidence?.modalFocus?.dockVisible === true &&
      evidence?.modalFocus?.dockReturnedHidden === true &&
      evidence?.modalFocus?.dockViewportReady === true &&
      evidence?.modalFocus?.dockControlCount === 5,
    "live desktop workspace command dock should appear only after the full header leaves view and remain fully viewport-contained"
  );
  check(
      evidence?.modalFocus?.dockPositionMirrorsHeader === true &&
      evidence?.modalFocus?.dockUndoRedoParity === true &&
      evidence?.modalFocus?.dockShortcutMetadataReady === true &&
      evidence?.modalFocus?.dockFocusReady === true &&
      evidence?.modalFocus?.dockSharedPlayReady === true &&
      evidence?.modalFocus?.dockActionsOpened === true &&
      evidence?.modalFocus?.dockActionsFocusRestored === true,
    "live desktop workspace command dock should mirror header state and reuse Play plus Quick Actions through native pointer/Escape input"
  );
  check(evidence?.bodyTextLength > 20000, "live desktop renderer should expose a substantial workstation surface");
  check(Array.isArray(evidence?.missingText) && evidence.missingText.length === 0, "live desktop renderer should contain all expected beginner/pro text");
  check(evidence?.samplingTextPresent === false, "live desktop first-run surface should not expose sampling-first language");
  check(evidence?.layout?.guidanceCenterOpen === false, "live desktop Guide & Review Center should start collapsed");
  check(
    evidence?.layout?.quickActionGraphReady === true,
    "live desktop should finish the on-demand Quick Actions graph load before exhaustive command evidence runs"
  );
  check(
    evidence?.layout?.guideQuickStartDecisionVisible === true &&
      evidence?.layout?.guideQuickStartDetailsOpen === false &&
      evidence?.layout?.guideQuickStartDetailsToggleVisible === true &&
      evidence?.layout?.guideQuickStartDetailsContentHidden === true &&
      evidence?.layout?.guideQuickStartDetailsInteractionReady === true,
    `live desktop Guide Quick Start should keep its decision direct and progress/routes compact with native open-close behavior (decision ${evidence?.layout?.guideQuickStartDecisionVisible}, open ${evidence?.layout?.guideQuickStartDetailsOpen}, toggle ${evidence?.layout?.guideQuickStartDetailsToggleVisible}, hidden ${evidence?.layout?.guideQuickStartDetailsContentHidden}, interaction ${evidence?.layout?.guideQuickStartDetailsInteractionReady})`
  );
  check(
    evidence?.layout?.audienceSessionActionsDirectVisible === true &&
      evidence?.layout?.audienceSessionProofOpen === false &&
      evidence?.layout?.audienceSessionProofToggleVisible === true &&
      evidence?.layout?.audienceSessionProofContentHidden === true &&
      evidence?.layout?.audienceSessionProofInteractionReady === true &&
      evidence?.layout?.audienceSessionProofRowsPreserved === true,
    `live desktop Audience Session should keep actions direct and proof compact with native open-close behavior (actions ${evidence?.layout?.audienceSessionActionsDirectVisible}, open ${evidence?.layout?.audienceSessionProofOpen}, toggle ${evidence?.layout?.audienceSessionProofToggleVisible}, hidden ${evidence?.layout?.audienceSessionProofContentHidden}, interaction ${evidence?.layout?.audienceSessionProofInteractionReady}, rows ${evidence?.layout?.audienceSessionProofRowsPreserved})`
  );
  check(
    evidence?.layout?.launchpadOpen === true &&
      evidence?.layout?.launchpadToggleVisible === true &&
      evidence?.layout?.launchpadContentVisible === true &&
      evidence?.layout?.launchpadActionCount === 3,
    "live desktop first-run launchpad should start open with a visible toggle and all three project-entry actions"
  );
  check(
    evidence?.layout?.compactTransportReady === true &&
      evidence?.layout?.compactTransportDirectActionsReady === true &&
      evidence?.layout?.launchpadHorizontalReady === true &&
      evidence?.layout?.transportSetupTopAligned === true &&
      evidence?.layout?.initialNavigatorStartsInViewport === true &&
      evidence?.layout?.compactTransportHeight <= 300,
    `live desktop should use a compact two-row transport with horizontal audience choices and initial Workflow Navigator visibility (height ${evidence?.layout?.compactTransportHeight}, navigator top ${evidence?.layout?.initialNavigatorTop}, actions ${evidence?.layout?.compactTransportDirectActionsReady}, horizontal ${evidence?.layout?.launchpadHorizontalReady}, aligned ${evidence?.layout?.transportSetupTopAligned})`
  );
  check(
    evidence?.layout?.minimumWindowTransportReady === true &&
      evidence?.layout?.minimumWindowDirectActionsReady === true &&
      evidence?.layout?.minimumWindowLaunchpadHorizontalReady === true &&
      evidence?.layout?.minimumWindowSetupReady === true &&
      evidence?.layout?.minimumWindowHorizontalOverflow === 0 &&
      evidence?.layout?.minimumWindowViewportWidth <= 1180,
    `live desktop minimum window should keep setup, horizontal audience choices, and every direct action inside the viewport without horizontal overflow (viewport ${evidence?.layout?.minimumWindowViewportWidth}, height ${evidence?.layout?.minimumWindowTransportHeight}, overflow ${evidence?.layout?.minimumWindowHorizontalOverflow}, transport ${evidence?.layout?.minimumWindowTransportReady}, setup ${evidence?.layout?.minimumWindowSetupReady}, choices ${evidence?.layout?.minimumWindowLaunchpadHorizontalReady}, actions ${evidence?.layout?.minimumWindowDirectActionsReady})`
  );
  check(
    evidence?.layout?.minimumWindowWideStudioAutoExpandReady === true &&
      evidence?.layout?.minimumWindowStudioResizeCollapseReady === true &&
      evidence?.layout?.minimumWindowStudioCompactEntryReady === true &&
      evidence?.layout?.minimumWindowStudioManualReopenReady === true &&
      evidence?.layout?.minimumWindowStudioHorizontalOverflow === 0 &&
      evidence?.layout?.minimumWindowStudioCompactHeight > 0 &&
      evidence?.layout?.minimumWindowStudioExpandedHeight > evidence?.layout?.minimumWindowStudioCompactHeight &&
      evidence?.layout?.minimumWindowStudioCompactHeight <= evidence?.layout?.minimumWindowTransportHeight + 1,
    `live desktop Studio transport should auto-expand wide, collapse after resize and compact entry, remain manually reopenable, and preserve workspace height at 1180px (wide ${evidence?.layout?.minimumWindowWideStudioAutoExpandReady}, resize ${evidence?.layout?.minimumWindowStudioResizeCollapseReady}, compact ${evidence?.layout?.minimumWindowStudioCompactEntryReady}, manual ${evidence?.layout?.minimumWindowStudioManualReopenReady}, compact height ${evidence?.layout?.minimumWindowStudioCompactHeight}, expanded height ${evidence?.layout?.minimumWindowStudioExpandedHeight}, overflow ${evidence?.layout?.minimumWindowStudioHorizontalOverflow})`
  );
  check(evidence?.layout?.patternLabOpen === false, "live desktop Pattern Lab should start collapsed");
  check(
    evidence?.layout?.swingFeelDarkThemeReady === true &&
      evidence?.layout?.swingFeelPressedSemanticsReady === true &&
      evidence?.layout?.swingFeelSelectedCount === 1,
    `live desktop Swing Feel pads should expose five dark-theme buttons with exactly one truthful selected target (theme ${evidence?.layout?.swingFeelDarkThemeReady}, semantics ${evidence?.layout?.swingFeelPressedSemanticsReady}, selected ${evidence?.layout?.swingFeelSelectedCount})`
  );
  check(
    evidence?.layout?.buttonThemeFoundationReady === true &&
      evidence?.layout?.buttonThemeDisabledReady === true &&
      evidence?.layout?.buttonThemeSpecialistStateReady === true &&
      evidence?.layout?.buttonThemeRepresentativeCount === 6 &&
      evidence?.layout?.buttonThemeNativeSurfaceCount === 0,
    `live desktop buttons should use the dark low-specificity foundation without native surfaces while preserving disabled and specialist states (foundation ${evidence?.layout?.buttonThemeFoundationReady}, representatives ${evidence?.layout?.buttonThemeRepresentativeCount}, native ${evidence?.layout?.buttonThemeNativeSurfaceCount}, disabled ${evidence?.layout?.buttonThemeDisabledReady}, specialist ${evidence?.layout?.buttonThemeSpecialistStateReady})`
  );
  check(
    evidence?.layout?.projectOwnershipReady === true,
    `live desktop should identify an editable 8-bar foundation with honest local-only save guidance (project ${evidence?.layout?.projectStatus}, safety ${evidence?.layout?.projectSafetyStatus} / ${evidence?.layout?.projectSafetyLabel} / ${evidence?.layout?.projectSafetyDetail})`
  );
  check(
    evidence?.starterLanding?.beginner?.projectTitle === "First Guided Beat" &&
      evidence?.starterLanding?.beginner?.focusTestId === "workflow-target-compose" &&
      evidence?.starterLanding?.beginner?.inViewport === true &&
      evidence?.starterLanding?.beginner?.clearOfNavigator === true,
    `live beginner starter should focus a visible Pattern editor below the sticky Workflow Navigator (${JSON.stringify(evidence?.starterLanding?.beginner ?? null)})`
  );
  check(
    evidence?.starterLanding?.producer?.projectTitle === "Producer Fast Pass" &&
      evidence?.starterLanding?.producer?.focusTestId === "review-queue" &&
      evidence?.starterLanding?.producer?.inViewport === true &&
      evidence?.starterLanding?.producer?.clearOfNavigator === true &&
      evidence?.starterLanding?.producer?.producerReviewOpen === true &&
      evidence?.starterLanding?.producer?.producerQueueOpen === true,
    `live producer starter should open and focus a visible Review Queue below the sticky Workflow Navigator (${JSON.stringify(evidence?.starterLanding?.producer ?? null)})`
  );
  check(
    evidence?.layout?.feedbackOutsideGuidance === true && evidence?.layout?.feedbackAfterGuidance === true,
    "live desktop global command feedback should remain outside and after optional guidance"
  );
  check(
    evidence?.layout?.workflowNavigatorPresent === true &&
      evidence?.layout?.workflowNavigatorVisible === true &&
      evidence?.layout?.workflowNavigatorOutsideGuidance === true &&
      evidence?.layout?.workflowNavigatorBeforeWorkspace === true &&
      evidence?.layout?.workflowNavigatorComposeJumpReady === true &&
      evidence?.layout?.workflowNavigatorDeliverJumpReady === true &&
      evidence?.layout?.workflowNavigatorStageCount === 4 &&
      evidence?.layout?.workflowNavigatorSticky === true,
    `live desktop Workflow Navigator should be visible outside optional guidance, sticky before the workstation, expose four stage actions, and jump to Compose and Deliver (present ${evidence?.layout?.workflowNavigatorPresent}, visible ${evidence?.layout?.workflowNavigatorVisible}, outside ${evidence?.layout?.workflowNavigatorOutsideGuidance}, before ${evidence?.layout?.workflowNavigatorBeforeWorkspace}, sticky ${evidence?.layout?.workflowNavigatorSticky}, stages ${evidence?.layout?.workflowNavigatorStageCount}, compose jump ${evidence?.layout?.workflowNavigatorComposeJumpReady}, deliver jump ${evidence?.layout?.workflowNavigatorDeliverJumpReady})`
  );
  check(
    evidence?.layout?.transportStatusBeforeEssentials === true &&
      evidence?.layout?.transportEssentialsBeforeProject === true &&
      evidence?.layout?.transportProjectBeforeSession === true &&
      evidence?.layout?.transportSessionBeforeExports === true &&
      evidence?.layout?.transportPlayDirectVisible === true &&
      evidence?.layout?.transportSaveDirectVisible === true &&
      evidence?.layout?.transportExportsContainWav === true,
    "live desktop transport should keep direct Play and project safety before Session Context and Exports"
  );
  check(
    evidence?.layout?.transportSessionOpen === false &&
      evidence?.layout?.transportExportsOpen === false &&
      evidence?.layout?.transportSessionToggleVisible === true &&
      evidence?.layout?.transportExportsToggleVisible === true,
    "live desktop Guided mode should keep Session Context and Exports compact with visible toggles"
  );
  check(
    evidence?.palette?.transportTools?.guidedSessionOpen === false &&
      evidence?.palette?.transportTools?.guidedExportsOpen === false &&
      evidence?.palette?.transportTools?.studioSessionOpen === true &&
      evidence?.palette?.transportTools?.studioExportsOpen === true &&
      evidence?.palette?.transportTools?.resetSessionOpen === false &&
      evidence?.palette?.transportTools?.resetExportsOpen === false,
    "live desktop transport secondary tools should expand for Studio and reset compactly for Guided"
  );
  check(
    evidence?.layout?.essentialShortcutMetadataReady === true &&
      evidence?.layout?.essentialShortcutTitlesReady === true &&
      evidence?.layout?.patternShortcutMetadataReady === true &&
      evidence?.layout?.playPressedStateReady === true,
    "live desktop essential controls should expose exact shortcut semantics, tooltip hints, pattern keys, and stopped Play state"
  );
  check(
    evidence?.palette?.launchpad?.initialOpen === true &&
      evidence?.palette?.launchpad?.collapsedAfterStarter === true &&
      evidence?.palette?.launchpad?.manualReopen === true &&
      evidence?.palette?.launchpad?.manualClose === true &&
      evidence?.palette?.launchpad?.sameStarterCollapse === true,
    "live desktop launchpad should collapse after changed or identical starter selection and remain manually reopenable and closable"
  );
  check(
    evidence?.layout?.patternLabToggleVisible === true &&
      evidence?.layout?.stepGridPresent === true &&
      evidence?.layout?.stepGridAfterPatternLab === true,
    "live desktop drum editor should expose a visible Pattern Lab toggle followed by the 16-step grid"
  );
  check(evidence?.layout?.captureIdeasOpen === false, "live desktop Capture & Ideas should start collapsed");
  check(
    evidence?.layout?.captureIdeasToggleVisible === true &&
      evidence?.layout?.noteLanesPresent === true &&
      evidence?.layout?.noteLanesAfterCaptureIdeas === true,
    "live desktop note editor should expose a visible Capture & Ideas toggle followed by direct note grids"
  );
  check(
    evidence?.palette?.captureIdeas?.initialOpen === false &&
      evidence?.palette?.captureIdeas?.autoReveal === true &&
      evidence?.palette?.captureIdeas?.resetOpen === false,
    "live desktop Capture & Ideas should auto-reveal when keyboard capture is armed"
  );
  check(
    evidence?.layout?.instrumentDirectChordsPresent === true &&
      evidence?.layout?.chordEventsBeforeHarmonyMoves === true &&
      evidence?.layout?.chordsBeforeSoundDesign === true,
    "live desktop Instrument panel should put direct chord events before Harmony Moves and Sound Design"
  );
  check(
    evidence?.layout?.chordCardCount >= 2 &&
      evidence?.layout?.chordExpandedCardCount === 1 &&
      evidence?.layout?.chordCompactCardCount === evidence?.layout?.chordCardCount - 1 &&
      evidence?.layout?.chordSelectedEditorVisible === true &&
      evidence?.layout?.chordCompactEditorsHidden === true &&
      evidence?.palette?.chordCards?.selectionReady === true &&
      evidence?.palette?.chordCards?.restoreReady === true,
    `live desktop chord grid should show one expanded selected editor, compact peers, and keyboard-driven editor switching (cards ${evidence?.layout?.chordCardCount}, expanded ${evidence?.layout?.chordExpandedCardCount}, compact ${evidence?.layout?.chordCompactCardCount}, selected visible ${evidence?.layout?.chordSelectedEditorVisible}, compact hidden ${evidence?.layout?.chordCompactEditorsHidden}, keyboard selection ${evidence?.palette?.chordCards?.selectionReady}, keyboard restore ${evidence?.palette?.chordCards?.restoreReady})`
  );
  check(
    evidence?.layout?.harmonyMovesOpen === false &&
      evidence?.layout?.soundDesignOpen === false &&
      evidence?.layout?.harmonyMovesToggleVisible === true &&
      evidence?.layout?.soundDesignToggleVisible === true,
    "live desktop Guided mode should show collapsed Harmony Moves and Sound Design toggles"
  );
  check(
    evidence?.palette?.instrumentTools?.guidedHarmonyOpen === false &&
      evidence?.palette?.instrumentTools?.guidedSoundOpen === false &&
      evidence?.palette?.instrumentTools?.studioHarmonyOpen === true &&
      evidence?.palette?.instrumentTools?.studioSoundOpen === true &&
      evidence?.palette?.instrumentTools?.resetHarmonyOpen === false &&
      evidence?.palette?.instrumentTools?.resetSoundOpen === false,
    "live desktop Instrument tools should expand for Studio and reset compactly for Guided through the shared mode handler"
  );
  check(
    evidence?.layout?.arrangementPlaybackPresent === true &&
      evidence?.layout?.arrangementTimelinePresent === true &&
      evidence?.layout?.selectedBlockEditorPresent === true &&
      evidence?.layout?.arrangementPatternControlsVisible === true &&
      evidence?.layout?.arrangementTrackStateControlsVisible === true &&
      evidence?.layout?.arrangementShapeControlsVisible === true &&
      evidence?.layout?.arrangementPlaybackBeforeTimeline === true &&
      evidence?.layout?.arrangementTimelineBeforeEditor === true &&
      evidence?.layout?.arrangementEssentialBeforeBlockMoves === true &&
      evidence?.layout?.blockMovesBeforeArrangementTools === true,
    "live desktop Arrangement panel should put playback, timeline, labeled Pattern/Track state/Block shape editing, and essential controls before optional tools"
  );
  check(
    evidence?.layout?.blockMovesOpen === false &&
      evidence?.layout?.arrangementToolsOpen === false &&
      evidence?.layout?.blockMovesToggleVisible === true &&
      evidence?.layout?.arrangementToolsToggleVisible === true,
    "live desktop Guided mode should show collapsed Block Moves and Arrangement Tools toggles"
  );
  check(
    evidence?.palette?.arrangementTools?.guidedArrangementOpen === false &&
      evidence?.palette?.arrangementTools?.guidedBlockMovesOpen === false &&
      evidence?.palette?.arrangementTools?.studioArrangementOpen === true &&
      evidence?.palette?.arrangementTools?.studioBlockMovesFullWidth === true &&
      evidence?.palette?.arrangementTools?.studioBlockMovesOpen === true &&
      evidence?.palette?.arrangementTools?.resetArrangementOpen === false &&
      evidence?.palette?.arrangementTools?.resetBlockMovesOpen === false,
    "live desktop Arrangement tools should expand for Studio and reset compactly for Guided through the shared mode handler"
  );
  check(
    evidence?.layout?.mixerStripsPresent === true &&
      evidence?.layout?.mixerBasicBalanceBeforeProcessing === true &&
      evidence?.layout?.mixerStripsBeforeMixMoves === true &&
      evidence?.layout?.mixMovesBeforeReview === true,
    "live desktop Mixer should put direct strip balance before Processing, Mix Moves, and Audition & Compare"
  );
  check(
    evidence?.layout?.mixerProcessingOpen === false &&
      evidence?.layout?.mixMovesOpen === false &&
      evidence?.layout?.mixReviewOpen === false &&
      evidence?.layout?.mixerProcessingToggleVisible === true &&
      evidence?.layout?.mixMovesToggleVisible === true &&
      evidence?.layout?.mixReviewToggleVisible === true,
    "live desktop Guided mode should show compact channel Processing, Mix Moves, and Audition & Compare toggles"
  );
  check(
    evidence?.palette?.mixerTools?.guidedMixMovesOpen === false &&
      evidence?.palette?.mixerTools?.guidedMixReviewOpen === false &&
      evidence?.palette?.mixerTools?.guidedProcessingOpen === false &&
      evidence?.palette?.mixerTools?.studioMixMovesOpen === true &&
      evidence?.palette?.mixerTools?.studioMixReviewOpen === true &&
      evidence?.palette?.mixerTools?.studioProcessingOpen === true &&
      evidence?.palette?.mixerTools?.resetMixMovesOpen === false &&
      evidence?.palette?.mixerTools?.resetMixReviewOpen === false &&
      evidence?.palette?.mixerTools?.resetProcessingOpen === false,
    "live desktop Mixer tools should expand for Studio and reset compactly for Guided through the shared mode handler"
  );
  check(
    evidence?.layout?.masterOutputControlsPresent === true &&
      evidence?.layout?.masterRoleBeforeControls === true &&
      evidence?.layout?.masterControlsBeforePolish === true &&
      evidence?.layout?.masterPolishBeforeReview === true &&
      evidence?.layout?.masterCeilingBoundsReady === true,
    "live desktop Master should put bounded precise output controls before Polish & Automation and Review & Export"
  );
  check(
    evidence?.layout?.masterPolishOpen === false &&
      evidence?.layout?.masterReviewOpen === false &&
      evidence?.layout?.masterReviewQueuePresent === true &&
      evidence?.layout?.masterReviewQueueOpen === false &&
      evidence?.layout?.masterMixCoachPresent === true &&
      evidence?.layout?.masterMixCoachOpen === false &&
      evidence?.layout?.masterPolishToggleVisible === true &&
      evidence?.layout?.masterReviewToggleVisible === true,
    "live desktop Guided mode should show compact Polish & Automation and Review & Export toggles"
  );
  check(
    evidence?.palette?.masterTools?.guidedMasterPolishOpen === false &&
      evidence?.palette?.masterTools?.guidedMasterReviewOpen === false &&
      evidence?.palette?.masterTools?.guidedMasterReviewQueueOpen === false &&
      evidence?.palette?.masterTools?.guidedMasterMixCoachOpen === false &&
      evidence?.palette?.masterTools?.studioMasterPolishOpen === true &&
      evidence?.palette?.masterTools?.studioMasterReviewOpen === true &&
      evidence?.palette?.masterTools?.studioMasterReviewQueueOpen === false &&
      evidence?.palette?.masterTools?.studioMasterMixCoachOpen === false &&
      evidence?.palette?.masterTools?.resetMasterPolishOpen === false &&
      evidence?.palette?.masterTools?.resetMasterReviewOpen === false &&
      evidence?.palette?.masterTools?.resetMasterReviewQueueOpen === false &&
      evidence?.palette?.masterTools?.resetMasterMixCoachOpen === false &&
      evidence?.palette?.masterTools?.routedMasterReviewQueueOpen === true &&
      evidence?.palette?.masterTools?.routedMasterMixCoachOpen === true,
    "live desktop Master tools should keep nested diagnostics compact across modes, reveal routed destinations, and reset compactly"
  );
  check(
    evidence?.layout?.deliveryDirectPresent === true &&
      evidence?.layout?.deliveryDirectVisible === true &&
      evidence?.layout?.deliveryOutsideGuidance === true &&
      evidence?.layout?.deliveryRouteBeforeDirect === true &&
      evidence?.layout?.deliveryDirectBeforeStatus === true &&
      evidence?.layout?.deliveryStatusBeforeAudit === true,
    "live desktop Delivery hierarchy should stay visible outside optional guidance and keep route, direct exports, delivery status, and package proof in order"
  );
  check(
    evidence?.layout?.deliveryStatusOpen === false &&
      evidence?.layout?.deliveryAuditOpen === false &&
      evidence?.layout?.deliveryStatusToggleVisible === true &&
      evidence?.layout?.deliveryAuditToggleVisible === true,
    "live desktop Guided mode should show compact Delivery Status & Receipt and Format & Package Proof toggles"
  );
  check(
    evidence?.palette?.deliveryTools?.guidedStatusOpen === false &&
      evidence?.palette?.deliveryTools?.guidedAuditOpen === false &&
      evidence?.palette?.deliveryTools?.studioStatusOpen === true &&
      evidence?.palette?.deliveryTools?.studioAuditOpen === true &&
      evidence?.palette?.deliveryTools?.resetStatusOpen === false &&
      evidence?.palette?.deliveryTools?.resetAuditOpen === false,
    "live desktop Delivery proof tools should expand for Studio and reset compactly for Guided through the shared mode handler"
  );

  const missingTestIds = expectedLiveTestIds.filter((testId) => evidence?.testIds?.[testId] !== true);
  check(missingTestIds.length === 0, `live desktop renderer is missing test ids: ${missingTestIds.join(", ")}`);
  check(evidence?.palette?.opened === true, "live desktop Quick Actions palette should open during launch smoke");
  check(
    evidence?.palette?.searchPresent === true,
    "live desktop Quick Actions palette should accept Audience Session, Audience Route Bridge, Dual Audience Readiness, and Audience Completion Route search input"
  );
  check(
    evidence?.palette?.resultPresent === true,
    "live desktop Quick Actions palette should leave Audience Session, Audience Route Bridge, Dual Audience Readiness, and Audience Completion Route execution results"
  );
  check(evidence?.palette?.guided?.actionPresent === true, "live desktop Quick Actions palette should show Enter Guided from first-time composer search");
  check(
    evidence?.palette?.guided?.spotlightAction === "audience-session-enter-beginner",
    "live desktop Quick Actions Guided spotlight should target audience-session-enter-beginner"
  );
  check(
    evidence?.palette?.guided?.spotlightTitle === "Enter Guided: First-time composer",
    "live desktop Quick Actions Guided spotlight should name Enter Guided"
  );
  check(
    String(evidence?.palette?.guided?.searchMetricValue ?? "").includes("Enter Guided: First-time composer"),
    "live desktop Quick Actions Guided search metric should target Enter Guided"
  );
  const guidedResultTitle = String(evidence?.palette?.guided?.resultTitle ?? "");
  const guidedResultStatus = String(evidence?.palette?.guided?.resultStatus ?? "");
  const guidedResultMetric = String(evidence?.palette?.guided?.resultMetricValue ?? "");
  check(
    (guidedResultStatus === "Entered" || guidedResultStatus.includes("Guided")) &&
      (guidedResultTitle === "Enter Guided: First-time composer" || guidedResultTitle === "First-time composer route selected"),
    "live desktop Quick Actions Guided command should execute with Entered result"
  );
  check(
    (guidedResultMetric.includes("Enter Guided for first-time composer") && guidedResultMetric.includes("target Guided")) ||
      guidedResultMetric.includes("Guided first-beat workflow"),
    "live desktop Quick Actions Guided result should include first-time composer route and Guided target"
  );
  check(
    String(evidence?.palette?.guided?.resultNextCheck ?? "").includes("First Beat Path"),
    "live desktop Quick Actions Guided result should guide the next First Beat Path check"
  );
  check(
    evidence?.palette?.producer?.actionPresent === true,
    "live desktop Quick Actions palette should show Enter Studio from professional producer search"
  );
  check(
    evidence?.palette?.producer?.spotlightAction === "audience-session-enter-producer",
    "live desktop Quick Actions producer spotlight should target audience-session-enter-producer"
  );
  check(
    evidence?.palette?.producer?.spotlightTitle === "Enter Studio: Professional producer",
    "live desktop Quick Actions producer spotlight should name Enter Studio"
  );
  check(
    String(evidence?.palette?.producer?.searchMetricValue ?? "").includes("Enter Studio: Professional producer"),
    "live desktop Quick Actions producer search metric should target Enter Studio"
  );
  const producerResultTitle = String(evidence?.palette?.producer?.resultTitle ?? "");
  const producerResultStatus = String(evidence?.palette?.producer?.resultStatus ?? "");
  const producerResultMetric = String(evidence?.palette?.producer?.resultMetricValue ?? "");
  check(
    (producerResultStatus === "Entered" || producerResultStatus.includes("Studio")) &&
      (producerResultTitle === "Enter Studio: Professional producer" || producerResultTitle === "Professional producer route selected"),
    "live desktop Quick Actions producer command should execute with Entered result"
  );
  check(
    (producerResultMetric.includes("Enter Studio for professional producer") && producerResultMetric.includes("target Studio")) ||
      producerResultMetric.includes("Studio producer scan workflow"),
    "live desktop Quick Actions producer result should include professional producer route and Studio target"
  );
  check(
    String(evidence?.palette?.producer?.resultNextCheck ?? "").includes("Review Queue") &&
      String(evidence?.palette?.producer?.resultNextCheck ?? "").includes("Export Preflight"),
    "live desktop Quick Actions producer result should guide the next Review Queue / Export Preflight check"
  );
  check(
    evidence?.palette?.nextStepRail?.present === true &&
      evidence?.palette?.nextStepRail?.rowCount === 2 &&
      evidence?.palette?.nextStepRail?.beginnerButtonPresent === true &&
      evidence?.palette?.nextStepRail?.producerButtonPresent === true,
    "live desktop Audience Next Step rail should render two actionable audience rows"
  );
  check(
    String(evidence?.palette?.nextStepRail?.beginnerRoute ?? "").includes("First-time composer") &&
      String(evidence?.palette?.nextStepRail?.beginnerAction ?? "").includes("Guided") &&
      String(evidence?.palette?.nextStepRail?.beginnerFollowup ?? "").includes("First Beat Path") &&
      String(evidence?.palette?.nextStepRail?.beginnerFollowup ?? "").includes("Dual Audience Readiness"),
    "live desktop Audience Next Step rail should show the beginner guided route and follow-up"
  );
  check(
    String(evidence?.palette?.nextStepRail?.producerRoute ?? "").includes("Professional producer") &&
      String(evidence?.palette?.nextStepRail?.producerAction ?? "").includes("Studio") &&
      String(evidence?.palette?.nextStepRail?.producerFollowup ?? "").includes("Review Queue") &&
      String(evidence?.palette?.nextStepRail?.producerFollowup ?? "").includes("Handoff Package Check"),
    "live desktop Audience Next Step rail should show the professional producer studio route and follow-up"
  );
  check(
    evidence?.palette?.completionCheckpoints?.present === true &&
      evidence?.palette?.completionCheckpoints?.rowCount === 2,
    "live desktop Audience Completion Checkpoints should render two audience lanes"
  );
  check(
    String(evidence?.palette?.completionCheckpoints?.beginnerLane ?? "").includes("First-time composer") &&
      String(evidence?.palette?.completionCheckpoints?.beginnerMode ?? "").includes("Guided") &&
      String(evidence?.palette?.completionCheckpoints?.beginnerStarter ?? "").includes("First Beat Path") &&
      String(evidence?.palette?.completionCheckpoints?.beginnerDelivery ?? "").includes("Handoff Package Check"),
    "live desktop Audience Completion Checkpoints should show the beginner guided completion path"
  );
  check(
    String(evidence?.palette?.completionCheckpoints?.producerLane ?? "").includes("Professional producer") &&
      String(evidence?.palette?.completionCheckpoints?.producerMode ?? "").includes("Studio") &&
      String(evidence?.palette?.completionCheckpoints?.producerStarter ?? "").includes("Review Queue") &&
      String(evidence?.palette?.completionCheckpoints?.producerDelivery ?? "").includes("Production Snapshot") &&
      String(evidence?.palette?.completionCheckpoints?.producerDelivery ?? "").includes("Export Preflight"),
    "live desktop Audience Completion Checkpoints should show the professional producer delivery path"
  );
  check(
    evidence?.palette?.deliverySnapshot?.present === true && evidence?.palette?.deliverySnapshot?.rowCount === 2,
    "live desktop Audience Delivery Snapshot should render two audience delivery rows"
  );
  check(
    String(evidence?.palette?.deliverySnapshot?.beginnerLane ?? "").includes("First-time composer") &&
      String(evidence?.palette?.deliverySnapshot?.beginnerFocus ?? "").includes("first-beat") &&
      String(evidence?.palette?.deliverySnapshot?.beginnerDeliverables ?? "").includes("WAV") &&
      String(evidence?.palette?.deliverySnapshot?.beginnerDeliverables ?? "").includes("Handoff Sheet") &&
      String(evidence?.palette?.deliverySnapshot?.beginnerProof ?? "").includes("package reopen"),
    "live desktop Audience Delivery Snapshot should show the beginner local delivery proof path"
  );
  check(
    String(evidence?.palette?.deliverySnapshot?.producerLane ?? "").includes("Professional producer") &&
      String(evidence?.palette?.deliverySnapshot?.producerFocus ?? "").includes("handoff") &&
      String(evidence?.palette?.deliverySnapshot?.producerDeliverables ?? "").includes("stem") &&
      String(evidence?.palette?.deliverySnapshot?.producerHandoff ?? "").includes("Export Preflight") &&
      String(evidence?.palette?.deliverySnapshot?.producerProof ?? "").includes("persona delivery package"),
    "live desktop Audience Delivery Snapshot should show the professional producer handoff proof path"
  );
  check(
    evidence?.palette?.sessionAcceptance?.present === true && evidence?.palette?.sessionAcceptance?.rowCount === 2,
    "live desktop Audience Session Acceptance should render two audience acceptance rows"
  );
  check(
    String(evidence?.palette?.sessionAcceptance?.beginnerLane ?? "").includes("First-time composer") &&
      String(evidence?.palette?.sessionAcceptance?.beginnerTarget ?? "").includes("8-bar") &&
      String(evidence?.palette?.sessionAcceptance?.beginnerEvidence ?? "").includes("workflow") &&
      String(evidence?.palette?.sessionAcceptance?.beginnerProof ?? "").includes("WAV") &&
      String(evidence?.palette?.sessionAcceptance?.beginnerNext ?? "").includes("Export Preflight"),
    "live desktop Audience Session Acceptance should show the beginner finished-session path"
  );
  check(
    String(evidence?.palette?.sessionAcceptance?.producerLane ?? "").includes("Professional producer") &&
      String(evidence?.palette?.sessionAcceptance?.producerTarget ?? "").includes("handoff") &&
      String(evidence?.palette?.sessionAcceptance?.producerEvidence ?? "").includes("package") &&
      String(evidence?.palette?.sessionAcceptance?.producerProof ?? "").includes("receipt") &&
      String(evidence?.palette?.sessionAcceptance?.producerNext ?? "").includes("Handoff Package Check"),
    "live desktop Audience Session Acceptance should show the professional producer finished-session path"
  );
  check(
    evidence?.palette?.sessionProofHandoff?.present === true && evidence?.palette?.sessionProofHandoff?.rowCount === 2,
    "live desktop Audience Session Proof Handoff should render two audience proof handoff rows"
  );
  check(
    String(evidence?.palette?.sessionProofHandoff?.beginnerLane ?? "").includes("First-time composer") &&
      String(evidence?.palette?.sessionProofHandoff?.beginnerRoute ?? "").includes("Export Preflight") &&
      String(evidence?.palette?.sessionProofHandoff?.beginnerProof ?? "").includes("WAV") &&
      String(evidence?.palette?.sessionProofHandoff?.beginnerArtifact ?? "").includes("local delivery package") &&
      String(evidence?.palette?.sessionProofHandoff?.beginnerNext ?? "").includes("Export Preflight"),
    "live desktop Audience Session Proof Handoff should show the beginner export proof path"
  );
  check(
    String(evidence?.palette?.sessionProofHandoff?.producerLane ?? "").includes("Professional producer") &&
      String(evidence?.palette?.sessionProofHandoff?.producerRoute ?? "").includes("Handoff Package Check") &&
      String(evidence?.palette?.sessionProofHandoff?.producerProof ?? "").includes("send order") &&
      String(evidence?.palette?.sessionProofHandoff?.producerArtifact ?? "").includes("persona delivery package") &&
      String(evidence?.palette?.sessionProofHandoff?.producerNext ?? "").includes("Handoff Package Check"),
    "live desktop Audience Session Proof Handoff should show the professional producer receipt proof path"
  );
  check(
    evidence?.palette?.deliveryProofBridge?.present === true && evidence?.palette?.deliveryProofBridge?.rowCount === 2,
    "live desktop Audience Delivery Proof Bridge should render two audience proof rows"
  );
  check(
    String(evidence?.palette?.deliveryProofBridge?.beginnerLane ?? "").includes("First-time composer") &&
      String(evidence?.palette?.deliveryProofBridge?.beginnerStatus ?? "").includes("Beginner delivery proof") &&
      String(evidence?.palette?.deliveryProofBridge?.beginnerRoute ?? "").includes("Export Preflight") &&
      String(evidence?.palette?.deliveryProofBridge?.beginnerPackage ?? "").includes("local delivery package") &&
      String(evidence?.palette?.deliveryProofBridge?.beginnerNext ?? "").includes("WAV"),
    "live desktop Audience Delivery Proof Bridge should show the beginner package proof route"
  );
  check(
    String(evidence?.palette?.deliveryProofBridge?.producerLane ?? "").includes("Professional producer") &&
      String(evidence?.palette?.deliveryProofBridge?.producerStatus ?? "").includes("Producer delivery proof") &&
      String(evidence?.palette?.deliveryProofBridge?.producerRoute ?? "").includes("Handoff Package Check") &&
      String(evidence?.palette?.deliveryProofBridge?.producerPackage ?? "").includes("persona delivery package") &&
      String(evidence?.palette?.deliveryProofBridge?.producerNext ?? "").includes("send order"),
    "live desktop Audience Delivery Proof Bridge should show the professional producer receipt proof route"
  );
  check(
    evidence?.palette?.starterBeginner?.buttonPresent === true &&
      evidence?.palette?.starterBeginner?.followupPresent === true &&
      evidence?.palette?.starterBeginner?.actionPresent === true,
    "live desktop Audience Starter beginner visible button and Quick Action should be available"
  );
  check(
    String(evidence?.palette?.starterBeginner?.followupText ?? "").includes("First Beat Path") &&
      String(evidence?.palette?.starterBeginner?.resultMetricValue ?? "").includes("starter project") &&
      String(evidence?.palette?.starterBeginner?.resultMetricValue ?? "").includes("First-time composer") &&
      String(evidence?.palette?.starterBeginner?.resultMetricValue ?? "").includes("Guided"),
    "live desktop Audience Starter beginner should create a guided first-time composer starter project"
  );
  check(
    String(evidence?.palette?.starterBeginner?.resultNextCheck ?? "").includes("First Beat Path") &&
      String(evidence?.palette?.starterBeginner?.resultNextCheck ?? "").includes("Audience Completion Route"),
    "live desktop Audience Starter beginner result should guide First Beat Path and Audience Completion Route follow-up"
  );
  check(
    String(evidence?.palette?.starterBeginner?.visibleResultMetricValue ?? "").includes("starter project") &&
      String(evidence?.palette?.starterBeginner?.visibleResultMetricValue ?? "").includes("First-time composer"),
    "live desktop Audience Starter beginner should expose visible starter result metric feedback"
  );
  check(
    Number(evidence?.palette?.starterBeginner?.visibleFollowupActionCount ?? 0) >= 2 &&
      evidence?.palette?.starterBeginner?.visibleFollowupPrimaryPresent === true &&
      evidence?.palette?.starterBeginner?.visibleFollowupReadinessPresent === true &&
      String(evidence?.palette?.starterBeginner?.visibleFollowupActionLabels ?? "").includes("First Beat Path") &&
      String(evidence?.palette?.starterBeginner?.visibleFollowupActionLabels ?? "").includes("Dual Audience Readiness"),
    "live desktop Audience Starter beginner should expose First Beat Path and Dual Audience Readiness follow-up buttons"
  );
  check(
    String(evidence?.palette?.starterBeginner?.visibleFollowupPrimaryResult ?? "").includes("First Beat Path") &&
      String(evidence?.palette?.starterBeginner?.visibleFollowupReadinessResult ?? "").includes("Dual Audience Readiness"),
    "live desktop Audience Starter beginner follow-up buttons should route to First Beat Path and Dual Audience Readiness surfaces"
  );
  check(
    evidence?.palette?.starterProducer?.buttonPresent === true &&
      evidence?.palette?.starterProducer?.followupPresent === true &&
      evidence?.palette?.starterProducer?.actionPresent === true,
    "live desktop Audience Starter producer visible button and Quick Action should be available"
  );
  check(
    String(evidence?.palette?.starterProducer?.followupText ?? "").includes("Export Preflight") &&
      String(evidence?.palette?.starterProducer?.resultMetricValue ?? "").includes("starter project") &&
      String(evidence?.palette?.starterProducer?.resultMetricValue ?? "").includes("Professional producer") &&
      String(evidence?.palette?.starterProducer?.resultMetricValue ?? "").includes("Studio"),
    "live desktop Audience Starter producer should create a studio professional producer starter project"
  );
  check(
    String(evidence?.palette?.starterProducer?.resultNextCheck ?? "").includes("Review Queue") &&
      String(evidence?.palette?.starterProducer?.resultNextCheck ?? "").includes("Handoff Package Check"),
    "live desktop Audience Starter producer result should guide Review Queue and Handoff Package Check follow-up"
  );
  check(
    evidence?.palette?.starterProducer?.visibleResultPresent === true &&
      String(evidence?.palette?.starterProducer?.visibleResultStatus ?? "").includes("Applied") &&
      String(evidence?.palette?.starterProducer?.visibleResultTitle ?? "").includes("Professional producer") &&
      String(evidence?.palette?.starterProducer?.visibleResultMetricValue ?? "").includes("starter project") &&
      String(evidence?.palette?.starterProducer?.visibleResultMetricValue ?? "").includes("Professional producer") &&
      String(evidence?.palette?.starterProducer?.visibleResultMetricValue ?? "").includes("Studio"),
    "live desktop Audience Starter producer should expose visible starter result metric feedback"
  );
  check(
    String(evidence?.palette?.starterProducer?.visibleResultAudition ?? "").includes("professional producer starter") &&
      String(evidence?.palette?.starterProducer?.visibleResultNextCheck ?? "").includes("Review Queue") &&
      String(evidence?.palette?.starterProducer?.visibleResultNextCheck ?? "").includes("Handoff Package Check"),
    "live desktop Audience Starter producer visible result should expose audition and next-check feedback"
  );
  check(
    Number(evidence?.palette?.starterProducer?.visibleFollowupActionCount ?? 0) >= 3 &&
      evidence?.palette?.starterProducer?.visibleFollowupPrimaryPresent === true &&
      evidence?.palette?.starterProducer?.visibleFollowupReadinessPresent === true &&
      evidence?.palette?.starterProducer?.visibleFollowupCompletionPresent === true &&
      String(evidence?.palette?.starterProducer?.visibleFollowupActionLabels ?? "").includes("Review Queue") &&
      String(evidence?.palette?.starterProducer?.visibleFollowupActionLabels ?? "").includes("Export Preflight") &&
      String(evidence?.palette?.starterProducer?.visibleFollowupActionLabels ?? "").includes("Handoff Package Check"),
    "live desktop Audience Starter producer should expose Review Queue, Export Preflight, and Handoff Package Check follow-up buttons"
  );
  check(
    String(evidence?.palette?.starterProducer?.visibleFollowupPrimaryResult ?? "").includes("Review Queue") &&
      String(evidence?.palette?.starterProducer?.visibleFollowupReadinessResult ?? "").includes("Export Preflight") &&
      String(evidence?.palette?.starterProducer?.visibleFollowupCompletionResult ?? "").includes("Package"),
    "live desktop Audience Starter producer follow-up buttons should route to Review Queue, Export Preflight, and Handoff Package Check surfaces"
  );
  check(
    evidence?.commandReference?.opened === true &&
      evidence?.commandReference?.searchInputPresent === true &&
      evidence?.commandReference?.searchQuery === "audience starter",
    "live desktop Command Reference should open and search for Audience Starter"
  );
  check(
    evidence?.commandReference?.itemPresent === true &&
      evidence?.commandReference?.spotlightId === "command-audience-starter" &&
      evidence?.commandReference?.spotlightLabel === "Audience Starter",
    "live desktop Command Reference search should spotlight Audience Starter"
  );
  check(
    evidence?.commandReference?.targetHasAudienceTargets === true &&
      String(evidence?.commandReference?.targetText ?? "").includes("Build"),
    "live desktop Audience Starter Command Reference target should name both starter audiences"
  );
  check(
    evidence?.commandReference?.contextHasStarterCommands === true &&
      evidence?.commandReference?.contextHasFollowupRoutes === true &&
      String(evidence?.commandReference?.contextText ?? "").includes("First Beat Path") &&
      String(evidence?.commandReference?.contextText ?? "").includes("Review Queue") &&
      String(evidence?.commandReference?.contextText ?? "").includes("Handoff Package Check"),
    "live desktop Audience Starter Command Reference context should expose starter commands and follow-up routes"
  );
  check(
    evidence?.commandReference?.contextHasResultMetric === true &&
      evidence?.commandReference?.contextHasDirectComposition === true,
    "live desktop Audience Starter Command Reference context should expose result metrics and direct-composition posture"
  );
  check(
    evidence?.commandReference?.handoffButtonPresent === true &&
      evidence?.commandReference?.quickActionsOpenedAfterHandoff === true,
    "live desktop Audience Starter Command Reference spotlight should hand off to Quick Actions"
  );
  check(
    evidence?.palette?.routeBridge?.actionPresent === true,
    "live desktop Quick Actions palette should show Audience Route Bridge Readout"
  );
  check(
    evidence?.palette?.routeBridge?.spotlightAction === "audience-route-bridge-readout-action",
    "live desktop Quick Actions Audience Route Bridge spotlight should target audience-route-bridge-readout-action"
  );
  check(
    String(evidence?.palette?.routeBridge?.spotlightTitle ?? "").includes("Review Audience Route Bridge"),
    "live desktop Quick Actions Audience Route Bridge spotlight should name Audience Route Bridge"
  );
  check(
    String(evidence?.palette?.routeBridge?.resultMetricValue ?? "").includes("Audience Route Bridge Readout"),
    "live desktop Quick Actions Audience Route Bridge readout result should include the bridge readout"
  );
  check(
    evidence?.bridgeDirect?.readiness?.buttonPresent === true && evidence?.bridgeDirect?.readiness?.resultPresent === true,
    "live desktop Audience Route Bridge readiness button should show a direct result strip"
  );
  check(
    String(evidence?.bridgeDirect?.readiness?.resultTitle ?? "").includes("Opened readiness") &&
      String(evidence?.bridgeDirect?.readiness?.resultMetric ?? "").includes("Bridge Readiness Result"),
    "live desktop Audience Route Bridge readiness direct result should name the readiness action"
  );
  check(
    String(evidence?.bridgeDirect?.readiness?.resultDestination ?? "").includes("First Beat Path") ||
      String(evidence?.bridgeDirect?.readiness?.resultDestination ?? "").includes("Export Preflight") ||
      String(evidence?.bridgeDirect?.readiness?.resultDestination ?? "").includes("Production Snapshot"),
    "live desktop Audience Route Bridge readiness direct result should name the active readiness destination"
  );
  check(
    evidence?.bridgeDirect?.completion?.buttonPresent === true && evidence?.bridgeDirect?.completion?.resultPresent === true,
    "live desktop Audience Route Bridge completion button should show a direct result strip"
  );
  check(
    String(evidence?.bridgeDirect?.completion?.resultTitle ?? "").includes("Opened completion") &&
      String(evidence?.bridgeDirect?.completion?.resultMetric ?? "").includes("Bridge Completion Result"),
    "live desktop Audience Route Bridge completion direct result should name the completion action"
  );
  check(
    String(evidence?.bridgeDirect?.completion?.resultDestination ?? "").includes("First Beat Path") ||
      String(evidence?.bridgeDirect?.completion?.resultDestination ?? "").includes("Export Preflight") ||
      String(evidence?.bridgeDirect?.completion?.resultDestination ?? "").includes("Production Snapshot") ||
      String(evidence?.bridgeDirect?.completion?.resultDestination ?? "").includes("Handoff Package Check"),
    "live desktop Audience Route Bridge completion direct result should name the active completion destination"
  );
  check(
    evidence?.palette?.routeBridgeReadiness?.actionPresent === true &&
      String(evidence?.palette?.routeBridgeReadiness?.resultMetricValue ?? "").includes("Bridge readiness lane"),
    "live desktop Quick Actions Audience Route Bridge readiness should execute with readiness lane evidence"
  );
  check(
    String(evidence?.palette?.routeBridgeReadiness?.resultNextCheck ?? "").includes("First Beat Path") ||
      String(evidence?.palette?.routeBridgeReadiness?.resultNextCheck ?? "").includes("Export Preflight") ||
      String(evidence?.palette?.routeBridgeReadiness?.resultNextCheck ?? "").includes("Production Snapshot"),
    "live desktop Quick Actions Audience Route Bridge readiness should guide the next active readiness check"
  );
  check(
    evidence?.palette?.routeBridgeCompletion?.actionPresent === true &&
      String(evidence?.palette?.routeBridgeCompletion?.resultMetricValue ?? "").includes("Bridge completion lane"),
    "live desktop Quick Actions Audience Route Bridge completion should execute with completion lane evidence"
  );
  check(
    String(evidence?.palette?.routeBridgeCompletion?.resultNextCheck ?? "").includes("First Beat Path") ||
      String(evidence?.palette?.routeBridgeCompletion?.resultNextCheck ?? "").includes("Export Preflight") ||
      String(evidence?.palette?.routeBridgeCompletion?.resultNextCheck ?? "").includes("Production Snapshot") ||
      String(evidence?.palette?.routeBridgeCompletion?.resultNextCheck ?? "").includes("Handoff Package Check"),
    "live desktop Quick Actions Audience Route Bridge completion should guide the next active completion check"
  );
  check(
    evidence?.palette?.dualReadout?.actionPresent === true,
    "live desktop Quick Actions palette should show Dual Audience Readiness Route Readout"
  );
  check(
    evidence?.palette?.dualReadout?.spotlightAction === "dual-audience-readiness-route-readout-action",
    "live desktop Quick Actions Dual Audience spotlight should target dual-audience-readiness-route-readout-action"
  );
  check(
    String(evidence?.palette?.dualReadout?.spotlightTitle ?? "").includes("Review Dual Audience Readiness"),
    "live desktop Quick Actions Dual Audience spotlight should name Dual Audience Readiness"
  );
  check(
    String(evidence?.palette?.dualReadout?.resultMetricValue ?? "").includes("Dual Audience Readiness Route Readout"),
    "live desktop Quick Actions Dual Audience readout result should include the route readout"
  );
  check(
    evidence?.palette?.dualBeginner?.actionPresent === true &&
      String(evidence?.palette?.dualBeginner?.resultMetricValue ?? "").includes("First-time composer lane"),
    "live desktop Quick Actions Dual Audience beginner lane should execute with first-time composer lane evidence"
  );
  check(
    String(evidence?.palette?.dualBeginner?.resultNextCheck ?? "").includes("First Beat Path"),
    "live desktop Quick Actions Dual Audience beginner lane should guide the next First Beat Path check"
  );
  check(
    evidence?.palette?.dualProducer?.actionPresent === true &&
      String(evidence?.palette?.dualProducer?.resultMetricValue ?? "").includes("Professional producer lane"),
    "live desktop Quick Actions Dual Audience producer lane should execute with professional producer lane evidence"
  );
  check(
    String(evidence?.palette?.dualProducer?.resultNextCheck ?? "").includes("Export Preflight") ||
      String(evidence?.palette?.dualProducer?.resultNextCheck ?? "").includes("Production Snapshot"),
    "live desktop Quick Actions Dual Audience producer lane should guide the next producer delivery check"
  );
  check(
    evidence?.palette?.completionReadout?.actionPresent === true,
    "live desktop Quick Actions palette should show Audience Completion Route Readout"
  );
  check(
    evidence?.palette?.completionReadout?.spotlightAction === "audience-completion-route-readout-action",
    "live desktop Quick Actions Audience Completion spotlight should target audience-completion-route-readout-action"
  );
  check(
    String(evidence?.palette?.completionReadout?.spotlightTitle ?? "").includes("Review Audience Completion Route"),
    "live desktop Quick Actions Audience Completion spotlight should name Audience Completion Route"
  );
  check(
    String(evidence?.palette?.completionReadout?.resultMetricValue ?? "").includes("Audience Completion Route Readout"),
    "live desktop Quick Actions Audience Completion readout result should include the route readout"
  );
  check(
    evidence?.palette?.completionBeginner?.actionPresent === true &&
      String(evidence?.palette?.completionBeginner?.resultMetricValue ?? "").includes("First-time composer completion"),
    "live desktop Quick Actions Audience Completion beginner lane should execute with first-time composer completion evidence"
  );
  check(
    String(evidence?.palette?.completionBeginner?.resultNextCheck ?? "").includes("First Beat Path") ||
      String(evidence?.palette?.completionBeginner?.resultNextCheck ?? "").includes("Export Preflight") ||
      String(evidence?.palette?.completionBeginner?.resultNextCheck ?? "").includes("Handoff Package Check"),
    "live desktop Quick Actions Audience Completion beginner lane should guide the next beginner completion check"
  );
  check(
    evidence?.palette?.completionProducer?.actionPresent === true &&
      String(evidence?.palette?.completionProducer?.resultMetricValue ?? "").includes("Professional producer completion"),
    "live desktop Quick Actions Audience Completion producer lane should execute with professional producer completion evidence"
  );
  check(
    String(evidence?.palette?.completionProducer?.resultNextCheck ?? "").includes("Production Snapshot") ||
      String(evidence?.palette?.completionProducer?.resultNextCheck ?? "").includes("Export Preflight") ||
      String(evidence?.palette?.completionProducer?.resultNextCheck ?? "").includes("Handoff Package Check"),
    "live desktop Quick Actions Audience Completion producer lane should guide the next producer completion check"
  );
  check(
    evidence?.palette?.sessionAcceptanceReadout?.actionPresent === true &&
      evidence?.palette?.sessionAcceptanceReadout?.spotlightAction === "audience-session-acceptance-readout-action" &&
      String(evidence?.palette?.sessionAcceptanceReadout?.spotlightTitle ?? "").includes("Review Audience Session Acceptance"),
    "live desktop Quick Actions palette should show Audience Session Acceptance Readout"
  );
  check(
    String(evidence?.palette?.sessionAcceptanceReadout?.resultMetricValue ?? "").includes("Audience Session Acceptance Readout"),
    "live desktop Quick Actions Audience Session Acceptance readout result should include the acceptance readout"
  );
  check(
    evidence?.palette?.sessionAcceptanceBeginner?.actionPresent === true &&
      String(evidence?.palette?.sessionAcceptanceBeginner?.resultMetricValue ?? "").includes("First-time composer acceptance") &&
      String(evidence?.palette?.sessionAcceptanceBeginner?.resultNextCheck ?? "").includes("Export Preflight"),
    "live desktop Quick Actions Audience Session Acceptance beginner lane should execute with Export Preflight evidence"
  );
  check(
    evidence?.palette?.sessionAcceptanceProducer?.actionPresent === true &&
      String(evidence?.palette?.sessionAcceptanceProducer?.resultMetricValue ?? "").includes("Professional producer acceptance") &&
      String(evidence?.palette?.sessionAcceptanceProducer?.resultNextCheck ?? "").includes("Handoff Package Check"),
    "live desktop Quick Actions Audience Session Acceptance producer lane should execute with Handoff Package Check evidence"
  );
  check(
    evidence?.palette?.sessionProofReadout?.actionPresent === true &&
      evidence?.palette?.sessionProofReadout?.spotlightAction === "audience-session-proof-handoff-readout-action" &&
      String(evidence?.palette?.sessionProofReadout?.spotlightTitle ?? "").includes("Review Audience Session Proof Handoff"),
    "live desktop Quick Actions palette should show Audience Session Proof Handoff Readout"
  );
  check(
    String(evidence?.palette?.sessionProofReadout?.resultMetricValue ?? "").includes("Audience Session Proof Handoff Readout"),
    "live desktop Quick Actions Audience Session Proof Handoff readout result should include the handoff readout"
  );
  check(
    evidence?.palette?.sessionProofBeginner?.actionPresent === true &&
      String(evidence?.palette?.sessionProofBeginner?.resultMetricValue ?? "").includes("First-time composer session proof") &&
      String(evidence?.palette?.sessionProofBeginner?.resultNextCheck ?? "").includes("Export Preflight"),
    "live desktop Quick Actions Audience Session Proof Handoff beginner lane should execute with Export Preflight evidence"
  );
  check(
    evidence?.palette?.sessionProofProducer?.actionPresent === true &&
      String(evidence?.palette?.sessionProofProducer?.resultMetricValue ?? "").includes("Professional producer session proof") &&
      String(evidence?.palette?.sessionProofProducer?.resultNextCheck ?? "").includes("Handoff Package Check"),
    "live desktop Quick Actions Audience Session Proof Handoff producer lane should execute with Handoff Package Check evidence"
  );
  check(
    evidence?.palette?.deliveryProofReadout?.actionPresent === true &&
      evidence?.palette?.deliveryProofReadout?.spotlightAction === "audience-delivery-proof-bridge-readout-action" &&
      String(evidence?.palette?.deliveryProofReadout?.spotlightTitle ?? "").includes("Review Audience Delivery Proof Bridge"),
    "live desktop Quick Actions palette should show Audience Delivery Proof Bridge Readout"
  );
  check(
    String(evidence?.palette?.deliveryProofReadout?.resultMetricValue ?? "").includes("Audience Delivery Proof Bridge Readout"),
    "live desktop Quick Actions Audience Delivery Proof Bridge readout result should include the bridge readout"
  );
  check(
    evidence?.palette?.deliveryProofBeginner?.actionPresent === true &&
      String(evidence?.palette?.deliveryProofBeginner?.resultMetricValue ?? "").includes("First-time composer delivery proof") &&
      String(evidence?.palette?.deliveryProofBeginner?.resultNextCheck ?? "").includes("Export Preflight"),
    "live desktop Quick Actions Audience Delivery Proof Bridge beginner lane should execute with Export Preflight evidence"
  );
  check(
    evidence?.palette?.deliveryProofProducer?.actionPresent === true &&
      String(evidence?.palette?.deliveryProofProducer?.resultMetricValue ?? "").includes("Professional producer delivery proof") &&
      String(evidence?.palette?.deliveryProofProducer?.resultNextCheck ?? "").includes("Handoff Package Check"),
    "live desktop Quick Actions Audience Delivery Proof Bridge producer lane should execute with Handoff Package Check evidence"
  );

  const visual = evidence?.visual;
  check(visual && typeof visual === "object", "live desktop launch smoke should include screenshot visual evidence");
  check(visual?.width >= 1180 && visual?.height >= 760, "live desktop screenshot should respect minimum viewport dimensions");
  check(visual?.pngBytes > 50000, "live desktop screenshot PNG should be substantial");
  check(visual?.bitmapBytes >= visual?.width * visual?.height * 4, "live desktop screenshot should include full RGBA bitmap bytes");
  check(visual?.sampledPixels >= 1000, "live desktop screenshot should sample enough pixels");
  check(visual?.opaqueSamples / visual?.sampledPixels >= 0.95, "live desktop screenshot should be mostly opaque");
  check(visual?.uniqueSampledColors >= 24, "live desktop screenshot should have visible color diversity");
  check(visual?.nonBackgroundSamples / visual?.sampledPixels >= 0.04, "live desktop screenshot should contain non-background UI pixels");
  check(visual?.maxColorDelta >= 48, "live desktop screenshot should have visible contrast");
  check(visual?.brightSamples >= 20 && visual?.darkSamples >= 20, "live desktop screenshot should contain both bright and dark UI samples");
}

function resolveElectronBinary() {
  try {
    const resolvedElectron = require("electron");
    if (typeof resolvedElectron === "string" && existsSync(resolvedElectron)) {
      return resolvedElectron;
    }
  } catch {
    // Fall through to the local bin fallback below.
  }

  const localBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "electron.cmd" : "electron");
  return existsSync(localBin) ? localBin : null;
}

checkBuiltArtifacts();
if (failures.length > 0) {
  fail("Built artifact preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const electronBin = resolveElectronBinary();
if (!electronBin) {
  fail("Electron binary is missing; run npm install first.");
}

const blockDetails = macGuiLaunchBlockDetails("npm run desktop:launch-smoke");
if (blockDetails) {
  fail("Refusing to start Electron in a restricted macOS GUI context.", blockDetails);
}

const env = {
  ...process.env,
  GROOVEFORGE_DESKTOP_LAUNCH_SMOKE: "1",
  NO_COLOR: "1"
};
delete env.ELECTRON_RUN_AS_NODE;
delete env.VITE_DEV_SERVER_URL;

const child = spawn(electronBin, ["."], {
  cwd: root,
  env,
  stdio: ["ignore", "pipe", "pipe"]
});

let stdout = "";
let stderr = "";
let settled = false;

const timeout = setTimeout(() => {
  if (settled) {
    return;
  }
  settled = true;
  child.kill("SIGTERM");
  fail("Timed out waiting for Electron launch smoke to exit.", `${stdout}\n${stderr}`);
}, timeoutMs);

child.stdout.setEncoding("utf8");
child.stderr.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  stdout += chunk;
});
child.stderr.on("data", (chunk) => {
  stderr += chunk;
});

child.on("error", (error) => {
  if (settled) {
    return;
  }
  settled = true;
  clearTimeout(timeout);
  fail(`Could not start Electron: ${error.message}`);
});

child.on("exit", (code, signal) => {
  if (settled) {
    return;
  }
  settled = true;
  clearTimeout(timeout);

  const combinedOutput = `${stdout}\n${stderr}`;
  const result = parseSmokeResult(combinedOutput);
  if (!result) {
    fail(
      `Electron exited without a launch smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
      macGuiLaunchAbortDetails("npm run desktop:launch-smoke", { code, signal, output: combinedOutput })
    );
  }

  if (code !== 0 || result.ok !== true) {
    const details = typeof result === "object" ? JSON.stringify(result, null, 2) : combinedOutput;
    fail(`Electron launch smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`, details);
  }

  checkResult(result);
  if (failures.length > 0) {
    fail("Launch smoke evidence validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  console.log("GrooveForge desktop launch smoke passed.");
  console.log("- Scope: live production Electron app process, hidden BrowserWindow, preload bridge, mounted React renderer, and first-run workstation DOM");
  console.log(
    `- Renderer: ${result.evidence.title}, ${result.evidence.viewport.width}x${result.evidence.viewport.height}, ${result.evidence.bodyTextLength} text characters, ${Object.keys(
      result.evidence.testIds
    ).length} required test ids`
  );
  console.log(
    `- Compose-first layout: Guide ${result.evidence.layout.guidanceCenterOpen ? "open" : "collapsed"}, Pattern Lab ${result.evidence.layout.patternLabOpen ? "open" : "collapsed"}, feedback outside guide ${result.evidence.layout.feedbackOutsideGuidance ? "yes" : "no"}, step grid after lab ${result.evidence.layout.stepGridAfterPatternLab ? "yes" : "no"}`
  );
  console.log(
    `- Guide Quick Start: decision direct ${result.evidence.layout.guideQuickStartDecisionVisible ? "yes" : "no"}, progress compact ${!result.evidence.layout.guideQuickStartDetailsOpen && result.evidence.layout.guideQuickStartDetailsContentHidden ? "yes" : "no"}, native open/close ${result.evidence.layout.guideQuickStartDetailsInteractionReady ? "yes" : "no"}`
  );
  console.log(`- Quick Actions graph: on-demand module ${result.evidence.layout.quickActionGraphReady ? "ready" : "not ready"}`);
  console.log(
    `- Audience Session: actions direct ${result.evidence.layout.audienceSessionActionsDirectVisible ? "yes" : "no"}, proof compact ${!result.evidence.layout.audienceSessionProofOpen && result.evidence.layout.audienceSessionProofContentHidden ? "yes" : "no"}, native open/close ${result.evidence.layout.audienceSessionProofInteractionReady ? "yes" : "no"}, proof rows ${result.evidence.layout.audienceSessionProofRowsPreserved ? "10/10" : "missing"}`
  );
  console.log(
    `- Workspace navigation: outside Guide ${result.evidence.layout.workflowNavigatorOutsideGuidance ? "yes" : "no"}, before workstation ${result.evidence.layout.workflowNavigatorBeforeWorkspace ? "yes" : "no"}, sticky ${result.evidence.layout.workflowNavigatorSticky ? "yes" : "no"}, Compose/Deliver jumps ${result.evidence.layout.workflowNavigatorComposeJumpReady && result.evidence.layout.workflowNavigatorDeliverJumpReady ? "yes" : "no"}, stages ${result.evidence.layout.workflowNavigatorStageCount}`
  );
  console.log(
    `- Transport essentials: Play direct ${result.evidence.layout.transportPlayDirectVisible ? "yes" : "no"}, Save direct ${result.evidence.layout.transportSaveDirectVisible ? "yes" : "no"}, Guided helpers ${result.evidence.layout.transportSessionOpen || result.evidence.layout.transportExportsOpen ? "open" : "collapsed"}, Studio auto-expand ${result.evidence.palette.transportTools.studioSessionOpen && result.evidence.palette.transportTools.studioExportsOpen ? "yes" : "no"}`
  );
  console.log(
    `- Shortcut discovery: essential metadata ${result.evidence.layout.essentialShortcutMetadataReady ? "yes" : "no"}, tooltip hints ${result.evidence.layout.essentialShortcutTitlesReady ? "yes" : "no"}, Pattern 1/2/3 ${result.evidence.layout.patternShortcutMetadataReady ? "yes" : "no"}, Play state ${result.evidence.layout.playPressedStateReady ? "yes" : "no"}`
  );
  console.log(
    `- Launchpad lifecycle: initial ${result.evidence.layout.launchpadOpen ? "open" : "collapsed"}, starter collapse ${result.evidence.palette.launchpad.collapsedAfterStarter ? "yes" : "no"}, manual reopen/close ${result.evidence.palette.launchpad.manualReopen && result.evidence.palette.launchpad.manualClose ? "yes" : "no"}`
  );
  console.log(
    `- Compact transport: ${result.evidence.layout.compactTransportHeight}px header, horizontal audience choices, setup top-aligned, Workflow Navigator starts at ${result.evidence.layout.initialNavigatorTop}px`
  );
  console.log(
    `- Minimum window: ${result.evidence.layout.minimumWindowViewportWidth}px viewport, ${result.evidence.layout.minimumWindowTransportHeight}px header, ${result.evidence.layout.minimumWindowHorizontalOverflow}px horizontal overflow, all direct actions visible`
  );
  console.log(
    `- Minimum Studio transport: ${result.evidence.layout.minimumWindowStudioCompactHeight}px compact vs ${result.evidence.layout.minimumWindowStudioExpandedHeight}px manual expansion, wide auto-expand and resize collapse ready`
  );
  console.log("- Modal focus: Quick Actions and Command Reference search entry, Tab/Shift+Tab wrap, Escape restore, and cross-dialog handoff ready");
  console.log(
    `- Workspace command dock: conditional show/hide ready, ${result.evidence.modalFocus.dockControlCount} controls, focusable with native Play and Actions, viewport contained`
  );
  console.log(
    `- Quick Actions keyboard selection: arrows/Home/End retained search focus; Enter ran ${result.evidence.modalFocus.quickKeyboardSelectedTitle}`
  );
  console.log("- Drum grid keyboard: 64 pressed-state buttons, one roving Tab stop, bounded navigation, Enter/Space toggles, playback guard, and Undo ready");
  console.log("- Closed disclosures: 24 panels, zero closed content/Tab leaks, native Enter reopen/reclose, and unchanged project posture ready");
  console.log("- Note-grid keyboard: one 808 and one Synth Tab stop, native spatial navigation, Enter/Space toggles, playback guard, and Undo ready");
  console.log("- Starter landing: beginner Pattern editor focused/visible; producer Review Queue opened/focused/visible");
  console.log("- Swing Feel pads: five dark-theme controls, pressed semantics ready, one selected target");
  console.log(
    `- Button theme foundation: ${result.evidence.layout.buttonThemeRepresentativeCount} representative inherited controls, ${result.evidence.layout.buttonThemeNativeSurfaceCount} native surfaces, disabled and specialist states preserved`
  );
  console.log(
    `- Note-editor-first layout: Capture & Ideas ${result.evidence.layout.captureIdeasOpen ? "open" : "collapsed"}, auto-reveal ${result.evidence.palette.captureIdeas.autoReveal ? "yes" : "no"}, note grids after capture ${result.evidence.layout.noteLanesAfterCaptureIdeas ? "yes" : "no"}`
  );
  console.log(
    `- Instrument-first layout: chord events before harmony ${result.evidence.layout.chordEventsBeforeHarmonyMoves ? "yes" : "no"}, selected editor ${result.evidence.layout.chordExpandedCardCount}/${result.evidence.layout.chordCardCount} open, compact peers ${result.evidence.layout.chordCompactCardCount}, Guided tools ${result.evidence.layout.harmonyMovesOpen || result.evidence.layout.soundDesignOpen ? "open" : "collapsed"}, Studio auto-expand ${result.evidence.palette.instrumentTools.studioHarmonyOpen && result.evidence.palette.instrumentTools.studioSoundOpen ? "yes" : "no"}`
  );
  console.log(
    `- Arrangement-first layout: timeline before editor ${result.evidence.layout.arrangementTimelineBeforeEditor ? "yes" : "no"}, labeled block groups ${result.evidence.layout.arrangementPatternControlsVisible && result.evidence.layout.arrangementTrackStateControlsVisible && result.evidence.layout.arrangementShapeControlsVisible ? "yes" : "no"}, essential edits before moves ${result.evidence.layout.arrangementEssentialBeforeBlockMoves ? "yes" : "no"}, Guided tools ${result.evidence.layout.blockMovesOpen || result.evidence.layout.arrangementToolsOpen ? "open" : "collapsed"}, Studio auto-expand ${result.evidence.palette.arrangementTools.studioBlockMovesOpen && result.evidence.palette.arrangementTools.studioArrangementOpen ? "yes" : "no"}`
  );
  console.log(
    `- Mixer-first layout: strips before moves ${result.evidence.layout.mixerStripsBeforeMixMoves ? "yes" : "no"}, basic balance before processing ${result.evidence.layout.mixerBasicBalanceBeforeProcessing ? "yes" : "no"}, Guided tools ${result.evidence.layout.mixerProcessingOpen || result.evidence.layout.mixMovesOpen || result.evidence.layout.mixReviewOpen ? "open" : "collapsed"}, Studio auto-expand ${result.evidence.palette.mixerTools.studioProcessingOpen && result.evidence.palette.mixerTools.studioMixMovesOpen && result.evidence.palette.mixerTools.studioMixReviewOpen ? "yes" : "no"}`
  );
  console.log(
    `- Master-first layout: output before helpers ${result.evidence.layout.masterControlsBeforePolish ? "yes" : "no"}, precise ceiling bounds ${result.evidence.layout.masterCeilingBoundsReady ? "yes" : "no"}, diagnostics compact ${!result.evidence.palette.masterTools.studioMasterReviewQueueOpen && !result.evidence.palette.masterTools.studioMasterMixCoachOpen ? "yes" : "no"}, routed reveal ${result.evidence.palette.masterTools.routedMasterReviewQueueOpen && result.evidence.palette.masterTools.routedMasterMixCoachOpen ? "yes" : "no"}, Studio outer auto-expand ${result.evidence.palette.masterTools.studioMasterPolishOpen && result.evidence.palette.masterTools.studioMasterReviewOpen ? "yes" : "no"}`
  );
  console.log(
    `- Delivery-first layout: visible outside Guide ${result.evidence.layout.deliveryOutsideGuidance && result.evidence.layout.deliveryDirectVisible ? "yes" : "no"}, direct actions before proof ${result.evidence.layout.deliveryDirectBeforeStatus ? "yes" : "no"}, Guided proof ${result.evidence.layout.deliveryStatusOpen || result.evidence.layout.deliveryAuditOpen ? "open" : "collapsed"}, Studio auto-expand ${result.evidence.palette.deliveryTools.studioStatusOpen && result.evidence.palette.deliveryTools.studioAuditOpen ? "yes" : "no"}`
  );
  console.log(
    `- Visual: ${result.evidence.visual.width}x${result.evidence.visual.height}, ${result.evidence.visual.pngBytes} PNG bytes, ${result.evidence.visual.uniqueSampledColors} sampled colors, ${result.evidence.visual.nonBackgroundSamples}/${result.evidence.visual.sampledPixels} non-background samples`
  );
  console.log("- Audience session rows: First-time composer, Professional producer");
  console.log("- Audience next-step rail: visible beginner and professional producer action rows passed");
  console.log("- Audience completion checkpoints: visible beginner and professional producer completion paths passed");
  console.log("- Audience delivery snapshot: visible beginner and professional producer delivery proof rows passed");
  console.log("- Audience Session Acceptance: visible beginner/professional producer acceptance rows plus Quick Actions route and lane evidence passed");
  console.log("- Audience Session Proof Handoff: visible beginner/professional producer proof handoff rows plus Quick Actions route and lane evidence passed");
  console.log("- Audience session Quick Actions: renderer palette search and run evidence passed for Enter Guided and Enter Studio");
  console.log("- Audience Starter controls: visible beginner and producer starter creation evidence passed");
  console.log("- Audience Starter Command Reference: live search, row context, and Quick Actions handoff evidence passed");
  console.log("- Audience Route Bridge Quick Actions: readout, readiness, completion, and direct button result evidence passed");
  console.log(
    "- Dual Audience Readiness Quick Actions: route readout, first-time composer lane, and professional producer lane search/run evidence passed"
  );
  console.log(
    "- Audience Completion Route Quick Actions: route readout, first-time composer completion, and professional producer completion search/run evidence passed"
  );
  console.log(
    "- Audience Delivery Proof Bridge: visible beginner/professional producer proof rows plus Quick Actions route and lane evidence passed"
  );
  console.log(
    "- Beginner path: Audience Session Readout, Audience Route Bridge, Dual Audience Readiness, Audience Completion Route, Audience Session Acceptance, Audience Session Proof Handoff, Audience Delivery Proof Bridge, Enter Guided, Guide Quick Start, First Beat Path, Beat Spine, Composer Guide, Workflow Navigator"
  );
  console.log(
    "- Producer path: Audience Session Readout, Audience Route Bridge, Dual Audience Readiness, Audience Completion Route, Audience Session Acceptance, Audience Session Proof Handoff, Audience Delivery Proof Bridge, Enter Studio, Studio mode, Review Queue, Production Snapshot, Mix Coach, Handoff Pack, Quick Actions, Command Reference"
  );
  console.log("- Workstation path: transport, compose, sound, arrange, mix, master, export controls, Handoff Pack");
});
