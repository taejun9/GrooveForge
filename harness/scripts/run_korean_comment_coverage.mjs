#!/usr/bin/env node

/**
 * 파일 역할: 저장소가 직접 관리하는 코드 파일마다 충분한 한글 설명 주석이 있는지 자동 점검한다.
 * 주요 흐름: 허용된 코드 루트를 재귀 순회하고 선두 주석을 형식별로 추출한 뒤, 한글 글자 수와 설명 줄 수를 검증한다.
 * 유지보수 주의: 의존성·생성물·JSON 데이터는 의도적으로 제외하며, 주석의 양만 확인할 뿐 내용의 정확성은 별도 리뷰가 판단한다.
 */

import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");
const scannedDirectories = ["src", "electron", "harness/scripts"];
const rootFiles = ["index.html", "vite.config.ts"];
const supportedExtensions = new Set([".ts", ".tsx", ".cts", ".mjs", ".py", ".css", ".html"]);
const minimumExpectedFiles = 179;
const minimumHangulCharacters = 24;
const minimumKoreanCommentLines = 2;

// 기준 브랜치부터 shebang 없이 node로 호출되던 진입점·공유 모듈만 예외로 두고, 나머지는 파일별 선두를 보존한다.
const preExistingShebanglessHarnessFiles = new Set([
  "harness/scripts/assemble_grooveforge_movements.mjs",
  "harness/scripts/desktop_bundle_dependency_guard.mjs",
  "harness/scripts/desktop_gui_launch_guard.mjs",
  "harness/scripts/distribution_local_env.mjs",
  "harness/scripts/register_ts_loader.mjs",
  "harness/scripts/run_quick_actions_bundle_smoke.mjs",
  "harness/scripts/ts_extension_loader.mjs",
]);

/** 생성물이나 숨김 폴더가 범위에 우연히 들어오는 일을 막으면서 코드 파일만 수집한다. */
async function collectCodeFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || ["node_modules", "build", "dist", "dist-electron"].includes(entry.name)) {
      continue;
    }

    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectCodeFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && supportedExtensions.has(extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * 주석 문법은 언어마다 다르므로 실행 문자열과 섞이지 않게 파일 시작 지점의 연속 주석만 모은다.
 * shebang과 doctype은 문법상 먼저 와야 하므로 건너뛰지만, import나 실행문이 한 줄이라도 나오면 이후 주석은 헤더로 인정하지 않는다.
 */
function extractLeadingCommentText(source, extension) {
  let leadingWindow = source.replace(/^\uFEFF/, "").slice(0, 2400);

  if (leadingWindow.startsWith("#!")) {
    leadingWindow = leadingWindow.replace(/^#![^\n]*(?:\n|$)/, "");
  }
  if (extension === ".html") {
    leadingWindow = leadingWindow.replace(/^\s*<!doctype\s+html\s*>/i, "");
  }

  if ([".ts", ".tsx", ".cts", ".mjs"].includes(extension)) {
    return leadingWindow.match(/^\s*((?:(?:\/\*[\s\S]*?\*\/|\/\/[^\n]*)(?:\s*))+)/)?.[1] ?? "";
  }
  if (extension === ".css") {
    return leadingWindow.match(/^\s*((?:(?:\/\*[\s\S]*?\*\/)(?:\s*))+)/)?.[1] ?? "";
  }
  if (extension === ".py") {
    return (
      leadingWindow.match(/^\s*((?:(?:#[^\n]*(?:\n|$))\s*)+)/)?.[1] ??
      leadingWindow.match(/^\s*((?:'''[\s\S]*?'''|\"\"\"[\s\S]*?\"\"\"))/)?.[1] ??
      ""
    );
  }
  if (extension === ".html") {
    return leadingWindow.match(/^\s*((?:(?:<!--[\s\S]*?-->)(?:\s*))+)/)?.[1] ?? "";
  }

  return "";
}

// 선두가 아닌 한글 문자열이나 본문 주석으로 검사를 우회할 수 없는지 작은 고정 fixture로 먼저 확인한다.
const parserFixtures = [
  { extension: ".ts", source: "/**\n * 파일 역할을 설명한다.\n * 주요 흐름과 경계를 설명한다.\n */\nimport x from 'x';", expected: true },
  { extension: ".ts", source: "import x from 'x';\n// 뒤늦은 한글 주석은 헤더가 아니다.", expected: false },
  { extension: ".mjs", source: "#!/usr/bin/env node\n// 역할을 설명한다.\n// 실패 경계를 설명한다.\nconst x = 1;", expected: true },
  { extension: ".py", source: "#!/usr/bin/env python3\n\"\"\"역할을 설명한다.\n주요 흐름과 실패 경계를 설명한다.\"\"\"\nprint('ok')", expected: true },
  { extension: ".html", source: "<!doctype html>\n<!-- 역할을 설명한다. -->\n<!-- 주요 흐름과 경계를 설명한다. -->\n<html></html>", expected: true },
  { extension: ".css", source: "// 역할을 설명한다.\n// 주요 흐름을 설명한다.\n:root {}", expected: false },
];

for (const fixture of parserFixtures) {
  const detected = extractLeadingCommentText(fixture.source, fixture.extension).length > 0;
  if (detected !== fixture.expected) {
    throw new Error(`한글 주석 헤더 파서 자체 검사가 실패했습니다: ${fixture.extension}`);
  }
}

const discoveredFiles = [];
for (const directory of scannedDirectories) {
  discoveredFiles.push(...(await collectCodeFiles(join(repositoryRoot, directory))));
}
for (const rootFile of rootFiles) {
  discoveredFiles.push(join(repositoryRoot, rootFile));
}
discoveredFiles.sort();

const failures = [];
const sourceByPath = new Map();
let shebangFileCount = 0;
for (const filePath of discoveredFiles) {
  const source = await readFile(filePath, "utf8");
  const commentText = extractLeadingCommentText(source, extname(filePath));
  const hangulCount = (commentText.match(/[가-힣]/g) ?? []).length;
  const koreanLineCount = commentText.split(/\r?\n/).filter((line) => /[가-힣]/.test(line)).length;
  const displayPath = relative(repositoryRoot, filePath);
  sourceByPath.set(displayPath, source);
  if (source.startsWith("#!")) {
    shebangFileCount += 1;
  }

  const isHarnessScript = displayPath.startsWith("harness/scripts/") && [".mjs", ".py"].includes(extname(filePath));
  if (isHarnessScript && !preExistingShebanglessHarnessFiles.has(displayPath) && !source.startsWith("#!")) {
    failures.push(`${displayPath}: 기준 브랜치부터 있던 shebang이 첫 줄에서 사라졌습니다.`);
  }

  if (hangulCount < minimumHangulCharacters || koreanLineCount < minimumKoreanCommentLines) {
    failures.push(
      `${displayPath}: 선두 주석의 한글 설명이 부족합니다 ` +
        `(한글 ${hangulCount}/${minimumHangulCharacters}자, 설명 ${koreanLineCount}/${minimumKoreanCommentLines}줄).`
    );
  }
}

// 주석 삽입이 문법상 선행해야 하는 기존 지시자를 밀거나 삭제하지 않았는지 실제 파일에서도 확인한다.
if (!sourceByPath.get("index.html")?.startsWith("<!doctype html>")) {
  failures.push("index.html은 표준 모드 doctype을 첫 선언으로 유지해야 합니다.");
}
if (!sourceByPath.get("src/audio/projectAudioAnalysisWorker.ts")?.startsWith('/// <reference lib="webworker" />')) {
  failures.push("projectAudioAnalysisWorker.ts는 webworker triple-slash 지시자를 첫 줄에 유지해야 합니다.");
}
const viteEnvironmentSource = sourceByPath.get("src/vite-env.d.ts") ?? "";
const viteReferenceIndex = viteEnvironmentSource.indexOf('/// <reference types="vite/client" />');
const viteDeclarationIndex = viteEnvironmentSource.indexOf("type NativeMenuCommand");
if (viteReferenceIndex < 0 || viteDeclarationIndex < 0 || viteReferenceIndex > viteDeclarationIndex) {
  failures.push("vite-env.d.ts는 vite/client triple-slash 지시자를 첫 타입 선언보다 앞에 유지해야 합니다.");
}

if (discoveredFiles.length < minimumExpectedFiles) {
  failures.push(`대상 코드 파일이 예상보다 적습니다: ${discoveredFiles.length}/${minimumExpectedFiles}.`);
}

if (failures.length > 0) {
  console.error("한글 코드 주석 커버리지 검사가 실패했습니다.");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `한글 코드 주석 커버리지 통과: ${discoveredFiles.length}개 파일, ` +
    `파일당 선두 한글 ${minimumHangulCharacters}자·${minimumKoreanCommentLines}줄 이상, ` +
    `헤더 파서 ${parserFixtures.length}/${parserFixtures.length}, ` +
    `shebang ${shebangFileCount}개 파일별·doctype/triple-slash 보존.`
);
