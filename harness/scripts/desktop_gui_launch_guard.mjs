export function macGuiLaunchBlockDetails(commandName, env = process.env, platform = process.platform) {
  const sandboxName = String(env.CODEX_SANDBOX ?? "").trim();
  const allowRestrictedLaunch = env.GROOVEFORGE_ALLOW_RESTRICTED_GUI_ELECTRON === "1";

  if (platform !== "darwin" || !sandboxName || allowRestrictedLaunch) {
    return null;
  }

  return [
    "Electron GUI launch blocked before macOS AppKit registration.",
    `Command: ${commandName}`,
    `Detected CODEX_SANDBOX=${sandboxName}, which indicates a restricted command sandbox.`,
    "This preflight prevents macOS Crash Reporter logs such as Electron SIGABRT / exit code 6 / Abort trap: 6 during AppKit application registration.",
    "Rerun from a normal macOS GUI terminal or with approved unsandboxed GUI/AppKit process access.",
    "Set GROOVEFORGE_ALLOW_RESTRICTED_GUI_ELECTRON=1 only when intentionally reproducing the restricted-launch crash path."
  ].join("\n");
}

export function isMacAppKitAbort({ code, signal, output = "" } = {}) {
  const text = String(output ?? "");
  const abortEvidence =
    signal === "SIGABRT" ||
    code === 6 ||
    /(?:EXC_CRASH\s*\(SIGABRT\)|Abort trap:\s*6|Namespace SIGNAL,\s*Code 6|abort\(\) called)/i.test(text);
  const appKitEvidence = /(?:_RegisterApplication|RegisterApplication|NSApplication|HIServices|AppKit)/i.test(text);
  const codexElectronCrashEvidence = /(?:Process:\s+Electron|Identifier:\s+com\.github\.Electron|com\.openai\.codex)/i.test(text);
  const crashReportEvidence = /(?:Thread \d+ Crashed|Triggered by Thread|Termination Reason|Exception Type)/i.test(text);

  return (
    signal === "SIGABRT" ||
    (appKitEvidence && (abortEvidence || crashReportEvidence || codexElectronCrashEvidence)) ||
    (abortEvidence && codexElectronCrashEvidence)
  );
}

export function isMacDyldFrameworkAbort({ output = "" } = {}) {
  const text = String(output ?? "");
  const dyldEvidence = /(?:Namespace DYLD|Library not loaded:|fatalDyldError|dyld\[\d+\])/i.test(text);
  const runtimeFrameworkEvidence =
    /(?:@rpath\/(?:Squirrel|ReactiveObjC|Mantle)\.framework\/(?:Squirrel|ReactiveObjC|Mantle)|(?:Squirrel|ReactiveObjC|Mantle)\.framework\/(?:Squirrel|ReactiveObjC|Mantle))/i.test(
      text
    );
  const electronBundleEvidence = /(?:Electron Framework|com\.github\.Electron\.framework|GrooveForge\.app|app\.grooveforge\.desktop|Process:\s+GrooveForge)/i.test(
    text
  );
  const missingOrSignatureEvidence =
    /(?:Library missing|no such file|code signature|no suitable image found|not valid for use in process|different Team IDs|mapped file)/i.test(
      text
    );

  return dyldEvidence && runtimeFrameworkEvidence && (electronBundleEvidence || missingOrSignatureEvidence);
}

function macDyldFrameworkAbortDetails(commandName, rawOutput) {
  return [
    "Diagnostic: Electron failed during macOS dyld framework loading before GrooveForge emitted launch evidence.",
    "Observed missing or signature-blocked Electron runtime framework dependency evidence.",
    "Crash signature: Namespace DYLD / Library missing for @rpath/Squirrel.framework/Squirrel, @rpath/ReactiveObjC.framework/ReactiveObjC, or @rpath/Mantle.framework/Mantle.",
    "Likely cause: stale or damaged packaged app bundle, unsigned nested framework, or launching an artifact built before the framework dependency guard.",
    `Action: rerun \`${commandName}\` after a fresh \`npm run build\`; package, PKG payload, and install smokes verify framework presence, strict code signatures, and @rpath dyld loadability before launch.`,
    "",
    "Raw Electron output:",
    rawOutput
  ].join("\n");
}

export function macGuiLaunchAbortDetails(commandName, { code, signal, output = "" } = {}) {
  const trimmedOutput = String(output ?? "").trim();
  const rawOutput = trimmedOutput.length > 0 ? trimmedOutput : "none";

  if (isMacDyldFrameworkAbort({ output })) {
    return macDyldFrameworkAbortDetails(commandName, rawOutput);
  }

  if (!isMacAppKitAbort({ code, signal, output })) {
    return rawOutput;
  }

  return [
    "Diagnostic: Electron aborted before GrooveForge emitted launch evidence.",
    "Observed macOS/AppKit registration abort evidence before the main/renderer/preload smoke path could report.",
    "Crash signature: Electron SIGABRT / exit code 6 / Abort trap: 6 during AppKit application registration.",
    "Likely cause: restricted, sandboxed, or non-GUI launch context blocking NSApplication registration.",
    `Action: rerun \`${commandName}\` from a normal macOS GUI session or with approved unsandboxed GUI/AppKit process access.`,
    "",
    "Raw Electron output:",
    rawOutput
  ].join("\n");
}
