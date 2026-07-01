#!/usr/bin/env node

import { spawn } from "node:child_process";
import { constants, existsSync, readFileSync, readdirSync } from "node:fs";
import { access, cp, mkdir, readFile, rm, rename, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const iconFileName = `${appName}.icns`;
const iconSource = path.join(root, "assets", "brand", "grooveforge-icon.svg");
const resultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const timeoutMs = 120000;
const outputRoot = path.join(root, "build", "desktop", `${appName}-${process.platform}-${process.arch}`);
const packagedApp = path.join(outputRoot, `${appName}.app`);
const failures = [];
const crcTable = new Uint32Array(256);

for (let i = 0; i < crcTable.length; i += 1) {
  let value = i;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[i] = value >>> 0;
}

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop package smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${relativePath} is missing`);
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function smoothstep(edge0, edge1, value) {
  const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return amount * amount * (3 - 2 * amount);
}

function rgba(hex, alpha = 255) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    alpha
  ];
}

function mixColor(a, b, amount) {
  return [
    Math.round(lerp(a[0], b[0], amount)),
    Math.round(lerp(a[1], b[1], amount)),
    Math.round(lerp(a[2], b[2], amount)),
    Math.round(lerp(a[3], b[3], amount))
  ];
}

function blendPixel(buffer, index, color, alpha) {
  const sourceAlpha = clamp((color[3] / 255) * alpha, 0, 1);
  const targetAlpha = buffer[index + 3] / 255;
  const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);

  if (outAlpha <= 0) {
    return;
  }

  buffer[index] = Math.round((color[0] * sourceAlpha + buffer[index] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  buffer[index + 1] = Math.round((color[1] * sourceAlpha + buffer[index + 1] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  buffer[index + 2] = Math.round((color[2] * sourceAlpha + buffer[index + 2] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  buffer[index + 3] = Math.round(outAlpha * 255);
}

function roundedRectCoverage(x, y, left, top, width, height, radius) {
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  const qx = Math.abs(x - centerX) - (width / 2 - radius);
  const qy = Math.abs(y - centerY) - (height / 2 - radius);
  const outsideDistance = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const insideDistance = Math.min(Math.max(qx, qy), 0);
  const signedDistance = outsideDistance + insideDistance - radius;
  return 1 - smoothstep(-1.5, 1.5, signedDistance);
}

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.byteLength, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  const raw = Buffer.alloc((width * 4 + 1) * height);

  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  for (let y = 0; y < height; y += 1) {
    const rawOffset = y * (width * 4 + 1);
    raw[rawOffset] = 0;
    rgbaBuffer.copy(raw, rawOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([signature, pngChunk("IHDR", ihdr), pngChunk("IDAT", deflateSync(raw, { level: 9 })), pngChunk("IEND", Buffer.alloc(0))]);
}

function drawRoundedRect(buffer, size, bounds, color, opacity = 1) {
  const [left, top, width, height, radius] = bounds;
  const scale = 1024 / size;
  const minX = Math.max(0, Math.floor(left / scale) - 2);
  const maxX = Math.min(size - 1, Math.ceil((left + width) / scale) + 2);
  const minY = Math.max(0, Math.floor(top / scale) - 2);
  const maxY = Math.min(size - 1, Math.ceil((top + height) / scale) + 2);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const ux = (x + 0.5) * scale;
      const uy = (y + 0.5) * scale;
      const coverage = roundedRectCoverage(ux, uy, left, top, width, height, radius);
      if (coverage > 0) {
        blendPixel(buffer, (y * size + x) * 4, color, coverage * opacity);
      }
    }
  }
}

function drawGrooveRing(buffer, size) {
  const tealA = rgba("#47f0c1");
  const tealB = rgba("#16a985");
  const scale = 1024 / size;
  const centerX = 392;
  const centerY = 520;
  const radius = 205;
  const stroke = 74;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const ux = (x + 0.5) * scale;
      const uy = (y + 0.5) * scale;
      const dx = ux - centerX;
      const dy = uy - centerY;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const gap = Math.abs(angle) < 0.42;
      const edge = Math.abs(distance - radius);
      const coverage = gap ? 0 : 1 - smoothstep(stroke / 2 - 2, stroke / 2 + 2, edge);

      if (coverage > 0) {
        const tone = clamp((uy - 250) / 520, 0, 1);
        blendPixel(buffer, (y * size + x) * 4, mixColor(tealA, tealB, tone), coverage);
      }
    }
  }

  drawRoundedRect(buffer, size, [430, 482, 190, 60, 30], rgba("#47f0c1"), 0.96);
}

function drawForgeSpark(buffer, size) {
  const scale = 1024 / size;
  const centerX = 744;
  const centerY = 344;
  const points = [
    [744, 250],
    [779, 324],
    [859, 334],
    [800, 388],
    [815, 466],
    [744, 427],
    [674, 466],
    [688, 388],
    [630, 334],
    [710, 324]
  ];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const ux = (x + 0.5) * scale;
      const uy = (y + 0.5) * scale;
      let inside = false;

      for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        const intersects = yi > uy !== yj > uy && ux < ((xj - xi) * (uy - yi)) / (yj - yi) + xi;
        if (intersects) {
          inside = !inside;
        }
      }

      if (inside) {
        const distance = Math.hypot(ux - centerX, uy - centerY);
        const glow = clamp(1 - distance / 210, 0.45, 1);
        blendPixel(buffer, (y * size + x) * 4, rgba("#fff3c4"), glow * 0.92);
      }
    }
  }
}

function createBrandIconPng(size) {
  const buffer = Buffer.alloc(size * size * 4);
  const scale = 1024 / size;
  const bgA = rgba("#10141c");
  const bgB = rgba("#15252a");
  const bgC = rgba("#241a18");

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const ux = (x + 0.5) * scale;
      const uy = (y + 0.5) * scale;
      const alpha = roundedRectCoverage(ux, uy, 76, 76, 872, 872, 196);
      if (alpha <= 0) {
        continue;
      }

      const vertical = clamp((uy - 76) / 872, 0, 1);
      const diagonal = clamp((ux + uy - 200) / 1600, 0, 1);
      const color = mixColor(mixColor(bgA, bgB, vertical), bgC, diagonal * 0.38);
      const index = (y * size + x) * 4;
      buffer[index] = color[0];
      buffer[index + 1] = color[1];
      buffer[index + 2] = color[2];
      buffer[index + 3] = Math.round(alpha * 255);
    }
  }

  drawGrooveRing(buffer, size);
  drawRoundedRect(buffer, size, [615, 286, 89, 473, 18], rgba("#f5a623"));
  drawRoundedRect(buffer, size, [615, 286, 276, 78, 20], rgba("#ffd166"));
  drawRoundedRect(buffer, size, [615, 490, 245, 78, 20], rgba("#f5b942"));
  drawForgeSpark(buffer, size);

  for (const [x, y, height] of [
    [213, 742, 92],
    [287, 696, 138],
    [361, 762, 72],
    [435, 716, 118],
    [509, 752, 82]
  ]) {
    drawRoundedRect(buffer, size, [x, y, 46, height, 14], rgba("#d8fff4"), 0.9);
  }

  return createPng(size, size, buffer);
}

function createIcns(pngEntries) {
  const chunks = pngEntries.map(([type, png]) => {
    const header = Buffer.alloc(8);
    header.write(type, 0, "ascii");
    header.writeUInt32BE(png.byteLength + 8, 4);
    return Buffer.concat([header, png]);
  });
  const length = 8 + chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const header = Buffer.alloc(8);
  header.write("icns", 0, "ascii");
  header.writeUInt32BE(length, 4);
  return Buffer.concat([header, ...chunks]);
}

async function installBrandIcon(resourcesDir) {
  check(existsSync(iconSource), "assets/brand/grooveforge-icon.svg should exist as the durable icon source");

  const pngEntries = [
    ["ic10", createBrandIconPng(1024)],
    ["ic09", createBrandIconPng(512)],
    ["ic08", createBrandIconPng(256)],
    ["ic07", createBrandIconPng(128)],
    ["icp6", createBrandIconPng(64)],
    ["icp5", createBrandIconPng(32)],
    ["icp4", createBrandIconPng(16)]
  ];
  const icon = createIcns(pngEntries);
  const iconPath = path.join(resourcesDir, iconFileName);
  await writeFile(iconPath, icon);
  return { iconBytes: icon.byteLength, iconPath };
}

function parseSmokeResult(output) {
  const line = output
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(resultPrefix));

  if (!line) {
    return null;
  }

  try {
    return JSON.parse(line.slice(resultPrefix.length));
  } catch (error) {
    fail(`Could not parse packaged launch smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

function findAncestorApp(candidate) {
  let current = path.resolve(candidate);
  while (current !== path.dirname(current)) {
    if (current.endsWith(".app") && existsSync(path.join(current, "Contents", "Info.plist"))) {
      return current;
    }
    current = path.dirname(current);
  }
  return null;
}

function resolveElectronAppTemplate() {
  const candidates = [];

  try {
    const electronBinary = require("electron");
    if (typeof electronBinary === "string") {
      candidates.push(electronBinary);
    }
  } catch {
    // Fall through to package-root resolution.
  }

  try {
    const electronPackage = require.resolve("electron/package.json");
    candidates.push(path.join(path.dirname(electronPackage), "dist", "Electron.app"));
  } catch {
    // Fall through to local path candidates.
  }

  candidates.push(path.join(root, "node_modules", "electron", "dist", "Electron.app"));
  candidates.push(path.join(root, "..", "node_modules", "electron", "dist", "Electron.app"));

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "Contents", "Info.plist"))) {
      return candidate;
    }

    const appPath = findAncestorApp(candidate);
    if (appPath) {
      return appPath;
    }
  }

  return null;
}

function checkBuiltArtifacts() {
  check(existsSync(path.join(root, "dist", "index.html")), "dist/index.html is missing; run npm run build before desktop package smoke");
  check(
    existsSync(path.join(root, "dist-electron", "main.js")),
    "dist-electron/main.js is missing; run npm run build before desktop package smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron", "preload.cjs")),
    "dist-electron/preload.cjs is missing; run npm run build before desktop package smoke"
  );

  const assetDir = path.join(root, "dist", "assets");
  if (!existsSync(assetDir)) {
    failures.push("dist/assets is missing; renderer assets were not built");
    return;
  }

  const assets = readdirSync(assetDir);
  check(assets.some((asset) => asset.endsWith(".js")), "dist/assets should contain renderer JavaScript chunks");
  check(assets.some((asset) => asset.endsWith(".css")), "dist/assets should contain renderer CSS");
}

function setPlistString(plist, key, value) {
  const pattern = new RegExp(`(<key>${key}</key>\\s*<string>)([^<]*)(</string>)`);
  if (!pattern.test(plist)) {
    failures.push(`Info.plist should include ${key}`);
    return plist;
  }
  return plist.replace(pattern, `$1${value}$3`);
}

function removePlistStringKey(plist, key) {
  return plist.replace(new RegExp(`\\s*<key>${key}</key>\\s*<string>[\\s\\S]*?</string>`, "g"), "");
}

function removePlistDictKey(plist, key) {
  return plist.replace(new RegExp(`\\s*<key>${key}</key>\\s*<dict>[\\s\\S]*?\\s*</dict>`, "g"), "");
}

async function writeGrooveForgePlist(infoPlistPath, version) {
  let plist = await readFile(infoPlistPath, "utf8");
  plist = setPlistString(plist, "CFBundleDisplayName", appName);
  plist = setPlistString(plist, "CFBundleExecutable", appName);
  plist = setPlistString(plist, "CFBundleIconFile", iconFileName);
  plist = setPlistString(plist, "CFBundleIdentifier", bundleId);
  plist = setPlistString(plist, "CFBundleName", appName);
  plist = setPlistString(plist, "CFBundleShortVersionString", version);
  plist = setPlistString(plist, "CFBundleVersion", version);
  plist = setPlistString(plist, "LSApplicationCategoryType", "public.app-category.music");

  for (const key of [
    "NSAudioCaptureUsageDescription",
    "NSBluetoothAlwaysUsageDescription",
    "NSBluetoothPeripheralUsageDescription",
    "NSCameraUsageDescription",
    "NSMicrophoneUsageDescription"
  ]) {
    plist = removePlistStringKey(plist, key);
  }
  plist = removePlistDictKey(plist, "NSAppTransportSecurity");

  await writeFile(infoPlistPath, plist, "utf8");
}

async function writeHelperPlistMetadata(contentsDir) {
  const helperMetadata = [
    ["Electron Helper.app", "GrooveForge Helper", "app.grooveforge.desktop.helper"],
    ["Electron Helper (Renderer).app", "GrooveForge Helper (Renderer)", "app.grooveforge.desktop.helper.renderer"],
    ["Electron Helper (GPU).app", "GrooveForge Helper (GPU)", "app.grooveforge.desktop.helper.gpu"],
    ["Electron Helper (Plugin).app", "GrooveForge Helper (Plugin)", "app.grooveforge.desktop.helper.plugin"]
  ];

  for (const [helperApp, helperName, helperId] of helperMetadata) {
    const plistPath = path.join(contentsDir, "Frameworks", helperApp, "Contents", "Info.plist");
    if (!existsSync(plistPath)) {
      failures.push(`${helperApp} Info.plist should exist`);
      continue;
    }

    let plist = await readFile(plistPath, "utf8");
    plist = setPlistString(plist, "CFBundleIdentifier", helperId);
    plist = setPlistString(plist, "CFBundleName", helperName);
    await writeFile(plistPath, plist, "utf8");
  }
}

async function writePackagedPackageJson(appRoot, packageJson) {
  const minimalPackageJson = {
    name: packageJson.name,
    productName: appName,
    version: packageJson.version,
    private: true,
    description: packageJson.description,
    main: packageJson.main,
    type: packageJson.type
  };

  await writeFile(path.join(appRoot, "package.json"), `${JSON.stringify(minimalPackageJson, null, 2)}\n`, "utf8");
}

async function packageMacApp() {
  const packageJson = readJson("package.json");
  if (!packageJson) {
    return null;
  }

  const electronApp = resolveElectronAppTemplate();
  if (!electronApp) {
    failures.push("Electron.app template is missing; run npm install first");
    return null;
  }

  await rm(outputRoot, { force: true, recursive: true });
  await mkdir(outputRoot, { recursive: true });
  await cp(electronApp, packagedApp, { recursive: true, verbatimSymlinks: true });

  const contentsDir = path.join(packagedApp, "Contents");
  const resourcesDir = path.join(contentsDir, "Resources");
  const macOsDir = path.join(contentsDir, "MacOS");
  const electronExecutable = path.join(macOsDir, "Electron");
  const grooveForgeExecutable = path.join(macOsDir, appName);
  const appRoot = path.join(resourcesDir, "app");

  if (existsSync(electronExecutable)) {
    await rename(electronExecutable, grooveForgeExecutable);
  }

  await writeGrooveForgePlist(path.join(contentsDir, "Info.plist"), packageJson.version);
  await writeHelperPlistMetadata(contentsDir);
  const icon = await installBrandIcon(resourcesDir);
  await rm(path.join(resourcesDir, "electron.icns"), { force: true });
  await rm(appRoot, { force: true, recursive: true });
  await mkdir(appRoot, { recursive: true });
  await cp(path.join(root, "dist"), path.join(appRoot, "dist"), { recursive: true });
  await cp(path.join(root, "dist-electron"), path.join(appRoot, "dist-electron"), { recursive: true });
  await writePackagedPackageJson(appRoot, packageJson);

  return {
    appRoot,
    executable: grooveForgeExecutable,
    icon,
    infoPlist: path.join(contentsDir, "Info.plist"),
    packagedApp
  };
}

async function checkPackagedApp(paths) {
  check(existsSync(paths.packagedApp), "packaged GrooveForge.app should exist");
  check(existsSync(paths.executable), "packaged app executable should be renamed to GrooveForge");
  await access(paths.executable, constants.X_OK).catch(() => failures.push("packaged GrooveForge executable should be executable"));
  check(existsSync(path.join(paths.appRoot, "dist", "index.html")), "packaged app should include dist/index.html");
  check(existsSync(path.join(paths.appRoot, "dist-electron", "main.js")), "packaged app should include dist-electron/main.js");
  check(existsSync(path.join(paths.appRoot, "dist-electron", "preload.cjs")), "packaged app should include dist-electron/preload.cjs");
  check(existsSync(paths.icon.iconPath), "packaged app should include GrooveForge.icns");
  check(paths.icon.iconBytes > 50000, `GrooveForge.icns should be substantial, got ${paths.icon.iconBytes} bytes`);
  check(!existsSync(path.join(paths.packagedApp, "Contents", "Resources", "electron.icns")), "packaged app should remove the Electron default icon file");

  const packagedPackageJson = JSON.parse(await readFile(path.join(paths.appRoot, "package.json"), "utf8"));
  check(packagedPackageJson.productName === appName, "packaged package.json should set productName GrooveForge");
  check(packagedPackageJson.main === "dist-electron/main.js", "packaged package.json should keep the Electron main entry");
  check(packagedPackageJson.type === "module", "packaged package.json should preserve ESM module type");
  check(!("scripts" in packagedPackageJson), "packaged package.json should not include development scripts");
  check(!("devDependencies" in packagedPackageJson), "packaged package.json should not include development dependencies");

  const plist = await readFile(paths.infoPlist, "utf8");
  check(plist.includes("<string>GrooveForge</string>"), "Info.plist should brand the app as GrooveForge");
  check(plist.includes(`<string>${iconFileName}</string>`), `Info.plist should use ${iconFileName}`);
  check(!plist.includes("electron.icns"), "Info.plist should not use the Electron default icon");
  check(plist.includes(`<string>${bundleId}</string>`), `Info.plist should use ${bundleId}`);
  check(plist.includes("<key>CFBundleExecutable</key>"), "Info.plist should include CFBundleExecutable");
  check(plist.includes("<string>public.app-category.music</string>"), "Info.plist should use the music app category");
  for (const forbidden of [
    "NSAudioCaptureUsageDescription",
    "NSBluetoothAlwaysUsageDescription",
    "NSBluetoothPeripheralUsageDescription",
    "NSCameraUsageDescription",
    "NSMicrophoneUsageDescription",
    "NSAllowsArbitraryLoads"
  ]) {
    check(!plist.includes(forbidden), `Info.plist should not include ${forbidden}`);
  }

  const icon = await readFile(paths.icon.iconPath);
  check(icon.slice(0, 4).toString("ascii") === "icns", "GrooveForge.icns should use the icns file signature");
  for (const chunkType of ["ic10", "ic09", "ic08", "ic07", "icp6", "icp5", "icp4"]) {
    check(icon.includes(Buffer.from(chunkType, "ascii")), `GrooveForge.icns should include ${chunkType}`);
  }

  for (const [helperApp, helperName, helperId] of [
    ["Electron Helper.app", "GrooveForge Helper", "app.grooveforge.desktop.helper"],
    ["Electron Helper (Renderer).app", "GrooveForge Helper (Renderer)", "app.grooveforge.desktop.helper.renderer"],
    ["Electron Helper (GPU).app", "GrooveForge Helper (GPU)", "app.grooveforge.desktop.helper.gpu"],
    ["Electron Helper (Plugin).app", "GrooveForge Helper (Plugin)", "app.grooveforge.desktop.helper.plugin"]
  ]) {
    const helperPlist = await readFile(path.join(paths.packagedApp, "Contents", "Frameworks", helperApp, "Contents", "Info.plist"), "utf8");
    check(helperPlist.includes(`<string>${helperName}</string>`), `${helperApp} should use GrooveForge helper name`);
    check(helperPlist.includes(`<string>${helperId}</string>`), `${helperApp} should use GrooveForge helper bundle id`);
  }
}

function checkLaunchResult(result) {
  check(result && typeof result === "object", "packaged app should return a structured launch smoke result");
  check(result?.ok === true, "packaged app launch smoke result should be ok");

  const evidence = result?.evidence;
  check(evidence?.title === appName, "packaged app document title should be GrooveForge");
  check(String(evidence?.location ?? "").startsWith("file:"), "packaged app renderer should load file assets");
  check(evidence?.appKind === "desktop", "packaged app preload bridge should expose appKind desktop");
  check(evidence?.hasSaveProject === true, "packaged app preload bridge should expose saveProject");
  check(evidence?.hasOpenProject === true, "packaged app preload bridge should expose openProject");
  check(evidence?.rootChildCount > 0, "packaged app should mount React under #root");
  check(evidence?.bodyTextLength > 20000, "packaged app should expose a substantial workstation surface");
  check(Array.isArray(evidence?.missingText) && evidence.missingText.length === 0, "packaged app should contain all expected beginner/pro text");
  check(evidence?.samplingTextPresent === false, "packaged app first-run surface should not expose sampling-first language");

  const visual = evidence?.visual;
  check(visual?.width >= 1180 && visual?.height >= 760, "packaged app screenshot should respect desktop minimums");
  check(visual?.pngBytes > 50000, "packaged app screenshot PNG should be substantial");
  check(visual?.sampledPixels >= 1000, "packaged app screenshot should sample enough pixels");
  check(visual?.uniqueSampledColors >= 24, "packaged app screenshot should have visible color diversity");
  check(visual?.nonBackgroundSamples / visual?.sampledPixels >= 0.04, "packaged app screenshot should contain non-background UI pixels");
  check(visual?.maxColorDelta >= 48, "packaged app screenshot should have visible contrast");
}

async function launchPackagedApp(paths) {
  const blockDetails = macGuiLaunchBlockDetails("npm run desktop:package-smoke");
  if (blockDetails) {
    fail("Refusing to start packaged Electron in a restricted macOS GUI context.", blockDetails);
  }

  const env = {
    ...process.env,
    GROOVEFORGE_DESKTOP_LAUNCH_SMOKE: "1",
    NO_COLOR: "1"
  };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.VITE_DEV_SERVER_URL;

  return await new Promise((resolve) => {
    const child = spawn(paths.executable, [], {
      cwd: paths.appRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill("SIGTERM");
      fail("Timed out waiting for packaged Electron app launch smoke to exit.", `${stdout}\n${stderr}`);
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      fail(`Could not start packaged Electron app: ${error.message}`);
    });

    child.on("exit", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);

      const combinedOutput = `${stdout}\n${stderr}`;
      const result = parseSmokeResult(combinedOutput);
      if (!result) {
        fail(`Packaged app exited without a launch smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`, combinedOutput);
      }
      if (code !== 0 || result.ok !== true) {
        fail(
          `Packaged app launch smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          JSON.stringify(result, null, 2)
        );
      }
      resolve(result);
    });
  });
}

if (process.platform !== "darwin") {
  console.log("GrooveForge desktop package smoke skipped.");
  console.log(`- Scope: macOS portable app bundle smoke is not available on ${process.platform}`);
  process.exit(0);
}

checkBuiltArtifacts();
if (failures.length > 0) {
  fail("Built artifact preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const paths = await packageMacApp();
if (!paths || failures.length > 0) {
  fail("Packaged app assembly failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await checkPackagedApp(paths);
if (failures.length > 0) {
  fail("Packaged app structure validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const result = await launchPackagedApp(paths);
checkLaunchResult(result);
if (failures.length > 0) {
  fail("Packaged app launch evidence validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge desktop package smoke passed.");
console.log("- Scope: macOS portable GrooveForge.app assembly, bundle contract, privacy posture, and packaged production launch");
console.log(`- App: ${path.relative(root, paths.packagedApp)}`);
console.log(`- Entry: ${path.relative(root, path.join(paths.appRoot, "dist-electron", "main.js"))} -> packaged dist/index.html`);
console.log(`- Icon: ${path.basename(paths.icon.iconPath)}, ${paths.icon.iconBytes} bytes, GrooveForge bundle metadata`);
console.log(
  `- Visual: ${result.evidence.visual.width}x${result.evidence.visual.height}, ${result.evidence.visual.pngBytes} PNG bytes, ${result.evidence.visual.uniqueSampledColors} sampled colors`
);
