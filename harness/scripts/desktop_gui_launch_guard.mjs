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
    "This preflight prevents macOS Crash Reporter logs such as Electron SIGABRT / Abort trap: 6 during AppKit application registration.",
    "Rerun from a normal macOS GUI terminal or with approved unsandboxed GUI/AppKit process access.",
    "Set GROOVEFORGE_ALLOW_RESTRICTED_GUI_ELECTRON=1 only when intentionally reproducing the restricted-launch crash path."
  ].join("\n");
}

export function isMacAppKitAbort({ signal, output = "" }) {
  return (
    signal === "SIGABRT" ||
    /(?:_RegisterApplication|RegisterApplication|NSApplication|HIServices|AppKit|EXC_CRASH|Abort trap:\s*6|com\.openai\.codex)/i.test(output)
  );
}

export function macGuiLaunchAbortDetails(commandName, { signal, output = "" } = {}) {
  const trimmedOutput = String(output ?? "").trim();
  const rawOutput = trimmedOutput.length > 0 ? trimmedOutput : "none";

  if (!isMacAppKitAbort({ signal, output })) {
    return rawOutput;
  }

  return [
    "Diagnostic: Electron aborted before GrooveForge emitted launch evidence.",
    "Observed macOS/AppKit registration abort evidence before the main/renderer/preload smoke path could report.",
    "Crash signature: Electron SIGABRT / Abort trap: 6 during AppKit application registration.",
    "Likely cause: restricted, sandboxed, or non-GUI launch context blocking NSApplication registration.",
    `Action: rerun \`${commandName}\` from a normal macOS GUI session or with approved unsandboxed GUI/AppKit process access.`,
    "",
    "Raw Electron output:",
    rawOutput
  ].join("\n");
}
