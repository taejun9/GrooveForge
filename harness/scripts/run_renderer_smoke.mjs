#!/usr/bin/env node

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function checkIncludes(text, needle, label) {
  check(text.includes(needle), `${label} should include ${needle}`);
}

function checkExcludes(text, needle, label) {
  check(!text.toLowerCase().includes(needle.toLowerCase()), `${label} should not include ${needle}`);
}

function installBrowserMocks() {
  const storage = new Map();
  const localStorage = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    }
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener() {},
      clearTimeout,
      grooveforge: { appKind: "desktop" },
      localStorage,
      removeEventListener() {},
      setTimeout
    }
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {}
  });
}

function validateFirstRunRenderer(html) {
  check(html.length > 250000, `first-run renderer output should be substantial, got ${html.length} characters`);
  const quickStartIndex = html.indexOf('data-testid="guide-quick-start"');
  const guidanceCenterIndex = html.indexOf('data-testid="guidance-center"');
  const feedbackAnchorIndex = html.indexOf('data-testid="workspace-feedback-anchor"');
  const workflowNavigatorIndex = html.indexOf('data-testid="workflow-navigator"');
  const workspaceIndex = html.indexOf('class="workspace-grid"');
  check(
    quickStartIndex >= 0 &&
      guidanceCenterIndex > quickStartIndex &&
      feedbackAnchorIndex > guidanceCenterIndex &&
      workflowNavigatorIndex > feedbackAnchorIndex &&
      workspaceIndex > workflowNavigatorIndex,
    "first-run hierarchy should keep Guide Quick Start, on-demand guidance, global feedback, visible workflow navigation, and core workspace in order"
  );
  check(
    ['compose', 'arrange', 'mix', 'deliver'].every((zone) =>
      html.includes(`data-testid="workflow-jump-${zone}"`)
    ),
    "Workflow Navigator should expose Compose, Arrange, Mix, and Deliver stage actions"
  );
  check(
    !html.includes('<details class="guidance-center" data-testid="guidance-center" open="">'),
    "Guide & Review Center should be collapsed by default so the core workspace remains close to first-run controls"
  );
  check(
    html.includes('<details class="first-run-launchpad" data-testid="first-run-launchpad" open="">') &&
      html.includes('data-testid="first-run-launchpad-toggle"') &&
      html.includes('data-testid="first-run-launchpad-content"') &&
      html.includes('data-testid="first-run-start-beat"') &&
      html.includes('data-testid="first-run-producer-pass"') &&
      html.includes('data-testid="first-run-open-project"'),
    "first-run launchpad should start open with beginner, producer, and existing-project choices plus a persistent toggle"
  );
  const transportBandIndex = html.indexOf('data-testid="workflow-target-transport"');
  const transportStatusControlsIndex = html.indexOf('data-testid="transport-status-controls"');
  const transportEssentialsIndex = html.indexOf('data-testid="transport-essential-controls"');
  const transportPlayIndex = html.indexOf('data-testid="transport-play"');
  const projectEssentialsIndex = html.indexOf('data-testid="project-essential-controls"');
  const projectSaveIndex = html.indexOf('data-testid="project-save"');
  const transportSessionIndex = html.indexOf('data-testid="transport-session-tools"');
  const transportExportsIndex = html.indexOf('data-testid="transport-export-tools"');
  const exportWavIndex = html.indexOf('data-testid="export-wav"');
  check(
    transportBandIndex >= 0 &&
      transportStatusControlsIndex > transportBandIndex &&
      transportEssentialsIndex > transportStatusControlsIndex &&
      transportPlayIndex > transportEssentialsIndex &&
      projectEssentialsIndex > transportPlayIndex &&
      projectSaveIndex > projectEssentialsIndex &&
      transportSessionIndex > projectSaveIndex &&
      transportExportsIndex > transportSessionIndex &&
      exportWavIndex > transportExportsIndex,
    "Transport hierarchy should keep status, direct transport, direct project safety, Session Context, and Exports in order"
  );
  check(
    !html.includes('<details class="transport-session-tools" data-testid="transport-session-tools" open="">') &&
      !html.includes('<details class="transport-export-tools" data-testid="transport-export-tools" open="">'),
    "Guided first render should keep Session Context and Exports collapsed"
  );
  const patternPlaybackIndex = html.indexOf('data-testid="pattern-playback-readout"');
  const patternLabIndex = html.indexOf('data-testid="pattern-lab"');
  const drumGridIndex = html.indexOf('class="step-grid"');
  check(
    patternPlaybackIndex >= 0 && patternLabIndex > patternPlaybackIndex && drumGridIndex > patternLabIndex,
    "drum editor hierarchy should keep playback context, the on-demand Pattern Lab, and the 16-step grid in order"
  );
  check(
    !html.includes('<details class="pattern-lab" data-testid="pattern-lab" open="">'),
    "Pattern Lab should be collapsed by default so direct drum programming remains primary"
  );
  const noteEditorIndex = html.indexOf('data-testid="note-editor-panel"');
  const captureIdeasIndex = html.indexOf('data-testid="capture-ideas"');
  const noteLanesIndex = html.indexOf('class="note-lanes"');
  check(
    noteEditorIndex >= 0 && captureIdeasIndex > noteEditorIndex && noteLanesIndex > captureIdeasIndex,
    "note editor hierarchy should keep the Capture & Ideas disclosure immediately before the direct note grids"
  );
  check(
    !html.includes('<details class="capture-ideas" data-testid="capture-ideas" open="">'),
    "Capture & Ideas should be collapsed by default so direct 808 and melody editing remains primary"
  );
  const instrumentPanelIndex = html.indexOf('data-testid="workflow-target-sound"');
  const directChordsIndex = html.indexOf('data-testid="instrument-direct-chords"');
  const chordEventGridIndex = html.indexOf('data-testid="chord-event-grid"');
  const harmonyMovesIndex = html.indexOf('data-testid="harmony-moves"');
  const soundDesignIndex = html.indexOf('data-testid="sound-design-tools"');
  check(
    instrumentPanelIndex >= 0 &&
      directChordsIndex > instrumentPanelIndex &&
      chordEventGridIndex > directChordsIndex &&
      harmonyMovesIndex > chordEventGridIndex &&
      soundDesignIndex > harmonyMovesIndex,
    "Instrument hierarchy should keep direct chord events before Harmony Moves and Sound Design"
  );
  check(
    !html.includes('<details class="harmony-moves" data-testid="harmony-moves" open="">') &&
      !html.includes('<details class="instrument-tools" data-testid="sound-design-tools" open="">'),
    "Guided first render should keep Harmony Moves and Sound Design collapsed"
  );
  const expandedChordCardCount = html.match(/data-editor-open="true"/g)?.length ?? 0;
  const compactChordCardCount = html.match(/data-editor-open="false"/g)?.length ?? 0;
  check(
    expandedChordCardCount === 1 &&
      compactChordCardCount >= 1 &&
      html.includes('data-testid="chord-summary-0"') &&
      html.includes('data-testid="chord-event-editor-0"') &&
      html.includes("Select to edit") &&
      html.includes("Editing"),
    "Chord event cards should keep exactly one selected editor expanded while peers remain compact and scannable"
  );
  const arrangementPanelIndex = html.indexOf('data-testid="workflow-target-arrange"');
  const arrangementPlaybackIndex = html.indexOf('data-testid="arrangement-playback-readout"');
  const arrangementTimelineIndex = html.indexOf('data-testid="arrangement-timeline"');
  const selectedBlockEditorIndex = html.indexOf('data-testid="selected-block-editor"');
  const arrangementBarsIndex = html.indexOf('data-testid="arrangement-bars-input"');
  const blockMovesIndex = html.indexOf('data-testid="block-moves"');
  const arrangementToolsIndex = html.indexOf('data-testid="arrangement-tools"');
  check(
    arrangementPanelIndex >= 0 &&
      arrangementPlaybackIndex > arrangementPanelIndex &&
      arrangementTimelineIndex > arrangementPlaybackIndex &&
      selectedBlockEditorIndex > arrangementTimelineIndex &&
      arrangementBarsIndex > selectedBlockEditorIndex &&
      blockMovesIndex > arrangementBarsIndex &&
      arrangementToolsIndex > blockMovesIndex,
    "Arrangement hierarchy should keep playback, timeline, essential block editing, Block Moves, and Arrangement Tools in order"
  );
  check(
    !html.includes('<details class="block-moves" data-testid="block-moves" open="">') &&
      !html.includes('<details class="arrangement-tools" data-testid="arrangement-tools" open="">'),
    "Guided first render should keep Block Moves and Arrangement Tools collapsed"
  );
  const mixerPanelIndex = html.indexOf('data-testid="workflow-target-mix"');
  const mixerStripsIndex = html.indexOf('data-testid="mixer-channel-strips"');
  const mixerMuteIndex = html.indexOf('data-testid="mixer-mute-drum_rack"');
  const mixerVolumeIndex = html.indexOf('data-testid="mixer-volume-drum_rack"');
  const mixerPanIndex = html.indexOf('data-testid="mixer-pan-drum_rack"');
  const mixerProcessingIndex = html.indexOf('data-testid="mixer-processing-drum_rack"');
  const mixMovesIndex = html.indexOf('data-testid="mix-moves"');
  const mixReviewIndex = html.indexOf('data-testid="mix-review-tools"');
  check(
    mixerPanelIndex >= 0 &&
      mixerStripsIndex > mixerPanelIndex &&
      mixerMuteIndex > mixerStripsIndex &&
      mixerVolumeIndex > mixerMuteIndex &&
      mixerPanIndex > mixerVolumeIndex &&
      mixerProcessingIndex > mixerPanIndex &&
      mixMovesIndex > mixerProcessingIndex &&
      mixReviewIndex > mixMovesIndex,
    "Mixer hierarchy should keep direct strips and basic balance before processing, Mix Moves, and Audition & Compare"
  );
  check(
    !html.includes('<details class="mixer-processing" data-testid="mixer-processing-drum_rack" open="">') &&
      !html.includes('<details class="mix-moves" data-testid="mix-moves" open="">') &&
      !html.includes('<details class="mix-review-tools" data-testid="mix-review-tools" open="">'),
    "Guided first render should keep channel Processing, Mix Moves, and Audition & Compare collapsed"
  );
  const masterPanelIndex = html.indexOf('data-testid="workflow-target-master"');
  const masterRoleIndex = html.indexOf('data-testid="master-output-role-readout"');
  const masterControlsIndex = html.indexOf('data-testid="master-output-controls"');
  const masterCeilingIndex = html.indexOf('data-testid="master-ceiling"');
  const masterCeilingInputIndex = html.indexOf('data-testid="master-ceiling-input"');
  const masterPresetIndex = html.indexOf('data-testid="master-preset-Clean Demo"');
  const masterPolishIndex = html.indexOf('data-testid="master-polish-tools"');
  const masterReviewIndex = html.indexOf('data-testid="master-review-tools"');
  check(
    masterPanelIndex >= 0 &&
      masterRoleIndex > masterPanelIndex &&
      masterControlsIndex > masterRoleIndex &&
      masterCeilingIndex > masterControlsIndex &&
      masterCeilingInputIndex > masterCeilingIndex &&
      masterPresetIndex > masterCeilingInputIndex &&
      masterPolishIndex > masterPresetIndex &&
      masterReviewIndex > masterPolishIndex,
    "Master hierarchy should keep output role, precise ceiling, presets, Polish & Automation, and Review & Export in order"
  );
  check(
    !html.includes('<details class="master-polish-tools" data-testid="master-polish-tools" open="">') &&
      !html.includes('<details class="master-review-tools" data-testid="master-review-tools" open="">'),
    "Guided first render should keep Polish & Automation and Review & Export collapsed"
  );
  const handoffPackIndex = html.indexOf('data-testid="handoff-pack"');
  const handoffRouteIndex = html.indexOf('data-testid="handoff-pack-route-readout"');
  const handoffDirectIndex = html.indexOf('data-testid="handoff-pack-direct"');
  const handoffGridIndex = html.indexOf('data-testid="handoff-pack-grid"');
  const handoffWavActionIndex = html.indexOf('data-testid="handoff-pack-action-wav"');
  const handoffStatusIndex = html.indexOf('data-testid="handoff-status-tools"');
  const handoffAuditIndex = html.indexOf('data-testid="handoff-audit-tools"');
  const handoffManifestIndex = html.indexOf('data-testid="handoff-manifest-audit"');
  check(
    handoffPackIndex >= 0 &&
      handoffPackIndex > workspaceIndex &&
      handoffRouteIndex > handoffPackIndex &&
      handoffDirectIndex > handoffRouteIndex &&
      handoffGridIndex > handoffDirectIndex &&
      handoffWavActionIndex > handoffGridIndex &&
      handoffStatusIndex > handoffWavActionIndex &&
      handoffAuditIndex > handoffStatusIndex &&
      handoffManifestIndex > handoffAuditIndex,
    "Delivery hierarchy should stay outside optional guidance after the workspace and keep route, direct exports, delivery status, and package proof in order"
  );
  check(
    !html.includes('<details class="handoff-status-tools" data-testid="handoff-status-tools" open="">') &&
      !html.includes('<details class="handoff-audit-tools" data-testid="handoff-audit-tools" open="">'),
    "Guided first render should keep Delivery Status & Receipt and Format & Package Proof collapsed"
  );

  const checks = {
    "starter transport": [
      "GrooveForge",
      "desktop workstation",
      'data-testid="workflow-target-transport"',
      'data-testid="first-run-launchpad"',
      'data-testid="first-run-start-beat"',
      'data-testid="first-run-producer-pass"',
      'data-testid="first-run-open-project"',
      "Make a beat now",
      "Start an 8-bar beat",
      "No samples or setup required",
      'data-testid="guidance-center"',
      'data-testid="guidance-center-toggle"',
      'data-testid="guidance-center-content"',
      'data-testid="workspace-feedback-anchor"',
      "Guide &amp; Review Center",
      "Open step-by-step guidance, beat checks, and delivery help",
      'value="Untitled Beat"',
      'value="145"',
      "F minor",
      'data-testid="style-select"',
      "Trap"
    ],
    "beginner guide path": [
      'data-testid="guide-quick-start"',
      'data-testid="guide-quick-start-headline"',
      "Guide Quick Start",
      'data-testid="audience-session-readout"',
      "Audience session",
      'data-testid="dual-audience-readiness"',
      "Dual Audience Readiness",
      "First-time composer lane",
      "First-time composer",
      'data-testid="audience-completion-route"',
      "Audience Completion Route",
      "First-time composer completion",
      'data-testid="audience-session-acceptance"',
      "Audience Session Acceptance",
      "Acceptance: complete a guided 8-bar first beat",
      'data-testid="audience-session-proof-handoff"',
      "Audience Session Proof Handoff",
      "Route: Guided first beat -&gt; Export Preflight",
      'data-testid="audience-delivery-proof-bridge"',
      "Audience Delivery Proof Bridge",
      "Beginner delivery proof",
      "Producer delivery proof",
      'data-testid="audience-session-action-beginner"',
      'data-testid="audience-starter-action-beginner"',
      'data-testid="audience-starter-followup-beginner"',
      "Starter follow-up: First Beat Path / Dual Audience Readiness",
      "Enter Guided",
      "Build Starter",
      "First Beat Path",
      "Beat Spine",
      "Composer Guide",
      "Workflow navigator",
      "Guided Focus",
      "Guided Session Pass"
    ],
    "compose-first drum editor": [
      'data-testid="pattern-lab"',
      'data-testid="pattern-lab-toggle"',
      'data-testid="pattern-lab-content"',
      "Pattern Lab",
      "Compare, generate, clone, vary, stack, and add fills",
      "Pattern A",
      'class="step-grid"',
      'data-testid="drum-step-kick-0"'
    ],
    "note-editor-first composition": [
      'data-testid="note-editor-panel"',
      'data-testid="capture-ideas"',
      'data-testid="capture-ideas-toggle"',
      'data-testid="capture-ideas-content"',
      "Capture &amp; Ideas",
      "Keyboard, MIDI, bass moves, and melody starters",
      "Keys off",
      'class="note-lanes"',
      "scale locked grid"
    ],
    "instrument chord first": [
      'data-testid="instrument-direct-chords"',
      'data-testid="chord-primary-actions"',
      'data-testid="chord-event-grid"',
      'data-testid="chord-summary-0"',
      'data-testid="chord-event-editor-0"',
      'data-editor-open="true"',
      'data-editor-open="false"',
      "Select to edit",
      "Editing",
      'data-testid="harmony-moves"',
      'data-testid="harmony-moves-toggle"',
      'data-testid="harmony-moves-content"',
      'data-testid="sound-design-tools"',
      'data-testid="sound-design-toggle"',
      'data-testid="sound-design-content"',
      "Harmony Moves",
      "Progressions, reharmonization, rhythm, and voicing",
      "Sound Design",
      "Devices, kits, tone shaping, and A/B snapshots"
    ],
    "arrangement timeline first": [
      'data-testid="arrangement-playback-readout"',
      'data-testid="arrangement-timeline"',
      'data-testid="selected-block-editor"',
      'data-testid="block-moves"',
      'data-testid="block-moves-toggle"',
      'data-testid="block-moves-content"',
      'data-testid="arrangement-tools"',
      'data-testid="arrangement-tools-toggle"',
      'data-testid="arrangement-tools-content"',
      "Block Moves",
      "Producer presets, priority suggestions, and structural previews",
      "Arrangement Tools",
      "Templates, song-form chains, section cues, mute maps, and transitions"
    ],
    "mixer strips first": [
      'data-testid="mixer-channel-strips"',
      'data-testid="mixer-processing-drum_rack"',
      'data-testid="mixer-processing-toggle-drum_rack"',
      'data-testid="mix-moves"',
      'data-testid="mix-moves-toggle"',
      'data-testid="mix-moves-content"',
      'data-testid="mix-review-tools"',
      'data-testid="mix-review-toggle"',
      'data-testid="mix-review-content"',
      "Tone &amp; Space",
      "Mix Moves",
      "Balance presets and Space send shaping",
      "Audition &amp; Compare",
      "Stem isolation, listening decisions, and Mix Snapshot A/B"
    ],
    "transport essentials first": [
      'data-testid="transport-status-controls"',
      'data-testid="transport-essential-controls"',
      'data-testid="transport-play"',
      'data-testid="project-essential-controls"',
      'data-testid="project-open"',
      'data-testid="project-save"',
      'data-testid="transport-session-tools"',
      'data-testid="transport-session-toggle"',
      'data-testid="transport-session-content"',
      'data-testid="transport-export-tools"',
      'data-testid="transport-export-toggle"',
      'data-testid="transport-export-content"',
      'data-testid="export-wav"',
      "Session Context",
      "Tempo, edit history, and input posture",
      "Exports",
      "WAV, stems, MIDI, sheet, and bundle"
    ],
    "launchpad lifecycle": [
      'data-testid="first-run-launchpad"',
      'data-testid="first-run-launchpad-toggle"',
      'data-testid="first-run-launchpad-content"',
      'data-testid="first-run-start-beat"',
      'data-testid="first-run-producer-pass"',
      'data-testid="first-run-open-project"',
      "Start or switch project",
      "Choose a ready-to-edit local project",
      "Choices open"
    ],
    "master output first": [
      'data-testid="master-output-role-readout"',
      'data-testid="master-output-controls"',
      'data-testid="master-ceiling"',
      'data-testid="master-ceiling-input"',
      'data-testid="master-polish-tools"',
      'data-testid="master-polish-toggle"',
      'data-testid="master-polish-content"',
      'data-testid="master-review-tools"',
      'data-testid="master-review-toggle"',
      'data-testid="master-review-content"',
      "Limiter ceiling",
      "Lower values leave more headroom before export.",
      "Output preset",
      "Polish &amp; Automation",
      "Review &amp; Export"
    ],
    "delivery actions first": [
      'data-testid="handoff-pack-direct"',
      'data-testid="handoff-pack-grid"',
      'data-testid="handoff-pack-action-wav"',
      'data-testid="handoff-pack-action-stems"',
      'data-testid="handoff-pack-action-midi"',
      'data-testid="handoff-pack-action-sheet"',
      'data-testid="handoff-pack-action-bundle"',
      'data-testid="handoff-status-tools"',
      'data-testid="handoff-status-toggle"',
      'data-testid="handoff-audit-tools"',
      'data-testid="handoff-audit-toggle"',
      "Choose a deliverable",
      "Export directly",
      "Delivery Status &amp; Receipt",
      "Format &amp; Package Proof"
    ],
    "producer workflow": [
      "Professional producer",
      "Professional producer lane",
      'data-testid="dual-audience-readiness-producer"',
      "Professional producer completion",
      'data-testid="audience-completion-route-producer"',
      'data-testid="audience-session-action-producer"',
      'data-testid="audience-starter-action-producer"',
      'data-testid="audience-starter-followup-producer"',
      "Starter follow-up: Review Queue / Export Preflight / Handoff Package Check",
      "Enter Studio",
      "Studio",
      "Review Queue",
      "Production Snapshot",
      "Mix Coach",
      "Sound Snapshot",
      "Mix Snapshot",
      "producer-level",
      'data-testid="quick-actions-open"',
      'data-testid="command-reference-open"',
      "Quick Actions",
      "Command Reference"
    ],
    "direct composition surfaces": [
      'data-testid="workflow-target-compose"',
      'data-testid="workflow-target-sound"',
      'data-testid="workflow-target-arrange"',
      "Pattern A",
      "Drums",
      "808",
      "Synth",
      "Melody",
      "Chords",
      "Arrangement"
    ],
    "mix master delivery": [
      'data-testid="workflow-target-mix"',
      'data-testid="workflow-target-master"',
      "Mixer",
      "Master",
      "Export meter",
      "Export Preflight",
      "Handoff Pack",
      "Export WAV",
      "Mix WAV",
      "Stem WAV",
      "Export MIDI",
      "Handoff Sheet",
      'data-testid="export-delivery-bundle"',
      "Delivery Bundle",
      "Export delivery bundle"
    ]
  };

  for (const [label, needles] of Object.entries(checks)) {
    for (const needle of needles) {
      checkIncludes(html, needle, label);
    }
  }

  for (const forbidden of ["sample import", "sample browser", "chop pads", "sampler track", "AudioClipEvent", "audio clip"]) {
    checkExcludes(html, forbidden, "first-run renderer output");
  }
}

function createAudienceSessionSmokeAction({ id, resultTargetId, title }) {
  return {
    id,
    title,
    detail: `${title} / Audience Session route / direct composition path`,
    group: "Guide",
    keywords: "audience session guided studio beginner producer composer",
    resultTargetId,
    run() {}
  };
}

function createDualAudienceSmokeAction({ id, resultTargetId, title }) {
  return {
    id,
    title,
    detail:
      "Dual Audience Readiness Route Readout / First-time composer lane: Next guided step / Professional producer lane: Producer review / First Beat Path / Export Preflight / Production Snapshot",
    group: "Project",
    keywords: "dual audience readiness first-time composer lane professional producer lane route readout",
    resultTargetId,
    run() {}
  };
}

function createAudienceCompletionSmokeAction({ id, resultTargetId, title }) {
  return {
    id,
    title,
    detail:
      "Audience Completion Route Readout / First-time composer completion: Final check / Professional producer completion: Delivery review / First Beat Path / Production Snapshot / Export Preflight / Handoff Package Check",
    group: "Project",
    keywords: "audience completion route first-time composer completion professional producer completion route readout",
    resultTargetId,
    run() {}
  };
}

function createAudienceDeliveryProofSmokeAction({ id, resultTargetId, title }) {
  return {
    id,
    title,
    detail:
      "Audience Delivery Proof Bridge Readout / First-time composer delivery proof / Professional producer delivery proof / Export Preflight deliverables / Handoff Package Check receipt / local delivery package reopen / persona delivery package reopen",
    group: "Project",
    keywords: "audience delivery proof bridge first-time composer professional producer local delivery package handoff receipt route readout",
    resultTargetId,
    run() {}
  };
}

function createAudienceSessionProofHandoffSmokeAction({ id, resultTargetId, title }) {
  return {
    id,
    title,
    detail:
      "Audience Session Proof Handoff Readout / First-time composer session proof / Professional producer session proof / Guided first beat -> Export Preflight / Studio scan -> Handoff Package Check / local delivery package reopen / persona delivery package reopen",
    group: "Project",
    keywords: "audience session proof handoff first-time composer professional producer export preflight handoff package check route readout",
    resultTargetId,
    run() {}
  };
}

function createAudienceSessionAcceptanceSmokeAction({ id, resultTargetId, title }) {
  return {
    id,
    title,
    detail:
      "Audience Session Acceptance Readout / First-time composer acceptance / Professional producer acceptance / complete a guided 8-bar first beat / complete a studio-ready handoff pass / Export Preflight deliverables / Handoff Package Check receipt / rendered path workflow package reopen export Handoff",
    group: "Project",
    keywords: "audience session acceptance first-time composer professional producer rendered path workflow package reopen export handoff route readout",
    resultTargetId,
    run() {}
  };
}

function createAudienceStarterSmokeAction({ id, resultTargetId, title }) {
  return {
    id,
    title,
    detail: `${title} / Audience Starter / Creates editable drums, 808/bass, melody/chords, arrangement, mix/master, and delivery target`,
    group: "Create",
    keywords: "audience starter project build first-time composer professional producer direct beat workstation sample free",
    resultTargetId,
    run() {}
  };
}

function validateAudienceSessionQuickActionResults(quickActions, workstation) {
  const guidedProject = { ...workstation.starterProject, mode: "guided" };
  const studioProject = { ...workstation.starterProject, mode: "studio" };
  const cases = [
    {
      label: "beginner Audience Session Quick Action result",
      action: createAudienceSessionSmokeAction({
        id: "audience-session-enter-beginner",
        resultTargetId: "beginner",
        title: "Enter Guided: First-time composer"
      }),
      beforeProject: studioProject,
      afterProject: guidedProject,
      beforeNeedles: ["Enter Guided for first-time composer", "Studio mode", "target Guided"],
      afterNeedles: [
        "Enter Guided for first-time composer",
        "Guided mode",
        "target Guided",
        "Pattern A",
        "selected-pattern events",
        "editable project events",
        "bars",
        "Follow First Beat Path"
      ],
      auditionNeedles: ["Guided mode", "First Beat Path"],
      nextNeedles: ["Enter Guided", "First Beat Path"]
    },
    {
      label: "producer Audience Session Quick Action result",
      action: createAudienceSessionSmokeAction({
        id: "audience-session-enter-producer",
        resultTargetId: "producer",
        title: "Enter Studio: Professional producer"
      }),
      beforeProject: guidedProject,
      afterProject: studioProject,
      beforeNeedles: ["Enter Studio for professional producer", "Guided mode", "target Studio"],
      afterNeedles: [
        "Enter Studio for professional producer",
        "Studio mode",
        "target Studio",
        "Pattern A",
        "selected-pattern events",
        "editable project events",
        "bars",
        "Scan Mode Focus, Review Queue, and Export Preflight"
      ],
      auditionNeedles: ["Studio mode", "Mode Focus", "Review Queue", "Production Snapshot", "Export Preflight"],
      nextNeedles: ["Enter Studio", "Review Queue", "Export Preflight"]
    }
  ];

  for (const testCase of cases) {
    const result = quickActions.createQuickActionResult(
      testCase.action,
      testCase.beforeProject,
      testCase.afterProject,
      "complete"
    );

    check(result.actionId === testCase.action.id, `${testCase.label} should return the executed action id`);
    check(result.status === "Entered", `${testCase.label} should report Entered status`);
    check(result.tone === "good", `${testCase.label} should report a good tone`);
    check(result.metric.id === "audience-session-route", `${testCase.label} should use the audience route metric id`);
    check(result.metric.label === "Audience session route", `${testCase.label} should use the audience route metric label`);
    check(result.metric.tone === "good", `${testCase.label} metric should report a good tone`);

    for (const needle of testCase.beforeNeedles) {
      checkIncludes(result.metric.before, needle, `${testCase.label} before metric`);
    }
    for (const needle of testCase.afterNeedles) {
      checkIncludes(result.metric.after, needle, `${testCase.label} after metric`);
    }
    for (const needle of testCase.auditionNeedles) {
      checkIncludes(result.auditionCue, needle, `${testCase.label} audition cue`);
    }
    for (const needle of testCase.nextNeedles) {
      checkIncludes(result.nextCheck, needle, `${testCase.label} next check`);
    }
  }
}

function validateAudienceStarterQuickActionResults(quickActions, workstation) {
  const cases = [
    {
      label: "beginner Audience Starter visible result",
      action: createAudienceStarterSmokeAction({
        id: "audience-starter-beginner",
        resultTargetId: "beginner",
        title: "Build Starter Project: First-time composer"
      }),
      afterProject: workstation.createAudienceStarterProject("beginner"),
      afterNeedles: [
        "starter project",
        "First-time composer first beat",
        "Guided mode / lofi / A minor / 8 bars / Starter Sketch delivery",
        "Guided mode",
        "Lo-fi / A minor / 86 BPM",
        "8 bars",
        "editable events",
        "delivery Starter Sketch"
      ],
      beforeNeedles: ["current project", "First-time composer first beat", "Trap", "F minor", "145 BPM", "editable events"],
      auditionNeedles: ["first-time composer starter", "First Beat Path", "Dual Audience Readiness"],
      nextNeedles: ["Audience Starter follow-up", "First Beat Path", "Audience Completion Route"]
    },
    {
      label: "producer Audience Starter visible result",
      action: createAudienceStarterSmokeAction({
        id: "audience-starter-producer",
        resultTargetId: "producer",
        title: "Build Starter Project: Professional producer"
      }),
      afterProject: workstation.createAudienceStarterProject("producer"),
      afterNeedles: [
        "starter project",
        "Professional producer studio pass",
        "Studio mode / house / C minor / 26 bars / Beat Store delivery",
        "Studio mode",
        "House / C minor / 124 BPM",
        "26 bars",
        "editable events",
        "delivery Beat Store"
      ],
      beforeNeedles: ["current project", "Professional producer studio pass", "Trap", "F minor", "145 BPM", "editable events"],
      auditionNeedles: ["professional producer starter", "Review Queue", "Production Snapshot", "Export Preflight"],
      nextNeedles: ["Audience Starter follow-up", "Review Queue", "Export Preflight", "Handoff Package Check"]
    }
  ];

  for (const testCase of cases) {
    const result = quickActions.createQuickActionResult(
      testCase.action,
      workstation.starterProject,
      testCase.afterProject,
      "complete"
    );

    check(result.actionId === testCase.action.id, `${testCase.label} should return the executed action id`);
    check(result.status === "Applied", `${testCase.label} should report Applied status`);
    check(result.tone === "good", `${testCase.label} should report a good tone`);
    check(result.metric.id === "audience-starter", `${testCase.label} should use the Audience Starter metric id`);
    check(result.metric.label === "Audience Starter", `${testCase.label} should use the Audience Starter metric label`);
    check(result.metric.tone === "good", `${testCase.label} metric should report a good tone`);

    for (const needle of testCase.beforeNeedles) {
      checkIncludes(result.metric.before, needle, `${testCase.label} before metric`);
    }
    for (const needle of testCase.afterNeedles) {
      checkIncludes(result.metric.after, needle, `${testCase.label} after metric`);
    }
    for (const needle of testCase.auditionNeedles) {
      checkIncludes(result.auditionCue, needle, `${testCase.label} audition cue`);
    }
    for (const needle of testCase.nextNeedles) {
      checkIncludes(result.nextCheck, needle, `${testCase.label} next check`);
    }
  }
}

function validateDualAudienceQuickActionResults(quickActions, workstation) {
  const cases = [
    {
      label: "Dual Audience Readiness route readout result",
      action: createDualAudienceSmokeAction({
        id: "dual-audience-readiness-route-readout-action",
        resultTargetId: "beginner",
        title: "Review Dual Audience Readiness: 1/2 lanes ready"
      }),
      metricNeedles: [
        "Dual Audience Readiness Route Readout",
        "First-time composer lane",
        "Professional producer lane",
        "Pattern A",
        "selected-pattern events",
        "editable project events",
        "Choose the first-time composer or professional producer lane"
      ],
      nextNeedles: ["first-time composer lane", "Export Preflight", "Production Snapshot"]
    },
    {
      label: "Dual Audience Readiness beginner lane result",
      action: createDualAudienceSmokeAction({
        id: "dual-audience-readiness-beginner-action",
        resultTargetId: "beginner",
        title: "Open Dual Audience First-time composer lane"
      }),
      metricNeedles: [
        "Open first-time composer lane",
        "First-time composer lane",
        "First Beat Path",
        "Pattern A",
        "selected-pattern events"
      ],
      nextNeedles: ["First Beat Path", "guided beat-making step"]
    },
    {
      label: "Dual Audience Readiness producer lane result",
      action: createDualAudienceSmokeAction({
        id: "dual-audience-readiness-producer-action",
        resultTargetId: "producer",
        title: "Open Dual Audience Professional producer lane"
      }),
      metricNeedles: [
        "Open professional producer lane",
        "Professional producer lane",
        "Export Preflight",
        "Production Snapshot",
        "Pattern A",
        "editable project events"
      ],
      nextNeedles: ["Export Preflight", "Production Snapshot"]
    }
  ];

  for (const testCase of cases) {
    const result = quickActions.createQuickActionResult(
      testCase.action,
      workstation.starterProject,
      workstation.starterProject,
      "complete"
    );

    check(result.actionId === testCase.action.id, `${testCase.label} should return the executed action id`);
    check(result.status === "Focused", `${testCase.label} should report Focused status`);
    check(result.tone === "good", `${testCase.label} should report a good tone`);
    check(result.metric.id === "dual-audience-readiness-route", `${testCase.label} should use the Dual Audience metric id`);
    check(result.metric.label === "Dual Audience Readiness", `${testCase.label} should use the Dual Audience metric label`);
    check(result.metric.tone === "good", `${testCase.label} metric should report a good tone`);

    for (const needle of testCase.metricNeedles) {
      checkIncludes(result.metric.after, needle, `${testCase.label} after metric`);
    }
    for (const needle of testCase.nextNeedles) {
      checkIncludes(result.nextCheck, needle, `${testCase.label} next check`);
    }
  }
}

function validateAudienceCompletionQuickActionResults(quickActions, workstation) {
  const cases = [
    {
      label: "Audience Completion Route readout result",
      action: createAudienceCompletionSmokeAction({
        id: "audience-completion-route-readout-action",
        resultTargetId: "beginner",
        title: "Review Audience Completion Route: 1/2 lanes send-ready"
      }),
      metricNeedles: [
        "Audience Completion Route Readout",
        "First-time composer completion",
        "Professional producer completion",
        "Pattern A",
        "selected-pattern events",
        "editable project events"
      ],
      nextNeedles: ["first-time composer", "professional producer", "completion lane"]
    },
    {
      label: "Audience Completion beginner lane result",
      action: createAudienceCompletionSmokeAction({
        id: "audience-completion-route-beginner-action",
        resultTargetId: "beginner",
        title: "Open Audience Completion First-time composer completion"
      }),
      metricNeedles: [
        "Open first-time composer completion lane",
        "First-time composer completion",
        "First Beat Path",
        "Export Preflight",
        "Handoff Package Check"
      ],
      nextNeedles: ["First Beat Path", "Export Preflight", "Handoff Package Check"]
    },
    {
      label: "Audience Completion producer lane result",
      action: createAudienceCompletionSmokeAction({
        id: "audience-completion-route-producer-action",
        resultTargetId: "producer",
        title: "Open Audience Completion Professional producer completion"
      }),
      metricNeedles: [
        "Open professional producer completion lane",
        "Professional producer completion",
        "Production Snapshot",
        "Export Preflight",
        "Handoff Package Check"
      ],
      nextNeedles: ["Production Snapshot", "Export Preflight", "Handoff Package Check"]
    }
  ];

  for (const testCase of cases) {
    const result = quickActions.createQuickActionResult(
      testCase.action,
      workstation.starterProject,
      workstation.starterProject,
      "complete"
    );

    check(result.actionId === testCase.action.id, `${testCase.label} should return the executed action id`);
    check(result.status === "Focused", `${testCase.label} should report Focused status`);
    check(result.tone === "good", `${testCase.label} should report a good tone`);
    check(result.metric.id === "audience-completion-route", `${testCase.label} should use the Audience Completion metric id`);
    check(result.metric.label === "Audience Completion Route", `${testCase.label} should use the Audience Completion metric label`);
    check(result.metric.tone === "good", `${testCase.label} metric should report a good tone`);

    for (const needle of testCase.metricNeedles) {
      checkIncludes(result.metric.after, needle, `${testCase.label} after metric`);
    }
    for (const needle of testCase.nextNeedles) {
      checkIncludes(result.nextCheck, needle, `${testCase.label} next check`);
    }
  }
}

function validateAudienceDeliveryProofQuickActionResults(quickActions, workstation) {
  const cases = [
    {
      label: "Audience Delivery Proof Bridge readout result",
      action: createAudienceDeliveryProofSmokeAction({
        id: "audience-delivery-proof-bridge-readout-action",
        resultTargetId: "route",
        title: "Review Audience Delivery Proof Bridge"
      }),
      metricNeedles: [
        "Audience Delivery Proof Bridge Readout",
        "First-time composer delivery proof",
        "Professional producer delivery proof",
        "Pattern A",
        "selected-pattern events",
        "editable project events"
      ],
      nextNeedles: ["first-time composer", "professional producer", "delivery proof"]
    },
    {
      label: "Audience Delivery Proof beginner lane result",
      action: createAudienceDeliveryProofSmokeAction({
        id: "audience-delivery-proof-bridge-beginner-action",
        resultTargetId: "beginner",
        title: "Open Delivery Proof First-time composer"
      }),
      metricNeedles: [
        "Open first-time composer delivery proof",
        "First-time composer delivery proof",
        "Export Preflight deliverables",
        "local delivery package reopen"
      ],
      nextNeedles: ["Export Preflight", "WAV", "Handoff Sheet"]
    },
    {
      label: "Audience Delivery Proof producer lane result",
      action: createAudienceDeliveryProofSmokeAction({
        id: "audience-delivery-proof-bridge-producer-action",
        resultTargetId: "producer",
        title: "Open Delivery Proof Professional producer"
      }),
      metricNeedles: [
        "Open professional producer delivery proof",
        "Professional producer delivery proof",
        "Handoff Package Check receipt",
        "persona delivery package reopen"
      ],
      nextNeedles: ["Handoff Package Check", "package reopen", "send order"]
    }
  ];

  for (const testCase of cases) {
    const result = quickActions.createQuickActionResult(
      testCase.action,
      workstation.starterProject,
      workstation.starterProject,
      "complete"
    );

    check(result.actionId === testCase.action.id, `${testCase.label} should return the executed action id`);
    check(result.status === "Focused", `${testCase.label} should report Focused status`);
    check(result.tone === "good", `${testCase.label} should report a good tone`);
    check(result.metric.id === "audience-delivery-proof-bridge", `${testCase.label} should use the Audience Delivery Proof metric id`);
    check(result.metric.label === "Audience Delivery Proof Bridge", `${testCase.label} should use the Audience Delivery Proof metric label`);
    check(result.metric.tone === "good", `${testCase.label} metric should report a good tone`);

    for (const needle of testCase.metricNeedles) {
      checkIncludes(result.metric.after, needle, `${testCase.label} after metric`);
    }
    for (const needle of testCase.nextNeedles) {
      checkIncludes(result.nextCheck, needle, `${testCase.label} next check`);
    }
  }
}

function validateAudienceSessionProofHandoffQuickActionResults(quickActions, workstation) {
  const cases = [
    {
      label: "Audience Session Proof Handoff readout result",
      action: createAudienceSessionProofHandoffSmokeAction({
        id: "audience-session-proof-handoff-readout-action",
        resultTargetId: "route",
        title: "Review Audience Session Proof Handoff"
      }),
      metricNeedles: [
        "Audience Session Proof Handoff Readout",
        "First-time composer session proof",
        "Professional producer session proof",
        "Pattern A",
        "selected-pattern events",
        "editable project events"
      ],
      nextNeedles: ["first-time composer", "professional producer", "session proof"]
    },
    {
      label: "Audience Session Proof Handoff beginner lane result",
      action: createAudienceSessionProofHandoffSmokeAction({
        id: "audience-session-proof-handoff-beginner-action",
        resultTargetId: "beginner",
        title: "Open Session Proof First-time composer"
      }),
      metricNeedles: [
        "Open first-time composer session proof",
        "First-time composer session proof",
        "Export Preflight",
        "local delivery package reopen"
      ],
      nextNeedles: ["Export Preflight", "WAV", "Handoff Sheet", "local package reopen"]
    },
    {
      label: "Audience Session Proof Handoff producer lane result",
      action: createAudienceSessionProofHandoffSmokeAction({
        id: "audience-session-proof-handoff-producer-action",
        resultTargetId: "producer",
        title: "Open Session Proof Professional producer"
      }),
      metricNeedles: [
        "Open professional producer session proof",
        "Professional producer session proof",
        "Handoff Package Check",
        "persona delivery package reopen"
      ],
      nextNeedles: ["Handoff Package Check", "send order", "stem handoff", "persona package reopen"]
    }
  ];

  for (const testCase of cases) {
    const result = quickActions.createQuickActionResult(
      testCase.action,
      workstation.starterProject,
      workstation.starterProject,
      "complete"
    );

    check(result.actionId === testCase.action.id, `${testCase.label} should return the executed action id`);
    check(result.status === "Focused", `${testCase.label} should report Focused status`);
    check(result.tone === "good", `${testCase.label} should report a good tone`);
    check(result.metric.id === "audience-session-proof-handoff", `${testCase.label} should use the Audience Session Proof metric id`);
    check(result.metric.label === "Audience Session Proof Handoff", `${testCase.label} should use the Audience Session Proof metric label`);
    check(result.metric.tone === "good", `${testCase.label} metric should report a good tone`);

    for (const needle of testCase.metricNeedles) {
      checkIncludes(result.metric.after, needle, `${testCase.label} after metric`);
    }
    for (const needle of testCase.nextNeedles) {
      checkIncludes(result.nextCheck, needle, `${testCase.label} next check`);
    }
  }
}

function validateAudienceSessionAcceptanceQuickActionResults(quickActions, workstation) {
  const cases = [
    {
      label: "Audience Session Acceptance readout result",
      action: createAudienceSessionAcceptanceSmokeAction({
        id: "audience-session-acceptance-readout-action",
        resultTargetId: "route",
        title: "Review Audience Session Acceptance"
      }),
      metricNeedles: [
        "Audience Session Acceptance Readout",
        "First-time composer acceptance",
        "Professional producer acceptance",
        "Pattern A",
        "selected-pattern events",
        "editable project events"
      ],
      nextNeedles: ["first-time composer", "professional producer", "Export Preflight", "Handoff Package Check"]
    },
    {
      label: "Audience Session Acceptance beginner lane result",
      action: createAudienceSessionAcceptanceSmokeAction({
        id: "audience-session-acceptance-beginner-action",
        resultTargetId: "beginner",
        title: "Open Acceptance First-time composer"
      }),
      metricNeedles: [
        "Open first-time composer acceptance",
        "First-time composer acceptance",
        "guided 8-bar first beat",
        "Export Preflight"
      ],
      nextNeedles: ["rendered path", "workflow", "package", "Export Preflight"]
    },
    {
      label: "Audience Session Acceptance producer lane result",
      action: createAudienceSessionAcceptanceSmokeAction({
        id: "audience-session-acceptance-producer-action",
        resultTargetId: "producer",
        title: "Open Acceptance Professional producer"
      }),
      metricNeedles: [
        "Open professional producer acceptance",
        "Professional producer acceptance",
        "studio-ready handoff pass",
        "Handoff Package Check"
      ],
      nextNeedles: ["rendered path", "workflow", "receipt", "Handoff Package Check"]
    }
  ];

  for (const testCase of cases) {
    const result = quickActions.createQuickActionResult(
      testCase.action,
      workstation.starterProject,
      workstation.starterProject,
      "complete"
    );

    check(result.actionId === testCase.action.id, `${testCase.label} should return the executed action id`);
    check(result.status === "Focused", `${testCase.label} should report Focused status`);
    check(result.tone === "good", `${testCase.label} should report a good tone`);
    check(result.metric.id === "audience-session-acceptance", `${testCase.label} should use the Audience Session Acceptance metric id`);
    check(result.metric.label === "Audience Session Acceptance", `${testCase.label} should use the Audience Session Acceptance metric label`);
    check(result.metric.tone === "good", `${testCase.label} metric should report a good tone`);

    for (const needle of testCase.metricNeedles) {
      checkIncludes(result.metric.after, needle, `${testCase.label} after metric`);
    }
    for (const needle of testCase.nextNeedles) {
      checkIncludes(result.nextCheck, needle, `${testCase.label} next check`);
    }
  }
}

function createAudienceSessionSmokeSummary() {
  return {
    headline: "Audience session ready",
    detail: "First-time composer and professional producer routes",
    statusLabel: "Audience session clear",
    activeAudience: "beginner",
    activeAudienceLabel: "First-time composer",
    readinessLabel: "First-time composer: Ready / Professional producer: Ready",
    nextCheck: "Choose the matching route before changing the beat.",
    tone: "good",
    rows: [
      {
        id: "beginner",
        label: "First-time composer",
        status: "Ready",
        value: "4/4 clear",
        detail: "Guided first-beat path / direct beat workstation",
        nextCheck: "Follow First Beat Path before editing or exporting.",
        actionLabel: "Enter Guided",
        actionDetail: "Open Guided first-beat workflow",
        tone: "good"
      },
      {
        id: "producer",
        label: "Professional producer",
        status: "Ready",
        value: "5/5 clear",
        detail: "Studio producer scan / Review Queue / Export Preflight",
        nextCheck: "Scan Mode Focus, Review Queue, and Export Preflight before delivery.",
        actionLabel: "Enter Studio",
        actionDetail: "Open Studio producer scan",
        tone: "good"
      }
    ]
  };
}

function validateAudienceSessionQuickActionPalette(guidancePanels, palette) {
  const selectedRows = [];
  const starterRows = [];
  const summary = createAudienceSessionSmokeSummary();
  const actions = guidancePanels.createAudienceSessionQuickActions({
    onCreateStarter(starterId) {
      starterRows.push(starterId);
    },
    onSelectAudience(row) {
      selectedRows.push(row.id);
    },
    summary
  });

  check(actions.length === 4, "Audience Session palette smoke should create two route actions and two starter actions");

  const beginnerAction = actions.find((action) => action.id === "audience-session-enter-beginner");
  const producerAction = actions.find((action) => action.id === "audience-session-enter-producer");
  const beginnerStarterAction = actions.find((action) => action.id === "audience-starter-beginner");
  const producerStarterAction = actions.find((action) => action.id === "audience-starter-producer");
  check(beginnerAction?.title === "Enter Guided: First-time composer", "Audience Session palette should expose Enter Guided title");
  check(producerAction?.title === "Enter Studio: Professional producer", "Audience Session palette should expose Enter Studio title");
  check(beginnerStarterAction?.title === "Build Starter Project: First-time composer", "Audience Session palette should expose beginner starter title");
  check(producerStarterAction?.title === "Build Starter Project: Professional producer", "Audience Session palette should expose producer starter title");
  check(beginnerAction?.group === "Project", "Audience Session route actions should remain Project-group actions");
  check(producerAction?.group === "Project", "Audience Session route actions should remain Project-group actions");
  check(beginnerStarterAction?.group === "Create", "Audience Starter beginner action should be a Create command");
  check(producerStarterAction?.group === "Create", "Audience Starter producer action should be a Create command");
  check(beginnerAction?.resultTargetId === "beginner", "Audience Session palette should keep beginner result target");
  check(producerAction?.resultTargetId === "producer", "Audience Session palette should keep producer result target");
  check(beginnerStarterAction?.resultTargetId === "beginner", "Audience Starter palette should keep beginner result target");
  check(producerStarterAction?.resultTargetId === "producer", "Audience Starter palette should keep producer result target");

  const audienceSearch = palette.filterQuickActions(actions, "audience session", "all");
  const guidedSearch = palette.filterQuickActions(actions, "enter guided", "guide");
  const studioSearch = palette.filterQuickActions(actions, "enter studio", "guide");
  const producerSearch = palette.filterQuickActions(actions, "professional producer", "project");
  const beginnerSearch = palette.filterQuickActions(actions, "first-time composer", "project");
  const starterSearch = palette.filterQuickActions(actions, "build starter project", "create");
  const beginnerStarterSearch = palette.filterQuickActions(actions, "first-time composer starter", "create");
  const producerStarterSearch = palette.filterQuickActions(actions, "professional producer starter", "create");

  check(audienceSearch.length === 2, "Audience Session palette all-scope search should show both routes");
  check(guidedSearch[0]?.id === "audience-session-enter-beginner", "Audience Session palette guide search should find Enter Guided");
  check(studioSearch[0]?.id === "audience-session-enter-producer", "Audience Session palette guide search should find Enter Studio");
  check(producerSearch[0]?.id === "audience-session-enter-producer", "Audience Session palette project search should find producer route");
  check(beginnerSearch[0]?.id === "audience-session-enter-beginner", "Audience Session palette project search should find beginner route");
  check(starterSearch.length === 2, "Audience Starter palette create search should show both starter actions");
  check(beginnerStarterSearch[0]?.id === "audience-starter-beginner", "Audience Starter palette create search should find beginner starter");
  check(producerStarterSearch[0]?.id === "audience-starter-producer", "Audience Starter palette create search should find producer starter");

  const guidedScopeOptions = palette.createQuickActionScopeOptions(actions, "enter guided");
  const guideScope = guidedScopeOptions.find((option) => option.id === "guide");
  const projectScope = guidedScopeOptions.find((option) => option.id === "project");
  check(guideScope?.count === 1, "Audience Session palette should count Enter Guided inside Guide scope");
  check(projectScope?.count === 1, "Audience Session palette should count Enter Guided inside Project scope");

  const guidedSearchResult = palette.createQuickActionSearchResult("enter guided", "guide", actions);
  check(guidedSearchResult.tone === "good", "Audience Session palette search result should be actionable");
  check(
    guidedSearchResult.metricValue === "Project / Enter Guided: First-time composer",
    "Audience Session palette search result should target Enter Guided"
  );
  check(
    guidedSearchResult.nextCheck.includes("Enter Guided: First-time composer"),
    "Audience Session palette search result should name the runnable Guided route"
  );

  const guidedSpotlight = palette.createQuickActionSpotlightSummary(
    guidedSearch,
    guidedSearch.find((action) => !action.disabled),
    "guide",
    guidedScopeOptions,
    "enter guided"
  );
  check(guidedSpotlight.actionId === "audience-session-enter-beginner", "Audience Session palette spotlight should target Enter Guided");
  check(guidedSpotlight.titleLabel === "Enter Guided: First-time composer", "Audience Session palette spotlight should name Enter Guided");

  beginnerAction?.run();
  producerAction?.run();
  beginnerStarterAction?.run();
  producerStarterAction?.run();
  check(selectedRows.join(",") === "beginner,producer", "Audience Session palette actions should run the selected row callbacks in order");
  check(starterRows.join(",") === "beginner,producer", "Audience Starter palette actions should run the starter callbacks in order");
}

function validateAudienceStarterCommandReference(shellPanels) {
  const commandReferenceHtml = renderToStaticMarkup(
    React.createElement(shellPanels.CommandReferenceDialog, {
      open: true,
      onClose() {},
      onOpenQuickActions() {}
    })
  );

  checkIncludes(commandReferenceHtml, 'data-testid="command-reference-item-audience-starter"', "Audience Starter Command Reference");
  checkIncludes(commandReferenceHtml, "Audience Starter", "Audience Starter Command Reference");
  checkIncludes(commandReferenceHtml, "Quick Actions / Create", "Audience Starter Command Reference");
  checkIncludes(
    commandReferenceHtml,
    "Build first-time composer / professional producer starter",
    "Audience Starter Command Reference"
  );
  checkIncludes(commandReferenceHtml, "Build Starter Project commands", "Audience Starter Command Reference");
  checkIncludes(commandReferenceHtml, "starter follow-up routes", "Audience Starter Command Reference");
  checkIncludes(commandReferenceHtml, "First Beat Path", "Audience Starter Command Reference");
  checkIncludes(commandReferenceHtml, "Review Queue", "Audience Starter Command Reference");
  checkIncludes(commandReferenceHtml, "Handoff Package Check", "Audience Starter Command Reference");
  checkIncludes(commandReferenceHtml, "Audience Starter result metric", "Audience Starter Command Reference");
  checkIncludes(commandReferenceHtml, "sample-free direct composition posture", "Audience Starter Command Reference");
}

function createDualAudienceSmokeRows() {
  return [
    {
      id: "beginner",
      laneLabel: "First-time composer lane",
      label: "First-time composer",
      statusLabel: "Next guided step",
      metricLabel: "4/5 beat checks / 80% path",
      detailLabel: "First Beat Path / Compose: add 808 bass",
      nextCheckLabel: "Follow First Beat Path for the next direct beat-making step.",
      actionLabel: "Open First Beat Path",
      tone: "warn",
      firstBeatPathStep: {
        id: "compose",
        label: "Compose",
        value: "808 bass",
        detail: "Add 808 bass",
        jumpLabel: "Compose",
        tone: "warn"
      }
    },
    {
      id: "producer",
      laneLabel: "Professional producer lane",
      label: "Professional producer",
      statusLabel: "Producer review",
      metricLabel: "7/8 producer checks / Export Preflight",
      detailLabel: "Production Snapshot / Mix: check headroom",
      nextCheckLabel: "Use Export Preflight or Production Snapshot for the next producer delivery check.",
      actionLabel: "Open Export Preflight",
      tone: "warn",
      exportPreflightCard: {
        id: "mix",
        label: "Mix",
        value: "Review",
        detail: "Check headroom",
        focusLabel: "Focus Mix",
        tone: "warn"
      }
    }
  ];
}

function createAudienceCompletionSmokeRows() {
  return [
    {
      id: "beginner",
      laneLabel: "First-time composer completion",
      label: "First-time composer",
      statusLabel: "Final check",
      metricLabel: "4/5 beat checks / 3/5 preflight",
      detailLabel: "First Beat Path / Export Preflight / Handoff Package Check",
      nextCheckLabel: "Use Export Preflight before sending the first beat.",
      actionLabel: "Open Export Preflight",
      tone: "warn",
      exportPreflightCard: {
        id: "readiness",
        label: "Readiness",
        value: "Review",
        detail: "Composition and arrangement checks need one pass",
        focusLabel: "Compose",
        tone: "warn"
      }
    },
    {
      id: "producer",
      laneLabel: "Professional producer completion",
      label: "Professional producer",
      statusLabel: "Delivery review",
      metricLabel: "4/5 production / 3/4 package",
      detailLabel: "Production Snapshot / Export Preflight / Handoff Package Check",
      nextCheckLabel: "Use Handoff Package Check before delivery.",
      actionLabel: "Open Deliver",
      tone: "warn",
      handoffPackageCheckCard: {
        id: "context",
        focusId: "context",
        label: "Context",
        value: "Review",
        status: "Needs context",
        detail: "Confirm Session Brief and Handoff Sheet",
        focusLabel: "Deliver",
        tone: "warn"
      }
    }
  ];
}

function validateDualAudienceQuickActionPalette(guidancePanels, palette) {
  const runs = [];
  const actions = guidancePanels.createDualAudienceReadinessQuickActions({
    onFocusExportPreflight(card) {
      runs.push(`export:${card.id}`);
    },
    onFocusProductionSnapshot(metric) {
      runs.push(`snapshot:${metric.id}`);
    },
    onFocusRouteReadout() {
      runs.push("route");
    },
    onJumpFirstBeatPath(step) {
      runs.push(`firstBeat:${step.id}`);
    },
    rows: createDualAudienceSmokeRows()
  });

  check(actions.length === 3, "Dual Audience palette smoke should create route, beginner, and producer actions");
  check(actions.every((action) => action.group === "Project"), "Dual Audience palette actions should remain Project-group actions");

  const routeAction = actions.find((action) => action.id === "dual-audience-readiness-route-readout-action");
  const beginnerAction = actions.find((action) => action.id === "dual-audience-readiness-beginner-action");
  const producerAction = actions.find((action) => action.id === "dual-audience-readiness-producer-action");
  check(routeAction?.title.includes("Review Dual Audience Readiness"), "Dual Audience palette should expose route readout title");
  check(beginnerAction?.title === "Open Dual Audience First-time composer lane", "Dual Audience palette should expose beginner lane title");
  check(producerAction?.title === "Open Dual Audience Professional producer lane", "Dual Audience palette should expose producer lane title");
  check(beginnerAction?.resultTargetId === "beginner", "Dual Audience palette should keep beginner result target");
  check(producerAction?.resultTargetId === "producer", "Dual Audience palette should keep producer result target");

  const routeSearch = palette.filterQuickActions(actions, "dual audience readiness", "all");
  const beginnerSearch = palette.filterQuickActions(actions, "first-time composer lane", "project");
  const producerSearch = palette.filterQuickActions(actions, "professional producer lane", "project");

  check(routeSearch[0]?.id === "dual-audience-readiness-route-readout-action", "Dual Audience palette search should find route readout first");
  check(beginnerSearch.some((action) => action.id === "dual-audience-readiness-beginner-action"), "Dual Audience palette search should find beginner lane");
  check(producerSearch.some((action) => action.id === "dual-audience-readiness-producer-action"), "Dual Audience palette search should find producer lane");

  const routeSearchResult = palette.createQuickActionSearchResult("dual audience readiness", "all", actions);
  check(routeSearchResult.tone === "good", "Dual Audience palette search result should be actionable");
  check(
    routeSearchResult.metricValue.includes("Review Dual Audience Readiness"),
    "Dual Audience palette search result should target the route readout"
  );

  routeAction?.run();
  beginnerAction?.run();
  producerAction?.run();
  check(runs.join(",") === "route,firstBeat:compose,export:mix", "Dual Audience palette actions should run route and lane handlers");
}

function validateAudienceCompletionQuickActionPalette(guidancePanels, palette) {
  const runs = [];
  const actions = guidancePanels.createAudienceCompletionRouteQuickActions({
    onFocusExportPreflight(card) {
      runs.push(`export:${card.id}`);
    },
    onFocusHandoffPackageCheck(card) {
      runs.push(`handoff:${card.id}`);
    },
    onFocusProductionSnapshot(metric) {
      runs.push(`snapshot:${metric.id}`);
    },
    onFocusRouteReadout() {
      runs.push("route");
    },
    onJumpFirstBeatPath(step) {
      runs.push(`firstBeat:${step.id}`);
    },
    rows: createAudienceCompletionSmokeRows()
  });

  check(actions.length === 3, "Audience Completion palette smoke should create route, beginner, and producer actions");
  check(actions.every((action) => action.group === "Project"), "Audience Completion palette actions should remain Project-group actions");

  const routeAction = actions.find((action) => action.id === "audience-completion-route-readout-action");
  const beginnerAction = actions.find((action) => action.id === "audience-completion-route-beginner-action");
  const producerAction = actions.find((action) => action.id === "audience-completion-route-producer-action");
  check(routeAction?.title.includes("Review Audience Completion Route"), "Audience Completion palette should expose route readout title");
  check(
    beginnerAction?.title === "Open Audience Completion First-time composer completion",
    "Audience Completion palette should expose beginner completion title"
  );
  check(
    producerAction?.title === "Open Audience Completion Professional producer completion",
    "Audience Completion palette should expose producer completion title"
  );
  check(beginnerAction?.resultTargetId === "beginner", "Audience Completion palette should keep beginner result target");
  check(producerAction?.resultTargetId === "producer", "Audience Completion palette should keep producer result target");

  const routeSearch = palette.filterQuickActions(actions, "audience completion route", "all");
  const beginnerSearch = palette.filterQuickActions(actions, "first-time composer completion", "project");
  const producerSearch = palette.filterQuickActions(actions, "professional producer completion", "project");

  check(routeSearch[0]?.id === "audience-completion-route-readout-action", "Audience Completion palette search should find route readout first");
  check(
    beginnerSearch.some((action) => action.id === "audience-completion-route-beginner-action"),
    "Audience Completion palette search should find beginner completion lane"
  );
  check(
    producerSearch.some((action) => action.id === "audience-completion-route-producer-action"),
    "Audience Completion palette search should find producer completion lane"
  );

  const routeSearchResult = palette.createQuickActionSearchResult("audience completion route", "all", actions);
  check(routeSearchResult.tone === "good", "Audience Completion palette search result should be actionable");
  check(
    routeSearchResult.metricValue.includes("Review Audience Completion Route"),
    "Audience Completion palette search result should target the route readout"
  );

  routeAction?.run();
  beginnerAction?.run();
  producerAction?.run();
  check(runs.join(",") === "route,export:readiness,handoff:context", "Audience Completion palette actions should run route and lane handlers");
}

function validateAudienceDeliveryProofQuickActionPalette(guidancePanels, palette) {
  const runs = [];
  const actions = guidancePanels.createAudienceDeliveryProofBridgeQuickActions({
    exportPreflightSummary: {
      headline: "Export Preflight",
      detail: "Delivery proof",
      tone: "warn",
      cards: [
        {
          id: "deliverables",
          focusId: "deliverables",
          label: "Deliverables",
          value: "WAV / stems / MIDI / Handoff Sheet",
          detail: "Confirm local delivery package files",
          focusLabel: "Deliver",
          tone: "warn"
        }
      ]
    },
    handoffPackageCheckSummary: {
      headline: "Handoff Package Check",
      detail: "Receipt proof",
      tone: "warn",
      cards: [
        {
          id: "receipt",
          focusId: "receipt",
          label: "Receipt",
          value: "Package reopen",
          status: "Review",
          detail: "Confirm send order and handoff receipt",
          focusLabel: "Deliver",
          focusTarget: "deliver",
          tone: "warn"
        }
      ]
    },
    onFocusExportPreflight(card) {
      runs.push(`export:${card.id}`);
    },
    onFocusHandoffPackageCheck(card) {
      runs.push(`handoff:${card.id}`);
    },
    onFocusRouteReadout() {
      runs.push("route");
    },
    rows: [
      {
        id: "beginner",
        label: "First-time composer",
        status: "Ready",
        value: "Guided",
        detail: "First beat package",
        nextCheck: "Export Preflight",
        actionLabel: "Enter Guided",
        actionDetail: "Guided first-beat route",
        tone: "good"
      },
      {
        id: "producer",
        label: "Professional producer",
        status: "Ready",
        value: "Studio",
        detail: "Producer handoff",
        nextCheck: "Handoff Package Check",
        actionLabel: "Enter Studio",
        actionDetail: "Studio producer route",
        tone: "good"
      }
    ]
  });

  check(actions.length === 3, "Audience Delivery Proof palette smoke should create route, beginner, and producer actions");
  check(actions.every((action) => action.group === "Project"), "Audience Delivery Proof palette actions should remain Project-group actions");

  const routeAction = actions.find((action) => action.id === "audience-delivery-proof-bridge-readout-action");
  const beginnerAction = actions.find((action) => action.id === "audience-delivery-proof-bridge-beginner-action");
  const producerAction = actions.find((action) => action.id === "audience-delivery-proof-bridge-producer-action");
  check(routeAction?.title === "Review Audience Delivery Proof Bridge", "Audience Delivery Proof palette should expose route readout title");
  check(
    beginnerAction?.title === "Open Delivery Proof First-time composer",
    "Audience Delivery Proof palette should expose beginner proof title"
  );
  check(
    producerAction?.title === "Open Delivery Proof Professional producer",
    "Audience Delivery Proof palette should expose producer proof title"
  );
  check(beginnerAction?.resultTargetId === "beginner", "Audience Delivery Proof palette should keep beginner result target");
  check(producerAction?.resultTargetId === "producer", "Audience Delivery Proof palette should keep producer result target");

  const routeSearch = palette.filterQuickActions(actions, "audience delivery proof bridge", "all");
  const beginnerSearch = palette.filterQuickActions(actions, "first-time composer delivery proof", "project");
  const producerSearch = palette.filterQuickActions(actions, "professional producer delivery proof", "project");

  check(routeSearch[0]?.id === "audience-delivery-proof-bridge-readout-action", "Audience Delivery Proof palette search should find route readout first");
  check(
    beginnerSearch.some((action) => action.id === "audience-delivery-proof-bridge-beginner-action"),
    "Audience Delivery Proof palette search should find beginner proof lane"
  );
  check(
    producerSearch.some((action) => action.id === "audience-delivery-proof-bridge-producer-action"),
    "Audience Delivery Proof palette search should find producer proof lane"
  );

  const routeSearchResult = palette.createQuickActionSearchResult("audience delivery proof bridge", "all", actions);
  check(routeSearchResult.tone === "good", "Audience Delivery Proof palette search result should be actionable");
  check(
    routeSearchResult.metricValue.includes("Review Audience Delivery Proof Bridge"),
    "Audience Delivery Proof palette search result should target the route readout"
  );

  routeAction?.run();
  beginnerAction?.run();
  producerAction?.run();
  check(runs.join(",") === "route,export:deliverables,handoff:receipt", "Audience Delivery Proof palette actions should run route and lane handlers");
}

function validateAudienceSessionProofHandoffQuickActionPalette(guidancePanels, palette) {
  const runs = [];
  const actions = guidancePanels.createAudienceSessionProofHandoffQuickActions({
    exportPreflightSummary: {
      headline: "Export Preflight",
      detail: "Session proof",
      tone: "warn",
      cards: [
        {
          id: "deliverables",
          focusId: "deliverables",
          label: "Deliverables",
          value: "WAV / stems / MIDI / Handoff Sheet",
          detail: "Confirm local delivery package files",
          focusLabel: "Deliver",
          tone: "warn"
        }
      ]
    },
    handoffPackageCheckSummary: {
      headline: "Handoff Package Check",
      detail: "Session receipt",
      tone: "warn",
      cards: [
        {
          id: "receipt",
          focusId: "receipt",
          label: "Receipt",
          value: "Package reopen",
          status: "Review",
          detail: "Confirm send order and handoff receipt",
          focusLabel: "Deliver",
          focusTarget: "deliver",
          tone: "warn"
        }
      ]
    },
    onFocusExportPreflight(card) {
      runs.push(`export:${card.id}`);
    },
    onFocusHandoffPackageCheck(card) {
      runs.push(`handoff:${card.id}`);
    },
    onFocusRouteReadout() {
      runs.push("route");
    },
    rows: createAudienceSessionSmokeSummary().rows
  });

  check(actions.length === 3, "Audience Session Proof Handoff palette smoke should create route, beginner, and producer actions");
  check(actions.every((action) => action.group === "Project"), "Audience Session Proof Handoff palette actions should remain Project-group actions");

  const routeAction = actions.find((action) => action.id === "audience-session-proof-handoff-readout-action");
  const beginnerAction = actions.find((action) => action.id === "audience-session-proof-handoff-beginner-action");
  const producerAction = actions.find((action) => action.id === "audience-session-proof-handoff-producer-action");
  check(routeAction?.title === "Review Audience Session Proof Handoff", "Audience Session Proof Handoff palette should expose route readout title");
  check(
    beginnerAction?.title === "Open Session Proof First-time composer",
    "Audience Session Proof Handoff palette should expose beginner proof title"
  );
  check(
    producerAction?.title === "Open Session Proof Professional producer",
    "Audience Session Proof Handoff palette should expose producer proof title"
  );
  check(beginnerAction?.resultTargetId === "beginner", "Audience Session Proof Handoff palette should keep beginner result target");
  check(producerAction?.resultTargetId === "producer", "Audience Session Proof Handoff palette should keep producer result target");

  const routeSearch = palette.filterQuickActions(actions, "audience session proof handoff", "all");
  const beginnerSearch = palette.filterQuickActions(actions, "first-time composer session proof", "project");
  const producerSearch = palette.filterQuickActions(actions, "professional producer session proof", "project");

  check(routeSearch[0]?.id === "audience-session-proof-handoff-readout-action", "Audience Session Proof Handoff palette search should find route readout first");
  check(
    beginnerSearch.some((action) => action.id === "audience-session-proof-handoff-beginner-action"),
    "Audience Session Proof Handoff palette search should find beginner proof lane"
  );
  check(
    producerSearch.some((action) => action.id === "audience-session-proof-handoff-producer-action"),
    "Audience Session Proof Handoff palette search should find producer proof lane"
  );

  const routeSearchResult = palette.createQuickActionSearchResult("audience session proof handoff", "all", actions);
  check(routeSearchResult.tone === "good", "Audience Session Proof Handoff palette search result should be actionable");
  check(
    routeSearchResult.metricValue.includes("Review Audience Session Proof Handoff"),
    "Audience Session Proof Handoff palette search result should target the route readout"
  );

  routeAction?.run();
  beginnerAction?.run();
  producerAction?.run();
  check(runs.join(",") === "route,export:deliverables,handoff:receipt", "Audience Session Proof Handoff palette actions should run route and lane handlers");
}

function validateAudienceSessionAcceptanceQuickActionPalette(guidancePanels, palette) {
  const runs = [];
  const actions = guidancePanels.createAudienceSessionAcceptanceQuickActions({
    exportPreflightSummary: {
      headline: "Export Preflight",
      detail: "Acceptance deliverables",
      tone: "warn",
      cards: [
        {
          id: "deliverables",
          focusId: "deliverables",
          label: "Deliverables",
          value: "WAV / stems / MIDI / Handoff Sheet",
          detail: "Confirm local session deliverables",
          focusLabel: "Deliver",
          tone: "warn"
        }
      ]
    },
    handoffPackageCheckSummary: {
      headline: "Handoff Package Check",
      detail: "Acceptance receipt",
      tone: "warn",
      cards: [
        {
          id: "receipt",
          focusId: "receipt",
          label: "Receipt",
          value: "Package reopen",
          status: "Review",
          detail: "Confirm receipt and send order",
          focusLabel: "Deliver",
          focusTarget: "deliver",
          tone: "warn"
        }
      ]
    },
    onFocusExportPreflight(card) {
      runs.push(`export:${card.id}`);
    },
    onFocusHandoffPackageCheck(card) {
      runs.push(`handoff:${card.id}`);
    },
    onFocusRouteReadout() {
      runs.push("route");
    },
    rows: createAudienceSessionSmokeSummary().rows
  });

  check(actions.length === 3, "Audience Session Acceptance palette smoke should create route, beginner, and producer actions");
  check(actions.every((action) => action.group === "Project"), "Audience Session Acceptance palette actions should remain Project-group actions");

  const routeAction = actions.find((action) => action.id === "audience-session-acceptance-readout-action");
  const beginnerAction = actions.find((action) => action.id === "audience-session-acceptance-beginner-action");
  const producerAction = actions.find((action) => action.id === "audience-session-acceptance-producer-action");
  check(routeAction?.title === "Review Audience Session Acceptance", "Audience Session Acceptance palette should expose route readout title");
  check(
    beginnerAction?.title === "Open Acceptance First-time composer",
    "Audience Session Acceptance palette should expose beginner acceptance title"
  );
  check(
    producerAction?.title === "Open Acceptance Professional producer",
    "Audience Session Acceptance palette should expose producer acceptance title"
  );
  check(beginnerAction?.resultTargetId === "beginner", "Audience Session Acceptance palette should keep beginner result target");
  check(producerAction?.resultTargetId === "producer", "Audience Session Acceptance palette should keep producer result target");

  const routeSearch = palette.filterQuickActions(actions, "audience session acceptance", "all");
  const beginnerSearch = palette.filterQuickActions(actions, "first-time composer acceptance", "project");
  const producerSearch = palette.filterQuickActions(actions, "professional producer acceptance", "project");

  check(routeSearch[0]?.id === "audience-session-acceptance-readout-action", "Audience Session Acceptance palette search should find route readout first");
  check(
    beginnerSearch.some((action) => action.id === "audience-session-acceptance-beginner-action"),
    "Audience Session Acceptance palette search should find beginner acceptance lane"
  );
  check(
    producerSearch.some((action) => action.id === "audience-session-acceptance-producer-action"),
    "Audience Session Acceptance palette search should find producer acceptance lane"
  );

  const routeSearchResult = palette.createQuickActionSearchResult("audience session acceptance", "all", actions);
  check(routeSearchResult.tone === "good", "Audience Session Acceptance palette search result should be actionable");
  check(
    routeSearchResult.metricValue.includes("Review Audience Session Acceptance"),
    "Audience Session Acceptance palette search result should target the route readout"
  );

  routeAction?.run();
  beginnerAction?.run();
  producerAction?.run();
  check(runs.join(",") === "route,export:deliverables,handoff:receipt", "Audience Session Acceptance palette actions should run route and lane handlers");
}

installBrowserMocks();

const server = await createServer({
  appType: "custom",
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true }
});

try {
  const { App } = await server.ssrLoadModule("/src/ui/App.tsx");
  const html = renderToStaticMarkup(React.createElement(App));
  validateFirstRunRenderer(html);
  validateAudienceSessionQuickActionResults(
    await server.ssrLoadModule("/src/ui/workstationAppQuickActions.tsx"),
    await server.ssrLoadModule("/src/domain/workstation.ts")
  );
  validateAudienceStarterQuickActionResults(
    await server.ssrLoadModule("/src/ui/workstationAppQuickActions.tsx"),
    await server.ssrLoadModule("/src/domain/workstation.ts")
  );
  validateDualAudienceQuickActionResults(
    await server.ssrLoadModule("/src/ui/workstationAppQuickActions.tsx"),
    await server.ssrLoadModule("/src/domain/workstation.ts")
  );
  validateAudienceCompletionQuickActionResults(
    await server.ssrLoadModule("/src/ui/workstationAppQuickActions.tsx"),
    await server.ssrLoadModule("/src/domain/workstation.ts")
  );
  validateAudienceSessionAcceptanceQuickActionResults(
    await server.ssrLoadModule("/src/ui/workstationAppQuickActions.tsx"),
    await server.ssrLoadModule("/src/domain/workstation.ts")
  );
  validateAudienceSessionProofHandoffQuickActionResults(
    await server.ssrLoadModule("/src/ui/workstationAppQuickActions.tsx"),
    await server.ssrLoadModule("/src/domain/workstation.ts")
  );
  validateAudienceDeliveryProofQuickActionResults(
    await server.ssrLoadModule("/src/ui/workstationAppQuickActions.tsx"),
    await server.ssrLoadModule("/src/domain/workstation.ts")
  );
  validateAudienceSessionQuickActionPalette(
    await server.ssrLoadModule("/src/ui/workstationGuidancePanels.tsx"),
    await server.ssrLoadModule("/src/ui/workstationAppQuickActionPalette.ts")
  );
  validateAudienceStarterCommandReference(await server.ssrLoadModule("/src/ui/workstationShellPanels.tsx"));
  validateDualAudienceQuickActionPalette(
    await server.ssrLoadModule("/src/ui/workstationGuidancePanels.tsx"),
    await server.ssrLoadModule("/src/ui/workstationAppQuickActionPalette.ts")
  );
  validateAudienceCompletionQuickActionPalette(
    await server.ssrLoadModule("/src/ui/workstationGuidancePanels.tsx"),
    await server.ssrLoadModule("/src/ui/workstationAppQuickActionPalette.ts")
  );
  validateAudienceSessionAcceptanceQuickActionPalette(
    await server.ssrLoadModule("/src/ui/workstationGuidancePanels.tsx"),
    await server.ssrLoadModule("/src/ui/workstationAppQuickActionPalette.ts")
  );
  validateAudienceSessionProofHandoffQuickActionPalette(
    await server.ssrLoadModule("/src/ui/workstationGuidancePanels.tsx"),
    await server.ssrLoadModule("/src/ui/workstationAppQuickActionPalette.ts")
  );
  validateAudienceDeliveryProofQuickActionPalette(
    await server.ssrLoadModule("/src/ui/workstationGuidancePanels.tsx"),
    await server.ssrLoadModule("/src/ui/workstationAppQuickActionPalette.ts")
  );

  if (failures.length > 0) {
    console.error("GrooveForge renderer smoke failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log("GrooveForge renderer smoke passed.");
    console.log("- Scope: first-run React workstation server render without browser, Electron window, network, imported audio, or sampling scope");
    console.log(`- Markup: ${html.length} characters from App first render`);
    console.log("- Starter: Untitled Beat, Guided 145 BPM F minor Trap state visible");
    console.log(
      "- Beginner path: Guide Quick Start, Audience Session Readout, Dual Audience Readiness, Audience Completion Route, Audience Delivery Proof Bridge, First Beat Path, Beat Spine, Composer Guide, Workflow Navigator"
    );
    console.log(
      "- Producer path: Dual Audience Readiness, Audience Completion Route, Audience Delivery Proof Bridge, Studio switch, Review Queue, Production Snapshot, Mix Coach, Handoff Pack, Quick Actions, Command Reference"
    );
    console.log("- Audience Session result: Enter Guided and Enter Studio Quick Actions return Entered status, route metrics, and route-specific follow-up");
    console.log("- Audience Session palette: Enter Guided, Enter Studio, and Audience Starter project actions are searchable through Quick Actions query and scope filters");
    console.log(
      "- Audience Starter follow-up: Build Starter Project actions return Applied status, before/after starter metrics, delivery target context, and beginner/pro next-route guidance"
    );
    console.log("- Audience Starter Command Reference: Build Starter Project creation row is searchable from the Guide command map");
    console.log("- Dual Audience Readiness palette: route readout plus both audience lanes are searchable and return focused route metrics");
    console.log("- Audience Completion Route palette: route readout plus both audience completion lanes are searchable and return focused route metrics");
    console.log("- Audience Session Acceptance palette: route readout plus both acceptance lanes are searchable and return focused acceptance metrics");
    console.log("- Audience Session Proof Handoff palette: route readout plus both proof handoff lanes are searchable and return focused proof metrics");
    console.log("- Audience Delivery Proof Bridge palette: route readout plus both proof lanes are searchable and return focused proof metrics");
    console.log("- Workstation path: compose, sound, arrange, mix, master, export, Handoff Pack, Delivery Bundle ZIP");
  }
} finally {
  await server.close();
}
