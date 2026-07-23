#!/usr/bin/env node

import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { createServer } from "vite";

const failures = [];
const styles = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../../src/ui/App.tsx", import.meta.url), "utf8");
const workstationSource = readFileSync(new URL("../../src/domain/workstation.ts", import.meta.url), "utf8");
const electronMainSource = readFileSync(new URL("../../electron/main.ts", import.meta.url), "utf8");
const composePanelsSource = readFileSync(new URL("../../src/ui/workstationComposePanels.tsx", import.meta.url), "utf8");
const graphSource = readFileSync(new URL("../../src/ui/workstationAppQuickActionGraph.ts", import.meta.url), "utf8");
const quickActionSource = readFileSync(new URL("../../src/ui/workstationAppQuickActions.tsx", import.meta.url), "utf8");
const shellSource = readFileSync(new URL("../../src/ui/workstationShellPanels.tsx", import.meta.url), "utf8");
const launchBearingPackageSources = [
  "run_desktop_package_smoke.mjs",
  "run_desktop_adhoc_sign_smoke.mjs",
  "run_desktop_pkg_payload_smoke.mjs",
  "run_desktop_install_smoke.mjs"
].map((fileName) => readFileSync(new URL(`./${fileName}`, import.meta.url), "utf8"));

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

function validateProjectFileLoadErrorStatus(uiModel) {
  check(
    uiModel.projectFileLoadErrorStatus(new Error("Unsupported GrooveForge project file version: 99.")) ===
      "Project version is unsupported; update GrooveForge or use the app version that saved it",
    "future project versions should show an actionable update/version recovery message"
  );
  check(
    uiModel.projectFileLoadErrorStatus(new Error("GrooveForge project file exceeds the 1,500,000 character safety limit.")) ===
      "Project file is too large to open safely",
    "oversized project files should show a specific safe-open message"
  );
  check(
    uiModel.projectFileLoadErrorStatus(new Error("GrooveForge project file exceeds the 6,000,000 byte native read safety limit.")) ===
      "Project file is too large to open safely",
    "native oversized project files should reuse the safe-open message"
  );
  check(
    uiModel.projectFileLoadErrorStatus(new SyntaxError("Unexpected token")) === "Invalid project file",
    "malformed JSON should retain the concise invalid-project message"
  );
  check(
    uiModel.projectFileLoadErrorStatus(new Error("EACCES"), "Open failed") === "Open failed",
    "non-parser native and File.text failures should preserve the open-failed fallback"
  );
  check(
    appSource.includes("setProjectStatus(projectFileLoadErrorStatus(error))"),
    "project loading should route parser failures through the actionable status helper"
  );
  check(
    /async function handleSaveProject\(\): Promise<ProjectSaveAttempt> \{\s*const requestId = \+\+projectSaveRequestIdRef\.current;\s*try \{\s*commitMasterCeilingDraft\(\);\s*const projectToSave = projectRef\.current;\s*const contents = serializeProjectFile\(projectToSave\);/u.test(appSource),
    "project serialization should stay inside the Save failure boundary and use the current project reference"
  );
  check(
    appSource.includes("file.size > maxProjectFileBytes"),
    "browser project import should reject oversized bytes before File.text()"
  );
}

function validateMasterCeilingDraftLifecycle(workstation) {
  const sourceProject = { ...workstation.starterProject, masterCeilingDb: -1 };
  check(
    workstation.resolveMasterCeilingDraft(sourceProject, " -6.0 ") === workstation.minMasterCeilingDb,
    "focused master ceiling draft should resolve through the domain bound before Save"
  );
  check(
    workstation.resolveMasterCeilingDraft(sourceProject, "") === -1 &&
      workstation.resolveMasterCeilingDraft(sourceProject, "invalid") === -1,
    "empty or invalid master ceiling draft should preserve the current project value"
  );

  const menuSource = printNamedFunction(appSource, "App.tsx", "handleNativeMenuCommand");
  const saveSource = printNamedFunction(appSource, "App.tsx", "handleSaveProject");
  const replaceSource = printNamedFunction(appSource, "App.tsx", "replaceProject");
  const historySource = printNamedFunction(appSource, "App.tsx", "restoreProjectFromHistory");
  const snapshotSource = printNamedFunction(appSource, "App.tsx", "restoreSavedSnapshot");
  check(
    /case "save-project":\s*commitMasterCeilingDraft\(\);/u.test(menuSource) &&
      /case "open-project":\s*commitMasterCeilingDraft\(\);/u.test(menuSource) &&
      /case "toggle-playback":\s*commitMasterCeilingDraft\(\);/u.test(menuSource),
    "native Save, Open, and playback commands should commit a focused ceiling draft before consuming project state"
  );
  check(
    /case "undo":\s*resetMasterCeilingEditor\(projectRef\.current\);/u.test(menuSource) &&
      /case "redo":\s*resetMasterCeilingEditor\(projectRef\.current\);/u.test(menuSource),
    "native Undo and Redo should cancel stale ceiling draft state before history restoration"
  );
  check(
    saveSource.includes("const projectToSave = projectRef.current;") &&
      saveSource.includes("serializeProjectFile(projectToSave)") &&
      !saveSource.includes("serializeProjectFile(project)"),
    "native Save should serialize current project state after draft resolution"
  );
  check(
    replaceSource.includes("resetMasterCeilingEditor(nextProject);") &&
      historySource.includes("resetMasterCeilingEditor(nextProject);") &&
      snapshotSource.includes("resetMasterCeilingEditor(projectRef.current);"),
    "project replacement, history restore, and snapshot restore should rebase the ceiling editor"
  );
}

function validateProjectReplacementGuard(replacementGuard) {
  const clean = replacementGuard.resolveProjectReplacementGuard(false, false);
  const dirty = replacementGuard.resolveProjectReplacementGuard(true, false);
  const recoveryOnly = replacementGuard.resolveProjectReplacementGuard(false, true);
  const dirtyRecovery = replacementGuard.resolveProjectReplacementGuard(true, true);
  check(
    clean.requiresConfirmation === false &&
      dirty.requiresConfirmation === true &&
      recoveryOnly.requiresConfirmation === true &&
      dirtyRecovery.requiresConfirmation === true,
    "project replacement guard should protect all dirty and recovery-draft loss states"
  );

  const loadSource = printNamedFunction(appSource, "App.tsx", "loadProjectText");
  const dirtySetterSource = printNamedFunction(appSource, "App.tsx", "setProjectHasUnsavedChanges");
  const parseIndex = loadSource.indexOf("const nextProject = parseProjectFile(contents);");
  const guardIndex = loadSource.indexOf("resolveProjectReplacementGuard(");
  const stopIndex = loadSource.indexOf("controllerRef.current?.stop();");
  const replaceIndex = loadSource.indexOf("replaceProject(nextProject");
  check(
    parseIndex >= 0 && guardIndex > parseIndex && stopIndex > guardIndex && replaceIndex > stopIndex,
    "project replacement should parse before confirmation and confirm before stopping playback or replacing content"
  );
  check(
    loadSource.includes("commitMasterCeilingDraft();") &&
      loadSource.includes("!window.confirm(replacementGuard.warning)") &&
      loadSource.includes('setProjectStatus("Open canceled; current project kept")') &&
      /!window\.confirm\(replacementGuard\.warning\)\) \{[\s\S]*?return;/u.test(loadSource),
    "dirty Open cancellation should keep the current project after resolving any focused ceiling draft"
  );
  check(
    appSource.includes("const projectHasUnsavedChangesRef = useRef(false);") &&
      dirtySetterSource.includes("projectHasUnsavedChangesRef.current = value;") &&
      dirtySetterSource.includes("setProjectHasUnsavedChangesState(value);") &&
      loadSource.includes("projectHasUnsavedChangesRef.current,") &&
      loadSource.includes("localDraftRecovery !== null"),
    "project replacement confirmation should read current dirty and recovery-draft state"
  );
}

function validateProjectCloseGuard(closeGuard) {
  const clean = closeGuard.resolveProjectCloseGuard(false, false);
  const dirty = closeGuard.resolveProjectCloseGuard(true, false);
  const recoveryOnly = closeGuard.resolveProjectCloseGuard(false, true);
  const dirtyRecovery = closeGuard.resolveProjectCloseGuard(true, true);
  check(
    clean.requiresConfirmation === false &&
      clean.shouldRefreshLocalDraft === false &&
      dirty.requiresConfirmation === true &&
      dirty.shouldRefreshLocalDraft === true &&
      recoveryOnly.requiresConfirmation === true &&
      recoveryOnly.shouldRefreshLocalDraft === false &&
      dirtyRecovery.requiresConfirmation === true &&
      dirtyRecovery.shouldRefreshLocalDraft === true,
    "project close guard should protect dirty/recovery states and refresh only the current dirty project"
  );

  const createWindowSource = printNamedFunction(electronMainSource, "main.ts", "createWindow");
  const unloadGuardIndex = appSource.indexOf('window.addEventListener("beforeunload", handleBeforeUnload);');
  check(
    unloadGuardIndex >= 0 &&
      appSource.includes('window.removeEventListener("beforeunload", handleBeforeUnload)') &&
      appSource.includes("commitMasterCeilingDraft();") &&
      appSource.includes("resolveProjectCloseGuard(") &&
      appSource.includes("projectHasUnsavedChangesRef.current,") &&
      appSource.includes("localDraftRecoveryRef.current !== null") &&
      appSource.includes("localDraftRecoveryRef.current = value;") &&
      appSource.includes("writeLocalDraft(projectRef.current)") &&
      appSource.includes("event.preventDefault();") &&
      appSource.includes('event.returnValue = "";'),
    "renderer beforeunload should resolve focused input, protect current dirty/recovery state, refresh the current draft, and unregister cleanly"
  );
  check(
    createWindowSource.includes('win.webContents.on("will-prevent-unload"') &&
      createWindowSource.includes('buttons: ["Save and close", "Close without a project file", "Keep editing"]') &&
      createWindowSource.includes("defaultId: saveAndCloseChoiceId") &&
      createWindowSource.includes("cancelId: keepEditingChoiceId") &&
      createWindowSource.includes('action === "save-and-close"') &&
      createWindowSource.includes('win.webContents.send(menuCommandChannel, "save-project-and-close")') &&
      /if \(action === "close-without-project-file"\) \{\s*event\.preventDefault\(\);/u.test(createWindowSource),
    "Electron close confirmation should default to Save, cancel to editing, route asynchronous Save, and override unload only for explicit close"
  );

  const saveAndCloseSource = printNamedFunction(appSource, "App.tsx", "handleSaveProjectAndClose");
  check(
    saveAndCloseSource.includes("resolveSaveBeforeCloseDecision(") &&
      saveAndCloseSource.includes('decision === "review-recovery"') &&
      saveAndCloseSource.includes("setLocalDraftRecoveryDeferred(false);") &&
      saveAndCloseSource.includes("Restore or clear the recovery draft before closing") &&
      saveAndCloseSource.indexOf("return;") < saveAndCloseSource.indexOf("const completion = await handleSaveProject();") &&
      saveAndCloseSource.includes("const completion = await handleSaveProject();") &&
      saveAndCloseSource.includes("shouldCloseAfterProjectSave(completion)") &&
      saveAndCloseSource.includes("window.grooveforge?.closeWindow?.();") &&
      !saveAndCloseSource.includes('completion === "saved-snapshot"'),
    "Save and close should request a guarded normal close only after the exact current project is durable"
  );
}

function validateProjectSaveCompletion(saveCompletion) {
  check(
    saveCompletion.resolveProjectSaveCompletion(1, 1, true) === "saved-current" &&
      saveCompletion.resolveProjectSaveCompletion(1, 1, false) === "saved-snapshot" &&
      saveCompletion.resolveProjectSaveCompletion(1, 2, true) === "stale" &&
      saveCompletion.resolveProjectSaveCompletion(1, 2, false) === "stale",
    "project Save completion should distinguish current, changed, and stale async results"
  );

  const saveSource = printNamedFunction(appSource, "App.tsx", "handleSaveProject");
  const resultSource = printNamedFunction(appSource, "App.tsx", "createProjectFileResult");
  const replaceSource = printNamedFunction(appSource, "App.tsx", "replaceProject");
  const commitIndex = saveSource.indexOf("commitMasterCeilingDraft();");
  const snapshotIndex = saveSource.indexOf("const projectToSave = projectRef.current;");
  const awaitIndex = saveSource.indexOf("await window.grooveforge?.saveProject?.");
  check(
    saveSource.includes("const requestId = ++projectSaveRequestIdRef.current;") &&
      commitIndex >= 0 &&
      snapshotIndex > commitIndex &&
      awaitIndex > snapshotIndex,
    "Save should sequence the request and resolve focused project state before capturing the durable snapshot"
  );
  check(
    saveSource.includes("projectRef.current === projectToSave") &&
      saveSource.includes('if (completion === "stale")') &&
      saveSource.includes("if (requestId !== projectSaveRequestIdRef.current)") &&
      saveSource.includes('if (completion === "saved-current")'),
    "Save should ignore older completions and only treat the exact captured snapshot as current"
  );
  check(
    replaceSource.indexOf("projectSaveRequestIdRef.current += 1;") >= 0 &&
      replaceSource.indexOf("projectSaveRequestIdRef.current += 1;") < replaceSource.indexOf("projectRef.current = nextProject;"),
    "full project replacement should invalidate pending Save completions before changing file identity"
  );
  check(
    saveSource.split('if (completion === "saved-current")').length - 1 === 2 &&
      saveSource.split("clearLocalDraftState();").length - 1 === 2 &&
      saveSource.split("setProjectHasUnsavedChanges(false);").length - 1 === 2 &&
      saveSource.split("setProjectHasUnsavedChanges(true);").length - 1 === 2 &&
      saveSource.includes("newer changes remain unsaved"),
    "Save should clear recovery only for the saved current snapshot and retain dirty state for newer edits"
  );
  check(
    resultSource.includes("newerChangesRemain = false") &&
      resultSource.includes("newer local edits and recovery remain unsaved") &&
      resultSource.includes("Save again to include the newer edits") &&
      resultSource.includes('tone: newerChangesRemain ? "warn" : "good"'),
    "Save result feedback should explain changed-snapshot safety and the required follow-up"
  );
}

function validateDemandMaterialization(palette) {
  let factoryCalls = 0;
  const factory = () => {
    factoryCalls += 1;
    return [{ id: "complete-command-graph" }];
  };

  const inactiveFirst = palette.materializeWhenActive(false, factory);
  const inactiveSecond = palette.materializeWhenActive(false, factory);
  check(factoryCalls === 0, "inactive Quick Actions materialization should not call the full command factory");
  check(inactiveFirst.length === 0, "inactive Quick Actions materialization should return no commands");
  check(inactiveFirst === inactiveSecond, "inactive Quick Actions materialization should reuse one stable empty array");

  const active = palette.materializeWhenActive(true, factory);
  check(factoryCalls === 1, "active Quick Actions materialization should call the full command factory exactly once");
  check(active.length === 1 && active[0]?.id === "complete-command-graph", "active Quick Actions should return the factory's complete command graph");

  const cachedActive = palette.materializeWhenActive(true, factory, active);
  check(factoryCalls === 1, "palette-local renders should reuse the active session graph without calling the factory again");
  check(cachedActive === active, "palette-local renders should retain the same active command graph identity");

  const closed = palette.materializeWhenActive(false, factory, active);
  check(closed === inactiveFirst, "closing Quick Actions should return the stable inactive graph instead of a cached active graph");
  const reopened = palette.materializeWhenActive(true, factory, null);
  check(factoryCalls === 2, "reopening Quick Actions after cache invalidation should build a fresh command graph");
  check(reopened !== active, "reopened Quick Actions should not reuse the previous session graph");
}

const graphSharedHelperNames = [
  "patternCueSwitchSelectedBlockPlacement",
  "patternUseSelectedBlockPlacement",
  "handoffSendReadinessLabel",
  "handoffSendReadinessGateLabel",
  "handoffBlockerRouteLabel",
  "tempoNudgeRouteSummary",
  "swingFeelRouteSummary",
  "keyRetargetOptionSummary",
  "keyRetargetPatternSummary",
  "keyRetargetablePatternEventTotal",
  "styleDirectionCurrentSummary",
  "styleDirectionTargetSummary",
  "styleDirectionPatternSummary",
  "firstBeatPathCommandDetail",
  "keyboardCaptureDefaultSummary",
  "keyboardCapturePitchMapSummary",
  "quickActionCaptureStepModeLabel",
  "quickActionSoundDesignPosture",
  "layerStarterRouteLabel",
  "patternStackRouteLabel",
  "drumMoveRouteLabel",
  "bassMoveRouteLabel",
  "melodyMoveRouteLabel",
  "chordMoveRouteLabel"
];

function printNamedFunction(source, fileName, functionName) {
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let declaration;
  const visit = (node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === functionName) {
      declaration = node;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  check(Boolean(declaration), `${fileName} should declare ${functionName}`);
  return declaration
    ? ts.createPrinter({ removeComments: true }).printNode(ts.EmitHint.Unspecified, declaration, sourceFile)
    : "";
}

function validateLocalDraftRecoveryDeferral(shell, helpers, draftLifecycle, workstation) {
  const recovery = {
    savedAt: "2026-07-13T00:00:00.000Z",
    project: workstation.starterProject,
    contents: "local recovery"
  };
  let deferCalls = 0;
  const bannerHtml = renderToStaticMarkup(
    React.createElement(shell.LocalDraftRecoveryBanner, {
      draft: recovery,
      onClear() {},
      onDefer() {
        deferCalls += 1;
      },
      onRestore() {}
    })
  );
  const deferredSummary = helpers.createProjectSafetyReadoutSummary(
    recovery,
    true,
    recovery.savedAt,
    "Editable 8-bar foundation",
    null,
    false
  );
  const activeSummary = helpers.createProjectSafetyReadoutSummary(
    recovery,
    false,
    recovery.savedAt,
    "Editable 8-bar foundation",
    null,
    false
  );
  const deferHandlerSource = printNamedFunction(appSource, "App.tsx", "deferLocalDraftRecovery");
  const restoreHistorySource = printNamedFunction(appSource, "App.tsx", "restoreProjectFromHistory");
  const replacementGate = draftLifecycle.resolveLocalDraftWriteGate(false, true);
  const firstEditGate = draftLifecycle.resolveLocalDraftWriteGate(true, replacementGate.skipNextWrite);

  check(
    bannerHtml.includes('data-testid="defer-local-draft"') &&
      bannerHtml.includes("Not now") &&
      bannerHtml.includes("set this recovery copy aside for the session"),
    "local draft recovery should offer a clearly session-scoped Not now action"
  );
  check(
    styles.includes(".local-draft-actions .icon-button.primary span") && styles.includes("color: #08120f;"),
    "local draft recovery primary action text should retain dark-on-mint contrast"
  );
  check(deferCalls === 0, "rendering local draft recovery should not invoke the defer action");
  check(
      deferredSummary.statusLabel === "Recovery set aside" &&
      deferredSummary.roleLabel === "Current project kept" &&
      deferredSummary.detailLabel.includes("available in Actions") &&
      deferredSummary.tone === "warn",
    "deferred recovery should confirm the current project is unchanged, keep recovery discoverable, and retain a safety warning"
  );
  check(
    activeSummary.statusLabel === "Draft found" && activeSummary.roleLabel === "Restore or clear",
    "active recovery should preserve the explicit Restore or Clear decision"
  );
  check(
    deferHandlerSource.includes("setLocalDraftRecoveryDeferred(true)") &&
      !deferHandlerSource.includes("writeLocalDraft") &&
      !deferHandlerSource.includes("clearLocalDraftStorage") &&
      !deferHandlerSource.includes("setLocalDraftRecovery(null)"),
    "Not now should remain session-only without writing, clearing, or dropping the recovery record"
  );
  check(
    /const savedAt = writeLocalDraft\(project\);\s*if \(savedAt\) {\s*setLocalDraftSavedAt\(savedAt\);\s*setLocalDraftRecovery\(null\);\s*setLocalDraftRecoveryDeferred\(false\);\s*}/.test(
      appSource
    ),
    "a successful current-project draft write should drop the replaced stale recovery target"
  );
  check(
    replacementGate.shouldWrite === false &&
      replacementGate.skipNextWrite === false &&
      firstEditGate.shouldWrite === true &&
      firstEditGate.skipNextWrite === false &&
      draftLifecycle.resolveLocalDraftWriteGate(false, false).shouldWrite === false &&
      draftLifecycle.resolveLocalDraftWriteGate(true, false).shouldWrite === true,
    "project replacement should consume its own draft skip while the first later edit remains write eligible"
  );
  check(
    appSource.includes(
      "const writeGate = resolveLocalDraftWriteGate(localDraftWriteArmed, localDraftSkipNextWriteRef.current);"
    ) &&
      appSource.includes("localDraftSkipNextWriteRef.current = writeGate.skipNextWrite;") &&
      appSource.includes("if (!writeGate.shouldWrite)"),
    "the local-draft effect should apply the explicit write gate before attempting storage"
  );
  check(
    restoreHistorySource.includes("setLocalDraftWriteArmed(true)") &&
      restoreHistorySource.includes("setProjectHasUnsavedChanges(true)") &&
      restoreHistorySource.includes("setProject(nextProject)"),
    "Undo and Redo restoration should conservatively mark changed project content unsaved and recovery-write eligible"
  );
  check(
    appSource.includes("    localDraftRecovery,") &&
      graphSource.includes('id: "restore-local-draft"') &&
      graphSource.includes('id: "clear-local-draft"') &&
      graphSource.includes("disabled: !localDraftRecovery"),
    "deferred recovery should remain wired to explicit Restore Draft and Clear Draft Quick Actions"
  );
}

function validateFirstRunProjectOwnership(html, helpers) {
  const initialSummary = helpers.createProjectSafetyReadoutSummary(
    null,
    false,
    null,
    "Editable 8-bar foundation",
    null,
    false
  );
  const updateProjectSource = printNamedFunction(appSource, "App.tsx", "updateProject");

  check(
    html.includes('<span data-testid="project-safety-status">Editable now</span>') &&
      html.includes('<strong data-testid="project-safety-label">Save to keep</strong>') &&
      html.includes('<small data-testid="project-safety-detail">Local project only</small>') &&
      html.includes('<span data-testid="project-status">Editable 8-bar foundation</span>'),
    "first render should identify a real editable foundation while keeping its local-only save requirement visible"
  );
  check(
    initialSummary.statusLabel === "Editable now" &&
      initialSummary.roleLabel === "Save to keep" &&
      initialSummary.detailLabel === "Local project only" &&
      initialSummary.detailTitle ===
        "Editable 8-bar foundation / Local project only / Use Save for a durable .grooveforge project file" &&
      initialSummary.tone === "warn",
    "initial project safety should combine edit ownership, local-only truth, and explicit durable-save guidance"
  );
  check(
    appSource.includes('useState("Editable 8-bar foundation")') && !appSource.includes('useState("Demo project")'),
    "App should initialize the first-run project as an editable foundation instead of a disposable demo"
  );
  check(
    updateProjectSource.includes('status = "Unsaved changes"') &&
      updateProjectSource.includes("setProjectHasUnsavedChanges(true)") &&
      updateProjectSource.includes("setLocalDraftWriteArmed(true)") &&
      updateProjectSource.includes("setProjectStatus(status)"),
    "the first real edit should still transition to unsaved changes and arm the local draft safety net"
  );
}

function validateLazyQuickActionGraphSource(graph) {
  check(
    appSource.includes('void import("./workstationAppQuickActionGraph")'),
    "App should request the Quick Actions command graph through a dynamic import"
  );
  check(
    !appSource.includes('from "./workstationAppQuickActionGraph"'),
    "App should not statically import the Quick Actions command graph"
  );
  check(
    graphSource.includes("export function createQuickActions({") && !quickActionSource.includes("export function createQuickActions({"),
    "the complete command factory should live only in the lazy graph module"
  );
  check(typeof graph.createQuickActions === "function", "the lazy graph module should export the complete command factory");
  for (const helperName of graphSharedHelperNames) {
    check(
      typeof graph[helperName] === "function" &&
        printNamedFunction(graphSource, "workstationAppQuickActionGraph.ts", helperName) ===
          printNamedFunction(quickActionSource, "workstationAppQuickActions.tsx", helperName),
      `lazy graph helper ${helperName} should match its first-render helper implementation`
    );
  }
  check(
    shellSource.includes('"quick-actions-load-error" : "quick-actions-loading"') &&
      shellSource.includes('data-testid="quick-actions-load-retry"') &&
      shellSource.includes("aria-busy={loading}"),
    "Quick Actions should expose explicit accessible loading, failure, and retry states"
  );
  check(
    styles.includes(".quick-actions-load-state") && styles.includes(".quick-actions-load-state.danger"),
    "Quick Actions loading and failure states should retain dedicated styling"
  );
}

function validateWorkspaceCommandDockSource(html) {
  check(
    appSource.includes("const [workspaceCommandDockVisible, setWorkspaceCommandDockVisible] = useState(false)") &&
      appSource.includes('typeof IntersectionObserver === "undefined"') &&
      appSource.includes("setWorkspaceCommandDockVisible(!entry.isIntersecting)") &&
      appSource.includes("observer.observe(transport)") &&
      appSource.includes("return () => observer.disconnect()"),
    "the workspace command dock should derive one local visibility state from the full transport header intersection"
  );
  check(
    [
      "workspace-command-dock",
      "workspace-command-dock-position",
      "workspace-command-dock-play",
      "workspace-command-dock-actions",
      "workspace-command-dock-undo",
      "workspace-command-dock-redo",
      "workspace-command-dock-save"
    ].every((testId) => appSource.includes(`data-testid="${testId}"`)) &&
      appSource.includes('aria-label="Workspace command dock"') &&
      appSource.includes('role="toolbar"') &&
      appSource.includes('data-workspace-command-dock-visible={workspaceCommandDockVisible}'),
    "the workspace command dock should expose a labeled toolbar, live position, and stable essential-control hooks"
  );
  check(
    appSource.includes('data-testid="workspace-command-dock-play"\n            onClick={togglePlayback}') &&
      appSource.includes('data-testid="workspace-command-dock-actions"\n            onClick={openQuickActions}') &&
      appSource.includes('data-testid="workspace-command-dock-undo"') &&
      appSource.includes("disabled={!canUndo}\n            onClick={undoProject}") &&
      appSource.includes('data-testid="workspace-command-dock-redo"') &&
      appSource.includes("disabled={!canRedo}\n            onClick={redoProject}") &&
      appSource.includes('data-testid="workspace-command-dock-save"') &&
      appSource.includes("onClick={() => void handleSaveProject()}"),
    "dock controls should reuse the existing Play, Actions, Undo, Redo, and Save handlers and disabled states"
  );
  check(
    appSource.includes(
      "controllerRef.current?.stop();\n      controllerRef.current = null;\n      setPlaybackPosition(null);\n      setIsPlaying(false);\n      return;"
    ),
    "explicit Stop should update shared header and dock playback state immediately while the audio controller closes"
  );
  check(
    styles.includes(".workspace-command-dock {\n  position: fixed;") &&
      styles.includes("width: min(660px, calc(100vw - 32px));") &&
      styles.includes('.app-shell[data-workspace-command-dock-visible="true"] {') &&
      styles.includes("padding-bottom: 92px;") &&
      styles.includes('.app-shell[data-workspace-command-dock-visible="true"] :focus-visible') &&
      styles.includes("scroll-margin-bottom: 92px;"),
    "the fixed dock should remain viewport-bounded and reserve focus/scroll clearance in the workspace"
  );
  check(
    !html.includes('data-testid="workspace-command-dock"'),
    "the workspace command dock should stay absent from the first render while the full transport is visible"
  );
}

function validateCompactStudioTransportSource() {
  check(
    appSource.includes("function isCompactTransportViewport(): boolean") &&
      appSource.includes('window.matchMedia("(max-width: 1220px)").matches') &&
      appSource.includes("window.innerWidth <= 1220"),
    "compact Studio transport behavior should share the existing 1220px responsive layout boundary"
  );
  check(
    appSource.includes("const transportAdvancedOpen = advancedOpen && !isCompactTransportViewport()") &&
      appSource.includes("setTransportSessionOpen(transportAdvancedOpen)") &&
      appSource.includes("setTransportExportsOpen(transportAdvancedOpen)"),
    "Studio mode should auto-expand transport disclosures only outside the compact viewport"
  );
  check(
    appSource.includes('const compactTransport = window.matchMedia("(max-width: 1220px)")') &&
      appSource.includes("if (event.matches)") &&
      appSource.includes('compactTransport.addEventListener("change", handleTransportViewportChange)') &&
      appSource.includes('compactTransport.removeEventListener("change", handleTransportViewportChange)') &&
      appSource.includes("collapseTransportTools()"),
    "crossing into the compact viewport should close both transport disclosures with a cleaned-up media listener"
  );
  check(
    appSource.includes("setModeAwareToolPanels: (mode) =>") &&
      appSource.includes("flushSync(() => updateModeAwareToolPanels(mode))") &&
      appSource.includes("delete current.setModeAwareToolPanels"),
    "production launch smoke should have a bounded UI-only hook for wide, resized, compact, and reset transport evidence"
  );
  check(
    styles.includes("@media (min-width: 901px) and (max-width: 1220px)") &&
      styles.includes(".command-strip .transport-session-tools") &&
      styles.includes(".command-strip .transport-export-tools"),
    "compact Studio behavior should retain the existing minimum-window disclosure layout and manual toggles"
  );
  check(
    launchBearingPackageSources.every(
      (source) =>
        source.includes("const timeoutMs = 1820000") &&
        source.includes("1,800-second launch-smoke timeout") &&
        source.includes('const progressPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_PROGRESS ";') &&
        source.includes("line.startsWith(progressPrefix)")
    ),
    "launch-bearing package parents should remain bounded above the app's 1,800-second launch collector and stream its progress"
  );
  check(
    electronMainSource.includes('const launchSmokeProgressPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_PROGRESS ";') &&
      electronMainSource.includes('updateProgress({ phase: "collecting-modal-focus", step'),
    "production launch smoke should expose concise phase and long modal-focus substep progress"
  );
}

function validateDrumGridKeyboardNavigation(html, navigation) {
  const drumStepTags = html.match(/<button[^>]*data-testid="drum-step-[^"]+"[^>]*>/g) ?? [];
  const tabStops = drumStepTags.filter((tag) => tag.includes('tabindex="0"'));
  const removedTabStops = drumStepTags.filter((tag) => tag.includes('tabindex="-1"'));
  check(drumStepTags.length === 64, `drum keyboard grid should render 64 direct step buttons, got ${drumStepTags.length}`);
  check(
    drumStepTags.every((tag) => tag.includes('aria-pressed="true"') || tag.includes('aria-pressed="false"')),
    "every drum step should expose an explicit pressed state"
  );
  check(
    tabStops.length === 1 && tabStops[0]?.includes('data-testid="drum-step-kick-0"') && removedTabStops.length === 63,
    "unselected drum grid should expose only Kick step 1 in the page Tab order"
  );
  check(
    html.includes('data-testid="drum-step-grid"') &&
      html.includes('aria-label="Drum step sequencer"') &&
      html.includes('aria-describedby="drum-grid-keyboard-help"') &&
      html.includes('Arrow keys move · Enter or Space toggles'),
    "drum grid should expose one named group with visible and accessible keyboard guidance"
  );
  check(
    appSource.includes("function handleDrumGridKeyDown") &&
      appSource.includes("isDrumGridActivationKey(event.key)") &&
      appSource.includes("event.stopPropagation()") &&
      appSource.includes("event.currentTarget.click()") &&
      appSource.includes("drumGridNavigationTarget({ lane, step }, event.key)") &&
      appSource.includes("setSelectedNote(null)") &&
      appSource.includes("setSelectedChordIndex(null)"),
    "drum grid keyboard handler should consume activation, reuse the click path, and keep directional selection exclusive"
  );
  check(
    navigation.isDrumGridActivationKey("Enter") &&
      navigation.isDrumGridActivationKey(" ") &&
      !navigation.isDrumGridActivationKey("ArrowRight") &&
      navigation.isDrumGridNavigationKey("ArrowRight") &&
      navigation.isDrumGridNavigationKey("Home") &&
      !navigation.isDrumGridNavigationKey("Enter"),
    "drum grid should keep activation keys separate from navigation keys"
  );
  const entry = navigation.drumGridEntryStep(null);
  const leftBoundary = navigation.drumGridNavigationTarget({ lane: "kick", step: 0 }, "ArrowLeft");
  const rightBoundary = navigation.drumGridNavigationTarget({ lane: "kick", step: 15 }, "ArrowRight");
  const upBoundary = navigation.drumGridNavigationTarget({ lane: "kick", step: 8 }, "ArrowUp");
  const downBoundary = navigation.drumGridNavigationTarget({ lane: "perc", step: 8 }, "ArrowDown");
  const downMove = navigation.drumGridNavigationTarget({ lane: "clap", step: 6 }, "ArrowDown");
  const homeMove = navigation.drumGridNavigationTarget({ lane: "hat", step: 9 }, "Home");
  const endMove = navigation.drumGridNavigationTarget({ lane: "hat", step: 9 }, "End");
  check(entry.lane === "kick" && entry.step === 0, "drum grid should enter at Kick step 1 before an explicit selection");
  check(
    leftBoundary.lane === "kick" && leftBoundary.step === 0 &&
      rightBoundary.lane === "kick" && rightBoundary.step === 15 &&
      upBoundary.lane === "kick" && upBoundary.step === 8 &&
      downBoundary.lane === "perc" && downBoundary.step === 8,
    "drum grid arrow navigation should stay bounded at every outer edge"
  );
  check(
    downMove.lane === "hat" && downMove.step === 6 &&
      homeMove.lane === "hat" && homeMove.step === 0 &&
      endMove.lane === "hat" && endMove.step === 15,
    "drum grid should preserve step on vertical moves and support lane-local Home/End"
  );
  for (const [laneIndex, lane] of navigation.drumGridLaneOrder.entries()) {
    for (let step = 0; step < 16; step += 1) {
      const current = { lane, step };
      const expectedTargets = {
        ArrowLeft: { lane, step: Math.max(0, step - 1) },
        ArrowRight: { lane, step: Math.min(15, step + 1) },
        ArrowUp: { lane: navigation.drumGridLaneOrder[Math.max(0, laneIndex - 1)], step },
        ArrowDown: { lane: navigation.drumGridLaneOrder[Math.min(3, laneIndex + 1)], step },
        Home: { lane, step: 0 },
        End: { lane, step: 15 }
      };
      for (const [key, expected] of Object.entries(expectedTargets)) {
        const target = navigation.drumGridNavigationTarget(current, key);
        check(
          target.lane === expected.lane && target.step === expected.step,
          `drum grid ${key} should map ${lane} step ${step + 1} to ${expected.lane} step ${expected.step + 1}`
        );
      }
    }
  }
  check(
    styles.includes(".drum-grid-keyboard-help") && styles.includes("text-align: right"),
    "drum grid keyboard guidance should retain a compact dedicated presentation"
  );
}

function validateNoteGridKeyboardNavigation(html, navigation) {
  const bassTags = html.match(/<button[^>]*data-testid="note-step-bass-[^"]+"[^>]*>/g) ?? [];
  const melodyTags = html.match(/<button[^>]*data-testid="note-step-melody-[^"]+"[^>]*>/g) ?? [];
  const gridRows = [
    { track: "bass", tags: bassTags, expectedCount: 144 },
    { track: "melody", tags: melodyTags, expectedCount: 160 }
  ];
  for (const { track, tags, expectedCount } of gridRows) {
    check(tags.length === expectedCount, `${track} keyboard grid should render ${expectedCount} direct note buttons, got ${tags.length}`);
    check(
      tags.every((tag) => tag.includes('aria-pressed="true"') || tag.includes('aria-pressed="false"')),
      `every ${track} note cell should expose an explicit pressed state`
    );
    check(
      tags.filter((tag) => tag.includes('tabindex="0"')).length === 1 &&
        tags.filter((tag) => tag.includes('tabindex="-1"')).length === expectedCount - 1,
      `${track} note grid should expose exactly one cell in the page Tab order`
    );
  }
  check(
    html.includes('data-testid="note-grid-bass"') &&
      html.includes('aria-label="808 note sequencer"') &&
      html.includes('aria-describedby="note-grid-keyboard-help-bass"') &&
      html.includes('data-testid="note-grid-melody"') &&
      html.includes('aria-label="Synth note sequencer"') &&
      html.includes('aria-describedby="note-grid-keyboard-help-melody"') &&
      (html.match(/Arrow keys move · Enter or Space toggles/g) ?? []).length >= 3,
    "808 and Synth grids should expose separate named groups with visible and accessible keyboard guidance"
  );
  check(
    composePanelsSource.includes("function handleKeyDown") &&
      composePanelsSource.includes("isNoteGridActivationKey(event.key)") &&
      composePanelsSource.includes("event.stopPropagation()") &&
      composePanelsSource.includes("event.currentTarget.click()") &&
      composePanelsSource.includes("noteGridNavigationTarget({ track, step, pitch }, event.key, displayPitches)") &&
      composePanelsSource.includes("onSelect(target)") &&
      appSource.includes("function selectNoteGridCell") &&
      appSource.includes("setSelectedDrumStep(null)") &&
      appSource.includes("setSelectedChordIndex(null)"),
    "note-grid keyboard handling should consume activation, reuse the click path, and keep directional selection exclusive"
  );
  check(
    navigation.isNoteGridActivationKey("Enter") &&
      navigation.isNoteGridActivationKey(" ") &&
      !navigation.isNoteGridActivationKey("ArrowDown") &&
      navigation.isNoteGridNavigationKey("ArrowDown") &&
      navigation.isNoteGridNavigationKey("End") &&
      !navigation.isNoteGridNavigationKey("Enter"),
    "note grids should keep activation keys separate from navigation keys"
  );

  const pitchSets = {
    bass: ["G1", "F1", "Eb1", "D1", "C1", "Bb0", "A0", "G0", "F0"],
    melody: ["E5", "D5", "C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"]
  };
  const selectedBass = { track: "bass", step: 7, pitch: "C1" };
  const selectedEntry = navigation.noteGridEntryCell("bass", pitchSets.bass, selectedBass);
  const defaultEntry = navigation.noteGridEntryCell("melody", pitchSets.melody, selectedBass);
  check(
    selectedEntry === selectedBass && defaultEntry.track === "melody" && defaultEntry.step === 0 && defaultEntry.pitch === "E5",
    "each note grid should enter at its selected cell or visually top-left cell"
  );
  for (const [track, pitches] of Object.entries(pitchSets)) {
    for (const [pitchIndex, pitch] of pitches.entries()) {
      for (let step = 0; step < 16; step += 1) {
        const current = { track, pitch, step };
        const expectedTargets = {
          ArrowLeft: { track, pitch, step: Math.max(0, step - 1) },
          ArrowRight: { track, pitch, step: Math.min(15, step + 1) },
          ArrowUp: { track, pitch: pitches[Math.max(0, pitchIndex - 1)], step },
          ArrowDown: { track, pitch: pitches[Math.min(pitches.length - 1, pitchIndex + 1)], step },
          Home: { track, pitch, step: 0 },
          End: { track, pitch, step: 15 }
        };
        for (const [key, expected] of Object.entries(expectedTargets)) {
          const target = navigation.noteGridNavigationTarget(current, key, pitches);
          check(
            target.track === expected.track && target.pitch === expected.pitch && target.step === expected.step,
            `${track} grid ${key} should map ${pitch} step ${step + 1} to ${expected.pitch} step ${expected.step + 1}`
          );
        }
      }
    }
  }
  check(
    styles.includes(".note-grid-keyboard-help") && styles.includes("text-align: right"),
    "note-grid keyboard guidance should retain a compact dedicated presentation"
  );
}

function validateClosedDetailsContainment(html) {
  const detailsTags = html.match(/<details\b[^>]*>/g) ?? [];
  const openDetailsTags = detailsTags.filter((tag) => /\sopen(?:=|\s|>)/.test(tag));
  const expectedDisclosures = [
    "first-run-launchpad",
    "transport-session-tools",
    "transport-export-tools",
    "guide-quick-start-details",
    "guidance-center",
    "audience-session-proof-details",
    "pattern-lab",
    "capture-ideas",
    "harmony-moves",
    "sound-design-tools",
    "block-moves",
    "arrangement-tools",
    "mixer-processing-drum_rack",
    "mixer-processing-bass_808",
    "mixer-processing-synth",
    "mixer-processing-chord",
    "mix-moves",
    "mix-review-tools",
    "master-polish-tools",
    "master-review-tools",
    "master-review-queue-tools",
    "master-mix-coach-tools",
    "handoff-status-tools",
    "handoff-audit-tools"
  ];
  check(
    styles.includes("details:not([open]) > :not(summary)") && styles.includes("display: none !important;"),
    "closed native disclosures should globally suppress every non-summary direct child even when component layout rules set display"
  );
  check(
    appSource.includes('event.target instanceof HTMLElement ? event.target.closest("summary")') &&
      appSource.includes("focusedSummary.parentElement instanceof HTMLDetailsElement") &&
      appSource.includes('(event.key === "Enter" || event.code === "Space")') &&
      appSource.includes("focusedSummary.click()"),
    "focused disclosure summaries should consume unmodified Enter/Space through one click-equivalent toggle before global playback handling"
  );
  check(
    detailsTags.length === expectedDisclosures.length &&
      expectedDisclosures.every((testId) => detailsTags.some((tag) => tag.includes(`data-testid=\"${testId}\"`))),
    `renderer should expose the complete ${expectedDisclosures.length}-disclosure inventory under the shared containment contract`
  );
  check(
    openDetailsTags.length === 1 && openDetailsTags[0]?.includes('data-testid="first-run-launchpad"'),
    "first render should keep only the project launchpad open while every tool and guidance disclosure starts contained"
  );
}

function validateQuickActionLoadStates(shell) {
  const baseProps = {
    actions: [],
    inspectedPinnedActionId: null,
    inspectedRecentActionId: null,
    open: true,
    pinnedActionIds: [],
    pinnedResult: null,
    query: "",
    recentActionSource: [],
    recentResult: null,
    recents: [],
    searchHintResult: null,
    searchRecoveryResult: null,
    searchResult: null,
    scope: "all",
    scopeResult: null,
    scopeOptions: [],
    onApplySearchHint() {},
    onClose() {},
    onInspectPinnedAction() {},
    onInspectRecentAction() {},
    onOpenCommandReference() {},
    onQueryChange() {},
    onRecoverSearchClear() {},
    onRecoverSearchScope() {},
    onRetryLoad() {},
    onRun() {},
    onScopeChange() {},
    onTogglePin() {}
  };
  const loadingHtml = renderToStaticMarkup(
    React.createElement(shell.QuickActions, { ...baseProps, loadError: null, loading: true })
  );
  const errorHtml = renderToStaticMarkup(
    React.createElement(shell.QuickActions, {
      ...baseProps,
      loadError: "Quick Actions could not load. Your project is unchanged.",
      loading: false
    })
  );
  const readyActions = [
    { id: "disabled-first", title: "Disabled first", detail: "Unavailable", group: "Guide", keywords: "disabled", disabled: true, run() {} },
    { id: "runnable-second", title: "Runnable second", detail: "First runnable", group: "Guide", keywords: "second", run() {} },
    { id: "runnable-third", title: "Runnable third", detail: "Second runnable", group: "Guide", keywords: "third", run() {} }
  ];
  const readyHtml = renderToStaticMarkup(
    React.createElement(shell.QuickActions, {
      ...baseProps,
      actions: readyActions,
      loadError: null,
      loading: false,
      recentActionSource: readyActions,
      scopeOptions: [{ id: "all", label: "All", count: readyActions.length }]
    })
  );

  check(
    loadingHtml.includes('data-testid="quick-actions-loading"') &&
      loadingHtml.includes('aria-busy="true"') &&
      loadingHtml.includes("The workstation stays usable while Actions becomes ready."),
    "Quick Actions loading state should render an immediate busy dialog without false empty results"
  );
  check(
    errorHtml.includes('data-testid="quick-actions-load-error"') &&
      errorHtml.includes('data-testid="quick-actions-load-retry"') &&
      errorHtml.includes("Your project is unchanged."),
    "Quick Actions load failure should render a non-destructive retry path"
  );
  check(
    readyHtml.includes('aria-controls="quick-actions-list"') &&
      readyHtml.includes('aria-describedby="quick-actions-keyboard-selection"') &&
      readyHtml.includes('aria-keyshortcuts="ArrowDown ArrowUp Home End Enter"') &&
      readyHtml.includes('data-keyboard-action="runnable-second"') &&
      readyHtml.includes('data-testid="quick-actions-keyboard-selection-position">Selected 1 of 2') &&
      readyHtml.includes('data-testid="quick-actions-keyboard-selection-title">Runnable second') &&
      readyHtml.includes('id="quick-action-option-runnable-second"') &&
      readyHtml.includes('class="quick-action-row keyboard-selected"'),
    "Quick Actions ready state should select and announce the first visible runnable result while excluding disabled commands"
  );
  check(
    styles.includes(".quick-actions-keyboard-selection") &&
      styles.includes(".quick-action-row.keyboard-selected .quick-action-run"),
    "Quick Actions keyboard selection should retain dedicated status and selected-row styling"
  );
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
  const guideQuickStartDecisionIndex = html.indexOf('data-testid="guide-quick-start-decision"');
  const guideQuickStartDetailsIndex = html.indexOf('data-testid="guide-quick-start-details"');
  const guideQuickStartPriorityIndex = html.indexOf('data-testid="guide-quick-start-priority"');
  check(
    guideQuickStartDecisionIndex >= 0 &&
      guideQuickStartDetailsIndex > guideQuickStartDecisionIndex &&
      guideQuickStartPriorityIndex > guideQuickStartDetailsIndex,
    "Guide Quick Start should keep the recommended decision direct before on-demand progress and route details"
  );
  check(
    !html.includes('<details class="guide-quick-start-details" data-testid="guide-quick-start-details" open="">') &&
      html.includes('data-testid="guide-quick-start-details-toggle"') &&
      html.includes('data-testid="guide-quick-start-details-content"') &&
      html.includes("Progress &amp; routes") &&
      html.includes("Completion diagnostics, bottleneck, context, and alternate paths"),
    "Guide Quick Start progress and alternate routes should start compact behind an informative native disclosure"
  );
  check(
      styles.includes(".guide-quick-start-details-summary:focus-visible") &&
      styles.includes(".guide-quick-start-details[open] .guide-quick-start-details-chevron") &&
      styles.includes("details:not([open]) > :not(summary)") &&
      styles.includes(".guide-quick-start-details-content"),
    "Guide Quick Start disclosure should retain keyboard focus, open-state, shared closed containment, and content styling"
  );
  const audienceNextStepIndex = html.indexOf('data-testid="audience-next-step-rail"');
  const audienceProofDetailsIndex = html.indexOf('data-testid="audience-session-proof-details"');
  const audienceSessionAcceptanceIndex = html.indexOf('data-testid="audience-session-acceptance"');
  const audienceSessionGridIndex = html.indexOf('data-testid="audience-session-grid"');
  check(
    audienceNextStepIndex >= 0 &&
      audienceProofDetailsIndex > audienceNextStepIndex &&
      audienceSessionAcceptanceIndex > audienceProofDetailsIndex &&
      audienceSessionGridIndex > audienceSessionAcceptanceIndex,
    "Audience Session should keep Next Step direct, proof diagnostics on demand, and audience action/starter cards direct"
  );
  check(
    !html.includes('<details class="audience-session-proof-details" data-testid="audience-session-proof-details" open="">') &&
      html.includes('data-testid="audience-session-proof-toggle"') &&
      html.includes('data-testid="audience-session-proof-content"') &&
      html.includes("Session proof") &&
      html.includes("Acceptance, completion, and delivery evidence for both lanes"),
    "Audience Session acceptance and delivery proof should start compact behind an informative native disclosure"
  );
  check(
    styles.includes(".audience-session-proof-summary:focus-visible") &&
      styles.includes(".audience-session-proof-details[open] .audience-session-proof-chevron") &&
      styles.includes("details:not([open]) > :not(summary)") &&
      styles.includes(".audience-session-proof-content"),
    "Audience Session proof disclosure should retain keyboard focus, open-state, shared closed containment, and content styling"
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
  const audienceStarterLandingSource = printNamedFunction(appSource, "App.tsx", "focusAudienceStarterLanding");
  const createAudienceStarterSource = printNamedFunction(appSource, "App.tsx", "createAudienceStarter");
  const workspaceScrollSource = printNamedFunction(appSource, "App.tsx", "scrollWorkspaceTargetIntoView");
  const workflowJumpSource = printNamedFunction(appSource, "App.tsx", "jumpToWorkflowZone");
  check(
    html.includes("Guided · opens the drum grid") &&
      html.includes("Studio · opens Review Queue") &&
      html.includes('data-testid="workflow-target-compose" aria-label="Pattern editor" tabindex="-1"') &&
      html.includes('data-testid="review-queue" aria-label="Review queue" tabindex="-1"'),
    "first-run choices should name their direct destinations and keep both landing regions programmatically focusable"
  );
  check(
    audienceStarterLandingSource.includes('starterId === "producer"') &&
      audienceStarterLandingSource.includes("setMasterReviewOpen(true)") &&
      audienceStarterLandingSource.includes("setMasterReviewQueueOpen(true)") &&
      audienceStarterLandingSource.includes("composePanelRef.current") &&
      audienceStarterLandingSource.includes("reviewQueuePanelRef.current") &&
      audienceStarterLandingSource.includes("scrollWorkspaceTargetIntoView(target)") &&
      audienceStarterLandingSource.includes("focus({ preventScroll: true })") &&
      createAudienceStarterSource.includes("focusAudienceStarterLanding(starterId)") &&
      workspaceScrollSource.includes('scrollIntoView({ block: "start", behavior: "auto" })') &&
      workspaceScrollSource.includes("window.innerWidth < 1221") &&
      workspaceScrollSource.includes("navigator.getBoundingClientRect().bottom + 12") &&
      workspaceScrollSource.includes('window.scrollBy({ top: targetTop - desiredTop, behavior: "auto" })') &&
      workflowJumpSource.includes("scrollWorkspaceTargetIntoView(targetRefs[zone])"),
    "both visible and Quick Actions starter creation should reuse one deterministic Compose or Review Queue landing route"
  );
  check(
    styles.includes(".workspace-grid > .panel,") &&
      styles.includes(".review-queue,") &&
      styles.includes("scroll-margin-top: 148px;"),
    "desktop workspace landing targets should clear the sticky Workflow Navigator"
  );
  check(
    styles.includes("container-name: review-queue;") &&
      styles.includes("container-type: inline-size;") &&
      styles.includes("@container review-queue (max-width: 720px)") &&
      styles.includes(".review-queue-focus-readout,") &&
      styles.includes(".review-queue-priority,") &&
      styles.includes(".review-fix-preview,") &&
      styles.includes("grid-template-columns: minmax(0, 1fr);") &&
      styles.includes("overflow-wrap: anywhere;"),
    "Review Queue should switch from its wide scan layout to readable wrapped rows from the component's own inline size"
  );
  check(
    appSource.includes('aria-label="Move selected arrangement block left"') &&
      appSource.includes('aria-label="Move selected arrangement block right"') &&
      appSource.includes("<span>Move left</span>") &&
      appSource.includes("<span>Move right</span>") &&
      appSource.includes('data-testid="arrangement-move-left"') &&
      appSource.includes('data-testid="arrangement-move-right"'),
    "both arrangement move controls should expose complete directional labels and unique selected-block accessible names"
  );
  const chordToolAccessibleNames = [
    "Audition selected chord",
    "Move selected chord one step left",
    "Move selected chord one step right",
    "Duplicate selected chord to the next empty step",
    "Duplicate selected chord to the previous beat",
    "Duplicate selected chord to the next beat",
    "Move selected chord voicing down",
    "Move selected chord voicing up"
  ];
  const chordToolVisibleLabels = [
    "Audition",
    "Step left",
    "Step right",
    "Duplicate",
    "Prev beat",
    "Next beat",
    "Voice down",
    "Voice up"
  ];
  check(
    chordToolAccessibleNames.every((label) => composePanelsSource.includes(`aria-label="${label}"`)) &&
      chordToolVisibleLabels.every((label) => composePanelsSource.includes(`<span>${label}</span>`)) &&
      composePanelsSource.includes('data-testid="chord-edit-tools"'),
    "all eight selected-chord actions should expose complete visible labels and unique directional accessible names"
  );
  check(
    styles.includes("container-name: chord-editor;") &&
      styles.includes("container-type: inline-size;") &&
      styles.includes("@container chord-editor (max-width: 780px)") &&
      styles.includes("grid-template-columns: repeat(4, minmax(0, 1fr));") &&
      styles.includes("min-height: 48px;") &&
      styles.includes("text-overflow: clip;") &&
      styles.includes("white-space: normal;"),
    "the selected-chord toolbar should use a readable four-by-two layout when its own component is narrow"
  );
  const noteToolAccessibleNames = [
    "Move selected note one step left",
    "Move selected note one step right",
    "Move selected note down in scale",
    "Move selected note up in scale",
    "Move selected note down an octave",
    "Move selected note up an octave",
    "Duplicate selected note to the next empty step",
    "Duplicate selected note to the previous beat",
    "Duplicate selected note to the next beat",
    "Audition selected 808 or Synth note"
  ];
  const noteToolVisibleLabels = [
    "Step left",
    "Step right",
    "Pitch down",
    "Pitch up",
    "Octave down",
    "Octave up",
    "Duplicate",
    "Prev beat",
    "Next beat",
    "Audition"
  ];
  check(
    noteToolAccessibleNames.every((label) => composePanelsSource.includes(`aria-label="${label}"`)) &&
      noteToolVisibleLabels.every((label) => composePanelsSource.includes(`<span>${label}</span>`)) &&
      composePanelsSource.includes('aria-label="Selected note tools"'),
    "all ten selected-note actions should expose complete visible labels and unique action-specific accessible names"
  );
  check(
    styles.includes("container-name: note-inspector;") &&
      styles.includes("container-type: inline-size;") &&
      styles.includes("@container note-inspector (max-width: 780px)") &&
      styles.includes("grid-template-columns: repeat(5, minmax(0, 1fr));") &&
      styles.includes("min-height: 48px;") &&
      styles.includes("text-overflow: clip;") &&
      styles.includes("white-space: normal;"),
    "the selected-note toolbar should use a readable five-by-two layout when its own inspector is narrow"
  );
  const drumToolAccessibleNames = [
    "Audition selected drum hit",
    "Copy selected drum hit shape",
    "Paste copied drum hit to the next empty step",
    "Duplicate selected drum hit to the previous beat",
    "Duplicate selected drum hit to the next beat"
  ];
  const drumToolVisibleLabels = ["Audition", "Copy hit", "Paste next", "Previous beat", "Next beat"];
  check(
    drumToolAccessibleNames.every((label) => composePanelsSource.includes(`aria-label="${label}"`)) &&
      drumToolVisibleLabels.every((label) => composePanelsSource.includes(`<span>${label}</span>`)) &&
      composePanelsSource.includes('aria-label="Selected drum hit tools"'),
    "all five selected-drum actions should expose complete visible labels and unique action-specific accessible names"
  );
  check(
    styles.includes(".drum-clipboard-row button {") &&
      styles.includes("align-items: stretch;") &&
      styles.includes("grid-template-columns: minmax(0, 1fr);") &&
      styles.includes("min-height: 48px;") &&
      styles.includes(".drum-clipboard-row button span {") &&
      styles.includes("text-overflow: clip;") &&
      styles.includes("white-space: normal;"),
    "the selected-drum toolbar should keep five readable columns with comfortable wrapped controls"
  );
  check(
    appSource.includes('aria-label={`Mute ${channel.name}`}') &&
      appSource.includes('aria-label={`Solo ${channel.name}`}') &&
      appSource.includes("aria-pressed={channel.muted}") &&
      appSource.includes("aria-pressed={channel.solo}") &&
      appSource.includes("<span>Mute</span>") &&
      appSource.includes("<span>Solo</span>") &&
      appSource.includes('data-testid={`mixer-strip-${channel.id}`}') &&
      appSource.includes('data-testid={`mixer-toggles-${channel.id}`}') &&
      appSource.includes('"Solo is unavailable on the Master channel"'),
    "all ten mixer toggles should expose complete labels, channel-specific names, pressed state, and an explicit disabled Master solo explanation"
  );
  check(
    styles.includes("container-name: mixer-strip;") &&
      styles.includes("container-type: inline-size;") &&
      styles.includes("@container mixer-strip (max-width: 190px)") &&
      styles.includes("grid-template-columns: repeat(2, minmax(48px, auto));") &&
      styles.includes("grid-template-columns: repeat(2, minmax(0, 1fr));") &&
      styles.includes("min-width: 48px;") &&
      styles.includes("display: block;") &&
      styles.includes("white-space: nowrap;"),
    "mixer toggles should retain a wide inline scan and use two contained full-label controls below the track name in each narrow strip"
  );
  const swingFeelPadIds = ["straight", "tight", "laid", "loose", "style"];
  const swingFeelPadSegments = swingFeelPadIds.map((id) => {
    const marker = html.indexOf(`data-testid="swing-feel-${id}"`);
    const start = marker >= 0 ? html.lastIndexOf("<button", marker) : -1;
    return start >= 0 ? html.slice(start, html.indexOf("</button>", start)) : "";
  });
  check(
    swingFeelPadSegments.every((segment) => segment.includes('aria-pressed="false"') || segment.includes('aria-pressed="true"')) &&
      swingFeelPadSegments.filter((segment) => segment.includes('aria-pressed="true"')).length === 1 &&
      swingFeelPadSegments[4]?.includes('aria-pressed="true"') &&
      appSource.includes("aria-pressed={selected}"),
    "all five Swing Feel pads should expose truthful pressed semantics with only the current Style target selected"
  );
  check(
    styles.includes(".swing-feel-row button {") &&
      styles.includes("appearance: none;") &&
      styles.includes("background: rgba(244, 239, 231, 0.045);") &&
      styles.includes(".swing-feel-row button:hover {") &&
      styles.includes(".swing-feel-row button:focus-visible {") &&
      styles.includes("outline: 2px solid #82d7ff;") &&
      styles.includes(".swing-feel-row button.selected {") &&
      styles.includes("inset 3px 0 0 #78f0c8") &&
      styles.includes(".swing-feel-row button.selected span,") &&
      styles.includes("color: #b8ffe7;"),
    "Swing Feel pads should override native light buttons with complete dark, hover, focus, selected, and text-hierarchy styling"
  );
  const groovePresetIds = ["tight", "pocket", "push", "reset"];
  const groovePresetSegments = groovePresetIds.map((id) => {
    const marker = html.indexOf(`data-testid="groove-preset-${id}"`);
    const start = marker >= 0 ? html.lastIndexOf("<button", marker) : -1;
    return start >= 0 ? html.slice(start, html.indexOf("</button>", start)) : "";
  });
  const groovePresetAccessibleNames = groovePresetSegments
    .map((segment) => segment.match(/aria-label="([^"]+)"/)?.[1] ?? "")
    .filter(Boolean);
  check(
    html.includes('data-testid="pattern-groove-presets"') &&
      html.includes("Pattern groove") &&
      html.includes("Pattern A") &&
      html.includes("Applies editable velocity + timing. Use Undo to compare.") &&
      html.includes("Controlled timing") &&
      html.includes("Laid-back backbeat") &&
      html.includes("Early energy") &&
      html.includes("Default feel") &&
      groovePresetSegments.every(
        (segment) =>
          segment.includes("aria-label=") &&
          segment.includes("title=") &&
          segment.includes("<strong>") &&
          segment.includes("<span>")
      ) &&
      groovePresetAccessibleNames.length === 4 &&
      new Set(groovePresetAccessibleNames).size === 4,
    "all four Pattern groove presets should explain their feel, selected-Pattern scope, editability, Undo path, and unique actions"
  );
  check(
    styles.includes(".groove-actions {") &&
      styles.includes("grid-template-columns: repeat(4, minmax(0, 1fr));") &&
      styles.includes("align-items: stretch;") &&
      styles.includes(".groove-actions button {") &&
      styles.includes("min-height: 48px;") &&
      styles.includes(".groove-actions button strong,") &&
      styles.includes("overflow-wrap: anywhere;") &&
      styles.includes("text-overflow: clip;") &&
      styles.includes("white-space: normal;"),
    "Pattern groove presets should retain a contained four-column direct scan with comfortable wrapped controls"
  );
  check(
    styles.includes(":where(button) {") &&
      styles.includes("appearance: none;") &&
      styles.includes("border: 1px solid rgba(244, 239, 231, 0.16);") &&
      styles.includes("background: rgba(244, 239, 231, 0.045);") &&
      styles.includes(":where(button:hover:not(:disabled)) {") &&
      styles.includes(":where(button:focus-visible) {") &&
      styles.includes("outline: 2px solid #82d7ff;") &&
      styles.includes(":where(button:disabled) {") &&
      styles.includes("cursor: not-allowed;") &&
      html.includes('data-testid="groove-preset-tight"') &&
      html.includes('data-testid="chord-copy"') &&
      html.includes('data-testid="arrangement-copy"') &&
      html.includes('data-testid="stem-audition-drum_rack"') &&
      html.includes('data-testid="mix-snapshot-capture-a"') &&
      html.includes('data-testid="session-brief-starter-starter"'),
    "the low-specificity button foundation should theme formerly native first-viewport and deep-workflow controls without replacing component styles"
  );
  check(
    styles.includes('"brand setup commands"') &&
      styles.includes('"launch launch commands"') &&
      styles.includes("grid-template-columns: 220px minmax(0, 1fr) 340px;") &&
      styles.includes(".brand-start {\n    display: contents;") &&
      styles.includes("grid-template-columns: minmax(100px, 127px) minmax(56px, 68px) 96px minmax(84px, 100px) 72px minmax(125px, 1fr);") &&
      styles.includes("grid-template-columns: minmax(180px, 0.85fr) repeat(2, minmax(190px, 1fr));") &&
      styles.includes(".command-strip .transport-essential-controls,") &&
      styles.includes("grid-template-columns: repeat(4, minmax(0, 1fr));") &&
      html.includes('data-testid="first-run-start-beat"') &&
      html.includes('data-testid="first-run-producer-pass"') &&
      html.includes('data-testid="first-run-open-project"'),
    "desktop first run should use a compact two-row transport with horizontal audience choices and preserved direct project actions"
  );
  check(
    styles.includes("@media (min-width: 901px) and (max-width: 1220px) {") &&
      styles.includes('"brand setup"') &&
      styles.includes('"launch launch"') &&
      styles.includes('"commands commands"') &&
      styles.includes("grid-template-columns: 200px minmax(0, 1fr);") &&
      styles.includes("grid-template-columns: minmax(110px, 140px) minmax(56px, 64px) 96px minmax(84px, 100px) 72px minmax(125px, 1fr);") &&
      styles.includes("grid-template-columns: minmax(180px, 0.8fr) repeat(2, minmax(190px, 1fr));") &&
      styles.includes(".command-strip .transport-essential-controls {") &&
      styles.includes("grid-column: 2 / 4;") &&
      styles.includes(".command-strip .transport-session-tools {") &&
      styles.includes("grid-column: 1 / 3;") &&
      styles.includes(".command-strip .transport-export-tools {") &&
      styles.includes("grid-column: 3 / 5;"),
    "the reachable minimum desktop width should use an intermediate transport layout without hiding setup, audience, command, or disclosure surfaces"
  );
  const loopScopeSegments = [
    "playback-mode-arrangement",
    "transport-loop-block",
    "transport-loop-transition",
    "playback-mode-pattern"
  ].map((testId) => {
    const marker = html.indexOf(`data-testid="${testId}"`);
    const start = marker >= 0 ? html.lastIndexOf("<button", marker) : -1;
    return start >= 0 ? html.slice(start, html.indexOf("</button>", start)) : "";
  });
  const loopScopeAccessibleNames = loopScopeSegments
    .map((segment) => segment.match(/aria-label="([^"]+)"/)?.[1] ?? "")
    .filter(Boolean);
  check(
    html.includes('aria-label="Choose audition loop scope"') &&
      html.includes('class="segmented playback-mode-row"') &&
      html.includes('role="group"') &&
      loopScopeSegments.every(
        (segment) =>
          segment.includes("aria-label=") &&
          segment.includes("aria-pressed=") &&
          segment.includes("title=") &&
          segment.includes("<strong>") &&
          segment.includes("<small>")
      ) &&
      loopScopeSegments[0].includes('aria-pressed="true"') &&
      loopScopeSegments.slice(1).every((segment) => segment.includes('aria-pressed="false"')) &&
      loopScopeAccessibleNames.length === 4 &&
      new Set(loopScopeAccessibleNames).size === 4 &&
      html.includes("8 bars timeline") &&
      html.includes("<small>All 8 bars</small>") &&
      html.includes("Intro · 1 bar") &&
      html.includes("Intro → Verse") &&
      html.includes("A · 21 events") &&
      !html.includes("events events"),
    "Transport loop scope should expose four complete live targets, unique names, one pressed scope, and correct event-count grammar"
  );
  check(
    styles.includes(".playback-mode-row button {") &&
      styles.includes("min-height: 48px;") &&
      styles.includes(".playback-mode-row button strong,") &&
      styles.includes(".playback-mode-row button small {") &&
      styles.includes("text-overflow: clip;") &&
      styles.includes("white-space: nowrap;") &&
      styles.includes(".playback-mode-row button.selected small {") &&
      styles.includes("grid-template-columns: repeat(4, minmax(64px, 1fr));"),
    "Transport loop scope should retain a contained readable four-column scan with comfortable two-line controls"
  );
  const metronomeMarker = html.indexOf('data-testid="metronome-toggle"');
  const metronomeButtonStart = metronomeMarker >= 0 ? html.lastIndexOf("<button", metronomeMarker) : -1;
  const metronomeSegment =
    metronomeButtonStart >= 0 ? html.slice(metronomeButtonStart, html.indexOf("</button>", metronomeButtonStart)) : "";
  check(
    metronomeSegment.includes('aria-label="Metronome off, 82 BPM. Turn on"') &&
      metronomeSegment.includes('aria-pressed="false"') &&
      metronomeSegment.includes('class="icon-button metronome-toggle ') &&
      metronomeSegment.includes('title="Turn metronome on"') &&
      metronomeSegment.includes("<strong>Metronome</strong>") &&
      metronomeSegment.includes("<small>Off · 82 BPM</small>"),
    "Metronome should expose its complete name, current state, BPM, next action, pressed state, and retained title"
  );
  check(
    styles.includes(".icon-button.metronome-toggle {") &&
      styles.includes(".command-strip .icon-button.metronome-toggle {") &&
      styles.includes(".metronome-toggle strong,") &&
      styles.includes(".metronome-toggle small {") &&
      styles.includes(".metronome-toggle.selected small,") &&
      styles.includes('.metronome-toggle[aria-pressed="true"] small {'),
    "Metronome should keep a contained readable two-line command-strip treatment with explicit active-state detail"
  );
  const tapTempoMarker = html.indexOf('data-testid="tap-tempo-button"');
  const tapTempoButtonStart = tapTempoMarker >= 0 ? html.lastIndexOf("<button", tapTempoMarker) : -1;
  const tapTempoSegment =
    tapTempoButtonStart >= 0 ? html.slice(tapTempoButtonStart, html.indexOf("</button>", tapTempoButtonStart)) : "";
  check(
    html.includes("<small>Tap Tempo · Undo/Keys</small>") &&
      tapTempoSegment.includes('aria-label="Tap Tempo, current project 82 BPM. Start with two or more taps"') &&
      tapTempoSegment.includes('class="icon-button tap-tempo-button"') &&
      tapTempoSegment.includes('title="Tap Tempo: current project 82 BPM · Tap two or more times to set tempo"') &&
      tapTempoSegment.includes('<span class="tap-tempo-button-copy">') &&
      tapTempoSegment.includes("<strong>Tap Tempo</strong>") &&
      tapTempoSegment.includes("<small>Start · 82 BPM</small>"),
    "Tap Tempo should be discoverable from the closed Session Context summary and expose complete live start-state copy, naming, and title"
  );
  check(
    styles.includes(".tap-tempo-button {") &&
      styles.includes("min-width: 140px;") &&
      styles.includes(".tap-tempo-button-copy {") &&
      styles.includes(".tap-tempo-button-copy strong,") &&
      styles.includes(".tap-tempo-button-copy small {") &&
      styles.includes(".tap-tempo-button-copy strong {") &&
      styles.includes(".tap-tempo-button-copy small {"),
    "Tap Tempo should keep a contained readable two-line direct-control treatment"
  );
  const tempoNudgeMarker = html.indexOf('data-testid="tempo-nudge-pads"');
  const tempoNudgeStart = tempoNudgeMarker >= 0 ? html.lastIndexOf("<div", tempoNudgeMarker) : -1;
  const tempoNudgeEnd = tempoNudgeStart >= 0 ? html.indexOf("</div>", tempoNudgeStart) : -1;
  const tempoNudgeSegment = tempoNudgeEnd >= 0 ? html.slice(tempoNudgeStart, tempoNudgeEnd) : "";
  const expectedTempoNudgeMarkup = [
    ["tempo-nudge-down", "Lower tempo by 1 BPM, 82 to 81 BPM", "Lower tempo by 1 BPM: 82 → 81 BPM", "-1 BPM", "81 BPM"],
    ["tempo-nudge-up", "Raise tempo by 1 BPM, 82 to 83 BPM", "Raise tempo by 1 BPM: 82 → 83 BPM", "+1 BPM", "83 BPM"],
    ["tempo-nudge-half", "Set half-time BPM, 82 to 60 BPM", "Set half-time BPM: 82 → 60 BPM", "Half", "60 BPM"],
    ["tempo-nudge-double", "Set double-time BPM, 82 to 164 BPM", "Set double-time BPM: 82 → 164 BPM", "Double", "164 BPM"]
  ];
  check(
    tempoNudgeSegment.includes('aria-label="Tempo nudge pads"') &&
      tempoNudgeSegment.includes('role="group"') &&
      expectedTempoNudgeMarkup.every(([testId, accessibleName, title, label, target]) => {
        const marker = tempoNudgeSegment.indexOf(`data-testid="${testId}"`);
        const buttonStart = marker >= 0 ? tempoNudgeSegment.lastIndexOf("<button", marker) : -1;
        const buttonEnd = buttonStart >= 0 ? tempoNudgeSegment.indexOf("</button>", buttonStart) : -1;
        const buttonSegment = buttonEnd >= 0 ? tempoNudgeSegment.slice(buttonStart, buttonEnd) : "";
        return (
          buttonSegment.includes(`aria-label="${accessibleName}"`) &&
          buttonSegment.includes(`title="${title}"`) &&
          buttonSegment.includes(`<strong>${label}</strong>`) &&
          buttonSegment.includes(`<small>${target}</small>`)
        );
      }),
    "Tempo Nudge pads should expose complete actions, current-to-target accessible names, exact target BPM, retained ids, and target-aware titles"
  );
  check(
    styles.includes(".tempo-nudge-pads {") &&
      styles.includes("min-width: 104px;") &&
      styles.includes("min-height: 54px;") &&
      styles.includes(".tempo-nudge-pads button strong,") &&
      styles.includes(".tempo-nudge-pads button small {") &&
      styles.includes("min-height: 25px;") &&
      styles.includes("grid-template-columns: minmax(100px, 127px) minmax(56px, 68px) 96px minmax(84px, 100px) 72px minmax(125px, 1fr);") &&
      styles.includes("grid-template-columns: minmax(110px, 140px) minmax(56px, 64px) 96px minmax(84px, 100px) 72px minmax(125px, 1fr);"),
    "Tempo Nudge pads should retain a contained readable two-by-two setup-row treatment at wide and minimum desktop widths"
  );
  const bpmInputIndex = html.indexOf('data-testid="project-bpm-input"');
  const keySelectIndex = html.indexOf('data-testid="project-key-select"');
  const timeSignatureIndex = html.indexOf('data-testid="project-time-signature"');
  const styleSelectIndex = html.indexOf('data-testid="style-select"');
  check(
    bpmInputIndex >= 0 &&
      keySelectIndex > bpmInputIndex &&
      timeSignatureIndex > keySelectIndex &&
      styleSelectIndex > timeSignatureIndex &&
      html.includes('aria-label="Project BPM"') &&
      html.includes('aria-label="Project key"') &&
      html.includes('aria-label="Time signature 4/4, fixed grid"') &&
      html.includes('title="GrooveForge currently uses a fixed 4/4 project grid"') &&
      html.includes('data-testid="project-time-signature-value"') &&
      html.includes("<strong>4/4</strong>") &&
      html.includes("<small>Fixed grid</small>"),
    "Project setup should expose editable BPM and Key followed by an honest read-only 4/4 Time signature before Style"
  );
  check(
    appSource.includes('projectTimeSignature') &&
      workstationSource.includes('export const projectTimeSignature = "4/4" as const;') &&
      styles.includes(".time-signature-field output,") &&
      styles.includes(".time-signature-field strong,") &&
      styles.includes(".time-signature-field small {") &&
      styles.includes("text-overflow: clip;") &&
      styles.includes("white-space: nowrap;"),
    "Time signature should reuse the domain-owned fixed meter and retain a contained two-line setup treatment"
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
  check(
    [
      'data-testid="project-title-input"',
      'data-testid="project-bpm-input"',
      'data-testid="project-key-select"',
      'data-testid="project-time-signature"',
      'aria-keyshortcuts="Control+K Meta+K"',
      'aria-keyshortcuts="? Control+/ Meta+/"',
      'aria-keyshortcuts="Space"',
      'aria-keyshortcuts="Control+Z Meta+Z"',
      'aria-keyshortcuts="Control+Y Meta+Y Control+Shift+Z Meta+Shift+Z"',
      'aria-keyshortcuts="Control+O Meta+O"',
      'aria-keyshortcuts="Control+S Meta+S"'
    ].every((shortcut) => html.includes(shortcut)),
    "essential transport and project controls should expose a stable editable field hook and their existing desktop shortcuts"
  );
  check(
    appSource.includes("sanitizeProjectTitleInput(event.target.value)") &&
      appSource.includes("normalizeProjectTitle(projectRef.current.title)") &&
      appSource.includes("maxLength={maxProjectTitleLength * 2}") &&
      /maxLength="160"/.test(html) &&
      appSource.includes('"Normalized project title"'),
    "project title input should sanitize while typing, preserve the Unicode code-point budget, and finalize on blur"
  );
  check(
    html.includes('title="Open Quick Actions (Ctrl/Cmd+K)"') &&
      html.includes('title="Open Command Reference (? or Ctrl/Cmd+/)"') &&
      html.includes('title="Play Song loop · 8 bars timeline · 82 BPM · Space"') &&
      html.includes('title="Undo last edit (Ctrl/Cmd+Z)"') &&
      html.includes('title="Redo last undone edit (Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y)"') &&
      html.includes('title="Open project (Ctrl/Cmd+O)"') &&
      html.includes('title="Save project (Ctrl/Cmd+S)"'),
    "essential transport and project controls should name shortcuts in native tooltips"
  );
  check(
    html.includes('data-testid="transport-play"') && html.includes('aria-pressed="false"'),
    "initial Play control should expose its stopped pressed state"
  );
  const transportPlayStart = transportPlayIndex >= 0 ? html.lastIndexOf("<button", transportPlayIndex) : -1;
  const transportPlaySegment =
    transportPlayStart >= 0 ? html.slice(transportPlayStart, html.indexOf("</button>", transportPlayStart)) : "";
  check(
    transportPlaySegment.includes('aria-label="Play Song loop, 8 bars timeline, 82 BPM"') &&
      transportPlaySegment.includes('class="icon-button primary transport-play-toggle"') &&
      transportPlaySegment.includes('title="Play Song loop · 8 bars timeline · 82 BPM · Space"') &&
      transportPlaySegment.includes('<span class="transport-play-copy">') &&
      transportPlaySegment.includes("<strong>Play</strong>") &&
      transportPlaySegment.includes("<small>Song · 8 bars</small>"),
    "Play should expose complete direct Song-loop target, BPM, next-action naming, and two-line visible copy"
  );
  check(
    styles.includes(".icon-button.transport-play-toggle {") &&
      styles.includes("min-width: 112px;") &&
      styles.includes("width: 340px;") &&
      styles.includes("grid-template-columns: repeat(3, 68px) 112px;") &&
      styles.includes(
        ".command-strip .transport-essential-controls > .icon-button:not(.metronome-toggle):not(.transport-play-toggle) {"
      ) &&
      styles.includes(".transport-play-copy {") &&
      styles.includes(".transport-play-copy strong,") &&
      styles.includes(".transport-play-copy small {") &&
      styles.includes(".transport-play-copy strong {") &&
      styles.includes(".transport-play-copy small {"),
    "Play should keep a contained readable two-line direct-control treatment"
  );
  check(
    ["A", "B", "C"].every((pattern, index) =>
      html.includes(`aria-keyshortcuts="${index + 1}"`) && html.includes(`title="Edit Pattern ${pattern} (${index + 1})"`)
    ),
    "Pattern A/B/C tabs should expose 1/2/3 shortcut semantics and tooltips"
  );
  const patternTabSegments = ["A", "B", "C"].map((pattern) => {
    const marker = html.indexOf(`data-testid="pattern-tab-${pattern}"`);
    const start = marker >= 0 ? html.lastIndexOf("<button", marker) : -1;
    return start >= 0 ? html.slice(start, html.indexOf("</button>", start)) : "";
  });
  const patternTabAccessibleNames = patternTabSegments
    .map((segment) => segment.match(/aria-label="([^"]+)"/)?.[1] ?? "")
    .filter(Boolean);
  check(
    html.includes('aria-label="Edit Pattern A, B, or C"') &&
      html.includes('aria-orientation="horizontal"') &&
      html.includes('class="pattern-tabs" role="tablist"') &&
      patternTabSegments.every(
        (segment, index) =>
          segment.includes('role="tab"') &&
          segment.includes(`Pattern ${["A", "B", "C"][index]}`) &&
          segment.includes("event") &&
          segment.includes("aria-selected=") &&
          segment.includes("data-editing=")
      ) &&
      patternTabAccessibleNames.length === 3 &&
      new Set(patternTabAccessibleNames).size === 3 &&
      patternTabSegments[0].includes('aria-selected="true"') &&
      patternTabSegments[0].includes('tabindex="0"') &&
      patternTabSegments.slice(1).every((segment) => segment.includes('aria-selected="false"') && segment.includes('tabindex="-1"')),
    "Pattern A/B/C should render as a complete, uniquely named tablist with one selected roving tab stop"
  );
  check(
    appSource.includes("function handlePatternTabKeyDown") &&
      ["ArrowLeft", "ArrowRight", "Home", "End"].every((key) => appSource.includes(`event.key === \"${key}\"`)) &&
      appSource.includes("event.preventDefault()") &&
      appSource.includes("selectPattern(targetPattern)") &&
      appSource.includes("patternTabRefs.current[targetPattern]?.focus()"),
    "Pattern tabs should wrap and automatically select/focus with ArrowLeft, ArrowRight, Home, and End"
  );
  check(
    styles.includes(".pattern-tabs button {") &&
      styles.includes("min-height: 48px;") &&
      styles.includes(".pattern-tabs button small strong,") &&
      styles.includes("text-overflow: clip;") &&
      styles.includes("white-space: nowrap;"),
    "Pattern tabs should retain a comfortable contained three-column scan with complete state copy"
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
  const arrangementPatternControlsIndex = html.indexOf('data-testid="arrangement-pattern-controls"');
  const arrangementTrackStateControlsIndex = html.indexOf('data-testid="arrangement-track-state-controls"');
  const arrangementShapeControlsIndex = html.indexOf('data-testid="arrangement-shape-controls"');
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
    arrangementPatternControlsIndex > selectedBlockEditorIndex &&
      arrangementTrackStateControlsIndex > arrangementPatternControlsIndex &&
      arrangementShapeControlsIndex > arrangementTrackStateControlsIndex &&
      arrangementBarsIndex > arrangementShapeControlsIndex &&
      html.includes("Pattern") &&
      html.includes("Track state") &&
      html.includes("All playing") &&
      html.includes("Block shape") &&
      html.includes("1 bar cannot split"),
    "Selected arrangement editor should visibly group Pattern, Track state, and Block shape controls in editing order"
  );
  const mobileStylesStart = styles.indexOf("@media (max-width: 620px)");
  const mobileStylesEnd = styles.indexOf("@media", mobileStylesStart + 1);
  const mobileStyles = styles.slice(mobileStylesStart, mobileStylesEnd);
  check(
    mobileStylesStart >= 0 &&
      mobileStyles.includes(".arrangement-editor,") &&
      mobileStyles.includes(".arrangement-shape-controls,") &&
      mobileStyles.includes(".arrangement-block-role-readout") &&
      mobileStyles.includes("grid-template-columns: 1fr;") &&
      mobileStyles.includes(".arrangement-actions") &&
      mobileStyles.includes("grid-template-columns: repeat(2, minmax(0, 1fr));"),
    "Selected arrangement editor should use one-column fields and two-column structure actions at 620px and below"
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
  const finishChecklistIndex = html.indexOf('data-testid="finish-checklist"');
  const masterReviewQueueToolsIndex = html.indexOf('data-testid="master-review-queue-tools"');
  const exportMeterIndex = html.indexOf('data-testid="export-meter"');
  const masterMixCoachToolsIndex = html.indexOf('data-testid="master-mix-coach-tools"');
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
    finishChecklistIndex > masterReviewIndex &&
      masterReviewQueueToolsIndex > finishChecklistIndex &&
      exportMeterIndex > masterReviewQueueToolsIndex &&
      masterMixCoachToolsIndex > exportMeterIndex,
    "Master Review should keep Finish Checklist and Export Meter direct around compact Review Queue and Mix Coach diagnostics"
  );
  check(
    !html.includes('<details class="master-polish-tools" data-testid="master-polish-tools" open="">') &&
      !html.includes('<details class="master-review-tools" data-testid="master-review-tools" open="">') &&
      !html.includes('<details class="master-diagnostic-tools" data-testid="master-review-queue-tools" open="">') &&
      !html.includes('<details class="master-diagnostic-tools" data-testid="master-mix-coach-tools" open="">') &&
      html.includes('data-testid="master-review-queue-toggle"') &&
      html.includes('data-testid="master-review-queue-content"') &&
      html.includes('data-testid="master-mix-coach-toggle"') &&
      html.includes('data-testid="master-mix-coach-content"'),
    "Guided first render should keep Polish, Review & Export, Review Queue, and Mix Coach compact with persistent summaries"
  );
  const handoffPackIndex = html.indexOf('data-testid="handoff-pack"');
  const handoffRouteIndex = html.indexOf('data-testid="handoff-pack-route-readout"');
  const handoffDirectIndex = html.indexOf('data-testid="handoff-pack-direct"');
  const handoffWavPreviewIndex = html.indexOf('data-testid="handoff-pack-preview-wav"');
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
      handoffWavPreviewIndex > handoffDirectIndex &&
      handoffGridIndex > handoffWavPreviewIndex &&
      handoffWavActionIndex > handoffGridIndex &&
      handoffStatusIndex > handoffWavActionIndex &&
      handoffAuditIndex > handoffStatusIndex &&
      handoffManifestIndex > handoffAuditIndex,
    "Delivery hierarchy should stay outside optional guidance after the workspace and keep route, rendered WAV preview, direct exports, delivery status, and package proof in order"
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
      'value="82"',
      "A minor",
      'data-testid="style-select"',
      'data-testid="style-starting-point"',
      "Starting point · 14 editable styles",
      "Lo-fi",
      "8 bars song loop"
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
      'data-testid="arrangement-pattern-controls"',
      'data-testid="arrangement-track-state-controls"',
      'data-testid="arrangement-shape-controls"',
      "Track state",
      "All playing",
      "Block shape",
      "1 bar cannot split",
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
      "Tap Tempo · Undo/Keys",
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
      'data-testid="master-review-queue-tools"',
      'data-testid="master-review-queue-toggle"',
      'data-testid="master-review-queue-content"',
      'data-testid="master-mix-coach-tools"',
      'data-testid="master-mix-coach-toggle"',
      'data-testid="master-mix-coach-content"',
      "Limiter ceiling",
      "Lower values leave more headroom before export.",
      "Output preset",
      "Polish &amp; Automation",
      "Review &amp; Export",
      "Prioritized production issues and targeted fixes",
      "Balance diagnosis and local corrective moves"
    ],
    "delivery actions first": [
      'data-testid="handoff-pack-direct"',
      'data-testid="handoff-pack-preview-wav"',
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
      "Preview WAV",
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
      beforeNeedles: ["current project", "First-time composer first beat", "Lo-fi", "A minor", "82 BPM", "8 bars", "editable events"],
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
      beforeNeedles: ["current project", "Professional producer studio pass", "Lo-fi", "A minor", "82 BPM", "8 bars", "editable events"],
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
  validateProjectFileLoadErrorStatus(await server.ssrLoadModule("/src/ui/workstationUiModel.ts"));
  validateMasterCeilingDraftLifecycle(await server.ssrLoadModule("/src/domain/workstation.ts"));
  validateProjectCloseGuard(await server.ssrLoadModule("/src/ui/projectCloseGuard.ts"));
  validateProjectReplacementGuard(await server.ssrLoadModule("/src/ui/projectReplacementGuard.ts"));
  validateProjectSaveCompletion(await server.ssrLoadModule("/src/ui/projectSaveCompletion.ts"));
  const html = renderToStaticMarkup(React.createElement(App));
  validateFirstRunRenderer(html);
  validateWorkspaceCommandDockSource(html);
  validateCompactStudioTransportSource();
  validateDrumGridKeyboardNavigation(
    html,
    await server.ssrLoadModule("/src/ui/drumGridKeyboardNavigation.ts")
  );
  validateNoteGridKeyboardNavigation(
    html,
    await server.ssrLoadModule("/src/ui/noteGridKeyboardNavigation.ts")
  );
  validateClosedDetailsContainment(html);
  check(
    html.includes('data-quick-actions-materialized="false"') &&
      html.includes('data-quick-actions-graph-state="deferred"'),
    "first render should keep the closed Quick Actions command graph unloaded and unmaterialized"
  );
  validateDemandMaterialization(await server.ssrLoadModule("/src/ui/workstationAppQuickActionPalette.ts"));
  validateLazyQuickActionGraphSource(await server.ssrLoadModule("/src/ui/workstationAppQuickActionGraph.ts"));
  validateQuickActionLoadStates(await server.ssrLoadModule("/src/ui/workstationShellPanels.tsx"));
  validateLocalDraftRecoveryDeferral(
    await server.ssrLoadModule("/src/ui/workstationShellPanels.tsx"),
    await server.ssrLoadModule("/src/ui/workstationAppHelpers.tsx"),
    await server.ssrLoadModule("/src/ui/localDraftLifecycle.ts"),
    await server.ssrLoadModule("/src/domain/workstation.ts")
  );
  validateFirstRunProjectOwnership(
    html,
    await server.ssrLoadModule("/src/ui/workstationAppHelpers.tsx")
  );
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
    console.log("- Starter: Untitled Beat, Guided 82 BPM A minor Lo-fi, 8 bars, Starter Sketch, 14 editable styles visible");
    console.log("- Project ownership: Editable 8-bar foundation, editable now, local only, explicit Save-to-keep guidance");
    console.log("- Starter landing: beginner opens the focused drum grid; producer opens the focused Review Queue; sticky navigation stays clear");
    console.log("- Deep editor commands: conditional fixed dock reuses Play, Actions, Undo, Redo, and Save after the full transport leaves view");
    console.log("- Minimum Studio transport: secondary Session Context and Exports stay compact through 1180px entry and resize while retaining manual reopen");
    console.log("- Drum grid keyboard: one roving Tab stop, bounded arrows/Home/End, explicit pressed state, Enter/Space toggle, and visible guidance");
    console.log("- Note-grid keyboard: one Tab stop per 808/Synth grid, exhaustive spatial arrows/Home/End, pressed state, guarded Enter/Space, and guidance");
    console.log("- Closed disclosures: 24-panel inventory shares one non-summary containment rule; only the project launchpad starts open");
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
    console.log("- Quick Actions lifecycle: graph module loads on demand with explicit wait/retry UI; one open session reuses its complete graph; reopen builds a fresh graph");
    console.log("- Local draft recovery: Not now is session-only; Project Safety keeps recovery discoverable; successful replacement drops stale restore state");
    console.log("- Unsaved close guard: clean exit is silent; dirty/recovery work blocks unload; Electron defaults to Save and Escape keeps editing");
    console.log("- Workstation path: compose, sound, arrange, mix, master, export, Handoff Pack, Delivery Bundle ZIP");
  }
} finally {
  await server.close();
}
