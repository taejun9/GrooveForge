#!/usr/bin/env node

/**
 * 설치된 앱의 dist 전체가 현재 검증할 빌드와 같은지 확인하고 실제 실행 경로를 반환한다.
 * 파일 이름·바이트 수·해시를 비교하므로 오래된 설치본이나 추가 산출물을 성공으로 오인하지 않는다.
 * 읽기 전용이며 설치·서명 변경은 하지 않고, 심볼릭 링크와 상대 앱 경로는 거부한다.
 */
import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

export async function installedBuildInventory(baseRoot) {
  const rows = [];
  async function visit(relativePath) {
    const filePath = path.join(baseRoot, relativePath);
    const info = await lstat(filePath);
    if (info.isSymbolicLink()) throw new Error("Installed QA build contains a symbolic link.");
    if (info.isDirectory()) {
      for (const name of (await readdir(filePath)).sort()) await visit(path.join(relativePath, name));
    } else if (info.isFile()) {
      const contents = await readFile(filePath);
      rows.push({ relativePath: relativePath.split(path.sep).join("/"), bytes: contents.length,
        sha256: createHash("sha256").update(contents).digest("hex") });
    } else throw new Error("Installed QA build contains a non-regular entry.");
  }
  for (const directory of ["dist", "dist-electron"]) await visit(directory);
  rows.sort((a, b) => a.relativePath.localeCompare(b.relativePath, "en"));
  for (const required of ["dist/index.html", "dist-electron/main.js", "dist-electron/preload.cjs"]) {
    if (!rows.some((row) => row.relativePath === required)) throw new Error(`Installed QA build is missing ${required}.`);
  }
  return rows;
}

export async function resolveInstalledQaApp(appPath, sourceRoot) {
  if (!path.isAbsolute(appPath) || !appPath.endsWith(".app")) throw new Error("Installed QA requires an absolute .app directory.");
  const bundle = await lstat(appPath);
  if (bundle.isSymbolicLink() || !bundle.isDirectory()) throw new Error("Installed QA app must be a regular directory.");
  const appRoot = path.join(appPath, "Contents", "Resources", "app");
  const executable = path.join(appPath, "Contents", "MacOS", "GrooveForge");
  // 마지막 파일만 검사하면 Contents/Resources/MacOS를 통한 경로 탈출이 남는다.
  for (const relative of ["Contents", "Contents/Resources", "Contents/MacOS"]) {
    const ancestor = await lstat(path.join(appPath, relative));
    if (ancestor.isSymbolicLink() || !ancestor.isDirectory()) throw new Error("Installed QA app contains a symbolic link or invalid ancestor.");
  }
  const metadataPath = path.join(appRoot, "package.json");
  const metadataInfo = await lstat(metadataPath);
  if (metadataInfo.isSymbolicLink() || !metadataInfo.isFile()) throw new Error("Installed QA metadata must be a regular file.");
  for (const entry of [appRoot, executable]) {
    const info = await lstat(entry);
    if (info.isSymbolicLink() || (entry === executable ? !info.isFile() || !(info.mode & 0o111) : !info.isDirectory())) {
      throw new Error("Installed QA executable or resources are invalid.");
    }
  }
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  if (metadata.name !== "grooveforge" || metadata.main !== "dist-electron/main.js") throw new Error("Installed QA package identity does not match GrooveForge.");
  const expected = await installedBuildInventory(sourceRoot);
  const actual = await installedBuildInventory(appRoot);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Installed QA app differs from the current production build; rebuild and reinstall.");
  return { appRoot, executable, evidence: { installed: true, buildFileCount: actual.length,
    contentSha256: createHash("sha256").update(JSON.stringify(actual)).digest("hex"),
    executableSha256: createHash("sha256").update(await readFile(executable)).digest("hex") } };
}
