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

  const checks = {
    "starter transport": [
      "GrooveForge",
      "desktop workstation",
      'data-testid="workflow-target-transport"',
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
      'data-testid="audience-session-action-beginner"',
      "Enter Guided",
      "First Beat Path",
      "Beat Spine",
      "Composer Guide",
      "Workflow navigator",
      "Guided Focus",
      "Guided Session Pass"
    ],
    "producer workflow": [
      "Professional producer",
      "Professional producer lane",
      'data-testid="dual-audience-readiness-producer"',
      'data-testid="audience-session-action-producer"',
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
      "Handoff Sheet"
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
  const summary = createAudienceSessionSmokeSummary();
  const actions = guidancePanels.createAudienceSessionQuickActions({
    onSelectAudience(row) {
      selectedRows.push(row.id);
    },
    summary
  });

  check(actions.length === 2, "Audience Session palette smoke should create two route actions");
  check(actions.every((action) => action.group === "Project"), "Audience Session palette actions should remain Project-group actions");

  const beginnerAction = actions.find((action) => action.id === "audience-session-enter-beginner");
  const producerAction = actions.find((action) => action.id === "audience-session-enter-producer");
  check(beginnerAction?.title === "Enter Guided: First-time composer", "Audience Session palette should expose Enter Guided title");
  check(producerAction?.title === "Enter Studio: Professional producer", "Audience Session palette should expose Enter Studio title");
  check(beginnerAction?.resultTargetId === "beginner", "Audience Session palette should keep beginner result target");
  check(producerAction?.resultTargetId === "producer", "Audience Session palette should keep producer result target");

  const audienceSearch = palette.filterQuickActions(actions, "audience session", "all");
  const guidedSearch = palette.filterQuickActions(actions, "enter guided", "guide");
  const studioSearch = palette.filterQuickActions(actions, "enter studio", "guide");
  const producerSearch = palette.filterQuickActions(actions, "professional producer", "project");
  const beginnerSearch = palette.filterQuickActions(actions, "first-time composer", "project");

  check(audienceSearch.length === 2, "Audience Session palette all-scope search should show both routes");
  check(guidedSearch[0]?.id === "audience-session-enter-beginner", "Audience Session palette guide search should find Enter Guided");
  check(studioSearch[0]?.id === "audience-session-enter-producer", "Audience Session palette guide search should find Enter Studio");
  check(producerSearch[0]?.id === "audience-session-enter-producer", "Audience Session palette project search should find producer route");
  check(beginnerSearch[0]?.id === "audience-session-enter-beginner", "Audience Session palette project search should find beginner route");

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
  check(selectedRows.join(",") === "beginner,producer", "Audience Session palette actions should run the selected row callbacks in order");
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
  validateAudienceSessionQuickActionPalette(
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
      "- Beginner path: Guide Quick Start, Audience Session Readout, Dual Audience Readiness, First Beat Path, Beat Spine, Composer Guide, Workflow Navigator"
    );
    console.log(
      "- Producer path: Dual Audience Readiness, Studio switch, Review Queue, Production Snapshot, Mix Coach, Sound/Mix Snapshot, Quick Actions, Command Reference"
    );
    console.log("- Audience Session result: Enter Guided and Enter Studio Quick Actions return Entered status, route metrics, and route-specific follow-up");
    console.log("- Audience Session palette: Enter Guided and Enter Studio are searchable through Quick Actions query and scope filters");
    console.log("- Workstation path: compose, sound, arrange, mix, master, export, Handoff Pack");
  }
} finally {
  await server.close();
}
