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
    console.log("- Beginner path: Guide Quick Start, Audience Session Readout, First Beat Path, Beat Spine, Composer Guide, Workflow Navigator");
    console.log("- Producer path: Studio switch, Review Queue, Production Snapshot, Mix Coach, Sound/Mix Snapshot, Quick Actions, Command Reference");
    console.log("- Workstation path: compose, sound, arrange, mix, master, export, Handoff Pack");
  }
} finally {
  await server.close();
}
