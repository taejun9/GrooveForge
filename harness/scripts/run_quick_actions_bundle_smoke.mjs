import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const distDir = path.join(root, "dist");
const assetsDir = path.join(distDir, "assets");
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

check(existsSync(path.join(distDir, "index.html")), "production dist/index.html should exist; run npm run build first");
check(existsSync(assetsDir), "production dist/assets should exist; run npm run build first");

if (failures.length === 0) {
  const html = readFileSync(path.join(distDir, "index.html"), "utf8");
  const assets = readdirSync(assetsDir);
  const graphFiles = assets.filter((name) => /^workstationAppQuickActionGraph-[^.]+\.js$/.test(name));
  const helperFiles = assets.filter((name) => /^workstation-app-quick-actions-[^.]+\.js$/.test(name));
  const entryMatch = html.match(/<script type="module" crossorigin src="\.\/assets\/([^"]+\.js)"><\/script>/);
  const entryFile = entryMatch?.[1] ?? "";
  const entrySource = entryFile ? readFileSync(path.join(assetsDir, entryFile), "utf8") : "";
  const graphFile = graphFiles[0] ?? "";
  const helperFile = helperFiles[0] ?? "";
  const graphBytes = graphFile ? statSync(path.join(assetsDir, graphFile)).size : 0;
  const helperBytes = helperFile ? statSync(path.join(assetsDir, helperFile)).size : 0;

  check(graphFiles.length === 1, `production build should contain one lazy Quick Actions graph chunk, got ${graphFiles.length}`);
  check(helperFiles.length === 1, `production build should contain one static Quick Actions helper chunk, got ${helperFiles.length}`);
  check(entryFile.length > 0, "production HTML should identify the entry module");
  check(graphFile.length > 0 && entrySource.includes(graphFile), "entry module should retain a dynamic route to the Quick Actions graph chunk");
  check(
    graphFile.length > 0 && !html.includes(`rel="modulepreload" crossorigin href="./assets/${graphFile}"`),
    "initial production HTML must not module-preload the Quick Actions graph chunk"
  );
  check(graphBytes > 100_000, `lazy Quick Actions graph should contain the complete command catalog, got ${graphBytes} bytes`);
  check(graphBytes < 500_000, `lazy Quick Actions graph should remain below 500 KB, got ${graphBytes} bytes`);
  check(helperBytes > 100_000, `static Quick Actions helpers should remain present, got ${helperBytes} bytes`);
  check(helperBytes < 500_000, `static Quick Actions helpers should remain below 500 KB, got ${helperBytes} bytes`);

  if (failures.length === 0) {
    console.log("GrooveForge Quick Actions bundle smoke passed.");
    console.log(`- Initial preload: graph no / static helpers ${helperBytes} bytes`);
    console.log(`- On-demand graph: ${graphFile} / ${graphBytes} bytes`);
  }
}

if (failures.length > 0) {
  console.error("GrooveForge Quick Actions bundle smoke failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
