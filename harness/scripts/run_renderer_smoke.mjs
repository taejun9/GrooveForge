#!/usr/bin/env node

/**
 * 역할: 첫 React 화면의 서버 렌더 결과와 UI 소스 계약이 제품·접근성·보안 경계를 지키는지 검사한다.
 * 흐름: CSS·TSX 소스를 읽고 Vite `ssrLoadModule`로 모듈을 불러 `renderToStaticMarkup`한 뒤 필수 UI와 금지 패턴을 대조한다.
 * 안전 경계: 브라우저·Electron·production bundle·네트워크·파일 저장 없이 로컬 소스만 검사하고 모든 위반을 실패로 모은다.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { createServer } from "vite";

const failures = [];
const styles = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../../src/ui/App.tsx", import.meta.url), "utf8");
const projectAudioAnalysisSource = readFileSync(
  new URL("../../src/audio/projectAudioAnalysis.ts", import.meta.url),
  "utf8"
);
const projectAudioAnalysisWorkerSource = readFileSync(
  new URL("../../src/audio/projectAudioAnalysisWorker.ts", import.meta.url),
  "utf8"
);
const projectAudioAnalysisHookSource = readFileSync(
  new URL("../../src/ui/useProjectAudioAnalysis.ts", import.meta.url),
  "utf8"
);
const savedSnapshotAudioAnalysisHookSource = readFileSync(
  new URL("../../src/ui/useSavedSnapshotAudioAnalyses.ts", import.meta.url),
  "utf8"
);
const workstationHelpersSource = readFileSync(
  new URL("../../src/ui/workstationAppHelpers.tsx", import.meta.url),
  "utf8"
);
const workflowNavigatorAnalysisPostureSource = readFileSync(
  new URL("../../src/ui/workflowNavigatorAnalysisPosture.ts", import.meta.url),
  "utf8"
);
const workstationSource = readFileSync(new URL("../../src/domain/workstation.ts", import.meta.url), "utf8");
const electronMainSource = readFileSync(new URL("../../electron/main.ts", import.meta.url), "utf8");
const nativeDialogOptionsSource = readFileSync(
  new URL("../../electron/nativeDialogOptions.ts", import.meta.url),
  "utf8"
);
const electronPreloadSource = readFileSync(new URL("../../electron/preload.cts", import.meta.url), "utf8");
const projectLibrarySource = readFileSync(new URL("../../electron/projectLibrary.ts", import.meta.url), "utf8");
const projectWorkspaceSource = readFileSync(new URL("../../electron/projectWorkspace.ts", import.meta.url), "utf8");
const composePanelsSource = readFileSync(new URL("../../src/ui/workstationComposePanels.tsx", import.meta.url), "utf8");
const chordCardKeyboardActivationSource = readFileSync(
  new URL("../../src/ui/chordCardKeyboardActivation.ts", import.meta.url),
  "utf8"
);
const guidancePanelsSource = readFileSync(
  new URL("../../src/ui/workstationGuidancePanels.tsx", import.meta.url),
  "utf8"
);
const workspaceOverviewSource = readFileSync(
  new URL("../../src/ui/WorkspaceOverview.tsx", import.meta.url),
  "utf8"
);
const workspacePageTabsSource = readFileSync(
  new URL("../../src/ui/WorkspacePageTabs.tsx", import.meta.url),
  "utf8"
);
const headerActionDockSource = readFileSync(
  new URL("../../src/ui/HeaderActionDock.tsx", import.meta.url),
  "utf8"
);
const graphSource = readFileSync(new URL("../../src/ui/workstationAppQuickActionGraph.ts", import.meta.url), "utf8");
const quickActionSource = readFileSync(new URL("../../src/ui/workstationAppQuickActions.tsx", import.meta.url), "utf8");
const desktopLaunchSmokeSource = readFileSync(new URL("./run_desktop_launch_smoke.mjs", import.meta.url), "utf8");
const desktopManualQaSource = readFileSync(new URL("./run_desktop_manual_qa.mjs", import.meta.url), "utf8");
const shellSource = readFileSync(new URL("../../src/ui/workstationShellPanels.tsx", import.meta.url), "utf8");
const styleChangeDialogSource = readFileSync(new URL("../../src/ui/StyleChangeDialog.tsx", import.meta.url), "utf8");
const styleChangePreviewSource = readFileSync(new URL("../../src/ui/styleChangePreview.ts", import.meta.url), "utf8");
const localizationSource = readFileSync(new URL("../../src/ui/localization.tsx", import.meta.url), "utf8");
const settingsDialogSource = readFileSync(new URL("../../src/ui/SettingsDialog.tsx", import.meta.url), "utf8");
const modalFocusTrapSource = readFileSync(new URL("../../src/ui/useModalFocusTrap.ts", import.meta.url), "utf8");
const launchBearingPackageSources = [
  "run_desktop_package_smoke.mjs",
  "run_desktop_adhoc_sign_smoke.mjs",
  "run_desktop_pkg_payload_smoke.mjs",
  "run_desktop_install_smoke.mjs"
].map((fileName) => readFileSync(new URL(`./${fileName}`, import.meta.url), "utf8"));

checkIncludes(
  appSource,
  "(options.skipStarterRoutes ||\n              (starterBeginner.resultTitle.length > 0 && starterProducer.resultTitle.length > 0))",
  "launch-smoke skipped Starter aggregate result contract"
);
checkIncludes(
  appSource,
  "deliveryProofProducer.resultTitle.length > 0 &&",
  "launch-smoke non-Starter aggregate result contract"
);

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
    /async function handleSaveProject\(intentEpoch = claimFixedFeedbackIntent\(\)\): Promise<ProjectSaveAttempt> \{\s*let requestId = 0;\s*try \{\s*commitMasterCeilingDraft\(\);\s*flushActiveMetadataDraft\("commit"\);\s*requestId = \+\+projectSaveRequestIdRef\.current;\s*const projectToSave = projectRef\.current;\s*const contents = serializeProjectFile\(projectToSave\);/u.test(appSource),
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
      loadSource.includes("projectHasUnsavedChangesRef.current || metadataReplacementDraftDirtyRef.current") &&
      loadSource.includes("localDraftRecoveryRef.current !== null"),
    "project replacement confirmation should read current dirty and recovery-draft state"
  );

  const starterClean = replacementGuard.resolveStarterProjectReplacementGuard(false, false, "Guided 8-bar beat starter project");
  const starterDirty = replacementGuard.resolveStarterProjectReplacementGuard(true, false, "Guided 8-bar beat starter project");
  const starterRecovery = replacementGuard.resolveStarterProjectReplacementGuard(false, true, "Studio starter pass project");
  const starterSource = printNamedFunction(appSource, "App.tsx", "createAudienceStarter");
  const starterGuardIndex = starterSource.indexOf("resolveStarterProjectReplacementGuard(");
  const starterConfirmIndex = starterSource.indexOf("window.confirm(replacementGuard.warning)");
  const starterMutationIndex = starterSource.indexOf("updateProject(() => createAudienceStarterProject");
  check(
    starterClean.requiresConfirmation === false &&
      starterDirty.requiresConfirmation === true &&
      starterRecovery.requiresConfirmation === true &&
      starterDirty.warning?.includes("Cancel to keep the current beat") === true,
    "Starter replacement guard should keep clean first-run entry direct and protect dirty/recovery work"
  );
  check(
    starterSource.includes("pendingMasterCeilingChange") &&
      starterSource.includes("resolveMasterCeilingDraft(projectRef.current, masterCeilingDraft)") &&
      starterSource.includes("projectHasUnsavedChangesRef.current || pendingMasterCeilingChange") &&
      starterGuardIndex >= 0 &&
      starterConfirmIndex > starterGuardIndex &&
      starterMutationIndex > starterConfirmIndex &&
      starterSource.includes("localDraftRecoveryRef.current !== null") &&
      starterSource.includes("Starter canceled;") &&
      /!window\.confirm\(replacementGuard\.warning\)\)[\s\S]*?return null;/u.test(starterSource),
    "Starter replacement should resolve current dirty/recovery state and allow cancellation before mutation"
  );
}

function validateStyleChangeSafety(styleChange) {
  const source = structuredClone(styleChange.workstation.starterProject);
  source.selectedPattern = "C";
  source.bpm = 91;
  const before = JSON.stringify(source);
  const preview = styleChange.module.createStyleChangePreview(source, "house");
  const applied = styleChange.module.applyStyleChange(source, "house");
  check(
    preview?.currentStyleName === "Lo-fi" &&
      preview.targetStyleName === "House" &&
      preview.currentBpm === 91 &&
      preview.targetBpm === 124 &&
      preview.selectedPatternBefore === "C" &&
      preview.patterns.length === 3,
    "Style change preview should expose current-to-target posture and Pattern A/B/C scope"
  );
  check(
    JSON.stringify(source) === before &&
      applied !== source &&
      applied.styleId === "house" &&
      applied.selectedPattern === "A" &&
      applied.bpm === 124,
    "Style preview should be immutable while explicit Apply returns the existing generated style posture"
  );

  const requestSource = printNamedFunction(appSource, "App.tsx", "selectStyle");
  const applySource = printNamedFunction(appSource, "App.tsx", "confirmStyleChange");
  const cancelSource = printNamedFunction(appSource, "App.tsx", "cancelStyleChange");
  check(
    requestSource.includes("createStyleChangePreview(projectRef.current, styleId)") &&
      requestSource.includes("setStyleChangePreview(preview)") &&
      requestSource.includes("current beat unchanged") &&
      !requestSource.includes("updateProject(") &&
      applySource.includes("updateProject(") &&
      applySource.includes("applyStyleChange(current, preview.targetStyleId)") &&
      cancelSource.includes("Style change canceled;") &&
      !cancelSource.includes("updateProject("),
    "Style selectors should only open preview while Apply owns the single undoable mutation and Cancel stays read-only"
  );
  check(
    appSource.includes("<StyleChangeDialog") &&
      appSource.includes('aria-describedby="style-change-behavior"') &&
      localizationSource.includes("review before Apply") &&
      !/data-testid="style-select"[^>]*aria-haspopup="dialog"[^>]*>/u.test(appSource) &&
      appSource.includes("styleChangeReturnFocusRef.current") &&
      appSource.includes("requestedTarget?.isConnected") &&
      appSource.includes("void selectStyle(event.target.value") &&
      styleChangeDialogSource.includes('aria-modal="true"') &&
      styleChangeDialogSource.includes('role="dialog"') &&
      styleChangeDialogSource.includes('data-testid="style-change-cancel"') &&
      styleChangeDialogSource.includes('data-testid="style-change-apply"') &&
      styleChangeDialogSource.includes('event.key === "Escape"') &&
      styleChangeDialogSource.includes("useModalFocusTrap(preview !== null") &&
      localizationSource.includes("Nothing has changed yet") &&
      localizationSource.includes("Undo restores the current beat") &&
      styleChangePreviewSource.includes("patterns: createStylePatternSet(styleId, project.key)"),
    "Style confirmation dialog should expose preview/apply/cancel, keyboard focus, and undo guidance"
  );
  check(
    styles.includes(".project-change-overlay") &&
      styles.includes(".project-change-dialog") &&
      styles.includes(".style-change-comparison") &&
      styles.includes(".project-change-actions button") &&
      styles.includes("z-index: 40;") &&
      styles.includes("min-height: 44px;"),
    "Style confirmation dialog should provide a contained responsive surface with direct-size actions"
  );
  check(
    graphSource.includes("Preview ${selected ? `reapply ${profile.name}` : `${profile.name} style`} change") &&
      graphSource.includes("Review before Apply / rebuild Pattern A/B/C") &&
      appSource.includes("return new Promise<QuickActionRunOutcome>") &&
      appSource.includes("styleChangeRequestResolveRef.current = resolve") &&
      appSource.includes('settleStyleChangeRequest("canceled")') &&
      appSource.includes('settleStyleChangeRequest("complete")') &&
      appSource.includes('runOutcome === "canceled" ? "canceled" : "complete"'),
    "Style Quick Actions should wait for the same explicit preview decision before reporting completion"
  );
  const quickAction = {
    id: "style-quick-house",
    title: "Preview House style change",
    detail: "Review before Apply",
    group: "Create",
    keywords: [],
    run: () => undefined
  };
  const canceledResult = styleChange.quickActions.createQuickActionResult(quickAction, source, source, "canceled");
  const appliedResult = styleChange.quickActions.createQuickActionResult(quickAction, source, applied, "complete");
  check(
    canceledResult.status === "Canceled" &&
      canceledResult.auditionCue.includes("stayed unchanged") &&
      canceledResult.tone === "warn" &&
      appliedResult.status === "Applied",
    "Style Quick Actions should distinguish Cancel from Apply in post-run result feedback"
  );
}

function validateNativeDialogOptions(nativeDialogOptions) {
  const projectsDirectory = path.join(process.cwd(), "qa-fixtures", "GrooveForge Projects");
  const defaultName = "My Beat.grooveforge.json";
  const expected = {
    en: {
      save: {
        title: "Save GrooveForge Project",
        buttonLabel: "Save",
        defaultPath: path.join(projectsDirectory, defaultName),
        filters: [{ name: "GrooveForge Project", extensions: ["json"] }]
      },
      open: {
        title: "Open GrooveForge Project",
        buttonLabel: "Open",
        defaultPath: projectsDirectory,
        filters: [{ name: "GrooveForge Project", extensions: ["json"] }],
        properties: ["openFile"]
      },
      close: {
        type: "warning",
        buttons: ["Save and close", "Close without a project file", "Keep editing"],
        defaultId: 0,
        cancelId: 2,
        title: "Unsaved GrooveForge work",
        message: "Save this project before closing GrooveForge?",
        detail:
          "Save and close creates a durable .grooveforge.json project file. Newer edits or a recovery draft that has not been restored keep GrooveForge open for review.",
        noLink: true
      }
    },
    ko: {
      save: {
        title: "GrooveForge 프로젝트 저장",
        buttonLabel: "저장",
        defaultPath: path.join(projectsDirectory, defaultName),
        filters: [{ name: "GrooveForge 프로젝트", extensions: ["json"] }]
      },
      open: {
        title: "GrooveForge 프로젝트 열기",
        buttonLabel: "열기",
        defaultPath: projectsDirectory,
        filters: [{ name: "GrooveForge 프로젝트", extensions: ["json"] }],
        properties: ["openFile"]
      },
      close: {
        type: "warning",
        buttons: ["저장 후 닫기", "프로젝트 파일 없이 닫기", "계속 편집"],
        defaultId: 0,
        cancelId: 2,
        title: "저장되지 않은 GrooveForge 작업",
        message: "GrooveForge를 닫기 전에 이 프로젝트를 저장할까요?",
        detail:
          "저장 후 닫기를 선택하면 영구 보관되는 .grooveforge.json 프로젝트 파일을 만듭니다. 아직 복원하지 않은 최신 편집 내용이나 복구 초안이 있으면 검토할 수 있도록 GrooveForge를 계속 열어 둡니다.",
        noLink: true
      }
    }
  };

  for (const locale of ["en", "ko"]) {
    const actual = {
      save: nativeDialogOptions.createNativeSaveProjectDialogOptions(
        locale,
        projectsDirectory,
        defaultName
      ),
      open: nativeDialogOptions.createNativeOpenProjectDialogOptions(locale, projectsDirectory),
      close: nativeDialogOptions.createNativeUnsavedCloseDialogOptions(locale)
    };
    check(
      isDeepStrictEqual(actual, expected[locale]),
      `${locale} native dialog factories should exactly match the independent title, buttons, paths, filters, properties, and close-copy contract`
    );
  }
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
  const beforeUnloadStart = appSource.indexOf("const handleBeforeUnload = (event: BeforeUnloadEvent): void => {");
  const unloadGuardIndex = appSource.indexOf('window.addEventListener("beforeunload", handleBeforeUnload);');
  const beforeUnloadSource = appSource.slice(beforeUnloadStart, unloadGuardIndex);
  const metadataDraftFlushIndex = beforeUnloadSource.indexOf('flushActiveMetadataDraft("commit");');
  const ceilingDraftCommitIndex = beforeUnloadSource.indexOf("commitMasterCeilingDraft();");
  const closeGuardIndex = beforeUnloadSource.indexOf("resolveProjectCloseGuard(");
  check(
    beforeUnloadStart >= 0 &&
      unloadGuardIndex > beforeUnloadStart &&
      appSource.includes('window.removeEventListener("beforeunload", handleBeforeUnload)') &&
      metadataDraftFlushIndex >= 0 &&
      ceilingDraftCommitIndex > metadataDraftFlushIndex &&
      closeGuardIndex > ceilingDraftCommitIndex &&
      beforeUnloadSource.includes("projectHasUnsavedChangesRef.current,") &&
      beforeUnloadSource.includes("localDraftRecoveryRef.current !== null") &&
      appSource.includes("localDraftRecoveryRef.current = value;") &&
      beforeUnloadSource.includes("writeLocalDraft(projectRef.current)") &&
      beforeUnloadSource.includes("event.preventDefault();") &&
      beforeUnloadSource.includes('event.returnValue = "";'),
    "renderer beforeunload should synchronously commit focused metadata then ceiling drafts before its dirty/recovery decision, refresh the exact current project, and unregister cleanly"
  );
  check(
    createWindowSource.includes('win.webContents.on("will-prevent-unload"') &&
      createWindowSource.includes(
        "dialog.showMessageBoxSync(win, createNativeUnsavedCloseDialogOptions(nativeMenuLocale))"
      ) &&
      nativeDialogOptionsSource.includes('saveAndClose: "Save and close"') &&
      nativeDialogOptionsSource.includes('saveAndClose: "저장 후 닫기"') &&
      nativeDialogOptionsSource.includes("defaultId: saveAndCloseChoiceId") &&
      nativeDialogOptionsSource.includes("cancelId: keepEditingChoiceId") &&
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
  const metadataFlushIndex = saveSource.indexOf('flushActiveMetadataDraft("commit");');
  const requestIndex = saveSource.indexOf("requestId = ++projectSaveRequestIdRef.current;");
  const snapshotIndex = saveSource.indexOf("const projectToSave = projectRef.current;");
  const awaitIndex = saveSource.indexOf("await window.grooveforge?.saveProject?.");
  check(
    saveSource.includes("let requestId = 0;") &&
      commitIndex >= 0 &&
      metadataFlushIndex > commitIndex &&
      requestIndex > metadataFlushIndex &&
      snapshotIndex > requestIndex &&
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
      resultSource.includes("databaseStored = true") &&
      resultSource.includes("newer local edits and recovery remain unsaved") &&
      resultSource.includes("SQLite library mirror could not be updated") &&
      resultSource.includes("Save again to include the newer edits") &&
      resultSource.includes('tone: newerChangesRemain || !databaseStored ? "warn" : "good"'),
    "Save result feedback should explain changed-snapshot and SQLite mirror safety"
  );
}

function validateProjectScopedUiState(exportCompletion) {
  const exportedProject = { id: "project-a" };
  const replacementProject = { id: "project-b" };
  const exportReceipt = { status: "Exported WAV" };
  check(
    exportCompletion.shouldCommitProjectExportResult(4, 4, exportedProject, exportedProject) === true &&
      exportCompletion.shouldCommitProjectExportResult(3, 4, exportedProject, exportedProject) === false &&
      exportCompletion.shouldCommitProjectExportResult(4, 4, exportedProject, replacementProject) === false,
    "project export completion should require both the latest request and the exact exported project"
  );
  const receiptBinding = exportCompletion.bindProjectExportReceipt(exportedProject, exportReceipt);
  check(
    exportCompletion.currentProjectExportReceipt(receiptBinding, exportedProject) === exportReceipt &&
      exportCompletion.currentProjectExportReceipt(receiptBinding, { ...exportedProject, title: "Renamed" }) === null &&
      exportCompletion.currentProjectExportReceipt(receiptBinding, { ...exportedProject, bpm: 111 }) === null &&
      exportCompletion.currentProjectExportReceipt(receiptBinding, { ...exportedProject, mixer: [] }) === null,
    "Latest Export should be bound to the exact immutable project and stale after title, tempo, or mixer mutation"
  );
  const reexportedReceipt = { status: "Exported bundle" };
  check(
    exportCompletion.currentProjectExportReceipt(
      exportCompletion.bindProjectExportReceipt(replacementProject, reexportedReceipt),
      replacementProject
    ) === reexportedReceipt,
    "re-exporting the current project should restore a valid Latest Export receipt"
  );

  const resetSource = printNamedFunction(appSource, "App.tsx", "resetProjectDependentUiState");
  const replaceSource = printNamedFunction(appSource, "App.tsx", "replaceProject");
  const starterSource = printNamedFunction(appSource, "App.tsx", "createAudienceStarter");
  const draftSource = printNamedFunction(appSource, "App.tsx", "restoreLocalDraft");
  check(
    resetSource.includes("projectSaveRequestIdRef.current += 1;") &&
      resetSource.includes("projectExportRequestIdRef.current += 1;") &&
      resetSource.includes("setProjectFileLabel(null);") &&
      resetSource.includes("setSoundSnapshots({ A: null, B: null });") &&
      resetSource.includes("setMixSnapshots({ A: null, B: null });") &&
      resetSource.includes("setStudioToneBaseline(createStudioToneBaseline(nextProject.sound));") &&
      resetSource.includes("setStudioToneBaselineResult(null);") &&
      resetSource.includes("setStudioToneResetResult(null);") &&
      resetSource.includes("handoffExportReceiptRef.current = null;") &&
      resetSource.includes("handoffExportReceiptProjectRef.current = null;") &&
      resetSource.includes("setHandoffExportReceipt(null);"),
    "project replacement UI reset should clear project identity, A/B snapshots, Studio Tone baseline results, and export receipt state"
  );
  check(
    replaceSource.includes("resetProjectDependentUiState(nextProject, false);") &&
      starterSource.includes("resetProjectDependentUiState(projectRef.current);") &&
      draftSource.includes("resetProjectDependentUiState(draftProject);"),
    "file replacement, audience starter creation, and local draft restore should share the project-dependent UI reset"
  );

  const wavSource = printNamedFunction(appSource, "App.tsx", "handleExportWav");
  const stemsSource = printNamedFunction(appSource, "App.tsx", "handleExportStems");
  const midiSource = printNamedFunction(appSource, "App.tsx", "handleExportMidi");
  const sheetSource = printNamedFunction(appSource, "App.tsx", "handleExportHandoffSheet");
  const bundleSource = printNamedFunction(appSource, "App.tsx", "handleExportDeliveryBundle");
  const receiptSource = printNamedFunction(appSource, "App.tsx", "recordHandoffExportReceipt");
  const currentReceiptSource = printNamedFunction(appSource, "App.tsx", "currentHandoffExportReceiptForProject");
  const invalidateReceiptSource = printNamedFunction(appSource, "App.tsx", "invalidateHandoffExportReceipt");
  const updateProjectSource = printNamedFunction(appSource, "App.tsx", "updateProject");
  const updateMetadataSource = printNamedFunction(appSource, "App.tsx", "updateProjectMetadata");
  const updateViewSource = printNamedFunction(appSource, "App.tsx", "updateProjectView");
  const restoreHistorySource = printNamedFunction(appSource, "App.tsx", "restoreProjectFromHistory");
  const quickActionSource = printNamedFunction(appSource, "App.tsx", "runQuickAction");
  check(
    [wavSource, stemsSource, midiSource, sheetSource, bundleSource].every(
      (source) => source.includes("const request = beginProjectExportRequest();") && source.includes("const exportProject = request.project;")
    ) &&
      wavSource.includes("exportWav(exportProject)") &&
      stemsSource.includes("exportStems(exportProject)") &&
      midiSource.includes("exportMidi(exportProject)") &&
      sheetSource.includes("createHandoffSheet(exportProject, currentExportAnalysis, currentStemAnalyses)") &&
      bundleSource.includes("exportDeliveryBundleZip(exportProject, currentExportAnalysis, currentStemAnalyses)"),
    "direct and Quick Actions export callbacks should resolve projectRef-backed export context at execution time"
  );
  check(
    receiptSource.includes("if (!projectExportRequestIsCurrent(request))") &&
      bundleSource.includes("function handleExportDeliveryBundle(): Promise<void>") &&
      bundleSource.split("projectExportRequestIsCurrent(request)").length - 1 >= 1 &&
      quickActionSource.includes('const exportRequestId = action.group === "Export" ? projectExportRequestIdRef.current : null;') &&
      quickActionSource.split("shouldCommitProjectExportResult(").length - 1 === 2 &&
      graphSource.includes("return nextHandoffItem.run();"),
    "async bundle and Quick Actions completion should ignore stale requests or a replaced project before recording UI results"
  );
  check(
    receiptSource.includes("handoffExportReceiptProjectRef.current = request.project") &&
      receiptSource.includes("setHandoffExportReceiptProject(request.project)") &&
      currentReceiptSource.includes("currentProjectExportReceipt(") &&
      currentReceiptSource.includes("projectRef.current") &&
      invalidateReceiptSource.includes("handoffExportReceiptRef.current = null") &&
      invalidateReceiptSource.includes("handoffExportReceiptProjectRef.current = null") &&
      invalidateReceiptSource.includes("setDeliveryStatusOpen(false)") &&
      [updateProjectSource, updateMetadataSource, updateViewSource, restoreHistorySource].every((source) =>
        source.includes("invalidateHandoffExportReceipt()")
      ) &&
      appSource.includes("exportReceipt={currentHandoffExportReceipt}"),
    "Handoff receipt consumers should mask mismatched snapshots and every mutation path should permanently invalidate package-ready state until re-export"
  );
}

function validateSqliteProjectStorage() {
  const clearRecoverySource = printNamedFunction(appSource, "App.tsx", "clearLocalDraftRecovery");
  check(
    projectWorkspaceSource.includes('pathApi.join(userHome, "GrooveForge")') &&
      projectWorkspaceSource.includes('pathApi.join(root, "Projects")') &&
      projectWorkspaceSource.includes('pathApi.join(root, "Data")') &&
      projectWorkspaceSource.includes('pathApi.join(data, "grooveforge.db")'),
    "desktop project storage should resolve the GrooveForge/Projects and GrooveForge/Data workspace below the current user home"
  );
  check(
    electronMainSource.includes('app.getPath("home")') &&
      electronMainSource.includes("new ProjectLibrary(workspace.databaseFile)") &&
      electronMainSource.includes('createHash("sha256")') &&
      electronMainSource.includes("databaseStored = false") &&
      electronMainSource.includes("app.requestSingleInstanceLock()") &&
      electronMainSource.includes('app.on("second-instance"') &&
      electronMainSource.includes('ipcMain.handle("grooveforge:save-project-recovery"') &&
      electronMainSource.includes('ipcMain.handle("grooveforge:load-project-recovery"') &&
      electronMainSource.includes('ipcMain.handle("grooveforge:clear-project-recovery"') &&
      electronMainSource.includes("return { savedAt: library.saveRecovery(payload).savedAt };"),
    "Electron main should own the user-home workspace, SQLite library mirror, and recovery IPC"
  );
  check(
    desktopManualQaSource.includes("manualQaAllowedBase") &&
      desktopManualQaSource.includes("assertExistingComponentsDoNotSymlink") &&
      desktopManualQaSource.includes("assertSafeWorkspaceTarget") &&
      desktopManualQaSource.includes("existing empty non-owned workspace") &&
      desktopManualQaSource.includes("intermediate symbolic-link escape") &&
      desktopManualQaSource.includes("final symbolic-link target") &&
      desktopManualQaSource.includes("stale/tampered build provenance") &&
      desktopManualQaSource.includes('const provenanceBuildRoots = ["dist", "dist-electron"]') &&
      desktopManualQaSource.includes("buildProvenanceFileManifest") &&
      desktopManualQaSource.includes("modified renderer chunk") &&
      desktopManualQaSource.includes("added production bundle file") &&
      desktopManualQaSource.includes("deleted production bundle file") &&
      desktopManualQaSource.includes("production bundle symbolic-link entry") &&
      electronMainSource.includes("assertManualQaWorkspaceTargetSync") &&
      electronMainSource.includes("validateManualQaProvenance") &&
      electronMainSource.includes("buildManualQaProvenanceFileManifestSync") &&
      electronMainSource.includes("Manual QA production bundle inventory changed after launcher provenance capture.") &&
      electronMainSource.includes("provenanceValidatedAtLaunch: true") &&
      electronMainSource.includes('app.setPath("userData", manualQaConfiguration.electronUserDataDirectory)') &&
      electronMainSource.includes("manualQaUserDataPosture") &&
      electronMainSource.includes("userDataIsolated") &&
      !electronMainSource.includes("userDataTouched") &&
      !desktopManualQaSource.includes("userDataTouched"),
    "visible Manual QA should require an owned non-symlink workspace, validate source/build provenance, and derive isolated Electron userData evidence"
  );
  check(
    projectLibrarySource.includes('import { DatabaseSync } from "node:sqlite"') &&
      projectLibrarySource.includes('openSync(databasePath, "wx", 0o600)') &&
      projectWorkspaceSource.includes("chmod(paths.data, 0o700)") &&
      projectLibrarySource.includes("PRAGMA journal_mode = WAL") &&
      projectLibrarySource.includes("PRAGMA synchronous = FULL") &&
      projectLibrarySource.includes("PRAGMA trusted_schema = OFF") &&
      projectLibrarySource.includes("PRAGMA quick_check") &&
      projectLibrarySource.includes("CREATE TABLE project_recovery") &&
      projectLibrarySource.includes("CREATE TABLE saved_projects") &&
      projectLibrarySource.includes(".run(contents, savedAt)") &&
      projectLibrarySource.includes(".run(id, storageKey, fileName, contents, savedAt)"),
    "SQLite project storage should use the built-in driver, durability and integrity pragmas, and bound parameters"
  );
  check(
    electronPreloadSource.includes("saveProjectRecovery: (contents: string)") &&
      electronPreloadSource.includes("loadProjectRecovery: ()") &&
      electronPreloadSource.includes("clearProjectRecovery: ()") &&
      !electronPreloadSource.includes("DatabaseSync") &&
      !electronPreloadSource.includes("grooveforge.db"),
    "the preload bridge should expose recovery operations without exposing SQL or database paths"
  );
  check(
    appSource.includes("const nativeRecoveryDebounceMs = 750;") &&
      appSource.includes("const loadProjectRecovery = window.grooveforge?.loadProjectRecovery;") &&
      appSource.includes("projectHasUnsavedChangesRef.current") &&
      appSource.includes("project: parseProjectFile(nativeRecovery.contents)") &&
      appSource.includes("scheduleNativeProjectRecovery(project);") &&
      appSource.includes("flushNativeProjectRecovery(projectRef.current);"),
    "the renderer should restore validated SQLite recovery, debounce edits, and flush pending recovery on unload"
  );
  check(
    clearRecoverySource.includes("const result = await clearProjectRecovery();") &&
      clearRecoverySource.includes("if (!result.cleared)") &&
      clearRecoverySource.includes("Could not clear SQLite recovery; retry") &&
      clearRecoverySource.includes("shouldCommitLocalDraftClear(") &&
      clearRecoverySource.includes("projectAtStart") &&
      clearRecoverySource.includes("localDraftRecoveryRef.current") &&
      clearRecoverySource.includes("Recovery changed while clearing; current work kept") &&
      clearRecoverySource.indexOf("await clearProjectRecovery()") <
        clearRecoverySource.indexOf("clearLocalDraftState(false)"),
    "explicit Clear should retain visible recovery until SQLite confirms deletion and no intervening edit changed the target"
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

function validateLiveOverdub(patternTools, workstation, midi, render, quickActions) {
  const project = {
    ...structuredClone(workstation.starterProject),
    selectedPattern: "A",
    patterns: {
      ...structuredClone(workstation.starterProject.patterns),
      A: workstation.createEmptyPatternData()
    }
  };
  const nextPlacement = patternTools.resolveKeyboardCapturePlacement(project, "melody", null, "next-free", null);
  check(
    nextPlacement?.pattern === "A" && nextPlacement?.step === 0,
    "Live Overdub should preserve the existing Next-empty capture path"
  );
  const replacePlacement = patternTools.resolveKeyboardCapturePlacement(
    project,
    "melody",
    { track: "melody", step: 6, pitch: "E4" },
    "replace-selected",
    null
  );
  check(
    replacePlacement?.step === 6 && replacePlacement?.replaceStep === true,
    "Live Overdub should preserve the existing Replace-selected capture path"
  );
  check(
    patternTools.resolveKeyboardCapturePlacement(
      project,
      "melody",
      null,
      "playhead",
      { mode: "arrangement", pattern: "A", loopStep: 5 }
    ) === null,
    "Live Overdub must reject ambiguous arrangement playback"
  );
  check(
    patternTools.resolveKeyboardCapturePlacement(
      project,
      "melody",
      null,
      "playhead",
      { mode: "pattern", pattern: "B", loopStep: 5 }
    ) === null,
    "Live Overdub must reject a non-selected Pattern playhead"
  );
  const livePlacement = patternTools.resolveKeyboardCapturePlacement(
    project,
    "melody",
    null,
    "playhead",
    { mode: "pattern", pattern: "A", loopStep: 19 }
  );
  check(
    livePlacement?.pattern === "A" && livePlacement?.step === 3 && livePlacement?.liveOverdub === true,
    "Live Overdub should quantize the Pattern playhead to the bounded 16-step event grid"
  );
  const capturedPattern = patternTools.addKeyboardCaptureNote(
    project.patterns.A,
    "melody",
    livePlacement?.step ?? -1,
    "E4",
    { octave: 4, length: 2, velocity: 0.73, glide: false },
    false
  );
  const capturedProject = {
    ...project,
    patterns: { ...project.patterns, A: capturedPattern },
    arrangement: [{ section: "Intro", pattern: "A", energy: 0.8, bars: 1, mutedTracks: [] }]
  };
  const roundTrip = workstation.parseProjectFile(workstation.serializeProjectFile(capturedProject));
  check(
    roundTrip.patterns.A.melodyNotes.some(
      (note) => note.step === 3 && note.pitch === "E4" && note.length === 2 && note.velocity === 0.73
    ),
    "Live Overdub events should survive the normal project save/load boundary"
  );
  check(midi.createMidiFile(roundTrip).byteLength > 128, "Live Overdub events should remain available to MIDI export");
  check(
    render.analyzeExport(roundTrip).status !== "Silent",
    "Live Overdub events should remain audible in deterministic WAV rendering"
  );
  const actions = patternTools.createCaptureStepModeActions({
    keyboardCaptureStepMode: "next-free",
    keyboardCaptureTarget: "melody",
    keyboardCaptureTargetLabel: "Synth",
    selectedPattern: "A",
    selectedNote: null,
    selectedNoteActive: false,
    selectedNoteLabel: "No selected note",
    onSetKeyboardCaptureStepMode: () => {}
  });
  check(
    actions.length === 3 &&
      actions.some((action) => action.id === "capture-step-mode-playhead" && /Live Overdub/.test(action.title)),
    "Quick Actions should expose Next, Replace, and the real Live Overdub placement mode"
  );
  const setupAction = {
    id: "capture-step-mode-playhead",
    title: "Capture step mode: Live Overdub",
    detail: "Pattern playhead",
    group: "Create",
    keywords: "live overdub",
    run: () => {}
  };
  const setupSnapshot = {
    keyboardCaptureEnabled: true,
    keyboardCaptureTarget: "melody",
    keyboardCaptureDefaults: {
      bass: { octave: 1, length: 2, velocity: 0.82, glide: false },
      melody: { octave: 4, length: 1, velocity: 0.68, glide: false }
    },
    keyboardCaptureStepMode: "next-free",
    midiCaptureStatus: "idle",
    midiCaptureArmed: false,
    midiInputCount: 0,
    connectedMidiInputCount: 0,
    midiStatusLabel: "MIDI not connected",
    midiDetailLabel: "Connect",
    midiSelectedInputId: "all",
    midiSelectedInputLabel: "All connected inputs",
    midiLastNoteLabel: "No MIDI note captured",
    selectedNote: null,
    selectedNoteActive: false,
    selectedNoteLabel: "No selected note"
  };
  const setupResult = quickActions.createQuickActionInputSetupResultState(setupAction, setupSnapshot);
  check(
    setupResult?.after.keyboardCaptureStepMode === "playhead",
    "Live Overdub Quick Actions should report the applied playhead mode in their after metric"
  );
  const canceledResult = quickActions.createQuickActionResult(
    setupAction,
    project,
    project,
    "canceled",
    0,
    null,
    setupResult
  );
  check(
    canceledResult.metric.before === canceledResult.metric.after,
    "a rejected Live Overdub Quick Action should keep its before/after setup metric unchanged"
  );
  check(
    /Stop Song, Block, or Turn playback/.test(canceledResult.nextCheck),
    "a rejected Live Overdub Quick Action should explain how to return to valid Pattern playback"
  );
  check(
    appSource.includes("const playbackSessionRef = useRef(0)") &&
      appSource.includes("const activePlaybackModeRef = useRef<PlaybackMode | null>(null)") &&
      appSource.includes("if (playbackSessionRef.current !== playbackSession)") &&
      appSource.includes("if (playbackSessionRef.current === playbackSession)"),
    "realtime callbacks should ignore stale playback sessions after a rapid Stop and Play"
  );
  check(
    appSource.includes("const activePlaybackMode = activePlaybackModeRef.current") &&
      appSource.includes('activePlaybackMode !== null && activePlaybackMode !== "pattern"') &&
      appSource.includes('mode === "playhead" && activePlaybackMode === null'),
    "Live Overdub mode selection should read current playback refs instead of a cached Quick Actions render closure"
  );
  check(
    appSource.includes('? currentEditorStep\n      : null;'),
    "Live Overdub readouts should share the selected-Pattern guard used by editor playheads"
  );
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
  const deferredKoreanSummary = helpers.createProjectSafetyReadoutSummary(
    recovery,
    true,
    recovery.savedAt,
    "Editable 8-bar foundation",
    null,
    false,
    "ko"
  );
  const activeKoreanSummary = helpers.createProjectSafetyReadoutSummary(
    recovery,
    false,
    recovery.savedAt,
    "Editable 8-bar foundation",
    null,
    false,
    "ko"
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
    deferredKoreanSummary.statusLabel === "복구본 보류됨" &&
      deferredKoreanSummary.roleLabel === "현재 프로젝트 유지됨" &&
      deferredKoreanSummary.detailLabel.includes("작업 메뉴에서 사용 가능") &&
      activeKoreanSummary.statusLabel === "초안 발견됨" &&
      activeKoreanSummary.roleLabel === "복원 또는 지우기" &&
      !/(?:Recovery set aside|Current project kept|Draft found|Restore or clear|available in Actions)/u.test(
        JSON.stringify({ deferredKoreanSummary, activeKoreanSummary })
      ),
    "Korean project-safety recovery states should localize visible and title copy while preserving the same recovery decisions"
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
  const stopPlaybackSource = printNamedFunction(appSource, "App.tsx", "stopPlayback");
  check(
    appSource.includes("const [workspaceCommandDockVisible, setWorkspaceCommandDockVisible] = useState(true)") &&
      !appSource.includes("setWorkspaceCommandDockVisible(false)") &&
      !appSource.includes("setWorkspaceCommandDockVisible(!entry.isIntersecting)"),
    "the workspace command dock should stay enabled independently of transport-header intersection"
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
      appSource.includes('aria-label={t("core.commandDockAria")}') &&
      localizationSource.includes('"core.commandDockAria": "Workspace command dock"') &&
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
    stopPlaybackSource.includes(
      "playbackSessionRef.current += 1;\n    activePlaybackModeRef.current = null;\n    controllerRef.current?.stop();\n    controllerRef.current = null;\n    updatePlaybackPosition(null);\n    setIsPlaying(false);"
    ) &&
      printNamedFunction(appSource, "App.tsx", "togglePlayback").includes("stopPlayback();"),
    "explicit Stop should update shared header and dock playback state immediately while the audio controller closes"
  );
  check(
    styles.includes(".workspace-command-dock {\n  position: fixed;") &&
      styles.includes("width: min(720px, calc(100vw - 24px));") &&
      styles.includes("inset-block-end: 10px;") &&
      styles.includes("min-height: 54px;") &&
      styles.includes("padding: 10px 10px 74px;"),
    "the always-visible player should remain fixed, viewport-bounded, and have permanent shell clearance"
  );
  check(
    html.includes('data-testid="workspace-command-dock"') &&
      html.includes('data-workspace-command-dock-visible="true"'),
    "the global player should be present and enabled on the first render"
  );
}

function validateCompactStudioTransportSource() {
  const modeAwareToolPanelsSource = printNamedFunction(appSource, "App.tsx", "updateModeAwareToolPanels");
  check(
    modeAwareToolPanelsSource.includes("setTransportSessionOpen(false)") &&
      !modeAwareToolPanelsSource.includes("setTransportSessionOpen(advancedOpen)") &&
      appSource.includes("const [transportSessionOpen, setTransportSessionOpen] = useState(false)"),
    "Session Context should stay on-demand in every workspace mode"
  );
  check(
    modeAwareToolPanelsSource.includes("const advancedOpen = mode === \"studio\"") &&
      modeAwareToolPanelsSource.includes("setMasterReviewQueueOpen(false)") &&
      modeAwareToolPanelsSource.includes("setTransportSessionOpen(false)"),
    "mode changes should preserve Studio guidance behavior without auto-opening Session Context"
  );
  check(
    appSource.includes('const compactTransport = window.matchMedia("(max-width: 1220px)")') &&
      appSource.includes("if (event.matches)") &&
      appSource.includes('compactTransport.addEventListener("change", handleTransportViewportChange)') &&
      appSource.includes('compactTransport.removeEventListener("change", handleTransportViewportChange)') &&
      appSource.includes("collapseTransportTools()"),
    "crossing into the compact viewport should close Session Context with a cleaned-up media listener"
  );
  check(
    appSource.includes("setModeAwareToolPanels: (mode) =>") &&
      appSource.includes("flushSync(() => updateModeAwareToolPanels(mode))") &&
      appSource.includes("delete current.setModeAwareToolPanels"),
    "production launch smoke should have a bounded UI-only hook for wide, resized, compact, and reset transport evidence"
  );
  check(
    styles.includes(".command-strip .transport-session-tools") &&
      styles.includes(".command-strip .transport-session-tools > .transport-tools-content") &&
      styles.includes("width: min(620px, calc(100vw - 24px));") &&
      !appSource.includes('data-testid="transport-export-tools"'),
    "Session Context should retain a viewport-bounded manual disclosure while exports move to the header dock"
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

function validateHeaderActionDockSource(html) {
  const dockIndex = html.indexOf('data-testid="header-action-dock"');
  const utilityTriggerIndex = html.indexOf('data-testid="header-utility-trigger"');
  const exportTriggerIndex = html.indexOf('data-testid="header-export-trigger"');
  const workspaceIndex = html.indexOf('class="workspace-tabpanels"');
  check(
    dockIndex >= 0 &&
      utilityTriggerIndex > dockIndex &&
      exportTriggerIndex > utilityTriggerIndex &&
      workspaceIndex > exportTriggerIndex &&
      html.includes('aria-controls="header-utility-menu"') &&
      html.includes('aria-controls="header-export-menu"') &&
      (html.match(/aria-expanded="false"/gu)?.length ?? 0) >= 2 &&
      (html.match(/aria-haspopup="menu"/gu)?.length ?? 0) >= 2 &&
      !html.includes('data-testid="header-utility-menu"') &&
      !html.includes('data-testid="header-export-menu"'),
    "the fixed header toolbar should expose two closed, labelled ARIA menu triggers before the workspace"
  );
  check(
    headerActionDockSource.includes('type HeaderMenuState = { id: HeaderMenuId; reason: "hover" | "pinned" } | null;') &&
      headerActionDockSource.includes("const [menuState, setMenuState] = useState<HeaderMenuState>(null);") &&
      headerActionDockSource.includes('event.pointerType !== "mouse"') &&
      headerActionDockSource.includes('{ id, reason: "hover" }') &&
      headerActionDockSource.includes("}, 180);") &&
      headerActionDockSource.includes('menuState?.id === id && menuState.reason === "pinned"') &&
      headerActionDockSource.includes('setMenuState({ id, reason: "pinned" });') &&
      headerActionDockSource.includes('document.addEventListener("pointerdown", dismissOutside, true)') &&
      headerActionDockSource.includes("useEffect(() => () => clearCloseTimer(), []);"),
    "header menus should share one exclusive hover-or-pinned state, delay mouse leave, and dismiss safely outside"
  );
  check(
      headerActionDockSource.includes('event.key === "ArrowDown" || event.key === "ArrowUp"') &&
      headerActionDockSource.includes('pinMenu(id, "first");') &&
      headerActionDockSource.includes('event.key === "ArrowDown" ? "first" : "last"') &&
      headerActionDockSource.includes('event.key === "Home"') &&
      headerActionDockSource.includes('event.key === "End"') &&
      headerActionDockSource.includes('event.key === "Escape"') &&
      headerActionDockSource.includes('event.key === "Tab"') &&
      headerActionDockSource.includes("closeMenu(true);") &&
      headerActionDockSource.includes("closeMenuAndMoveFocus(id, event.shiftKey);") &&
      headerActionDockSource.includes('document.addEventListener("keydown", dismissMenuWithEscape)') &&
      headerActionDockSource.includes("enabledMenuItems(menuRefs.current[id])") &&
      headerActionDockSource.includes("items[nextIndex].focus();") &&
      headerActionDockSource.includes("const pendingFocusRef = useRef") &&
      headerActionDockSource.includes("useLayoutEffect(() => {") &&
      headerActionDockSource.includes('items[pendingFocus.edge === "first" ? 0 : items.length - 1]?.focus();'),
    "header menus should support trigger edges, wrapped arrows, Home/End, Escape focus return, and untrapped Tab"
  );
  check(
    headerActionDockSource.includes('aria-controls={`header-${id}-menu`}') &&
      headerActionDockSource.includes('aria-expanded={open}') &&
      headerActionDockSource.includes('aria-haspopup="menu"') &&
      headerActionDockSource.includes('role="menu"') &&
      headerActionDockSource.includes('role="menuitem"') &&
      headerActionDockSource.includes("aria-keyshortcuts={item.keyShortcuts}") &&
      headerActionDockSource.includes("disabled={item.disabled}") &&
      headerActionDockSource.includes("triggerRefs.current[menuId]?.focus();") &&
      headerActionDockSource.includes("item.onSelect();"),
    "header menu triggers and items should preserve ARIA ownership, shortcuts, disabled state, and durable action focus"
  );
  check(
    ['project-open', 'project-save', 'quick-actions-open', 'command-reference-open', 'guidance-center-open', 'settings-open'].every(
      (testId) => appSource.includes(`testId: "${testId}"`)
    ) &&
      ['export-wav', 'export-stems', 'export-midi', 'export-handoff-sheet', 'export-delivery-bundle'].every((testId) =>
        appSource.includes(`testId: "${testId}"`)
      ) &&
      [
        "handleOpenProject()",
        "handleSaveProject()",
        "openQuickActions",
        "openCommandReference",
        "setGuidanceCenterOpen(true)",
        "setSettingsOpen(true)",
        "handleExportWav",
        "handleExportStems",
        "handleExportMidi",
        "handleExportHandoffSheet",
        "handleExportDeliveryBundle"
      ].every((handler) => appSource.includes(handler)) &&
      appSource.includes('keyShortcuts: "Control+O Meta+O"') &&
      appSource.includes('keyShortcuts: "Control+S Meta+S"') &&
      appSource.includes('keyShortcuts: "Control+K Meta+K"') &&
      appSource.includes('keyShortcuts: "? Control+/ Meta+/"'),
    "closed Utility and Export menus should retain every project, help, settings, and delivery action contract in source"
  );
  check(
    (() => {
      const dockStart = styles.indexOf(".header-action-dock {\n  position: fixed;");
      const dockEnd = dockStart >= 0 ? styles.indexOf("\n}", dockStart) : -1;
      const dockStyles = dockStart >= 0 && dockEnd > dockStart ? styles.slice(dockStart, dockEnd) : "";
      return dockStyles.includes("inset-block-start: 12px;") &&
        dockStyles.includes("inset-inline-end: 12px;") &&
        dockStyles.includes("z-index: 22;");
    })() &&
      styles.includes(".header-action-menu-popover {\n  position: absolute;") &&
      styles.includes("width: min(340px, calc(100vw - 24px));") &&
      styles.includes("max-height: calc(100dvh - 88px);") &&
      styles.includes("overflow: auto;") &&
      styles.includes(".project-change-overlay,\n.quick-actions-overlay {\n  position: fixed;\n  z-index: 30;") &&
      styles.includes(".project-change-overlay {\n  z-index: 40;"),
    "the HeaderActionDock and its popover should stay fixed above the workspace, bounded inside the viewport, and below modal overlays"
  );
}

function validateDesktopFixedFrameSource() {
  const fixedMediaStart = styles.indexOf("@media (min-width: 901px) and (min-height: 640px)");
  const fixedMediaEnd = fixedMediaStart >= 0 ? styles.indexOf("\n@media (max-width: 900px)", fixedMediaStart) : -1;
  const fixedFrameStyles =
    fixedMediaStart >= 0 && fixedMediaEnd > fixedMediaStart
      ? styles.slice(fixedMediaStart, fixedMediaEnd)
      : "";
  const readabilityMediaStart = styles.indexOf("실제 설치 앱 가독성 보정");
  const readabilityMediaEnd =
    readabilityMediaStart >= 0
      ? styles.indexOf("\n@media (min-width: 901px) and (max-width: 1040px)", readabilityMediaStart)
      : -1;
  const readabilityFrameStyles =
    readabilityMediaStart >= 0 && readabilityMediaEnd > readabilityMediaStart
      ? styles.slice(readabilityMediaStart, readabilityMediaEnd)
      : "";
  check(
    fixedFrameStyles.includes("html,\n  body,\n  #root {") &&
      fixedFrameStyles.includes("height: 100%;") &&
      fixedFrameStyles.includes("overflow: hidden;") &&
      fixedFrameStyles.includes(".app-shell,\n  .app-shell[data-workspace-command-dock-visible=\"true\"] {") &&
      fixedFrameStyles.includes("height: 100dvh;") &&
      fixedFrameStyles.includes("grid-template-rows: 130px 38px 58px minmax(0, 1fr);") &&
      fixedFrameStyles.includes("padding: 10px 10px 74px;"),
    "901px+ desktop should bound html, body, root, and the app shell to one overflow-hidden viewport"
  );
  check(
    fixedFrameStyles.includes('.transport-band {') &&
      fixedFrameStyles.includes('"brand setup"\n      "commands commands";') &&
      fixedFrameStyles.includes("grid-template-rows: 55px 48px;") &&
      fixedFrameStyles.includes(".app-shell > .workflow-navigator {\n    position: relative;\n    top: auto;") &&
      fixedFrameStyles.includes("height: 58px;") &&
      !fixedFrameStyles.includes(".app-shell > .workflow-navigator {\n    position: sticky;"),
    "desktop transport should use two compact rows and main tabs should remain a non-sticky in-frame row"
  );
  check(
    fixedFrameStyles.includes(".workspace-tabpanels {\n    grid-row: 4;") &&
      fixedFrameStyles.includes("height: 100%;") &&
      fixedFrameStyles.includes(".workspace-zone-panel:not([hidden]) {") &&
      fixedFrameStyles.includes("grid-template-rows: 52px minmax(0, 1fr);") &&
      fixedFrameStyles.includes(".workspace-zone-panel:not([hidden]) > .workspace-page-panel:not([hidden]),\n  .workspace-deliver-panel > .handoff-pack {") &&
      fixedFrameStyles.includes("max-height: 100%;") &&
      fixedFrameStyles.includes("overflow: auto;") &&
      fixedFrameStyles.includes("overscroll-behavior: contain;") &&
      !fixedFrameStyles.includes("\n  .workspace-page-panel:not([hidden]),\n"),
    "only the active direct page, or Deliver handoff owner, should scroll inside the overflow-hidden desktop frame"
  );
  check(
    fixedFrameStyles.includes(".guidance-center {\n    position: fixed;") &&
      fixedFrameStyles.includes("max-height: calc(100dvh - 148px);") &&
      fixedFrameStyles.includes(".guidance-center-content {") &&
      fixedFrameStyles.includes("max-height: calc(100dvh - 198px);") &&
      fixedFrameStyles.includes("overscroll-behavior: contain;"),
    "Guide content should open as a viewport-bounded overlay with its own internal scroller"
  );
  check(
    readabilityFrameStyles.includes("--workspace-player-clearance: 80px;") &&
      readabilityFrameStyles.includes("grid-template-rows: 114px 40px 56px minmax(0, 1fr);") &&
      readabilityFrameStyles.includes("padding: 10px 10px var(--workspace-player-clearance);") &&
      readabilityFrameStyles.includes("grid-template-rows: 50px 44px;") &&
      readabilityFrameStyles.includes("align-self: start;\n    min-height: 50px;") &&
      readabilityFrameStyles.includes("min-height: 24px;") &&
      readabilityFrameStyles.includes(".workspace-tabpanels,\n  .workspace-zone-panel:not([hidden]) {\n    overflow: clip;") &&
      readabilityFrameStyles.includes("scrollbar-gutter: stable;") &&
      readabilityFrameStyles.includes("padding: 12px 14px 30px;") &&
      readabilityFrameStyles.includes("backdrop-filter: none;") &&
      readabilityFrameStyles.includes(".workspace-feedback-anchor > .quick-action-result,\n  .mode-row > .quick-action-result {") &&
      readabilityFrameStyles.includes("box-sizing: border-box;\n    max-height: 82px;\n    overflow: clip;") &&
      readabilityFrameStyles.includes("grid-template-columns: minmax(0, 1fr);\n    align-content: center;") &&
      readabilityFrameStyles.includes("white-space: normal;\n    line-height: 1.2;") &&
      readabilityFrameStyles.includes("-webkit-line-clamp: 2;") &&
      readabilityFrameStyles.includes("pointer-events: auto;") &&
      readabilityFrameStyles.includes(".app-shell:has(.workflow-navigator-result) {\n    --workspace-player-clearance: 170px;") &&
      readabilityFrameStyles.includes('.app-shell[data-fixed-feedback-active="true"] .guidance-center[open] {') &&
      readabilityFrameStyles.includes("max-height: calc(100dvh - 238px);") &&
      readabilityFrameStyles.includes(
        '.app-shell[data-fixed-feedback-active="true"] .guidance-center[open] .guidance-center-content {'
      ) &&
      readabilityFrameStyles.includes("max-height: calc(100dvh - 288px);") &&
      readabilityFrameStyles.includes("@media (min-width: 1180px) and (min-height: 640px)") &&
      readabilityFrameStyles.includes("92px 78px minmax(104px, 1fr)") &&
      readabilityFrameStyles.includes("text-overflow: ellipsis;"),
    "the final installed-app frame should reserve player clearance, keep one visible scroll owner, prevent toast overlap, keep fixed-result follow-ups readable, and protect the English meter label"
  );
  check(
    shellSource.includes('data-testid="quick-action-result-audition" title={result.auditionCue}') &&
      shellSource.includes('data-testid="quick-action-result-next-check" title={result.nextCheck}'),
    "fixed Quick Action follow-ups should expose their complete text on hover when the two-line visual clamp is still shorter than the message"
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
      /aria-label="(?:808|Sub|Walking|Pluck|Reese|Minimal) Bass note sequencer"/.test(html) &&
      html.includes('aria-describedby="note-grid-keyboard-help-bass"') &&
      html.includes('data-testid="note-grid-melody"') &&
      html.includes('aria-label="Synth note sequencer"') &&
      html.includes('aria-describedby="note-grid-keyboard-help-melody"') &&
      (html.match(/Arrow keys move · Enter or Space toggles/g) ?? []).length >= 3,
    "Bass and Synth grids should expose separate named groups with visible and accessible keyboard guidance"
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
    "guide-quick-start-details",
    "guidance-center",
    "workflow-review-disclosure",
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
      styles.includes(".quick-action-row.keyboard-selected .quick-action-run") &&
      styles.includes("overflow-y: auto;") &&
      styles.includes("min-height: 64px;"),
    "Quick Actions should retain keyboard selection styling and a scrollable, nonzero result surface at the desktop minimum"
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

function validateWorkspaceFunctionTabs(html) {
  const zones = ["overview", "compose", "arrange", "mix", "deliver"];
  const zoneLabels = {
    overview: "Overview",
    compose: "Compose",
    arrange: "Arrange",
    mix: "Mix",
    deliver: "Deliver"
  };
  const openingTagById = (tagName, id) => {
    const idIndex = html.indexOf(`id="${id}"`);
    const tagStart = idIndex >= 0 ? html.lastIndexOf(`<${tagName}`, idIndex) : -1;
    const tagEnd = tagStart >= 0 ? html.indexOf(">", idIndex) : -1;
    return tagStart >= 0 && tagEnd >= idIndex ? html.slice(tagStart, tagEnd + 1) : "";
  };
  const elementMarkupById = (tagName, id) => {
    const idIndex = html.indexOf(`id="${id}"`);
    const tagStart = idIndex >= 0 ? html.lastIndexOf(`<${tagName}`, idIndex) : -1;
    const tagEnd = tagStart >= 0 ? html.indexOf(`</${tagName}>`, idIndex) : -1;
    return tagStart >= 0 && tagEnd >= idIndex ? html.slice(tagStart, tagEnd + `</${tagName}>`.length) : "";
  };
  const cssRuleBody = (selector) => {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    return styles.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "u"))?.[1] ?? "";
  };

  const modeRowIndex = html.indexOf('<section class="mode-row"');
  const modeRowCloseIndex = modeRowIndex >= 0 ? html.indexOf("</section>", modeRowIndex) : -1;
  const workflowNavigatorIndex = html.indexOf('data-testid="workflow-navigator"');
  const workflowNavigatorTagIndex =
    workflowNavigatorIndex >= 0 ? html.lastIndexOf("<nav", workflowNavigatorIndex) : -1;
  const quickStartIndex = html.indexOf('data-testid="guide-quick-start"');
  const guidanceCenterIndex = html.indexOf('data-testid="guidance-center"');
  const feedbackAnchorIndex = html.indexOf('data-testid="workspace-feedback-anchor"');
  const workspaceTabpanelsIndex = html.indexOf('class="workspace-tabpanels"');
  check(
    modeRowIndex >= 0 &&
      modeRowCloseIndex > modeRowIndex &&
      workflowNavigatorTagIndex === modeRowCloseIndex + "</section>".length &&
      guidanceCenterIndex > workflowNavigatorIndex &&
      quickStartIndex > guidanceCenterIndex &&
      feedbackAnchorIndex > quickStartIndex &&
      workspaceTabpanelsIndex > feedbackAnchorIndex,
    "first-run hierarchy should place compact main tabs after Mode, Guide Quick Start inside Guidance Center, then feedback and the core workspace"
  );
  check(
    appSource.includes("activeZone={activeWorkspaceZone}") &&
      appSource.includes('className="workspace-tabpanels"') &&
      appSource.includes("data-active-workspace-zone={activeWorkspaceZone}"),
    "App should share one active workspace zone between Workflow Navigator and the tabpanel container"
  );
  const overviewTabSelectionSource = printNamedFunction(appSource, "App.tsx", "selectOverviewNavigatorTab");
  const workflowTabSelectionSource = printNamedFunction(appSource, "App.tsx", "selectWorkflowNavigatorTab");
  const quickActionRunSource = printNamedFunction(appSource, "App.tsx", "runQuickAction");
  const clearFixedFeedbackLaneSource = printNamedFunction(appSource, "App.tsx", "clearFixedFeedbackLane");
  const beginFixedFeedbackIntentSource = printNamedFunction(appSource, "App.tsx", "beginFixedFeedbackIntent");
  const claimFixedFeedbackIntentSource = printNamedFunction(appSource, "App.tsx", "claimFixedFeedbackIntent");
  const fixedFeedbackIntentIsCurrentSource = printNamedFunction(
    appSource,
    "App.tsx",
    "fixedFeedbackIntentIsCurrent"
  );
  const saveProjectSource = printNamedFunction(appSource, "App.tsx", "handleSaveProject");
  const openProjectSource = printNamedFunction(appSource, "App.tsx", "handleOpenProject");
  const importProjectSource = printNamedFunction(appSource, "App.tsx", "handleImportFile");
  const loadProjectSource = printNamedFunction(appSource, "App.tsx", "loadProjectText");
  const clearLocalDraftSource = printNamedFunction(appSource, "App.tsx", "clearLocalDraftRecovery");
  const undoProjectSource = printNamedFunction(appSource, "App.tsx", "undoProject");
  const redoProjectSource = printNamedFunction(appSource, "App.tsx", "redoProject");
  const restoreLocalDraftSource = printNamedFunction(appSource, "App.tsx", "restoreLocalDraft");
  const fixedFeedbackShowSources = [
    ["showModeSwitchResult", "setModeSwitchResult(result)"],
    ["showProjectFileResult", "setProjectFileResult(result)"],
    ["showLocalDraftRecoveryResult", "setLocalDraftRecoveryResult(result)"],
    ["showWorkflowNavigatorResult", "setWorkflowNavigatorResult(result)"],
    ["showUndoRedoResult", "setUndoRedoResult(result)"],
    ["showQuickActionResult", "setQuickActionResult(result)"]
  ].map(([functionName, setter]) => ({
    setter,
    source: printNamedFunction(appSource, "App.tsx", functionName)
  }));
  check(
    [
      "setModeSwitchResult(null)",
      "setProjectFileResult(null)",
      "setLocalDraftRecoveryResult(null)",
      "setWorkflowNavigatorResult(null)",
      "setUndoRedoResult(null)",
      "setQuickActionResult(null)"
    ].every((setter) => clearFixedFeedbackLaneSource.includes(setter)) &&
      fixedFeedbackShowSources.every(
        ({ setter, source }) =>
          source.includes("intentEpoch = claimFixedFeedbackIntent()") &&
          source.includes("fixedFeedbackIntentIsCurrent(intentEpoch)") &&
          source.includes("clearFixedFeedbackLane()") &&
          source.includes(setter)
      ) &&
      overviewTabSelectionSource.includes("beginFixedFeedbackIntent()") &&
      overviewTabSelectionSource.includes("clearFixedFeedbackLane()") &&
      workflowTabSelectionSource.includes("showWorkflowNavigatorResult(") &&
      quickActionRunSource.includes("showQuickActionResult(result, feedbackIntentEpoch)") &&
      appSource.includes('data-fixed-feedback-active={fixedFeedbackOwner !== "none"}') &&
      appSource.includes('data-fixed-feedback-owner={fixedFeedbackOwner}') &&
      appSource.includes('fixedFeedbackOwner === "mode-switch"') &&
      appSource.includes('fixedFeedbackOwner === "project-file"') &&
      appSource.includes('fixedFeedbackOwner === "local-draft"') &&
      appSource.includes('result={fixedFeedbackOwner === "workflow" ? workflowNavigatorResult : null}') &&
      appSource.includes('fixedFeedbackOwner === "undo-redo"') &&
      appSource.includes('fixedFeedbackOwner === "quick-action"'),
    "mode, project-file, draft, workflow, undo/redo, and Quick Action results should share one structurally exclusive fixed feedback lane"
  );
  check(
    appSource.includes("const fixedFeedbackIntentEpochRef = useRef(0)") &&
      appSource.includes("const activeQuickActionFeedbackIntentEpochRef = useRef<number | null>(null)") &&
      beginFixedFeedbackIntentSource.includes("fixedFeedbackIntentEpochRef.current += 1") &&
      claimFixedFeedbackIntentSource.includes(
        "activeQuickActionFeedbackIntentEpochRef.current ?? beginFixedFeedbackIntent()"
      ) &&
      fixedFeedbackIntentIsCurrentSource.includes("intentEpoch === fixedFeedbackIntentEpochRef.current") &&
      quickActionRunSource.includes("const feedbackIntentEpoch = beginFixedFeedbackIntent()") &&
      quickActionRunSource.includes("activeQuickActionFeedbackIntentEpochRef.current = feedbackIntentEpoch") &&
      quickActionRunSource.includes(
        "activeQuickActionFeedbackIntentEpochRef.current = previousQuickActionFeedbackIntentEpoch"
      ) &&
      quickActionRunSource.split("fixedFeedbackIntentIsCurrent(feedbackIntentEpoch)").length - 1 >= 3 &&
      saveProjectSource.includes("intentEpoch = claimFixedFeedbackIntent()") &&
      saveProjectSource.includes("showProjectFileResult(") &&
      saveProjectSource.split("fixedFeedbackIntentIsCurrent(intentEpoch)").length - 1 >= 2 &&
      openProjectSource.includes("intentEpoch = claimFixedFeedbackIntent()") &&
      openProjectSource.includes('loadProjectText(result.contents, fileDisplayName(result.filePath), "open", intentEpoch)') &&
      openProjectSource.split("fixedFeedbackIntentIsCurrent(intentEpoch)").length - 1 >= 3 &&
      importProjectSource.includes("const intentEpoch = claimFixedFeedbackIntent()") &&
      importProjectSource.includes('loadProjectText(contents, file.name, "import", intentEpoch)') &&
      importProjectSource.includes("fixedFeedbackIntentIsCurrent(intentEpoch)") &&
      loadProjectSource.includes("intentEpoch = claimFixedFeedbackIntent()") &&
      loadProjectSource.includes("showProjectFileResult(createProjectFileResult(action, sourceName, nextProject), intentEpoch)") &&
      loadProjectSource.split("fixedFeedbackIntentIsCurrent(intentEpoch)").length - 1 >= 2 &&
      clearLocalDraftSource.includes("intentEpoch = claimFixedFeedbackIntent()") &&
      clearLocalDraftSource.split("fixedFeedbackIntentIsCurrent(intentEpoch)").length - 1 >= 4 &&
      clearLocalDraftSource.includes(
        'showLocalDraftRecoveryResult(createLocalDraftRecoveryResult("clear", recovery, projectRef.current), intentEpoch)'
      ) &&
      appSource.includes('onClear={() => void clearLocalDraftRecovery(beginFixedFeedbackIntent())}') &&
      electronMainSource.includes('onStep("closing the first-run launchpad before direct fixed-feedback controls")') &&
      electronMainSource.includes(
        'document.querySelector(\'[data-testid="first-run-launchpad"]\')?.hasAttribute(\'open\') === false'
      ) &&
      undoProjectSource.includes("claimFixedFeedbackIntent()") &&
      undoProjectSource.indexOf("claimFixedFeedbackIntent()") < undoProjectSource.indexOf("setUndoRedoResult(null)") &&
      redoProjectSource.includes("claimFixedFeedbackIntent()") &&
      redoProjectSource.indexOf("claimFixedFeedbackIntent()") < redoProjectSource.indexOf("setUndoRedoResult(null)") &&
      restoreLocalDraftSource.includes("claimFixedFeedbackIntent()") &&
      restoreLocalDraftSource.indexOf("claimFixedFeedbackIntent()") <
        restoreLocalDraftSource.indexOf("setLocalDraftRecoveryResult(null)"),
    "async Quick Actions should keep one feedback intent through their own project/draft result, direct draft UI should mint a numeric intent, launch-smoke should uncover direct controls after reload, and stale completions should be rejected after a newer intent"
  );

  const firstMainTabsLabelIndex = html.indexOf('aria-label="Main production tabs"');
  const tablistLabelIndex = html.indexOf('aria-label="Main production tabs"', firstMainTabsLabelIndex + 1);
  const tablistTagStart = tablistLabelIndex >= 0 ? html.lastIndexOf("<div", tablistLabelIndex) : -1;
  const tablistTagEnd = tablistLabelIndex >= 0 ? html.indexOf(">", tablistLabelIndex) : -1;
  const tablistTag =
    tablistTagStart >= 0 && tablistTagEnd >= tablistLabelIndex
      ? html.slice(tablistTagStart, tablistTagEnd + 1)
      : "";
  check(
    tablistTag.includes('role="tablist"') &&
      tablistTag.includes('aria-orientation="horizontal"') &&
      tablistTag.includes('class="workflow-navigator-grid"'),
    "Workflow Navigator should expose a labelled horizontal workstation function tablist"
  );
  const workspaceTabsSurfaceIndex = html.indexOf('data-testid="workspace-tabs-surface"');
  const workspaceTabsHeadingIndex = html.indexOf("MAIN TABS");
  check(
    workspaceTabsSurfaceIndex >= 0 &&
      workspaceTabsHeadingIndex > workspaceTabsSurfaceIndex &&
      tablistTagStart > workspaceTabsHeadingIndex &&
      html.includes('data-active-workspace-tab="compose"') &&
      html.includes('id="workspace-tabs-title"') &&
      html.includes('class="workflow-tab-status" aria-hidden="true">ACTIVE</span>'),
    "function tabs should live in a dedicated labelled MAIN TABS surface with an explicit active-state badge"
  );

  const tabTags = Object.fromEntries(
    zones.map((zone) => [zone, openingTagById("button", `workspace-tab-${zone}`)])
  );
  const tabMarkup = Object.fromEntries(
    zones.map((zone) => [zone, elementMarkupById("button", `workspace-tab-${zone}`)])
  );
  const panelTags = Object.fromEntries(
    zones.map((zone) => [zone, openingTagById("section", `workspace-panel-${zone}`)])
  );
  const overviewPageIds = ["snapshot", "song-map", "readiness"];
  const composePageIds = ["drums", "notes", "instruments"];
  const arrangePageIds = ["timeline", "structure"];
  const mixPageIds = ["mixer", "master"];
  const deliverPageIds = ["exports", "checks"];
  const overviewPageTabTags = Object.fromEntries(
    overviewPageIds.map((page) => [page, openingTagById("button", `overview-page-tab-${page}`)])
  );
  const overviewPagePanelTags = Object.fromEntries(
    overviewPageIds.map((page) => [page, openingTagById("section", `overview-page-panel-${page}`)])
  );
  const composePageTabTags = Object.fromEntries(
    composePageIds.map((page) => [page, openingTagById("button", `compose-page-tab-${page}`)])
  );
  const composePagePanelTags = Object.fromEntries(
    composePageIds.map((page) => [page, openingTagById("section", `compose-page-panel-${page}`)])
  );
  const arrangePageTabTags = Object.fromEntries(
    arrangePageIds.map((page) => [page, openingTagById("button", `arrange-page-tab-${page}`)])
  );
  const arrangePagePanelTags = Object.fromEntries(
    arrangePageIds.map((page) => [page, openingTagById("section", `arrange-page-panel-${page}`)])
  );
  const mixPageTabTags = Object.fromEntries(
    mixPageIds.map((page) => [page, openingTagById("button", `mix-page-tab-${page}`)])
  );
  const mixPagePanelTags = Object.fromEntries(
    mixPageIds.map((page) => [page, openingTagById("section", `mix-page-panel-${page}`)])
  );
  const deliverPageTabTags = Object.fromEntries(
    deliverPageIds.map((page) => [page, openingTagById("button", `deliver-page-tab-${page}`)])
  );
  const deliverPagePanelTags = Object.fromEntries(
    deliverPageIds.map((page) => [page, openingTagById("div", `deliver-page-panel-${page}`)])
  );
  check(
    isDeepStrictEqual(
      [...html.matchAll(/id="workspace-tab-([^" ]+)"/gu)].map((match) => match[1]),
      zones
    ) &&
      zones.every((zone) =>
        tabMarkup[zone].includes(`<span class="workflow-tab-label">${zoneLabels[zone]}</span>`)
      ),
    "Workflow Navigator should render exactly five ordered main tabs labelled Overview, Compose, Arrange, Mix, and Deliver"
  );
  check(
    zones.every(
      (zone) =>
        tabTags[zone].includes('role="tab"') &&
        tabTags[zone].includes(`aria-controls="workspace-panel-${zone}"`) &&
        tabTags[zone].includes(`data-testid="workflow-jump-${zone}"`)
    ),
    "Overview, Compose, Arrange, Mix, and Deliver controls should preserve workflow jump test ids and own their matching tabpanels"
  );
  check(
    tabTags.compose.includes('aria-selected="true"') &&
      tabTags.compose.includes('tabindex="0"') &&
      zones
        .filter((zone) => zone !== "compose")
        .every(
          (zone) =>
            tabTags[zone].includes('aria-selected="false"') &&
            tabTags[zone].includes('tabindex="-1"')
        ),
    "Compose should be the default selected and roving-tab-stop function tab"
  );
  check(
    zones.every(
      (zone) =>
        panelTags[zone].includes('role="tabpanel"') &&
        panelTags[zone].includes(`aria-labelledby="workspace-tab-${zone}"`) &&
        panelTags[zone].includes(`data-workspace-zone="${zone}"`)
    ),
    "every workspace function panel should be a labelled tabpanel with a stable zone identity"
  );
  check(
    html.includes('class="workspace-tabpanels" data-active-workspace-zone="compose"') &&
      panelTags.compose.includes('tabindex="0"') &&
      !panelTags.compose.includes(" hidden") &&
      zones
        .filter((zone) => zone !== "compose")
        .every((zone) => panelTags[zone].includes('hidden=""') && panelTags[zone].includes('tabindex="-1"')),
    "first render should expose only the Compose tabpanel and keep Overview, Arrange, Mix, and Deliver hidden and untabbable"
  );
  check(
    html.includes('data-testid="overview-page-tabs"') &&
      html.includes('aria-label="Overview sub tabs"') &&
      overviewPageIds.every(
        (page) =>
          overviewPageTabTags[page].includes('role="tab"') &&
          overviewPageTabTags[page].includes(`aria-controls="overview-page-panel-${page}"`) &&
          overviewPagePanelTags[page].includes('role="tabpanel"') &&
          overviewPagePanelTags[page].includes(`aria-labelledby="overview-page-tab-${page}"`) &&
          overviewPagePanelTags[page].includes(`data-workspace-page="${page}"`)
      ) &&
      overviewPageTabTags.snapshot.includes('aria-selected="true"') &&
      overviewPageTabTags.snapshot.includes('tabindex="0"') &&
      !overviewPagePanelTags.snapshot.includes('hidden=""') &&
      ["song-map", "readiness"].every(
        (page) =>
          overviewPageTabTags[page].includes('aria-selected="false"') &&
          overviewPageTabTags[page].includes('tabindex="-1"') &&
          overviewPagePanelTags[page].includes('hidden=""') &&
          overviewPagePanelTags[page].includes('tabindex="-1"')
      ),
    "Overview should expose At a glance, Song map, and Readiness as three labelled, roving, mutually exclusive pages"
  );
  const overviewPlaybackSource = printNamedFunction(appSource, "App.tsx", "toggleOverviewSongPlayback");
  const sharedPlaybackStartSource = printNamedFunction(appSource, "App.tsx", "startPlaybackTarget");
  const overviewArrangementSelectionIndex = overviewPlaybackSource.indexOf(
    'selectTransportLoopScope("arrangement", false)'
  );
  const overviewArrangementStartIndex = overviewPlaybackSource.indexOf(
    'startPlaybackTarget({ mode: "arrangement", startBar: 0 })'
  );
  check(
    workspaceOverviewSource.includes('data-testid="overview-full-song-play"') &&
      workspaceOverviewSource.includes('data-testid="overview-song-progress"') &&
      workspaceOverviewSource.includes("onClick={onToggleFullSongPlayback}") &&
      appSource.includes("isFullSongPlaying={isFullSongPlaying}") &&
      appSource.includes("onToggleFullSongPlayback={toggleOverviewSongPlayback}") &&
      appSource.includes("playbackPosition={playbackPosition}") &&
      overviewPlaybackSource.includes("if (isPlaying)") &&
      overviewPlaybackSource.includes("stopPlayback();") &&
      overviewArrangementSelectionIndex >= 0 &&
      overviewArrangementStartIndex > overviewArrangementSelectionIndex &&
      sharedPlaybackStartSource.includes("stopMixPreview();") &&
      sharedPlaybackStartSource.includes("auditionControllerRef.current?.stop();") &&
      sharedPlaybackStartSource.includes("controllerRef.current = startRealtimePlayback(projectRef.current"),
    "Overview full-song audition should reuse the shared arrangement transport, expose progress, and stop competing preview engines"
  );
  check(
    html.includes('data-testid="compose-page-tabs"') &&
      html.includes('aria-label="Compose sub tabs"') &&
      composePageIds.every(
        (page) =>
          composePageTabTags[page].includes('role="tab"') &&
          composePageTabTags[page].includes(`aria-controls="compose-page-panel-${page}"`) &&
          composePagePanelTags[page].includes('role="tabpanel"') &&
          composePagePanelTags[page].includes(`aria-labelledby="compose-page-tab-${page}"`) &&
          composePagePanelTags[page].includes(`data-workspace-page="${page}"`)
      ) &&
      composePageTabTags.drums.includes('aria-selected="true"') &&
      composePageTabTags.drums.includes('tabindex="0"') &&
      !composePagePanelTags.drums.includes('hidden=""') &&
      ["notes", "instruments"].every(
        (page) =>
          composePageTabTags[page].includes('aria-selected="false"') &&
          composePageTabTags[page].includes('tabindex="-1"') &&
          composePagePanelTags[page].includes('hidden=""') &&
          composePagePanelTags[page].includes('tabindex="-1"')
      ),
    "Compose should expose three labelled, roving, mutually exclusive full-width editor pages"
  );
  check(
    html.includes('data-testid="arrange-page-tabs"') &&
      html.includes('aria-label="Arrange sub tabs"') &&
      arrangePageIds.every(
        (page) =>
          arrangePageTabTags[page].includes('role="tab"') &&
          arrangePageTabTags[page].includes(`aria-controls="arrange-page-panel-${page}"`) &&
          arrangePagePanelTags[page].includes('role="tabpanel"') &&
          arrangePagePanelTags[page].includes(`aria-labelledby="arrange-page-tab-${page}"`) &&
          arrangePagePanelTags[page].includes(`data-workspace-page="${page}"`)
      ) &&
      arrangePageTabTags.timeline.includes('aria-selected="true"') &&
      arrangePageTabTags.timeline.includes('tabindex="0"') &&
      !arrangePagePanelTags.timeline.includes('hidden=""') &&
      arrangePageTabTags.structure.includes('aria-selected="false"') &&
      arrangePageTabTags.structure.includes('tabindex="-1"') &&
      arrangePagePanelTags.structure.includes('hidden=""') &&
      arrangePagePanelTags.structure.includes('tabindex="-1"') &&
      appSource.includes('activateArrangeWorkspacePage(page, true)') &&
      appSource.includes('flushSync(() => activateArrangeWorkspacePage(page))'),
    "Arrange should expose separate Timeline and Structure sub tabs with the shared reveal contract"
  );
  check(
    html.includes('data-testid="mix-page-tabs"') &&
      html.includes('aria-label="Mix sub tabs"') &&
      mixPageIds.every(
        (page) =>
          mixPageTabTags[page].includes('role="tab"') &&
          mixPageTabTags[page].includes(`aria-controls="mix-page-panel-${page}"`) &&
          mixPagePanelTags[page].includes('role="tabpanel"') &&
          mixPagePanelTags[page].includes(`aria-labelledby="mix-page-tab-${page}"`) &&
          mixPagePanelTags[page].includes(`data-workspace-page="${page}"`)
      ) &&
      mixPageTabTags.mixer.includes('aria-selected="true"') &&
      mixPageTabTags.master.includes('aria-selected="false"') &&
      !mixPagePanelTags.mixer.includes('hidden=""') &&
      mixPagePanelTags.master.includes('hidden=""'),
    "Mix should expose separate labelled Mixer and Master pages instead of compressing both side by side"
  );
  check(
    html.includes('data-testid="deliver-page-tabs"') &&
      html.includes('aria-label="Deliver sub tabs"') &&
      deliverPageIds.every(
        (page) =>
          deliverPageTabTags[page].includes('role="tab"') &&
          deliverPageTabTags[page].includes(`aria-controls="deliver-page-panel-${page}"`) &&
          deliverPagePanelTags[page].includes('role="tabpanel"') &&
          deliverPagePanelTags[page].includes(`aria-labelledby="deliver-page-tab-${page}"`) &&
          deliverPagePanelTags[page].includes(`data-workspace-page="${page}"`)
      ) &&
      deliverPageTabTags.exports.includes('aria-selected="true"') &&
      deliverPageTabTags.exports.includes('tabindex="0"') &&
      !deliverPagePanelTags.exports.includes('hidden=""') &&
      deliverPagePanelTags.exports.includes('data-testid="handoff-pack-direct"') &&
      deliverPageTabTags.checks.includes('aria-selected="false"') &&
      deliverPageTabTags.checks.includes('tabindex="-1"') &&
      deliverPagePanelTags.checks.includes('hidden=""') &&
      deliverPagePanelTags.checks.includes('tabindex="-1"') &&
      deliverPagePanelTags.checks.includes('data-testid="handoff-pack-checks"'),
    "Deliver should expose Exports and Checks & package as two labelled pages while keeping the Handoff Pack mounted"
  );
  check(
    workspacePageTabsSource.includes('data-testid={`${idPrefix}-page-tabs`}') &&
      workspacePageTabsSource.includes('aria-controls={`${idPrefix}-page-panel-${item.id}`}') &&
      ["ArrowLeft", "ArrowRight", "Home", "End"].every((key) =>
        workspacePageTabsSource.includes(`case "${key}":`)
      ) &&
      workspacePageTabsSource.indexOf("onSelect(nextItem.id);") <
        workspacePageTabsSource.indexOf("tabRefs.current[nextIndex]?.focus();") &&
      guidancePanelsSource.includes(
        'const mainTabIds: WorkspaceMainTabId[] = ["overview", ...items.map((item) => item.id)];'
      ),
    "main and sub tabs should retain shared Arrow/Home/End roving focus and tab-to-panel ownership contracts"
  );
  check(
    [
      "overview-page-snapshot",
      "overview-player",
      "overview-full-song-play",
      "overview-song-progress",
      "overview-metrics",
      "overview-mini-timeline",
      "overview-arrangement-list",
      "overview-readiness-grid",
      "workflow-target-overview",
      "workflow-target-compose",
      "workflow-target-arrange",
      "workflow-target-mix",
      "workflow-target-master",
      "review-queue",
      "handoff-pack"
    ].every((testId) => html.includes(`data-testid="${testId}"`)),
    "functional tab grouping should preserve Overview, workspace landing, and review/export test ids"
  );

  const hiddenRule = cssRuleBody('.workspace-zone-panel[hidden]');
  const pageHiddenRule = cssRuleBody('.workspace-page-panel[hidden]');
  const pageVisibleRule = cssRuleBody('.workspace-page-panel:not([hidden])');
  const pageTabsRule = cssRuleBody('.workspace-page-tabs');
  const pageTabSelectedRule = cssRuleBody('.workspace-page-tab[aria-selected="true"]');
  const selectedRule = cssRuleBody('.workflow-navigator-card[aria-selected="true"]');
  const selectedUnderlineRule = cssRuleBody('.workflow-navigator-card[aria-selected="true"]::after');
  const selectedBadgeRule = cssRuleBody('.workflow-navigator-card[aria-selected="true"] .workflow-tab-status');
  const appShellRule = cssRuleBody(".app-shell");
  const tabsSurfaceRule = cssRuleBody(".workspace-tabs-surface");
  const navigatorGridRule = cssRuleBody(".workflow-navigator-grid");
  const navigatorValueRule = cssRuleBody(".workflow-navigator-card strong");
  const workspaceGridRule = cssRuleBody(".workspace-grid");
  const overviewRule = cssRuleBody(".workspace-overview-panel");
  const composeRule = cssRuleBody(".workspace-compose-panel");
  const arrangeRule = cssRuleBody(".workspace-arrange-panel");
  const mixRule = cssRuleBody(".workspace-mix-panel");
  const mixMixerRule = cssRuleBody(".workspace-mix-panel > .mixer-panel");
  const mixMasterRule = cssRuleBody(".workspace-mix-panel > .master-panel");
  const deliverRule = cssRuleBody(".workspace-deliver-panel");
  const desktopDeliverHandoffRule = cssRuleBody(".workspace-deliver-panel .handoff-pack");
  check(
    appShellRule.includes("overflow-x: clip;") &&
      !appShellRule.includes("overflow-x: hidden;"),
    "the app shell should clip accidental inline paint overflow without becoming a horizontal scroll container"
  );
  check(
    hiddenRule.includes("display: none !important;") &&
      selectedRule.includes("border-block-end-width: 3px;") &&
      selectedRule.includes("background:") &&
      selectedRule.includes("box-shadow:") &&
      selectedUnderlineRule.includes("height: 4px;") &&
      selectedUnderlineRule.includes("background: #82d7ff;") &&
      selectedBadgeRule.includes("background: #82d7ff;") &&
      selectedBadgeRule.includes("color: #071317;") &&
      tabsSurfaceRule.includes("border: 1px solid rgba(130, 215, 255, 0.54);") &&
      tabsSurfaceRule.includes("box-shadow:") &&
      navigatorGridRule.includes("grid-template-columns: repeat(5, minmax(0, 1fr));") &&
      navigatorValueRule.includes("overflow-wrap: anywhere;") &&
      navigatorValueRule.includes("white-space: normal;"),
    "five main tabs should fit one explicit grid while inactive panels stay hidden, key status values wrap, and the selected tab remains high contrast"
  );
  check(
    guidancePanelsSource.includes("const tablistRef = useRef<HTMLDivElement | null>(null);") &&
      guidancePanelsSource.includes("const nearestScrollLeft =") &&
      guidancePanelsSource.includes("tablist.scrollTo({") &&
      guidancePanelsSource.includes('behavior: "auto"') &&
      guidancePanelsSource.includes("tablist.scrollWidth - tablist.clientWidth"),
    "external mobile workspace routes should reveal an offscreen active tab with nearest horizontal tablist scrolling only"
  );
  check(
    styles.includes(".workflow-navigator-grid {\n    grid-template-columns: repeat(2, minmax(0, 1fr));") &&
      styles.includes(".workspace-page-tablist {\n    display: flex;") &&
      styles.includes("overflow-x: auto;") &&
      styles.includes(".workspace-page-tab {\n    flex: 0 0 min(78vw, 280px);") &&
      styles.includes("@media (max-width: 620px) {\n  .workspace-page-tab,\n  .workflow-navigator-card {") &&
      styles.includes("min-height: 68px;"),
    "responsive main and sub tabs should wrap or scroll deliberately while preserving large narrow-screen hit targets"
  );
  check(
    panelTags.overview.includes("workspace-grid workspace-zone-panel workspace-overview-panel") &&
      overviewRule.includes("grid-template-columns: minmax(0, 1fr);") &&
      panelTags.compose.includes("workspace-grid workspace-zone-panel workspace-compose-panel") &&
      workspaceGridRule.includes("grid-template-columns:") &&
      composeRule.includes("grid-template-columns: minmax(0, 1fr);") &&
      pageHiddenRule.includes("display: none !important;") &&
      pageVisibleRule.includes("min-height: clamp(540px, 64vh, 920px);") &&
      pageVisibleRule.includes("padding: 20px;") &&
      pageTabsRule.includes("grid-column: 1 / -1;") &&
      pageTabSelectedRule.includes("border-color: rgba(120, 240, 200, 0.9);") &&
      panelTags.arrange.includes("workspace-grid workspace-zone-panel workspace-arrange-panel") &&
      arrangeRule.includes("grid-template-columns: minmax(0, 1fr);") &&
      panelTags.mix.includes("workspace-grid workspace-zone-panel workspace-mix-panel") &&
      mixRule.includes("grid-template-columns: minmax(0, 1fr);") &&
      mixMixerRule.includes("grid-column: 1;") &&
      mixMasterRule.includes("grid-column: 1;") &&
      panelTags.deliver.includes("workspace-zone-panel workspace-deliver-panel") &&
      deliverRule.includes("display: grid;") &&
      styles.includes(".workspace-deliver-panel > .workspace-page-tabs,") &&
      desktopDeliverHandoffRule.includes("grid-template-columns: 250px minmax(0, 1fr);"),
    "Overview, Compose, Arrange, Mix, and Deliver should retain full-width nested-page layouts with a readable Handoff Pack"
  );
  check(
    styles.includes("@media (max-width: 1600px) {") &&
      styles.includes(".workspace-compose-panel {\n    grid-template-columns: minmax(0, 1fr);") &&
      styles.includes(".workspace-compose-panel .pattern-stack-preview {\n    grid-template-columns: repeat(2, minmax(0, 1fr));") &&
      styles.includes(".workspace-compose-panel .pattern-stack-preview > * {\n    overflow: visible;\n    overflow-wrap: anywhere;\n    text-overflow: clip;\n    white-space: normal;") &&
      styles.includes(".workspace-mix-panel {\n    grid-template-columns: minmax(0, 1fr);") &&
      styles.includes(".mode-row > .session-meter {\n    flex: 1 1 720px;\n    min-width: 0;\n    flex-wrap: wrap;") &&
      styles.includes(".mode-row > .quick-action-result {\n    flex: 1 1 100%;\n    width: 100%;") &&
      electronMainSource.includes("collectManualQaViewportAccessibility") &&
      electronMainSource.includes("intentionalScrollerExclusions") &&
      electronMainSource.includes("clipped-by-") &&
      electronMainSource.includes("relativeLeft <= ancestor.scrollWidth + 1") &&
      electronMainSource.includes("window.innerHeight - navigatorHeight - 120") &&
      electronMainSource.includes("native-hit-test-blocked") &&
      electronMainSource.includes("accessibleInteractiveKeys.has(offender.elementKey)") &&
      electronMainSource.includes("centerManualQaTargetedAccessibility") &&
      electronMainSource.includes("element.closest('[hidden], [inert], [aria-hidden=\"true\"]')") &&
      electronMainSource.includes("not-hit-tested-after-target-scroll") &&
      electronMainSource.includes("targetedPosture?.left") &&
      electronMainSource.includes("renderedInteractiveCount: renderedInteractiveKeys.size") &&
      electronMainSource.includes("auto-song-${zone}-deep.png") &&
      electronMainSource.includes("inaccessible active or shell elements"),
    "1440px workspace QA should shrink intrinsic tracks and hard-fail clipped active elements with deep-scroll native hit-test evidence"
  );
}

function validateProjectAudioAnalysisPerformance(html, helpers) {
  check(
    appSource.includes("const projectAudioAnalysis = useProjectAudioAnalysis(") &&
      appSource.includes(
        'projectAudioAnalysisCommitEnabledForZone(activeWorkspaceZone === "overview" ? "mix" : activeWorkspaceZone)'
      ) &&
      !appSource.includes("const exportAnalysis = useMemo(() => analyzeExport(project), [project]);") &&
      !appSource.includes("const stemAnalyses = useMemo(() => analyzeStemExports(project), [project]);"),
    "App render should route exact PCM meter work through the off-main-thread hook and give Overview the same commit posture as Mix"
  );
  const modeSwitchSource = printNamedFunction(appSource, "App.tsx", "switchProjectMode");
  const loopScopeSource = printNamedFunction(appSource, "App.tsx", "selectTransportLoopScope");
  check(
    modeSwitchSource.includes("afterModeFocusSummary,") &&
      modeSwitchSource.includes("afterSessionPassSummary,") &&
      modeSwitchSource.includes("afterFirstBeatPathSummary,") &&
      modeSwitchSource.includes("createModeFocusSummary(") &&
      !modeSwitchSource.includes("analyzeExport(") &&
      !modeSwitchSource.includes("analyzeStemExports(") &&
      !modeSwitchSource.includes("createBeatReadinessChecks("),
    "mode switching should build target-mode result summaries from current exact meters without synchronously rebuilding PCM analysis"
  );
  check(
    loopScopeSource.includes("if (!isPlaying && scope === transportLoopScope)") &&
      loopScopeSource.includes("return;") &&
      loopScopeSource.indexOf("if (!isPlaying && scope === transportLoopScope)") < loopScopeSource.indexOf("setTransportLoopScope(scope)"),
    "re-selecting the active transport loop scope while stopped should be a no-op before workstation-wide state updates"
  );
  check(
    appSource.includes("createSnapshotCompareProjectProfileFromAnalysis(project, exportAnalysis, stemAnalyses)") &&
      appSource.includes("useSavedSnapshotAudioAnalyses(") &&
      appSource.includes("guidanceCenterOpen && !projectAudioAnalysis.pending && project.snapshots.length > 0") &&
      appSource.includes("savedSnapshotAudioAnalyses.byIdentity[projectAudioAnalysisIdentity(savedProject)]") &&
      appSource.includes("createSnapshotCompareDeferredProjectProfile(") &&
      !appSource.includes("currentSnapshotCompareProfile, createSnapshotCompareProjectProfile") &&
      workstationHelpersSource.includes("createSnapshotCompareProjectProfileFromAnalysis(") &&
      !printNamedFunction(
        workstationHelpersSource,
        "workstationAppHelpers.tsx",
        "createSnapshotCompareProjectProfileFromAnalysis"
      ).includes("analyzeExport("),
    "current and saved Snapshot Compare profiles should reuse exact worker meters without synchronously rendering PCM"
  );
  check(
    savedSnapshotAudioAnalysisHookSource.includes("createSavedSnapshotAudioAnalysisTasks(") &&
      savedSnapshotAudioAnalysisHookSource.includes("projectAudioAnalysisIdentity(project)") &&
      savedSnapshotAudioAnalysisHookSource.includes("const runNext = (taskIndex: number)") &&
      savedSnapshotAudioAnalysisHookSource.includes("grooveforge-saved-snapshot-audio-analysis") &&
      savedSnapshotAudioAnalysisHookSource.includes("worker.onmessageerror") &&
      savedSnapshotAudioAnalysisHookSource.includes('status: "error"') &&
      savedSnapshotAudioAnalysisHookSource.includes("workerRef.current?.terminate()") &&
      !savedSnapshotAudioAnalysisHookSource.includes("analyzeProjectAudio(") &&
      !savedSnapshotAudioAnalysisHookSource.includes("analyzeExport(") &&
      !savedSnapshotAudioAnalysisHookSource.includes("analyzeStemExports("),
    "saved Snapshot Compare analysis should use one sequential, cached, stale-safe worker queue with explicit pending/error posture"
  );
  const reviewQueueStart = workstationHelpersSource.indexOf("export function ReviewQueue(");
  const reviewQueueEnd = workstationHelpersSource.indexOf("export type ReviewQueuePriority", reviewQueueStart);
  const reviewQueueSource = workstationHelpersSource.slice(reviewQueueStart, reviewQueueEnd);
  check(
    appSource.includes("analysis={exportAnalysis}") &&
      appSource.includes("analysisPending={projectAudioAnalysis.pending}") &&
      reviewQueueSource.includes("createReviewFixPreview") &&
      reviewQueueSource.includes("focusedItemId, project, analysis") &&
      reviewQueueSource.includes("createReviewFixOption(item, project, analysis)") &&
      !reviewQueueSource.includes("analyzeExport(") &&
      reviewQueueSource.includes("analysisPending || item.tone"),
    "Review Queue render should reuse worker meters and disable fixes while exact audio analysis is pending"
  );
  const workflowNavigatorItemsSource = printNamedFunction(
    workstationHelpersSource,
    "workstationAppHelpers.tsx",
    "createWorkflowNavigatorItems"
  );
  check(
    appSource.includes("projectAudioAnalysis.status") &&
      workflowNavigatorItemsSource.includes('analysisStatus: WorkflowNavigatorAnalysisStatus = "ready"') &&
      workflowNavigatorItemsSource.includes('workflowNavigatorAnalysisPosture("mix", analysisStatus)') &&
      workflowNavigatorItemsSource.includes('workflowNavigatorAnalysisPosture("deliver", analysisStatus)') &&
      workflowNavigatorAnalysisPostureSource.includes('{ value: "Analyzing", detail: "Waiting for meters / mix signal checks deferred" }') &&
      workflowNavigatorAnalysisPostureSource.includes('{ value: "Waiting for meters", detail: "Analysis in progress / export readiness deferred" }') &&
      workflowNavigatorAnalysisPostureSource.includes('value: "Meters unavailable"') &&
      !workflowNavigatorAnalysisPostureSource.includes("Silent") &&
      !workflowNavigatorAnalysisPostureSource.includes("Hold export"),
    "Workflow Navigator and review summaries should defer synthetic no-signal claims until exact meters are ready"
  );
  const titleInputSource = printNamedFunction(appSource, "App.tsx", "ProjectTitleInput");
  const sessionBriefFieldsSource = printNamedFunction(
    workstationHelpersSource,
    "workstationAppHelpers.tsx",
    "SessionBriefFields"
  );
  const metadataUpdateSource = printNamedFunction(appSource, "App.tsx", "updateProjectMetadata");
  const sessionBriefUpdateSource = printNamedFunction(appSource, "App.tsx", "updateSessionBrief");
  const metadataFlushSource = printNamedFunction(appSource, "App.tsx", "flushActiveMetadataDraft");
  const metadataBlurSource = printNamedFunction(appSource, "App.tsx", "blurMetadataDraftElement");
  const metadataRevisionSource = printNamedFunction(appSource, "App.tsx", "advanceMetadataDraftRevision");
  const undoProjectSource = printNamedFunction(appSource, "App.tsx", "undoProject");
  const openProjectSource = printNamedFunction(appSource, "App.tsx", "handleOpenProject");
  const loadProjectSource = printNamedFunction(appSource, "App.tsx", "loadProjectText");
  const replaceProjectSource = printNamedFunction(appSource, "App.tsx", "replaceProject");
  check(
    titleInputSource.includes("setDraft(nextTitle)") &&
      titleInputSource.includes("startTransition") &&
      titleInputSource.includes("onCommit(normalized)") &&
      titleInputSource.includes("authoritativeRevision") &&
      titleInputSource.includes("setDraft(title)") &&
      titleInputSource.includes("[authoritativeRevision, title]") &&
      appSource.includes("onBlur={(event) => commitDraft(event.currentTarget.value)}") &&
      sessionBriefFieldsSource.includes("setDraft") &&
      sessionBriefFieldsSource.includes("startTransition") &&
      sessionBriefFieldsSource.includes("onChange(field, value)") &&
      sessionBriefFieldsSource.includes("activeFieldRef") &&
      sessionBriefFieldsSource.includes("activeFieldRef.current = null") &&
      sessionBriefFieldsSource.includes("setDraft(brief)") &&
      sessionBriefFieldsSource.includes("[authoritativeRevision, brief]") &&
      workstationHelpersSource.includes('onBlur={(event) => commitDraft("artist", event.currentTarget.value)}') &&
      workstationHelpersSource.includes('onBlur={(event) => commitDraft("notes", event.currentTarget.value)}') &&
      metadataFlushSource.includes('intent: "commit" | "prepare-replacement" | "discard"') &&
      metadataBlurSource.includes("metadataBlurCommitSuppressedRef.current = true") &&
      metadataBlurSource.includes("metadataBlurCommitSuppressedRef.current = false") &&
      metadataFlushSource.includes("pendingMetadataDraftRef.current") &&
      metadataFlushSource.includes("commitMetadataDraft(snapshot)") &&
      openProjectSource.includes('flushActiveMetadataDraft("prepare-replacement")') &&
      /if \(result\.canceled \|\| !result\.contents\) \{\s*flushActiveMetadataDraft\("commit"\)/u.test(openProjectSource) &&
      /!window\.confirm\(replacementGuard\.warning\)\) \{\s*flushActiveMetadataDraft\("commit"\)/u.test(loadProjectSource) &&
      replaceProjectSource.indexOf('flushActiveMetadataDraft("discard")') <
        replaceProjectSource.indexOf("advanceMetadataDraftRevision()") &&
      metadataRevisionSource.includes("pendingMetadataDraftRef.current = null") &&
      metadataRevisionSource.includes("setMetadataDraftRevision(nextRevision)") &&
      undoProjectSource.indexOf('flushActiveMetadataDraft("commit")') <
        undoProjectSource.indexOf("const currentUndoStack = undoStackRef.current"),
    "project title and isolated Session Brief fields should type locally, accept authoritative replacements, and flush exactly once for native project operations"
  );
  check(
    metadataUpdateSource.includes("projectRef.current = nextProject") &&
      metadataUpdateSource.includes("replaceUndoHistory") &&
      metadataUpdateSource.includes("replaceRedoHistory([])") &&
      metadataUpdateSource.includes("setLocalDraftWriteArmed(true)") &&
      metadataUpdateSource.includes("setProjectHasUnsavedChanges(true)") &&
      metadataUpdateSource.includes("setProject(nextProject)") &&
      metadataUpdateSource.includes("setSessionBriefCompassResult(null)") &&
      !metadataUpdateSource.includes("setComposerActionResult(null)") &&
      sessionBriefUpdateSource.includes("updateProjectMetadata") &&
      appSource.includes("(current) => (current.title === title ? current : { ...current, title })"),
    "non-musical title and Session Brief edits should preserve durable project ownership without invalidating every musical result"
  );
  check(
    projectAudioAnalysisHookSource.includes("workerRef.current?.terminate();") &&
      projectAudioAnalysisHookSource.includes("inFlightRequestRef.current") &&
      projectAudioAnalysisHookSource.includes("유휴 Worker는 재사용") &&
      projectAudioAnalysisHookSource.includes("deferredResponseRef.current = response") &&
      projectAudioAnalysisHookSource.includes("commitEnabledRef.current = commitEnabled") &&
      projectAudioAnalysisHookSource.includes("!commitEnabledRef.current || shouldHoldProjectAudioAnalysisCommit(activeTestId)") &&
      projectAudioAnalysisHookSource.includes("if (!commitEnabled && !retryForced)") &&
      projectAudioAnalysisHookSource.includes("requestIdRef.current += 1") &&
      projectAudioAnalysisHookSource.includes("(snapshot.identity === identity && snapshot.exact)") &&
      projectAudioAnalysisHookSource.includes("retryRequest.generation") &&
      projectAudioAnalysisHookSource.includes("shouldHoldProjectAudioAnalysisCommit(activeTestId)") &&
      projectAudioAnalysisHookSource.includes('document.addEventListener("focusout", releaseDeferredResponse)') &&
      projectAudioAnalysisHookSource.includes("analysisCommitTargetTestId(event.relatedTarget)") &&
      projectAudioAnalysisHookSource.includes("!commitEnabled ||") &&
      projectAudioAnalysisHookSource.includes("}, [commitEnabled]);") &&
      projectAudioAnalysisHookSource.includes("deferredResponseRef.current = null") &&
      projectAudioAnalysisHookSource.includes("startTransition(() => {") &&
      projectAudioAnalysisHookSource.includes("shouldAcceptProjectAudioAnalysisResponse(") &&
      projectAudioAnalysisHookSource.includes("response.id,") &&
      projectAudioAnalysisHookSource.includes("latestIdentityRef.current") &&
      projectAudioAnalysisHookSource.includes("setSnapshot({ identity: response.identity, analysis: response.analysis, exact: true })"),
    "audio analysis should defer offline work through creative tabs, reuse an idle worker in review tabs, terminate superseded edits, hold exact commits during metadata entry, and preserve stale guards"
  );
  check(
    projectAudioAnalysisHookSource.includes("shouldAcceptProjectAudioAnalysisFailure(") &&
      projectAudioAnalysisHookSource.includes("projectAudioAnalysisStatus(") &&
      projectAudioAnalysisHookSource.includes("try {\n        worker = new Worker(") &&
      projectAudioAnalysisHookSource.includes("createdWorker.onerror") &&
      projectAudioAnalysisHookSource.includes("createdWorker.onmessageerror") &&
      projectAudioAnalysisHookSource.includes("worker.postMessage(") &&
      projectAudioAnalysisHookSource.includes("commitAnalysisFailure(") &&
      projectAudioAnalysisHookSource.includes('pending: status !== "ready"') &&
      projectAudioAnalysisHookSource.includes("setRetryRequest") &&
      projectAudioAnalysisHookSource.includes("generation: current.generation + 1") &&
      appSource.includes('data-audio-analysis-state={projectAudioAnalysis.status}') &&
      localizationSource.includes('"Audio meters unavailable"') &&
      appSource.includes('data-testid="audio-analysis-retry"') &&
      appSource.includes("onClick={retryCurrentProjectAudioAnalysis}") &&
      styles.includes(".session-meter .audio-analysis-retry:focus-visible"),
    "audio analysis worker failures should converge on an identity-safe error state with blocked exact actions and a visible focusable Retry meters control"
  );
  const analysisGateSource = printNamedFunction(
    workstationHelpersSource,
    "workstationAppHelpers.tsx",
    "ProjectAudioAnalysisGate"
  );
  const retrySource = printNamedFunction(appSource, "App.tsx", "retryCurrentProjectAudioAnalysis");
  const surfaceGuardSource = printNamedFunction(appSource, "App.tsx", "exactAudioAnalysisReadyForSurface");
  const pendingGuideGateHtml = renderToStaticMarkup(
    React.createElement(helpers.ProjectAudioAnalysisGate, {
      onRetry() {},
      status: "pending",
      surface: "Guide"
    })
  );
  const errorGuideGateHtml = renderToStaticMarkup(
    React.createElement(helpers.ProjectAudioAnalysisGate, {
      onRetry() {},
      status: "error",
      surface: "Guide"
    })
  );
  check(
    analysisGateSource.includes('t("analysis.analyzing")') &&
      analysisGateSource.includes('t("analysis.metersUnavailable")') &&
      workstationHelpersSource.includes('t("analysis.hiddenDetail")') &&
      workstationHelpersSource.includes('t("analysis.retry")') &&
      localizationSource.includes('"analysis.analyzing": "Analyzing"') &&
      localizationSource.includes('"analysis.metersUnavailable": "Meters unavailable"') &&
      localizationSource.includes(
        '"analysis.hiddenDetail": "Meter values, readiness claims, and delivery actions stay hidden until analysis is exact."'
      ) &&
      localizationSource.includes('"analysis.retry": "Retry meters"') &&
      workstationHelpersSource.includes('data-testid={`audio-analysis-gate-${surface.toLowerCase()}`}') &&
      appSource.includes("exactProjectAudioAnalysisReady && isStemTrackId(channel.id)") &&
      appSource.includes("exactProjectAudioAnalysisReady ? (") &&
      appSource.includes('surface="Guide"') &&
      appSource.includes('surface="Mix"') &&
      appSource.includes('surface="Master"') &&
      appSource.includes('surface="Deliver"') &&
      appSource.includes("exportReceipt={currentHandoffExportReceipt}") &&
      surfaceGuardSource.includes('projectAudioAnalysis.status === "ready"') &&
      styles.includes(".project-audio-analysis-gate.error"),
    "Mix, Master, and Handoff meter-derived surfaces and delivery actions should stay behind an exact ready-state gate"
  );
  check(
    pendingGuideGateHtml.includes('data-testid="audio-analysis-gate-guide"') &&
      pendingGuideGateHtml.includes("Analyzing") &&
      !pendingGuideGateHtml.includes("Retry meters") &&
      errorGuideGateHtml.includes('data-testid="audio-analysis-gate-guide"') &&
      errorGuideGateHtml.includes("Meters unavailable") &&
      errorGuideGateHtml.includes("Retry meters") &&
      [pendingGuideGateHtml, errorGuideGateHtml].every(
        (gateHtml) => !gateHtml.includes("Silent") && !/[+-]?\d+(?:\.\d+)?\s*dB\b/.test(gateHtml)
      ) &&
      appSource.includes("{exactProjectAudioAnalysisReady && (\n      <AudienceSessionReadout") &&
      appSource.includes("{exactProjectAudioAnalysisReady && (\n      <StyleInspector") &&
      appSource.includes("analysisStatus={projectAudioAnalysis.status}") &&
      workstationHelpersSource.includes('surface="Guide"'),
    "Guide pending and error states should keep creative brief controls available while hiding stale meter, dB, and readiness result cards"
  );
  const workflowRetryNavigationIndex = retrySource.indexOf("activateWorkspaceZone(retryZone)");
  const workflowRetryRequestIndex = retrySource.indexOf(
    "projectAudioAnalysis.retry()",
    workflowRetryNavigationIndex
  );
  check(
    retrySource.includes('if (sourceZone === "overview")') &&
      retrySource.includes("Retrying exact audio meters in Overview") &&
      retrySource.includes("projectAudioAnalysisRetryZone(sourceZone)") &&
      workflowRetryNavigationIndex >= 0 &&
      workflowRetryRequestIndex > workflowRetryNavigationIndex,
    "Retry should stay in commit-enabled Overview while Compose or Arrange first navigates to a commit-enabled review zone"
  );
  check(
    projectAudioAnalysisWorkerSource.includes("analyzeProjectAudio(project)") &&
      projectAudioAnalysisWorkerSource.includes("self.postMessage({ id, identity, analysis:"),
    "audio meter worker should return request-scoped exact mix and stem analyses"
  );
  check(
    ["arrangement", "automation", "bpm", "key", "masterCeilingDb", "mixer", "patterns", "sound", "styleId", "swing"].every(
      (field) => projectAudioAnalysisSource.includes(`${field}: project.${field}`)
    ) &&
      ["title", "mode", "selectedPattern", "deliveryTarget", "sessionBrief", "snapshots", "metronomeEnabled"].every(
        (field) => !projectAudioAnalysisSource.includes(`${field}: project.${field}`)
      ),
    "audio analysis identity should include every PCM input and exclude UI-only project metadata"
  );
  check(
    styles.includes(".guidance-center-content > * {\n  content-visibility: auto;\n  contain-intrinsic-block-size: auto 320px;") &&
      styles.includes(".workspace-zone-panel:not([hidden]) > .panel") &&
      styles.includes("contain-intrinsic-block-size: auto 720px;"),
    "distant Guide and active workspace cards should use intrinsic-size content visibility to bound cold layout work"
  );
  check(
    html.includes('data-audio-analysis-state="ready"') &&
      html.includes('data-testid="audio-analysis-status">Audio meters ready</span>'),
    "audio analysis readiness should be explicit instead of presenting an unlabeled pending Silent meter"
  );
  const modePanelsSource = printNamedFunction(appSource, "App.tsx", "updateModeAwareToolPanels");
  const expandZoneSource = printNamedFunction(appSource, "App.tsx", "expandStudioWorkspaceZone");
  const activateZoneSource = printNamedFunction(appSource, "App.tsx", "activateWorkspaceZone");
  check(
    modePanelsSource.includes("const activeZone = activeWorkspaceZoneRef.current;") &&
      modePanelsSource.includes('if (activeZone !== "overview")') &&
      modePanelsSource.includes("expandStudioWorkspaceZone(activeZone)") &&
      !modePanelsSource.includes("setArrangementToolsOpen(advancedOpen)") &&
      !modePanelsSource.includes("Object.fromEntries(projectRef.current.mixer") &&
      expandZoneSource.includes('zone === "compose"') &&
      expandZoneSource.includes('zone === "arrange"') &&
      expandZoneSource.includes('zone === "mix"') &&
      activateZoneSource.includes('projectRef.current.mode === "studio"') &&
      activateZoneSource.includes('zone !== "overview"') &&
      activateZoneSource.includes("expandStudioWorkspaceZone(zone)"),
    "Studio mode should skip read-only Overview and materialize each production zone only when it becomes active"
  );
  check(
    appSource.includes('import { Activity, startTransition, useEffect, useMemo, useRef, useState } from "react";') &&
      appSource.includes('function workspaceActivityMode(visible: boolean): "visible" | "hidden"') &&
      appSource.includes('typeof document === "undefined" || visible') &&
      appSource.includes('<Activity mode={workspaceActivityMode(guidanceCenterOpen)} name="guide-review-center">') &&
      ["overview", "compose", "arrange", "mix", "deliver"].every((zone) =>
        appSource.includes(
          `<Activity mode={workspaceActivityMode(activeWorkspaceZone === "${zone}")} name="workspace-${zone}">`
        )
      ),
    "closed Guide content and all five inactive main-tab bodies should use React Activity to defer hidden updates while preserving their DOM and local state"
  );
}

function validateFirstRunRenderer(html, supportedStyleCount) {
  check(html.length > 250000, `first-run renderer output should be substantial, got ${html.length} characters`);
  validateWorkspaceFunctionTabs(html);
  const workspaceIndex = html.indexOf('class="workspace-grid"');
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
  const workspaceZoneSource = printNamedFunction(appSource, "App.tsx", "workspaceZoneForTarget");
  const workspaceActivationSource = printNamedFunction(appSource, "App.tsx", "activateWorkspaceZone");
  const workspaceScrollSource = printNamedFunction(appSource, "App.tsx", "scrollWorkspaceTargetIntoView");
  const workspaceRouteSource = printNamedFunction(appSource, "App.tsx", "routeWorkspaceTargetIntoView");
  const workspaceRoutePageSource = printNamedFunction(appSource, "App.tsx", "activateWorkspaceRoutePage");
  const guidanceScrollSource = printNamedFunction(appSource, "App.tsx", "scrollGuidanceTargetIntoView");
  const beatPassportRouteSource = printNamedFunction(appSource, "App.tsx", "focusBeatPassportRouteReadout");
  const runQuickActionSource = printNamedFunction(appSource, "App.tsx", "runQuickAction");
  const workflowJumpSource = printNamedFunction(appSource, "App.tsx", "jumpToWorkflowZone");
  const workflowTabSelectionSource = printNamedFunction(appSource, "App.tsx", "selectWorkflowNavigatorTab");
  const desktopShortcutSource = printNamedFunction(appSource, "App.tsx", "handleDesktopShortcut");
  const nativeMenuSource = printNamedFunction(appSource, "App.tsx", "handleNativeMenuCommand");
  const midiCaptureSource = printNamedFunction(appSource, "App.tsx", "captureMidiNoteEvent");
  const deleteSelectedEventSource = printNamedFunction(appSource, "App.tsx", "deleteSelectedEvent");
  const workspacePageActivationSource = printNamedFunction(appSource, "App.tsx", "activateWorkspacePageForTarget");
  const finishChecklistRouteSource = printNamedFunction(
    appSource,
    "App.tsx",
    "focusFinishChecklistRouteReadout"
  );
  const reviewQueueRouteSource = printNamedFunction(
    appSource,
    "App.tsx",
    "focusReviewQueueRouteReadout"
  );
  const coldWorkspaceRouteSources = [
    "focusBeatReadinessCheck",
    "focusBeatPassportMetric",
    "focusProductionSnapshotMetric",
    "focusSnapshotCompareMetric",
    "focusHookReadinessCard",
    "focusToplineSpaceCard",
    "focusModeFocusCard",
    "focusSessionPassCard",
    "focusReviewQueueItem"
  ].map((name) => printNamedFunction(appSource, "App.tsx", name));
  const coldWorkspaceReadoutRoutes = [
    ["focusPatternPlaybackReadout", 'routeWorkspaceTargetIntoView("compose", "start")'],
    ["focusPatternUseReadout", 'routeWorkspaceTargetIntoView("arrange", "start")'],
    ["focusStemAuditionReadout", 'routeWorkspaceTargetIntoView("mix", "start")'],
    ["focusMasterFinishReadout", 'routeWorkspaceTargetIntoView("master", "center")'],
    ["focusTimbreCheck", 'routeWorkspaceTargetIntoView("sound", "start")'],
    ["focusExportPreflightRouteReadout", 'routeWorkspaceTargetIntoView("deliver", "start")'],
    ["focusTransportPositionReadout", 'routeWorkspaceTargetIntoView("transport", "start")']
  ].map(([name, route]) => ({
    route,
    source: printNamedFunction(appSource, "App.tsx", name)
  }));
  const structureWorkspaceReadoutRoutes = [
    "focusPatternChainReadout",
    "focusChainExpandReadout",
    "focusArrangementTemplateReadout",
    "focusArrangementArcReadout",
    "focusArrangementFocusReadout",
    "focusSectionLocatorReadout",
    "focusSongFormOverviewReadout",
    "focusArrangementTransitionMapTransition",
    "focusArrangementTransitionMapReadout"
  ].map((name) => printNamedFunction(appSource, "App.tsx", name));
  const timelineWorkspaceReadoutRoutes = [
    "focusArrangementMoveReadout",
    "focusPatternUseReadout",
    "focusArrangementPlaybackReadout",
    "focusSelectedArrangementBlockReadout",
    "focusAudibleArrangementFollowReadout"
  ].map((name) => printNamedFunction(appSource, "App.tsx", name));
  const muteMapWorkspaceReadoutRoutes = ["focusArrangementMuteMapLane", "focusArrangementMuteMapReadout"].map(
    (name) => printNamedFunction(appSource, "App.tsx", name)
  );
  check(
    html.includes("Guided · opens the drum grid") &&
      html.includes("Studio · opens Review Queue") &&
      /<section(?=[^>]*id="compose-page-panel-drums")(?=[^>]*data-testid="workflow-target-compose")(?=[^>]*tabindex="0")[^>]*>/u.test(
        html
      ) &&
      html.includes('data-testid="review-queue" aria-label="Review queue" tabindex="-1"'),
    "first-run choices should name their direct destinations and keep both landing regions programmatically focusable"
  );
  const zoneResolutionIndex = workspaceScrollSource.indexOf("zoneHint ?? workspaceZoneForTarget(initialTarget)");
  const zoneActivationIndex = workspaceScrollSource.indexOf("activateWorkspaceZone(zone)");
  const routeZoneActivationIndex = workspaceRouteSource.indexOf("activateWorkspaceZone(zone)");
  const routePageActivationIndex = workspaceRouteSource.indexOf("activateWorkspaceRoutePage(target)");
  const focusTransferIndex = workspaceScrollSource.indexOf("if (shouldTransferFocus)");
  const targetFocusIndex = workspaceScrollSource.indexOf("target.focus({ preventScroll: true })");
  const panelFocusFallbackIndex = workspaceScrollSource.indexOf(
    "document.getElementById(`workspace-panel-${zone}`)?.focus({ preventScroll: true })"
  );
  const targetScrollIndex = workspaceScrollSource.indexOf("target.scrollIntoView");
  const mixTabpanelIndex = html.indexOf('id="workspace-panel-mix"');
  const reviewQueueIndex = html.indexOf('data-testid="review-queue"');
  const deliverTabpanelIndex = html.indexOf('id="workspace-panel-deliver"');
  check(
    audienceStarterLandingSource.includes('starterId === "producer"') &&
      audienceStarterLandingSource.includes("setMasterReviewOpen(true)") &&
      audienceStarterLandingSource.includes("setMasterReviewQueueOpen(true)") &&
      audienceStarterLandingSource.includes(
        'scrollWorkspaceTargetIntoView(() => reviewQueuePanelRef.current, "start", "mix")'
      ) &&
      audienceStarterLandingSource.includes('routeWorkspaceTargetIntoView("compose")') &&
      audienceStarterLandingSource.includes("focus({ preventScroll: true })") &&
      createAudienceStarterSource.includes("focusAudienceStarterLanding(starterId)") &&
      workspaceZoneSource.includes('[data-workspace-zone]') &&
      ['overview', 'compose', 'arrange', 'mix', 'deliver'].every((zone) =>
        workspaceZoneSource.includes(`zone === "${zone}"`)
      ) &&
      workspaceActivationSource.includes("activeWorkspaceZoneRef.current === zone") &&
      workspaceActivationSource.includes("flushSync") &&
      workspaceActivationSource.includes("activeWorkspaceZoneRef.current = zone") &&
      workspaceActivationSource.includes("setActiveWorkspaceZone(zone)") &&
      zoneResolutionIndex >= 0 &&
      zoneActivationIndex > zoneResolutionIndex &&
      targetScrollIndex > zoneActivationIndex &&
      workspaceScrollSource.includes('target.scrollIntoView({ block, behavior: "auto" })') &&
      workspaceRouteSource.includes('target === "arrange-mute-map"') &&
      workspaceRouteSource.includes(
        'arrangeStructurePanelRef.current?.scrollIntoView({ block, behavior: "auto" })'
      ) &&
      workspaceRouteSource.includes("requestAnimationFrame(() => {") &&
      workspaceRouteSource.includes("return;") &&
      workspaceRouteSource.includes("scrollWorkspaceTargetIntoView(() => workspaceRouteElement(target), block, zone)") &&
      routeZoneActivationIndex >= 0 &&
      routePageActivationIndex > routeZoneActivationIndex &&
      workspaceScrollSource.includes('document.getElementById(`workspace-panel-${zone}`)') &&
      coldWorkspaceRouteSources.every((source) => source.includes("routeWorkspaceTargetIntoView")) &&
      workflowJumpSource.includes("routeWorkspaceTargetIntoView(zone)") &&
      workflowTabSelectionSource.includes("guidanceCenterRef.current?.open") &&
      workflowTabSelectionSource.includes("flushSync(() => setGuidanceCenterOpen(false))") &&
      workflowTabSelectionSource.includes('document.getElementById(`workspace-panel-${item.id}`)') &&
      workflowTabSelectionSource.includes('"start",') &&
      workflowTabSelectionSource.includes("item.id") &&
      !workflowTabSelectionSource.includes("jumpToWorkflowNavigatorItem(item)") &&
      appSource.includes("onJump={selectWorkflowNavigatorTab}") &&
      appSource.includes("onJumpWorkflowSpotlight={jumpToWorkflowNavigatorItem}") &&
      mixTabpanelIndex >= 0 &&
      reviewQueueIndex > mixTabpanelIndex &&
      reviewQueueIndex < deliverTabpanelIndex,
    "direct functional-tab selection should collapse Guide Activity, preserve the active nested page, and reveal targets inside the page-owned scroller"
  );
  check(
    coldWorkspaceReadoutRoutes.every(({ route, source }) => source.includes(route)) &&
      !/scrollWorkspaceTargetIntoView\((?:compose|arrange|mix|master|sound|deliver|transport)PanelRef\.current/.test(
        appSource
      ),
    "cold Quick Action readouts should resolve functional-tab targets only after the destination Activity is activated"
  );
  check(
    appSource.includes('| "arrange-structure"') &&
      appSource.includes('| "arrange-mute-map"') &&
      appSource.includes("const arrangeStructurePanelRef = useRef<HTMLElement | null>(null);") &&
      appSource.includes("const arrangementMuteMapPanelRef = useRef<HTMLElement | null>(null);") &&
      appSource.includes("ref={arrangeStructurePanelRef}") &&
      appSource.includes("routeRef={arrangementMuteMapPanelRef}") &&
      workstationHelpersSource.includes('aria-label={t("arrange.helper.muteMapAria")}') &&
      workstationHelpersSource.includes("arrangement-mute-map arrangement-mute-map-route-target") &&
      workstationHelpersSource.includes('data-arrangement-mute-map-route-target="true"') &&
      workstationHelpersSource.includes("ref={routeRef}") &&
      workstationHelpersSource.includes('role="region"') &&
      workspaceRoutePageSource.includes('case "arrange-structure":') &&
      workspaceRoutePageSource.includes('case "arrange-mute-map":') &&
      workspaceRoutePageSource.includes('activateArrangeWorkspacePage("structure")') &&
      workspaceRoutePageSource.includes("setArrangementToolsOpen(true)") &&
      appSource.includes('if (target === "arrange-mute-map")') &&
      appSource.includes("requestAnimationFrame(() => {") &&
      styles.includes(".arrangement-mute-map-route-target") &&
      styles.includes("scroll-margin-top: 164px;") &&
      structureWorkspaceReadoutRoutes.every((source) =>
        source.includes('routeWorkspaceTargetIntoView("arrange-structure", "start")')
      ) &&
      timelineWorkspaceReadoutRoutes.every((source) =>
        source.includes('routeWorkspaceTargetIntoView("arrange", "start")')
      ) &&
      muteMapWorkspaceReadoutRoutes.every((source) =>
        source.includes('routeWorkspaceTargetIntoView("arrange-mute-map", "start")')
      ),
    "Structure routes should reveal the Structure sub tab and its Arrangement Tools, with Mute Map routes landing on the visible map instead of falling back to Timeline or the panel top"
  );
  const guidanceRevealIndex = guidanceScrollSource.indexOf("flushSync(() => setGuidanceCenterOpen(true))");
  const guidanceFocusIndex = guidanceScrollSource.indexOf("target.focus({ preventScroll: true })");
  const guidanceScrollIndex = guidanceScrollSource.indexOf('target.scrollIntoView({ block, behavior: "auto" })');
  check(
      appSource.includes("const guidanceCenterRef = useRef<HTMLDetailsElement | null>(null);") &&
      appSource.includes("ref={guidanceCenterRef}") &&
      guidanceScrollSource.includes("initialGuidanceCenter?.contains(initialTarget)") &&
      guidanceScrollSource.includes('const deferredTarget = typeof targetResolver === "function"') &&
      guidanceScrollSource.includes("activeElement === document.body") &&
      guidanceScrollSource.includes("activeElement?.closest('[role=\"dialog\"], [data-testid=\"quick-actions\"]')") &&
      guidanceRevealIndex >= 0 &&
      guidanceScrollSource.includes("!target.matches('a[href], button, input, select, textarea, [tabindex]')") &&
      guidanceScrollSource.includes("target.tabIndex = -1") &&
      guidanceFocusIndex > guidanceRevealIndex &&
      guidanceScrollIndex > guidanceFocusIndex &&
      beatPassportRouteSource.includes('scrollGuidanceTargetIntoView(() => beatPassportPanelRef.current, "start")') &&
      html.includes('data-testid="beat-passport" tabindex="-1"') &&
      runQuickActionSource.includes('action.group === "Project" || action.group === "Export"') &&
      runQuickActionSource.includes("flushSync(() => setGuidanceCenterOpen(true))"),
    "central guidance reveal should open its target before internal scroll, make non-control routes focusable after modal dismissal, and preserve synchronous Project/Export disclosure"
  );
  check(
    appSource.includes("const activeWorkspaceZoneRef = useRef<WorkspaceMainTabId>(activeWorkspaceZone);") &&
      appSource.includes("activeWorkspaceZoneRef.current = activeWorkspaceZone;") &&
      appSource.includes(
        "const activeComposeWorkspacePageRef = useRef<ComposeWorkspacePageId>(activeComposeWorkspacePage);"
      ) &&
      desktopShortcutSource.includes('activeWorkspaceZoneRef.current === "compose"') &&
      desktopShortcutSource.includes('activeComposeWorkspacePageRef.current === "notes"') &&
      desktopShortcutSource.includes("keyboardCaptureEnabled") &&
      desktopShortcutSource.includes("isKeyboardCaptureKey(key)") &&
      desktopShortcutSource.includes('activeWorkspaceZoneRef.current === "compose" && nextPattern') &&
      desktopShortcutSource.includes(
        'activeWorkspaceZoneRef.current === "compose" && (key === "backspace" || key === "delete")'
      ) &&
      deleteSelectedEventSource.includes("switch (activeComposeWorkspacePageRef.current)") &&
      deleteSelectedEventSource.includes('case "drums"') &&
      deleteSelectedEventSource.includes('case "notes"') &&
      deleteSelectedEventSource.includes('case "instruments"'),
    "desktop capture and Delete should read the current nested page while shared Pattern shortcuts remain Compose-only"
  );
  check(
    /case "delete-selected-event":\s*if \(activeWorkspaceZoneRef\.current !== "compose"\) \{\s*setProjectStatus\("Delete Selected Event is available in Compose"\);\s*return;\s*\}\s*deleteSelectedEvent\(\);/u.test(
      nativeMenuSource
    ),
    "native Delete Selected Event should return before mutation whenever the current functional tab is not Compose"
  );
  check(
    electronMainSource.includes('for (const keyCode of ["1", "2", "3", "Delete", "A"] as const)') &&
      electronMainSource.includes("keyResults[keyCode] =") &&
      electronMainSource.includes(
        "afterKey.composeDataFingerprint === preparedCompose.composeDataFingerprint"
      ) &&
      electronMainSource.includes("afterKey.selectedPattern === preparedCompose.selectedPattern") &&
      electronMainSource.includes("hiddenComposeGuards[zone] = keyResults") &&
      desktopLaunchSmokeSource.includes('["1", "2", "3", "Delete", "A"].every('),
    "Electron hidden Compose guards should compare project fingerprint and selected Pattern after every native key so mutations cannot cancel each other"
  );
  check(
    midiCaptureSource.includes('activeWorkspaceZoneRef.current !== "compose"') &&
      midiCaptureSource.includes('activeComposeWorkspacePageRef.current !== "notes"') &&
      midiCaptureSource.indexOf('activeComposeWorkspacePageRef.current !== "notes"') <
        midiCaptureSource.indexOf("midiNoteOnFromMessage(event.data)"),
    "MIDI note capture should reject events outside the open Compose Notes page before decoding or mutating a note"
  );
  check(
    workspaceScrollSource.includes(
      "const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;"
    ) &&
      workspaceScrollSource.includes("const activeElementZone = workspaceZoneForTarget(activeElement);") &&
      workspaceScrollSource.includes(
        "const dismissedModalFocus ="
      ) &&
      workspaceScrollSource.includes("activeElement === document.body") &&
      workspaceScrollSource.includes(
        "activeElement?.closest('[role=\"dialog\"], [data-testid=\"quick-actions\"]')"
      ) &&
      workspaceScrollSource.includes(
        "activeElementPage !== targetPage"
      ) &&
      workspaceScrollSource.includes("activateWorkspacePageForTarget(initialTarget)") &&
      workspacePageActivationSource.includes('target?.closest<HTMLElement>("[data-workspace-page]")') &&
      workspacePageActivationSource.includes("flushSync") &&
      workspaceScrollSource.includes(
        "dismissedModalFocus && !target.matches('a[href], button, input, select, textarea, [tabindex]')"
      ) &&
      workspaceScrollSource.includes("target.tabIndex = -1") &&
      workspaceScrollSource.includes("if (zone && document.activeElement !== target)") &&
      !workspaceScrollSource.includes("zone !== null &&\n      (dismissedModalFocus") &&
      zoneActivationIndex >= 0 &&
      focusTransferIndex > zoneActivationIndex &&
      targetFocusIndex > focusTransferIndex &&
      panelFocusFallbackIndex > targetFocusIndex &&
      targetScrollIndex > panelFocusFallbackIndex,
    "workspace reveal should activate functional zones and nested pages before focusing a visible target and scrolling"
  );
  check(
    finishChecklistRouteSource.includes("flushSync(() => setMasterReviewOpen(true))") &&
      finishChecklistRouteSource.includes(
        'scrollWorkspaceTargetIntoView(() => finishChecklistPanelRef.current, "start", "mix")'
      ) &&
      !finishChecklistRouteSource.includes("finishChecklistPanelRef.current?.scrollIntoView"),
    "Finish Checklist route readout should synchronously reveal its disclosure and use the central Mix-tab reveal path"
  );
  const reviewQueueOuterRevealIndex = reviewQueueRouteSource.indexOf("setMasterReviewOpen(true)");
  const reviewQueueInnerRevealIndex = reviewQueueRouteSource.indexOf("setMasterReviewQueueOpen(true)");
  const reviewQueueScrollIndex = reviewQueueRouteSource.indexOf(
    'revealWorkspaceTargetAfterLayout(() => reviewQueuePanelRef.current, "start", "mix", true)'
  );
  const deferredWorkspaceRevealSource = printNamedFunction(
    appSource,
    "App.tsx",
    "revealWorkspaceTargetAfterLayout"
  );
  check(
    reviewQueueRouteSource.includes("flushSync(() => {") &&
      reviewQueueRouteSource.includes("setGuidanceCenterOpen(false)") &&
      reviewQueueOuterRevealIndex >= 0 &&
      reviewQueueInnerRevealIndex > reviewQueueOuterRevealIndex &&
      reviewQueueScrollIndex > reviewQueueInnerRevealIndex &&
      deferredWorkspaceRevealSource.includes("let remainingLayoutFrames = 2") &&
      deferredWorkspaceRevealSource.includes("window.requestAnimationFrame(reveal)") &&
      deferredWorkspaceRevealSource.includes("scrollWorkspaceTargetIntoView(targetResolver, block, zoneHint)") &&
      deferredWorkspaceRevealSource.includes("focus({ preventScroll: true })") &&
      workspaceScrollSource.includes('target.scrollIntoView({ block, behavior: "auto" })') &&
      !appSource.includes("flushSync(() => focusReviewQueueRouteReadout())"),
    "Review Queue route readout should dismiss the Guide overlay, reveal both disclosures, then use a bounded post-layout auto scroll and accessible focus"
  );
  check(
    electronMainSource.includes(
      'onStep("closing both Mix Review Queue disclosures before native Quick Actions routing")'
    ) &&
      electronMainSource.includes('await sendLaunchSmokeFunctionalTabNativeKey(win, "K", commandModifier)') &&
      electronMainSource.includes('await win.webContents.insertText("review queue route")') &&
      electronMainSource.includes('await sendLaunchSmokeFunctionalTabNativeKey(win, "Enter")') &&
      desktopLaunchSmokeSource.includes(
        'finishChecklistQuickActionReveal?.activeElementTestId === "finish-checklist"'
      ) &&
      desktopLaunchSmokeSource.includes("finishChecklistQuickActionReveal?.activeElementVisible === true") &&
      desktopLaunchSmokeSource.includes(
        "finishChecklistQuickActionReveal?.activeElementWithinActivePanel === true"
      ) &&
      electronMainSource.includes("activeElementInViewport: Boolean(") &&
      desktopLaunchSmokeSource.includes("crossTabFocusTransfer?.activeElementInViewport === true") &&
      electronMainSource.includes("finishChecklistClearOfNavigator") &&
      electronMainSource.includes("finishChecklistInViewport") &&
      desktopLaunchSmokeSource.includes(
        "finishChecklistQuickActionReveal?.finishChecklistClearOfNavigator === true"
      ) &&
      desktopLaunchSmokeSource.includes("finishChecklistQuickActionReveal?.finishChecklistWidth > 0") &&
      desktopLaunchSmokeSource.includes("finishChecklistQuickActionReveal?.finishChecklistHeight > 0") &&
      desktopLaunchSmokeSource.includes(
        "finishChecklistQuickActionReveal?.finishChecklistInViewport === true"
      ) &&
      desktopLaunchSmokeSource.includes("finishChecklistQuickActionReveal?.visibleHeight > 0") &&
      electronMainSource.includes("reviewQueueClearOfNavigator") &&
      electronMainSource.includes("reviewQueueUnobscured") &&
      electronMainSource.includes("queue.contains(queueProbe)") &&
      electronMainSource.includes("disclosurePostureRestored") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.sourceZone === \"mix\"") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.destinationZone === \"mix\"") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.activeElementTestId === \"review-queue\"") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.activeElementVisible === true") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.activeElementWithinActivePanel === true") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.guidanceCenterOpen === false") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.reviewQueueWidth > 0") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.reviewQueueHeight > 0") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.reviewQueueInViewport === true") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.reviewQueueUnobscured === true") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.reviewQueueClearOfNavigator === true") &&
      desktopLaunchSmokeSource.includes("reviewQueueQuickActionReveal?.disclosurePostureRestored === true"),
    "Electron and its external runner should contract native Finish plus unobscured same-Mix Review Queue viewport clearance, preservation, and restoration evidence"
  );
  check(
    electronMainSource.includes(
      'onStep("preparing closed Guide and Compose for native Beat Passport Quick Actions routing")'
    ) &&
      electronMainSource.includes('await win.webContents.insertText("beat passport route")') &&
      electronMainSource.includes('guidanceBeatPassportSelectedActionId !== "beat-passport-route-readout-action"') &&
      electronMainSource.includes('document.activeElement === passport') &&
      electronMainSource.includes("passportClearOfNavigator") &&
      electronMainSource.includes("guidancePostureRestored") &&
      electronMainSource.includes("480000") &&
      desktopLaunchSmokeSource.includes('guidanceBeatPassportQuickActionReveal?.sourceZone === "compose"') &&
      desktopLaunchSmokeSource.includes('guidanceBeatPassportQuickActionReveal?.destinationZone === "compose"') &&
      desktopLaunchSmokeSource.includes('guidanceBeatPassportQuickActionReveal?.activeElementTestId === "beat-passport"') &&
      desktopLaunchSmokeSource.includes("guidanceBeatPassportQuickActionReveal?.activeElementVisible === true") &&
      desktopLaunchSmokeSource.includes("guidanceBeatPassportQuickActionReveal?.guidanceCenterInitiallyClosed === true") &&
      desktopLaunchSmokeSource.includes(
        'guidanceBeatPassportQuickActionReveal?.selectedActionId ===\n        "beat-passport-route-readout-action"'
      ) &&
      desktopLaunchSmokeSource.includes("guidanceBeatPassportQuickActionReveal?.passportWithinGuidance === true") &&
      desktopLaunchSmokeSource.includes("guidanceBeatPassportQuickActionReveal?.passportInViewport === true") &&
      desktopLaunchSmokeSource.includes("guidanceBeatPassportQuickActionReveal?.passportClearOfNavigator === true") &&
      desktopLaunchSmokeSource.includes("guidanceBeatPassportQuickActionReveal?.projectFingerprintPreserved === true") &&
      desktopLaunchSmokeSource.includes("guidanceBeatPassportQuickActionReveal?.guidancePostureRestored === true"),
    "Electron and its external runner should contract the native closed-Guide Beat Passport shortcut, exact keyboard target, focus, viewport clearance, preservation, posture restoration, and bounded timeout evidence"
  );
  check(
    electronMainSource.includes(
      'onStep("running native First Beat Path Setup Quick Action from Compose to Transport")'
    ) &&
      electronMainSource.includes('await win.webContents.insertText("first beat path setup")') &&
      electronMainSource.includes(
        'firstBeatPathTransportSelectedActionId !== "first-beat-path-step-setup"'
      ) &&
      electronMainSource.includes("document.activeElement === transport") &&
      electronMainSource.includes("firstBeatPathTransportQuickActionReveal") &&
      electronMainSource.includes("480000") &&
      desktopLaunchSmokeSource.includes(
        'firstBeatPathTransportQuickActionReveal?.sourceZone === "compose"'
      ) &&
      desktopLaunchSmokeSource.includes(
        'firstBeatPathTransportQuickActionReveal?.destinationZone === "compose"'
      ) &&
      desktopLaunchSmokeSource.includes(
        'firstBeatPathTransportQuickActionReveal?.activeElementTestId ===\n        "workflow-target-transport"'
      ) &&
      desktopLaunchSmokeSource.includes(
        'firstBeatPathTransportQuickActionReveal?.selectedActionId ===\n        "first-beat-path-step-setup"'
      ) &&
      desktopLaunchSmokeSource.includes(
        "firstBeatPathTransportQuickActionReveal?.transportInViewport === true"
      ) &&
      desktopLaunchSmokeSource.includes(
        "firstBeatPathTransportQuickActionReveal?.projectFingerprintPreserved === true"
      ) &&
      desktopLaunchSmokeSource.includes(
        "firstBeatPathTransportQuickActionReveal?.guidancePostureRestored === true"
      ),
    "Electron and its external runner should contract native First Beat Path Setup routing to focus visible Transport outside tabs while Compose, project data, modal closure, Guide restoration, and timeout stay bounded"
  );
  check(
    styles.includes(".workspace-zone-panel:not([hidden]) {") &&
      styles.includes("grid-template-rows: 52px minmax(0, 1fr);") &&
      styles.includes("scroll-margin-top: 0;"),
    "desktop workspace landing targets should start below the in-flow main and sub tab rows"
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
    appSource.includes('aria-label={t("arrange.moveLeftAria")}') &&
      appSource.includes('aria-label={t("arrange.moveRightAria")}') &&
      appSource.includes('<span>{t("arrange.moveLeft")}</span>') &&
      appSource.includes('<span>{t("arrange.moveRight")}</span>') &&
      localizationSource.includes('"arrange.moveLeftAria": "Move selected arrangement block left"') &&
      localizationSource.includes('"arrange.moveRightAria": "Move selected arrangement block right"') &&
      appSource.includes('data-testid="arrangement-move-left"') &&
      appSource.includes('data-testid="arrangement-move-right"'),
    "both arrangement move controls should expose complete directional labels and unique selected-block accessible names"
  );
  const chordToolAccessibleNames = [
    ["compose.panel.chords.auditionTitle", "Audition selected chord"],
    ["compose.panel.chords.stepLeftTitle", "Move selected chord one step left"],
    ["compose.panel.chords.stepRightTitle", "Move selected chord one step right"],
    ["compose.panel.chords.duplicateTitle", "Duplicate selected chord to the next empty step"],
    ["compose.panel.chords.duplicatePrevious", "Duplicate selected chord to the previous beat"],
    ["compose.panel.chords.duplicateNext", "Duplicate selected chord to the next beat"],
    ["compose.panel.chords.voiceDownTitle", "Move selected chord voicing down"],
    ["compose.panel.chords.voiceUpTitle", "Move selected chord voicing up"]
  ];
  const chordToolVisibleLabels = [
    "compose.panel.audition",
    "compose.panel.stepLeft",
    "compose.panel.stepRight",
    "compose.panel.duplicate",
    "compose.panel.previousBeatShort",
    "compose.panel.nextBeat",
    "compose.panel.chords.voiceDown",
    "compose.panel.chords.voiceUp"
  ];
  check(
    chordToolAccessibleNames.every(
      ([key, label]) =>
        composePanelsSource.includes(`aria-label={t("${key}")}`) &&
        localizationSource.includes(`"${key}": "${label}"`)
    ) &&
      chordToolVisibleLabels.every((key) => composePanelsSource.includes(`<span>{t("${key}")}</span>`)) &&
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
    ["compose.panel.notes.stepLeftTitle", "Move selected note one step left"],
    ["compose.panel.notes.stepRightTitle", "Move selected note one step right"],
    ["compose.panel.notes.pitchDownTitle", "Move selected note down in scale"],
    ["compose.panel.notes.pitchUpTitle", "Move selected note up in scale"],
    ["compose.panel.notes.octaveDownTitle", "Move selected note down an octave"],
    ["compose.panel.notes.octaveUpTitle", "Move selected note up an octave"],
    ["compose.panel.notes.duplicateTitle", "Duplicate selected note to the next empty step"],
    ["compose.panel.notes.duplicatePrevious", "Duplicate selected note to the previous beat"],
    ["compose.panel.notes.duplicateNext", "Duplicate selected note to the next beat"],
    ["compose.panel.notes.auditionTitle", "Audition selected 808 or Synth note"]
  ];
  const noteToolVisibleLabels = [
    "compose.panel.stepLeft",
    "compose.panel.stepRight",
    "compose.panel.notes.pitchDown",
    "compose.panel.notes.pitchUp",
    "compose.panel.notes.octaveDown",
    "compose.panel.notes.octaveUp",
    "compose.panel.duplicate",
    "compose.panel.previousBeatShort",
    "compose.panel.nextBeat",
    "compose.panel.audition"
  ];
  check(
    noteToolAccessibleNames.every(
      ([key, label]) =>
        composePanelsSource.includes(`aria-label={t("${key}")}`) &&
        localizationSource.includes(`"${key}": "${label}"`)
    ) &&
      noteToolVisibleLabels.every((key) => composePanelsSource.includes(`<span>{t("${key}")}</span>`)) &&
      composePanelsSource.includes('aria-label={t("compose.panel.notes.toolsAria")}') &&
      localizationSource.includes('"compose.panel.notes.toolsAria": "Selected note tools"'),
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
    ["compose.panel.drums.auditionHit", "Audition selected drum hit"],
    ["compose.panel.drums.copyHitShape", "Copy selected drum hit shape"],
    ["compose.panel.drums.pasteHitNext", "Paste copied drum hit to the next empty step"],
    ["compose.panel.drums.duplicatePrevious", "Duplicate selected drum hit to the previous beat"],
    ["compose.panel.drums.duplicateNext", "Duplicate selected drum hit to the next beat"]
  ];
  const drumToolVisibleLabels = [
    "compose.panel.audition",
    "compose.panel.drums.copyHit",
    "compose.panel.drums.pasteNext",
    "compose.panel.previousBeat",
    "compose.panel.nextBeat"
  ];
  check(
    drumToolAccessibleNames.every(
      ([key, label]) =>
        composePanelsSource.includes(`aria-label={t("${key}")}`) &&
        localizationSource.includes(`"${key}": "${label}"`)
    ) &&
      drumToolVisibleLabels.every((key) => composePanelsSource.includes(`<span>{t("${key}")}</span>`)) &&
      composePanelsSource.includes('aria-label={t("compose.panel.drums.hitToolsAria")}') &&
      localizationSource.includes('"compose.panel.drums.hitToolsAria": "Selected drum hit tools"'),
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
    appSource.includes('aria-label={t("mix.muteAria", { channel: channel.name })}') &&
      appSource.includes('aria-label={t("mix.soloAria", { channel: channel.name })}') &&
      appSource.includes("aria-pressed={channel.muted}") &&
      appSource.includes("aria-pressed={channel.solo}") &&
      appSource.includes('<span>{t("mix.mute")}</span>') &&
      appSource.includes('<span>{t("mix.solo")}</span>') &&
      appSource.includes('data-testid={`mixer-strip-${channel.id}`}') &&
      appSource.includes('data-testid={`mixer-toggles-${channel.id}`}') &&
      appSource.includes('t("mix.soloUnavailableTitle")') &&
      localizationSource.includes('"mix.muteAria": "Mute {channel}"') &&
      localizationSource.includes('"mix.soloAria": "Solo {channel}"') &&
      localizationSource.includes('"mix.soloUnavailableTitle": "Solo is unavailable on the Master channel"'),
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
    styles.includes("@media (min-width: 901px) and (min-height: 640px) {") &&
      styles.includes('"brand setup"\n      "commands commands";') &&
      styles.includes("grid-template-rows: 55px 48px;") &&
      styles.includes("grid-template-columns: minmax(180px, 0.35fr) minmax(470px, 1fr) minmax(142px, 0.25fr);") &&
      html.includes('data-testid="first-run-start-beat"') &&
      html.includes('data-testid="first-run-producer-pass"') &&
      html.includes('data-testid="first-run-open-project"'),
    "fixed desktop should use a two-row transport while preserving all three project-start actions"
  );
  check(
    styles.includes("@media (max-width: 900px) {") &&
      styles.includes(".header-action-menu-trigger span {\n    display: none;") &&
      styles.includes(".header-action-menu-trigger {\n    width: 38px;") &&
      styles.includes("width: min(340px, calc(100vw - 24px));"),
    "below the fixed-frame boundary, both header menus should retain compact triggers and a viewport-bounded popover"
  );
  check(
    styles.includes(".app-shell > .workflow-navigator {\n    position: relative;\n    top: auto;") &&
      styles.includes(".workspace-tabpanels {\n    grid-row: 4;") &&
      styles.includes(".workspace-zone-panel:not([hidden]) > .workspace-page-panel:not([hidden]),") &&
      styles.includes(".workspace-deliver-panel > .handoff-pack {") &&
      styles.includes("overscroll-behavior: contain;"),
    "fixed desktop should keep compact main tabs in flow while the selected page owns deep scrolling"
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
      styles.includes("grid-template-columns: minmax(150px, 1.3fr) minmax(56px, 64px) 96px minmax(84px, 100px) 72px minmax(125px, 1fr);") &&
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
  const transportSessionIndex = html.indexOf('data-testid="transport-session-tools"');
  const headerActionDockIndex = html.indexOf('data-testid="header-action-dock"');
  const headerUndoIndex = html.indexOf('data-testid="undo-button"');
  const headerUtilityIndex = html.indexOf('data-testid="header-utility-trigger"');
  const headerExportIndex = html.indexOf('data-testid="header-export-trigger"');
  check(
    transportBandIndex >= 0 &&
      transportStatusControlsIndex > transportBandIndex &&
      transportEssentialsIndex > transportStatusControlsIndex &&
      transportPlayIndex > transportEssentialsIndex &&
      transportSessionIndex > transportPlayIndex &&
      headerActionDockIndex > transportSessionIndex &&
      headerUndoIndex > headerActionDockIndex &&
      headerUtilityIndex > headerUndoIndex &&
      headerExportIndex > headerUtilityIndex,
    "Transport hierarchy should keep status, playback, Session Context, and the fixed Utility/Export action dock in order"
  );
  check(
    !html.includes('<details class="transport-session-tools" data-testid="transport-session-tools" open="">') &&
      !html.includes('data-testid="transport-export-tools"') &&
      html.includes('data-testid="header-export-trigger"'),
    "Guided first render should keep Session Context collapsed and expose exports through the fixed menu trigger"
  );
  check(
    [
      'data-testid="project-title-input"',
      'data-testid="project-bpm-input"',
      'data-testid="project-key-select"',
      'data-testid="project-time-signature"',
      'aria-keyshortcuts="Control+K Meta+K"',
      'aria-keyshortcuts="Space"',
      'aria-keyshortcuts="Control+Z Meta+Z"',
      'aria-keyshortcuts="Control+Y Meta+Y Control+Shift+Z Meta+Shift+Z"',
      'aria-keyshortcuts="Control+S Meta+S"'
    ].every((shortcut) => html.includes(shortcut)),
    "visible transport, header edit, and bottom-player controls should expose stable field hooks and desktop shortcuts"
  );
  check(
    appSource.includes("sanitizeProjectTitleInput(event.target.value)") &&
      appSource.includes("normalizeProjectTitle(value)") &&
      appSource.includes("maxLength={maxProjectTitleLength * 2}") &&
      /maxLength="160"/.test(html),
    "project title input should sanitize while typing, preserve the Unicode code-point budget, and finalize on blur"
  );
  check(
    html.includes('title="Open Quick Actions (Ctrl/Cmd+K)"') &&
      html.includes('title="Play Song loop · 8 bars timeline · 82 BPM · Space"') &&
      html.includes('title="Undo last edit (Ctrl/Cmd+Z)"') &&
      html.includes('title="Redo last undone edit (Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y)"') &&
      html.includes('title="Save project (Ctrl/Cmd+S)"'),
    "visible playback and edit controls should name their shortcuts in native tooltips"
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
      styles.includes(".command-strip .transport-essential-controls {") &&
      styles.includes("grid-column: 2 / 4;") &&
      styles.includes("grid-template-columns: repeat(4, minmax(0, 1fr));") &&
      styles.includes(".command-strip .icon-button {\n    width: 100%;\n    min-width: 0;") &&
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
  check(
    composePanelsSource.includes("handleChordCardKeyboardActivation(event, () => onSelect(index));") &&
      chordCardKeyboardActivationSource.includes("event.target !== event.currentTarget") &&
      chordCardKeyboardActivationSource.includes('event.key !== "Enter" && event.key !== " "') &&
      chordCardKeyboardActivationSource.includes("event.preventDefault();") &&
      chordCardKeyboardActivationSource.includes("event.stopPropagation();") &&
      chordCardKeyboardActivationSource.indexOf("event.stopPropagation();") <
        chordCardKeyboardActivationSource.indexOf("onActivate();"),
    "Chord card Enter/Space activation should only handle the card itself, preserving nested control keyboard clicks while stopping the global Space transport shortcut"
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
      `Starting point · ${supportedStyleCount} editable styles`,
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
      "Main production tabs",
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
      'data-testid="transport-session-tools"',
      'data-testid="transport-session-toggle"',
      'data-testid="transport-session-content"',
      'data-testid="header-action-dock"',
      'data-testid="header-utility-trigger"',
      'data-testid="header-export-trigger"',
      'data-testid="workspace-command-dock"',
      'data-testid="workspace-command-dock-play"',
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
      'data-testid="deliver-page-tabs"',
      'data-testid="deliver-page-tab-exports"',
      'data-testid="deliver-page-tab-checks"',
      'data-testid="handoff-pack-direct"',
      'data-testid="handoff-pack-checks"',
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
    "overview project scan": [
      'data-testid="workflow-target-overview"',
      'data-testid="overview-page-tabs"',
      'data-testid="overview-page-tab-snapshot"',
      'data-testid="overview-page-tab-song-map"',
      'data-testid="overview-page-tab-readiness"',
      'data-testid="overview-page-snapshot"',
      'data-testid="overview-page-song-map"',
      'data-testid="overview-page-readiness"',
      'data-testid="overview-player"',
      'data-testid="overview-full-song-play"',
      'data-testid="overview-song-progress"',
      'data-testid="overview-metrics"',
      'data-testid="overview-mini-timeline"',
      'data-testid="overview-arrangement-list"',
      'data-testid="overview-readiness-grid"'
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
      "Quick Actions"
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
      "Mix WAV",
      "Stem WAV",
      "Handoff Sheet",
      "Delivery Bundle"
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

function validateWorkflowNavigatorLocalization(localization, guidancePanels, workstationHelpers) {
  const items = [
    {
      id: "compose",
      label: "Compose",
      value: "Pattern A",
      detail: "compose-ready-detail",
      tone: "good"
    },
    {
      id: "arrange",
      label: "Arrange",
      value: "8 bars",
      detail: "arrange-review-detail",
      tone: "warn"
    },
    {
      id: "mix",
      label: "Mix",
      value: "Blocked",
      detail: "mix-blocker-detail",
      tone: "danger"
    },
    {
      id: "deliver",
      label: "Deliver",
      value: "Ready",
      detail: "deliver-ready-detail",
      tone: "good"
    }
  ];
  const result = workstationHelpers.createWorkflowNavigatorJumpResult(items[2], items);
  const renderNavigator = (locale) =>
    renderToStaticMarkup(
      React.createElement(
        localization.LocalizationProvider,
        { initialLocale: locale },
        React.createElement(guidancePanels.WorkflowNavigator, {
          activeZone: "mix",
          items,
          onJump() {},
          result
        })
      )
    );
  const englishHtml = renderNavigator("en");
  const koreanHtml = renderNavigator("ko");
  const koreanResult = workstationHelpers.createWorkflowNavigatorJumpResult(items[2], items, "ko");

  check(
    englishHtml.includes('aria-label="Workflow review"') &&
      englishHtml.includes('title="Workflow Spotlight recommends Jump Mix: mix-blocker-detail"') &&
      englishHtml.includes('title="Jump to Mix: mix-blocker-detail"') &&
      englishHtml.includes('title="Jump to Mix: Blocked"') &&
      englishHtml.includes(
        'aria-label="Next blocker / Mix: Blocked / mix-blocker-detail / 2 ready / 1 review / 1 blocker"'
      ) &&
      englishHtml.includes('data-testid="workflow-spotlight-decision-status">Workflow blocker</span>') &&
      englishHtml.includes('data-testid="workflow-spotlight-decision-label">Jump Mix</strong>') &&
      englishHtml.includes('data-testid="workflow-spotlight-status">Next blocker</span>') &&
      englishHtml.includes('data-testid="workflow-spotlight-zone">Mix: Blocked</strong>') &&
      englishHtml.includes('data-testid="workflow-spotlight-detail">Jump target: Mix / mix-blocker-detail</small>') &&
      englishHtml.includes('data-testid="workflow-spotlight-count">2 ready / 1 review / 1 blocker</small>') &&
      englishHtml.includes('data-testid="workflow-navigator-result-status">Jumped</span>') &&
      englishHtml.includes('data-testid="workflow-navigator-result-title">Mix zone ready</strong>') &&
      englishHtml.includes('data-testid="workflow-navigator-result-value">Workflow: 2/4 ready / 1 review / 1 blocker</strong>'),
    "English Workflow Review should preserve its visible, title, aria, and jump-result contract"
  );
  check(
    koreanHtml.includes('aria-label="작업 흐름 검토"') &&
      koreanHtml.includes('title="작업 흐름 권장: 믹스 탭으로 이동 · 채널 밸런스, 공간감, 마스터 마무리"') &&
      koreanHtml.includes('title="이동: 믹스 · 채널 밸런스, 공간감, 마스터 마무리"') &&
      koreanHtml.includes('title="이동: 믹스 · 해결 필요"') &&
      koreanHtml.includes(
        'aria-label="다음 해결 항목 / 믹스: 해결 필요 / 채널 밸런스, 공간감, 마스터 마무리 / 준비 2개 / 검토 1개 / 차단 1개"'
      ) &&
      koreanHtml.includes('data-testid="workflow-spotlight-decision-status">작업 흐름 해결 필요</span>') &&
      koreanHtml.includes('data-testid="workflow-spotlight-decision-label">믹스 탭으로 이동</strong>') &&
      koreanHtml.includes('data-testid="workflow-spotlight-decision-detail">해결 필요: 채널 밸런스, 공간감, 마스터 마무리</small>') &&
      koreanHtml.includes('data-testid="workflow-spotlight-status">다음 해결 항목</span>') &&
      koreanHtml.includes('data-testid="workflow-spotlight-zone">믹스: 해결 필요</strong>') &&
      koreanHtml.includes('data-testid="workflow-spotlight-detail">이동 대상: 믹스 / 채널 밸런스, 공간감, 마스터 마무리</small>') &&
      koreanHtml.includes('data-testid="workflow-spotlight-count">준비 2개 / 검토 1개 / 차단 1개</small>') &&
      koreanHtml.includes('data-testid="workflow-navigator-result-status">이동 완료</span>') &&
      koreanHtml.includes('data-testid="workflow-navigator-result-title">믹스 탭 준비됨</strong>') &&
      koreanHtml.includes('data-testid="workflow-navigator-result-value">작업 흐름: 전체 4개 중 2개 준비 / 검토 1개 / 차단 1개</strong>') &&
      koreanHtml.includes("믹스나 마스터를 바꾸기 전에 스템 듣기와 믹스 코치를 확인하세요.") &&
      koreanHtml.includes("헤드룸, 스템 밸런스, 저역, 마스터 방향이 준비되면 돌아오세요."),
    "Korean Workflow Review should localize visible guidance, accessibility titles, and the full jump result"
  );

  for (const englishLiteral of [
    "Workflow Spotlight recommends",
    "Workflow blocker",
    "Jump Mix",
    "Next blocker",
    "Jump target:",
    "Mix zone ready",
    "Use Stem Audition",
    "Return after headroom"
  ]) {
    checkExcludes(koreanHtml, englishLiteral, "Korean Workflow Review");
  }
  check(
    koreanResult.status === "이동 완료" &&
      koreanResult.title === "믹스 탭 준비됨" &&
      koreanResult.detail === "해결 필요 / 채널 밸런스, 공간감, 마스터 마무리" &&
      koreanResult.metricLabel === "작업 흐름" &&
      koreanResult.metricValue === "전체 4개 중 2개 준비 / 검토 1개 / 차단 1개" &&
      koreanResult.auditionCue === "믹스나 마스터를 바꾸기 전에 스템 듣기와 믹스 코치를 확인하세요." &&
      koreanResult.nextCheck === "헤드룸, 스템 밸런스, 저역, 마스터 방향이 준비되면 돌아오세요.",
    "Workflow Navigator jump-result helpers should expose typed Korean copy without changing their routing identity"
  );
}

function validateLocalization(localization, SettingsDialog, App) {
  const desktopShortcutSource = printNamedFunction(appSource, "App.tsx", "handleDesktopShortcut");
  const localizationProviderSource = printNamedFunction(
    localizationSource,
    "localization.tsx",
    "LocalizationProvider"
  );
  const nativeMenuSource = printNamedFunction(appSource, "App.tsx", "handleNativeMenuCommand");
  const settingsBackdropMouseDownIndex = settingsDialogSource.indexOf('onMouseDown={(event) => {');
  const settingsBackdropTargetIndex = settingsDialogSource.indexOf(
    "event.target === event.currentTarget",
    settingsBackdropMouseDownIndex
  );
  const settingsBackdropPreventDefaultIndex = settingsDialogSource.indexOf(
    "event.preventDefault();",
    settingsBackdropTargetIndex
  );
  const settingsBackdropCloseIndex = settingsDialogSource.indexOf("onClose();", settingsBackdropTargetIndex);
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
  const blockedStorage = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    }
  };

  check(
    localization.normalizeAppLocale("en") === "en" &&
      localization.normalizeAppLocale("ko") === "ko" &&
      localization.normalizeAppLocale("fr") === "en",
    "localization should accept only English and Korean and recover invalid values to English"
  );
  check(
    localization.readStoredAppLocale(storage) === "en" &&
      localization.writeStoredAppLocale(storage, "ko") &&
      localization.readStoredAppLocale(storage) === "ko" &&
      localization.persistAppLocale(storage, "en") === "device",
    "localization should persist the selected locale in its dedicated device-local key"
  );
  values.set(localization.appLocaleStorageKey, "damaged");
  const blockedPersistence = localization.persistAppLocale(blockedStorage, "ko");
  const blockedPersistenceMessages = localization.localePersistenceMessageKeys(blockedPersistence);
  check(
      localization.readStoredAppLocale(storage) === "en" &&
      localization.readStoredAppLocale(blockedStorage) === "en" &&
      localization.writeStoredAppLocale(blockedStorage, "ko") === false &&
      blockedPersistence === "session" &&
      blockedPersistenceMessages.title === "settings.sessionOnly" &&
      blockedPersistenceMessages.detail === "settings.sessionOnlyDetail" &&
      localization.translate("en", blockedPersistenceMessages.title) === "Available for this session" &&
      localization.translate("ko", blockedPersistenceMessages.title) === "이번 실행에서만 적용" &&
      localizationSource.includes("setPersistence(persistAppLocale(browserLocaleStorage(), locale));") &&
      localizationSource.includes('"settings.sessionOnly": "Available for this session"') &&
      localizationSource.includes('"settings.sessionOnly": "이번 실행에서만 적용"'),
    "localization should recover damaged or unavailable localStorage without changing the project"
  );
  check(
    localization.translate("en", "nav.openSubTab", { label: "Drums", detail: "Pattern grid" }) ===
      "Open Drums sub tab: Pattern grid" &&
      localization.translate("ko", "nav.openSubTab", { label: "드럼", detail: "패턴 그리드" }) ===
        "드럼 서브 탭 열기: 패턴 그리드" &&
      localization.translate("en", "launch.activeProject", { title: "A$&B$$C$'D" }) ===
        "A$&B$$C$'D active · reopen project choices",
    "localization should interpolate matching English and Korean copy without interpreting replacement tokens in user text"
  );

  const renderSettings = (locale) =>
    renderToStaticMarkup(
      React.createElement(
        localization.LocalizationProvider,
        { initialLocale: locale },
        React.createElement(SettingsDialog, { open: true, onClose() {} })
      )
    );
  const englishSettings = renderSettings("en");
  const koreanSettings = renderSettings("ko");
  const sessionSettings = renderToStaticMarkup(React.createElement(SettingsDialog, { open: true, onClose() {} }));
  const browserWindow = globalThis.window;
  const localStorageDescriptor = Object.getOwnPropertyDescriptor(browserWindow, "localStorage");
  let unavailableStorageSettings = "";
  try {
    Object.defineProperty(browserWindow, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      }
    });
    unavailableStorageSettings = renderSettings("ko");
  } finally {
    if (localStorageDescriptor) {
      Object.defineProperty(browserWindow, "localStorage", localStorageDescriptor);
    }
  }
  const koreanApp = renderToStaticMarkup(
    React.createElement(
      localization.LocalizationProvider,
      { initialLocale: "ko" },
      React.createElement(App)
    )
  );
  const koreanUtilityEntryIndex = koreanApp.indexOf('data-testid="header-utility-trigger"');
  const koreanWorkspaceTabpanelsIndex = koreanApp.indexOf('class="workspace-tabpanels"');
  const koreanGuideQuickStartIndex = koreanApp.indexOf('data-testid="guide-quick-start"');
  const koreanGuideQuickStartDetailsContentIndex = koreanApp.indexOf(
    'data-testid="guide-quick-start-details-content"',
    koreanGuideQuickStartIndex
  );
  const koreanGuideQuickStartVisibleMarkup =
    koreanGuideQuickStartIndex >= 0 && koreanGuideQuickStartDetailsContentIndex > koreanGuideQuickStartIndex
      ? koreanApp.slice(koreanGuideQuickStartIndex, koreanGuideQuickStartDetailsContentIndex)
      : "";
  const koreanGuideQuickStartAccessibleCopy = Array.from(
    koreanGuideQuickStartVisibleMarkup.matchAll(/(?:aria-label|title)="([^"]*)"/gu),
    (match) => match[1] ?? ""
  );
  const elementMarkupByTestId = (tagName, testId) => {
    const markerIndex = koreanApp.indexOf(`data-testid="${testId}"`);
    const start = markerIndex >= 0 ? koreanApp.lastIndexOf(`<${tagName}`, markerIndex) : -1;
    const end = start >= 0 ? koreanApp.indexOf(`</${tagName}>`, markerIndex) : -1;
    return start >= 0 && end >= markerIndex ? koreanApp.slice(start, end + tagName.length + 3) : "";
  };
  const koreanTransportPositionMarkup = elementMarkupByTestId("div", "transport-position-readout");
  const koreanLocalDraftMarkup = elementMarkupByTestId("span", "local-draft-status");
  const koreanProjectSafetyMarkup = elementMarkupByTestId("div", "project-safety-readout");

  check(
    englishSettings.includes('data-testid="settings-dialog"') &&
      englishSettings.includes("Choose how GrooveForge appears on this device.") &&
      englishSettings.includes("Show the app interface in Korean.") &&
      englishSettings.includes('data-testid="settings-language-en"') &&
      englishSettings.includes('data-testid="settings-language-ko"'),
    "English Settings should expose one labelled dialog and both supported language choices"
  );
  check(
    koreanSettings.includes("이 기기에서 GrooveForge가 표시되는 방식을 선택하세요.") &&
      (koreanSettings.includes("언어 설정은 프로젝트, 오디오, 실행 취소 기록을 바꾸지 않습니다.") ||
        koreanSettings.includes("기기 저장소를 사용할 수 없습니다.")),
    "Korean Settings should localize the choice and truthfully describe device or session-only persistence"
  );
  check(
    sessionSettings.includes('data-persistence="session"') &&
      sessionSettings.includes("Available for this session") &&
      sessionSettings.includes("Device storage is unavailable."),
    "Settings should render the session-only warning when locale storage is unavailable"
  );
  check(
    unavailableStorageSettings.includes('data-persistence="session"') &&
      unavailableStorageSettings.includes("이번 실행에서만 적용") &&
      unavailableStorageSettings.includes("기기 저장소를 사용할 수 없습니다."),
    "LocalizationProvider should pass unavailable device storage through to Korean Settings session-only copy"
  );
  check(
      koreanApp.includes('data-locale="ko"') &&
      koreanApp.includes(">메인 탭<") &&
      koreanApp.includes(">서브 탭<") &&
      koreanApp.includes(">기능</span>") &&
      koreanUtilityEntryIndex >= 0 &&
      koreanWorkspaceTabpanelsIndex > koreanUtilityEntryIndex,
    "Korean App render should localize main/sub tabs and keep the Utility menu trigger outside production tabpanels"
  );
  check(
    koreanTransportPositionMarkup.includes('title="곡 반복 대기 · 1마디 1박, 스텝 1, 전체 8마디."') &&
      koreanTransportPositionMarkup.includes('<span data-testid="transport-position-status">곡 대기</span>') &&
      koreanTransportPositionMarkup.includes('<strong data-testid="transport-position-label">1마디 1박</strong>') &&
      koreanTransportPositionMarkup.includes('<small data-testid="transport-position-detail">Intro / 패턴 A</small>') &&
      !/(?:Cued Song|Bar 1\.1|Step 1|Song loop is cued)/u.test(koreanTransportPositionMarkup) &&
      koreanLocalDraftMarkup === '<span data-testid="local-draft-status">로컬 초안</span>' &&
      !koreanLocalDraftMarkup.includes("Draft local") &&
      koreanProjectSafetyMarkup.includes(
        'title="편집 가능한 프로젝트 / 로컬 프로젝트만 / 지속 가능한 .grooveforge 프로젝트 파일로 유지하려면 저장하세요"'
      ) &&
      koreanProjectSafetyMarkup.includes('<span data-testid="project-safety-status">지금 편집 가능</span>') &&
      koreanProjectSafetyMarkup.includes('<strong data-testid="project-safety-label">저장하여 유지</strong>') &&
      koreanProjectSafetyMarkup.includes('<small data-testid="project-safety-detail">로컬 프로젝트만</small>') &&
      !/(?:Editable now|Save to keep|Local project only|Use Save for a durable)/u.test(koreanProjectSafetyMarkup),
    "Korean top transport and session meter should localize visible position, draft, project-safety, title, and accessibility presentation copy without changing project-domain values"
  );
  check(
    localization.translate("en", "guide.quickStart.headline") === "Guide Quick Start" &&
      localization.translate("ko", "guide.quickStart.headline") === "가이드 빠른 시작" &&
      localization.translate("ko", "guide.quickStart.runSource", { source: "경로" }) === "경로 실행" &&
      koreanGuideQuickStartVisibleMarkup.includes('aria-label="가이드 빠른 시작"') &&
      koreanGuideQuickStartVisibleMarkup.includes(">가이드 빠른 시작<") &&
      koreanGuideQuickStartVisibleMarkup.includes(">진행도와 경로<") &&
      koreanGuideQuickStartVisibleMarkup.includes("이동 대상") &&
      koreanGuideQuickStartVisibleMarkup.includes("병목") &&
      !/(?:>|&gt;)[^<]*(?:Guide Quick Start|Beat path|Progress &amp; routes|Completion diagnostics|Run Path|Run Session|Run Workflow)[^<]*</u.test(
        koreanGuideQuickStartVisibleMarkup
      ) &&
      koreanGuideQuickStartAccessibleCopy.every(
        (copy) => !/(?:Guide Quick Start|Guide quick start|Beat path|Run Path|Run Session|Run Workflow|Destination|Metric|Context|Audition|Next)/u.test(copy)
      ),
    "Korean Guide Quick Start should localize its always-visible copy plus aria-label and title context without leaking core English literals"
  );
  check(
    localizationSource.includes("document.documentElement.lang = locale;") &&
      localizationSource.includes("window.grooveforge?.setLocale?.(locale);") &&
      /const value = useMemo<LocalizationContextValue>\(\s*\(\) => \(\{\s*locale,\s*persistence,/u.test(
        localizationProviderSource
      ) &&
      localizationProviderSource.includes("[locale, persistence, setLocale]") &&
      localizationProviderSource.includes("setPersistence(persistAppLocale(browserLocaleStorage(), locale));") &&
      localizationSource.includes('grooveforge.ui.locale.v1') &&
      settingsDialogSource.includes('type="radio"') &&
      settingsDialogSource.includes('role="dialog"') &&
      settingsDialogSource.includes('data-persistence={persistence}') &&
      settingsDialogSource.includes('data-testid="settings-persistence"') &&
      settingsDialogSource.includes("localePersistenceMessageKeys(persistence)") &&
      settingsDialogSource.includes("t(persistenceMessages.title)") &&
      settingsDialogSource.includes("t(persistenceMessages.detail)") &&
      settingsDialogSource.includes("useModalFocusTrap(open, dialogRef, selectedLanguageRef, true)") &&
      settingsDialogSource.includes('event.key === "Escape"') &&
      settingsBackdropMouseDownIndex >= 0 &&
      settingsBackdropTargetIndex > settingsBackdropMouseDownIndex &&
      settingsBackdropPreventDefaultIndex > settingsBackdropTargetIndex &&
      settingsBackdropCloseIndex > settingsBackdropPreventDefaultIndex &&
      modalFocusTrapSource.includes("const returnFocus = document.activeElement") &&
      modalFocusTrapSource.includes("if (restoreFocus && returnFocus?.isConnected)") &&
      modalFocusTrapSource.includes("returnFocus.focus({ preventScroll: true });") &&
      appSource.includes('data-locale={locale}') &&
      appSource.includes("data-redo-depth={redoStack.length}") &&
      appSource.includes("data-undo-depth={undoStack.length}") &&
      appSource.includes('href="#workspace-main"') &&
      desktopShortcutSource.includes("if (styleChangePreview || settingsOpen)") &&
      desktopShortcutSource.indexOf("if (styleChangePreview || settingsOpen)") <
        desktopShortcutSource.indexOf("if (wantsCommandReference)") &&
      desktopShortcutSource.indexOf("if (styleChangePreview || settingsOpen)") <
        desktopShortcutSource.indexOf('if (event.code === "Space")') &&
      nativeMenuSource.includes("if (styleChangePreview || settingsOpen)") &&
      nativeMenuSource.indexOf("if (styleChangePreview || settingsOpen)") < nativeMenuSource.indexOf("switch (command)"),
    "localization source should synchronize document language, use a versioned preference, and keep settings and skip navigation accessible"
  );
  check(
    !localizationSource.includes("ProjectState") &&
      !settingsDialogSource.includes("setProject") &&
      !settingsDialogSource.includes("updateProject"),
    "language preferences should remain outside project data and edit history"
  );
  check(
    styles.includes("@media (max-width: 600px)") &&
      styles.includes(".settings-language-options") &&
      styles.includes("grid-template-columns: 1fr;") &&
      styles.includes("@media (max-width: 620px)") &&
      styles.includes('.app-shell[data-locale="ko"] .workspace-page-tabs-heading > span') &&
      styles.includes("@media (prefers-reduced-motion: reduce)") &&
      styles.includes("@media (forced-colors: active)"),
    "localization layout should stack Settings at 390px and preserve Korean tab labels, reduced motion, and forced-color selection cues"
  );
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
  const localization = await server.ssrLoadModule("/src/ui/localization.tsx");
  const { SettingsDialog } = await server.ssrLoadModule("/src/ui/SettingsDialog.tsx");
  const workstation = await server.ssrLoadModule("/src/domain/workstation.ts");
  validateProjectFileLoadErrorStatus(await server.ssrLoadModule("/src/ui/workstationUiModel.ts"));
  validateMasterCeilingDraftLifecycle(workstation);
  validateNativeDialogOptions(await server.ssrLoadModule("/electron/nativeDialogOptions.ts"));
  validateProjectCloseGuard(await server.ssrLoadModule("/src/ui/projectCloseGuard.ts"));
  validateProjectReplacementGuard(await server.ssrLoadModule("/src/ui/projectReplacementGuard.ts"));
  validateStyleChangeSafety({
    module: await server.ssrLoadModule("/src/ui/styleChangePreview.ts"),
    quickActions: await server.ssrLoadModule("/src/ui/workstationAppQuickActions.tsx"),
    workstation: await server.ssrLoadModule("/src/domain/workstation.ts")
  });
  validateProjectSaveCompletion(await server.ssrLoadModule("/src/ui/projectSaveCompletion.ts"));
  validateProjectScopedUiState(await server.ssrLoadModule("/src/ui/projectExportCompletion.ts"));
  validateSqliteProjectStorage();
  const html = renderToStaticMarkup(React.createElement(App));
  validateFirstRunRenderer(html, workstation.styleProfiles.length);
  validateLocalization(localization, SettingsDialog, App);
  validateWorkflowNavigatorLocalization(
    localization,
    await server.ssrLoadModule("/src/ui/workstationGuidancePanels.tsx"),
    await server.ssrLoadModule("/src/ui/workstationAppHelpers.tsx")
  );
  validateProjectAudioAnalysisPerformance(
    html,
    await server.ssrLoadModule("/src/ui/workstationAppHelpers.tsx")
  );
  check(
    html.includes('data-testid="keyboard-capture-step-mode-playhead"') &&
      html.includes("<span>Overdub</span>") &&
      html.includes("<small>live playhead</small>"),
    "Keyboard Capture should expose one direct Live Overdub mode that records against Pattern playback"
  );
  validateLiveOverdub(
    await server.ssrLoadModule("/src/ui/workstationPatternTools.ts"),
    workstation,
    await server.ssrLoadModule("/src/audio/midi.ts"),
    await server.ssrLoadModule("/src/audio/render.ts"),
    await server.ssrLoadModule("/src/ui/workstationAppQuickActions.tsx")
  );
  validateWorkspaceCommandDockSource(html);
  validateCompactStudioTransportSource();
  validateHeaderActionDockSource(html);
  validateDesktopFixedFrameSource();
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
    console.log(
      `- Starter: Untitled Beat, Guided 82 BPM A minor Lo-fi, 8 bars, Starter Sketch, ${workstation.styleProfiles.length} editable styles visible`
    );
    console.log("- Project ownership: Editable 8-bar foundation, editable now, local only, explicit Save-to-keep guidance");
    console.log("- Fixed desktop frame: 901px+ keeps the document still, compact main tabs in flow, and only the active page internally scrollable");
    console.log("- Global player: the bottom dock is visible from first render and reuses Play, Actions, Undo, Redo, and Save");
    console.log("- Header actions: fixed Utility and Export menus share exclusive hover/click state with complete keyboard and ARIA behavior");
    console.log("- Drum grid keyboard: one roving Tab stop, bounded arrows/Home/End, explicit pressed state, Enter/Space toggle, and visible guidance");
    console.log("- Note-grid keyboard: one Tab stop per Bass/Synth grid, exhaustive spatial arrows/Home/End, pressed state, guarded Enter/Space, and guidance");
    console.log("- Live Overdub: Keyboard Capture exposes a direct Pattern-playhead recording mode alongside Next and Replace");
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
    console.log("- Workstation path: compose, sound, arrange, mix, master, Export delivery bundle, Delivery Bundle ZIP, and Handoff Pack");
  }
} finally {
  await server.close();
}
