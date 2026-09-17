#!/usr/bin/env node

/**
 * 역할: Composer Actions의 실제 React 렌더가 준비된 미터를 재사용하고 전곡 PCM을 재계산하지 않는지 검사한다.
 * 흐름: 메모리 안에서 PCM 진입 횟수만 관측하고 실제 분석·여섯 설명·독립 패널·App의 ready/pending 렌더를 비교한다.
 * 안전 경계: 앱 실행·파일 내보내기·소스 수정 없이 SSR에서 검사하며 기존 생략 인자의 정확 분석 경로도 보존한다.
 */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { createServer } from "vite";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "grooveforge-composer-analysis-smoke-"));
const counterKey = "__grooveforgeComposerAnalysisSmokePcmCalls";
const descriptors = new Map(["window", "navigator", "Worker", counterKey].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
let instrumented = false;
let server;

try {
  Object.defineProperty(globalThis, counterKey, { configurable: true, writable: true, value: 0 });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener() {},
      removeEventListener() {},
      clearTimeout,
      setTimeout,
      grooveforge: { appKind: "desktop" },
      localStorage: { getItem: () => null, setItem() {}, removeItem() {} }
    }
  });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  Object.defineProperty(globalThis, "Worker", { configurable: true, writable: true, value: undefined });

  server = await createServer({
    root: repositoryRoot,
    appType: "custom",
    cacheDir: path.join(temporaryRoot, "vite-cache"),
    logLevel: "silent",
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, watch: null },
    plugins: [{
      name: "observe-composer-pcm-entry",
      enforce: "pre",
      transform(source, id) {
        if (!id.split("?")[0].endsWith("/src/audio/render.ts")) return null;
        const ast = ts.createSourceFile(id, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
        const declarations = ast.statements.filter((node) => ts.isFunctionDeclaration(node) && ["renderProject", "analyzeProjectExportsCombined"].includes(node.name?.text));
        assert.equal(declarations.length, 2, "개별·동시 PCM 진입 관측 위치가 존재해야 합니다.");
        let observedSource = source;
        for (const declaration of declarations.reverse()) {
          assert.ok(declaration.body);
          const position = declaration.body.getStart(ast) + 1;
          observedSource = `${observedSource.slice(0, position)}\nglobalThis.${counterKey} += 1;\n${observedSource.slice(position)}`;
        }
        instrumented = true;
        return {
          code: observedSource,
          map: null
        };
      }
    }]
  });

  const { starterProject } = await server.ssrLoadModule("/src/domain/workstation.ts");
  const audio = await server.ssrLoadModule("/src/audio/projectAudioAnalysis.ts");
  const helpers = await server.ssrLoadModule("/src/ui/workstationAppHelpers.tsx");
  const derivations = await server.ssrLoadModule("/src/ui/workstationAppDerivations.tsx");
  const { App } = await server.ssrLoadModule("/src/ui/App.tsx");
  const exact = audio.analyzeProjectAudio(starterProject);
  assert.ok(instrumented && globalThis[counterKey] > 0, `실제 오디오 렌더를 관측해야 합니다: instrumented=${instrumented}, count=${globalThis[counterKey]}`);
  const checks = derivations.createBeatReadinessChecks(starterProject, exact.mix);
  const summary = helpers.createComposerActionsSummary(starterProject, checks, exact.mix, exact.stems);
  assert.deepEqual(new Set(summary.actions.map((action) => action.area)), new Set(["drums", "bass", "harmony", "melody", "arrange", "finish"]));

  globalThis[counterKey] = 0;
  const originalContexts = summary.actions.map((action) => helpers.composerActionButtonContext(action, starterProject));
  assert.equal(globalThis[counterKey], 1, "분석 인자를 생략한 finish 호출은 현재 프로젝트의 정확 PCM 분석을 유지해야 합니다.");
  globalThis[counterKey] = 0;
  const suppliedContexts = summary.actions.map((action) => helpers.composerActionButtonContext(action, starterProject, exact.mix));
  assert.deepEqual(suppliedContexts, originalContexts, "기존 여섯 작업의 설명과 실제 headroom 의미가 같아야 합니다.");
  assert.equal(globalThis[counterKey], 0, "정확 미터를 전달하면 버튼 설명에서 PCM을 재렌더하지 않아야 합니다.");

  const panel = renderToStaticMarkup(React.createElement(helpers.ComposerActions, {
    project: starterProject, analysis: exact.mix, summary, result: null, onRun() {}
  }));
  assert.ok(panel.includes('data-testid="composer-actions"') && panel.includes('data-testid="composer-action-finish-master"'));
  assert.equal(globalThis[counterKey], 0, "실제 ComposerActions React 렌더도 PCM을 재계산하지 않아야 합니다.");

  // 캐시한 실제 정확 결과로 App 전체를 렌더해 상위 prop 연결 누락도 비용 관측으로 검출한다.
  const readyApp = renderToStaticMarkup(React.createElement(App));
  assert.ok(readyApp.includes('data-audio-analysis-state="ready"') && readyApp.includes('data-testid="composer-actions"'));
  assert.equal(globalThis[counterKey], 0, "App의 ready 렌더는 ComposerActions에 정확 미터를 전달해야 합니다.");
  globalThis.Worker = class PendingWorker {};
  const pendingApp = renderToStaticMarkup(React.createElement(App));
  assert.ok(pendingApp.includes('data-audio-analysis-state="pending"') && !pendingApp.includes('data-testid="composer-actions"'));
  assert.equal(globalThis[counterKey], 0, "분석 미준비 App은 숨긴 ComposerActions의 동기 fallback을 실행하지 않아야 합니다.");
  console.log("Composer action analysis smoke passed: 6 unchanged contexts, legacy exact fallback, panel/App ready+pending renders, 0 UI PCM rerenders.");
} finally {
  await server?.close();
  for (const [key, descriptor] of descriptors) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
  await rm(temporaryRoot, { recursive: true, force: true });
}
