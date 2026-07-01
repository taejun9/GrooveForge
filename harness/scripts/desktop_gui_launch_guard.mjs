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

