/**
 * 역할: 제한된 macOS 샌드박스에서 Electron GUI를 무리하게 띄워 AppKit이 중단되는 상황을 사전에 판별한다.
 * 흐름: 플랫폼·샌드박스 환경·명시적 우회 플래그를 읽어 실행 가능 여부와 사용자용 진단 문구를 일관되게 만든다.
 * 안전 경계: 제한 상태는 기본적으로 실패 폐쇄하며, 이 모듈은 앱을 직접 실행하거나 시스템 설정을 바꾸지 않는다.
 */
export function macGuiLaunchBlockDetails(commandName, env = process.env, platform = process.platform) {
  const sandboxName = String(env.CODEX_SANDBOX ?? "").trim();
  const allowRestrictedLaunch = env.GROOVEFORGE_ALLOW_RESTRICTED_GUI_ELECTRON === "1";

  // macOS의 제한된 명령 샌드박스만 선제 차단한다. 우회 플래그는 충돌 재현을 위한 명시적 선택이며
  // 일반 실행에서 자동으로 켜지지 않는다.
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

  // 종료 코드 하나만으로 일반 앱 오류를 AppKit 충돌로 오인하지 않도록, 신호·프레임워크·충돌 보고서
  // 단서를 함께 묶는다. 단, SIGABRT 자체는 등록 단계 중단 가능성이 높아 즉시 진단 대상으로 삼는다.
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

  // dyld 문구와 Electron 핵심 프레임워크 이름이 동시에 있어야 패키지 의존성 실패로 분류한다.
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
