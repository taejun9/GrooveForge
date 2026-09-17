#!/usr/bin/env node

/**
 * 설치 QA가 현재 빌드와 다른 번들을 거부하는지 임시 파일로 검증한다.
 * 정상 복사, 변조·누락·추가 파일, 잘못된 실행 권한·identity·symlink를 순서대로 검사한다.
 * 실제 설치본은 읽거나 수정하지 않으며 자신이 만든 임시 폴더만 정리한다.
 */
import assert from "node:assert/strict";
import { chmod, cp, mkdir, mkdtemp, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { resolveInstalledQaApp } from "./installed_app_qa.mjs";

const testRoot = await mkdtemp(path.join(tmpdir(), "grooveforge-installed-qa-"));
try {
  const source = path.join(testRoot, "source");
  const bundle = path.join(testRoot, "GrooveForge.app");
  const resource = path.join(bundle, "Contents/Resources/app");
  const executable = path.join(bundle, "Contents/MacOS/GrooveForge");
  await mkdir(path.join(source, "dist"), { recursive: true });
  await mkdir(path.join(source, "dist-electron"));
  for (const file of ["dist/index.html", "dist-electron/main.js", "dist-electron/preload.cjs"]) {
    await writeFile(path.join(source, file), `fixture ${file}`);
  }
  await mkdir(path.dirname(resource), { recursive: true });
  await cp(source, resource, { recursive: true });
  await mkdir(path.dirname(executable));
  await writeFile(executable, "fixture executable", { mode: 0o700 });
  const identity = { name: "grooveforge", main: "dist-electron/main.js" };
  await writeFile(path.join(resource, "package.json"), JSON.stringify(identity));
  assert.equal((await resolveInstalledQaApp(bundle, source)).evidence.buildFileCount, 3);
  await assert.rejects(resolveInstalledQaApp("GrooveForge.app", source), /absolute/);
  const index = path.join(resource, "dist/index.html");
  await writeFile(index, "tampered");
  await assert.rejects(resolveInstalledQaApp(bundle, source), /differs/);
  await cp(path.join(source, "dist/index.html"), index);
  await writeFile(path.join(resource, "dist/extra.js"), "unexpected");
  await assert.rejects(resolveInstalledQaApp(bundle, source), /differs/);
  await rm(path.join(resource, "dist/extra.js"));
  await rm(index);
  await assert.rejects(resolveInstalledQaApp(bundle, source), /missing/);
  await symlink(path.join(source, "dist/index.html"), index);
  await assert.rejects(resolveInstalledQaApp(bundle, source), /symbolic link/);
  await rm(index);
  await cp(path.join(source, "dist/index.html"), index);
  await chmod(executable, 0o600);
  await assert.rejects(resolveInstalledQaApp(bundle, source), /invalid/);
  await chmod(executable, 0o700);
  await writeFile(path.join(resource, "package.json"), JSON.stringify({ ...identity, main: "other.js" }));
  await assert.rejects(resolveInstalledQaApp(bundle, source), /identity/);
  await writeFile(path.join(resource, "package.json"), JSON.stringify(identity));
  assert.equal((await resolveInstalledQaApp(bundle, source)).evidence.installed, true);
  // 중간 디렉터리를 바꾸어도 leaf의 파일·해시는 같지만 설치본으로 인정하면 안 된다.
  const contents = path.join(bundle, "Contents");
  const outside = path.join(testRoot, "outside-contents");
  await rename(contents, outside);
  await symlink(outside, contents);
  await assert.rejects(resolveInstalledQaApp(bundle, source), /symbolic link/);
  await rm(contents);
  await rename(outside, contents);
  console.log("Installed-app QA smoke passed: exact build, tamper, inventory, symlink, executable, identity.");
} finally {
  await rm(testRoot, { recursive: true, force: true });
}
