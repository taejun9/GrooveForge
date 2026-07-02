import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const requiredFrameworkInstallNames = [
  "@rpath/Squirrel.framework/Squirrel",
  "@rpath/ReactiveObjC.framework/ReactiveObjC",
  "@rpath/Mantle.framework/Mantle"
];

function runCommand(command, args, { cwd, timeoutMs, allowFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, NO_COLOR: "1" },
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
      reject(new Error(`${command} timed out after ${timeoutMs}ms\n${stdout}\n${stderr}`));
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
      reject(error);
    });
    child.on("exit", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (code !== 0 && allowFailure !== true) {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "null"} signal ${signal ?? "null"}\n${stdout}\n${stderr}`));
        return;
      }
      resolve({ code, signal, stdout, stderr });
    });
  });
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function relativePath(root, filePath) {
  const relative = path.relative(root, filePath);
  return !relative.startsWith("..") && !path.isAbsolute(relative) ? relative : filePath;
}

function frameworkRootFor(binaryPath) {
  const parts = binaryPath.split(path.sep);
  const frameworkIndex = parts.findIndex((part) => part.endsWith(".framework"));
  if (frameworkIndex === -1) {
    return path.dirname(binaryPath);
  }
  return parts.slice(0, frameworkIndex + 1).join(path.sep);
}

function electronFrameworkLoaderDir(appPath) {
  return path.join(
    appPath,
    "Contents",
    "Frameworks",
    "Electron Framework.framework",
    "Versions",
    "A"
  );
}

function electronFrameworkBinaryPath(appPath) {
  return path.join(electronFrameworkLoaderDir(appPath), "Electron Framework");
}

function appExecutablePath(appPath) {
  return path.join(appPath, "Contents", "MacOS", path.basename(appPath, ".app"));
}

function parseOtoolRpaths(output) {
  const lines = output.split(/\r?\n/);
  const rpaths = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() !== "cmd LC_RPATH") {
      continue;
    }

    for (let offset = index + 1; offset < Math.min(index + 8, lines.length); offset += 1) {
      const match = lines[offset].trim().match(/^path\s+(.+?)\s+\(offset\s+\d+\)$/);
      if (match) {
        rpaths.push(match[1]);
        break;
      }
    }
  }

  return [...new Set(rpaths)];
}

function resolveRpath(appPath, rpath, loaderDir = electronFrameworkLoaderDir(appPath)) {
  if (rpath.startsWith("@loader_path")) {
    return path.resolve(loaderDir, rpath.slice("@loader_path".length).replace(/^\//, ""));
  }

  if (rpath.startsWith("@executable_path")) {
    return path.resolve(path.join(appPath, "Contents", "MacOS"), rpath.slice("@executable_path".length).replace(/^\//, ""));
  }

  if (path.isAbsolute(rpath)) {
    return rpath;
  }

  return path.resolve(appPath, rpath);
}

function dependencyCandidates(appPath, installName, rpathRows = []) {
  const dependencyPath = installName.replace(/^@rpath\//, "");
  const frameworksDir = path.join(appPath, "Contents", "Frameworks");
  const rpathCandidates = rpathRows.map((row) => ({
    source: row.path,
    loadCommandSource: row.source,
    path: path.join(resolveRpath(appPath, row.path, row.loaderDir), dependencyPath),
    fromLoadCommand: true
  }));

  const fallbackCandidates = [
    {
      source: "@loader_path/Libraries",
      loadCommandSource: "diagnostic fallback",
      path: path.join(electronFrameworkLoaderDir(appPath), "Libraries", dependencyPath),
      fromLoadCommand: false
    },
    {
      source: "Contents/Frameworks",
      loadCommandSource: "diagnostic fallback",
      path: path.join(frameworksDir, dependencyPath),
      fromLoadCommand: false
    }
  ];

  return [...rpathCandidates, ...fallbackCandidates].filter(
    (candidate, index, candidates) => candidates.findIndex((item) => item.path === candidate.path) === index
  );
}

function parseOtoolInstallNames(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+\(/)[0])
    .filter((line) => line.startsWith("@rpath/"));
}

export function formatFrameworkDependencyRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.installName)} | ${readyLabel(row.referencedByElectronFramework)} | ${readyLabel(row.present)} | ${readyLabel(row.signatureVerified)} | ${readyLabel(row.dyldLoadable)} | ${row.dyldCandidateCount} | ${escapeCell(row.resolvedPath)} |`
    )
    .join("\n");
}

export async function electronFrameworkDependencyReport(appPath, { root, timeoutMs = 120000 } = {}) {
  const electronFrameworkBinary = electronFrameworkBinaryPath(appPath);
  const appExecutable = appExecutablePath(appPath);
  const otool = await runCommand("otool", ["-L", electronFrameworkBinary], {
    cwd: root,
    timeoutMs,
    allowFailure: true
  });
  const otoolLoadCommands = await runCommand("otool", ["-l", electronFrameworkBinary], {
    cwd: root,
    timeoutMs,
    allowFailure: true
  });
  const appExecutableLoadCommands = await runCommand("otool", ["-l", appExecutable], {
    cwd: root,
    timeoutMs,
    allowFailure: true
  });
  const installNames = otool.code === 0 ? parseOtoolInstallNames(otool.stdout) : [];
  const electronFrameworkRpaths = otoolLoadCommands.code === 0 ? parseOtoolRpaths(otoolLoadCommands.stdout) : [];
  const appExecutableRpaths = appExecutableLoadCommands.code === 0 ? parseOtoolRpaths(appExecutableLoadCommands.stdout) : [];
  const rpathRows = [
    ...electronFrameworkRpaths.map((rpath) => ({
      source: "Electron Framework",
      path: rpath,
      loaderDir: electronFrameworkLoaderDir(appPath),
      valueRecorded: false
    })),
    ...appExecutableRpaths.map((rpath) => ({
      source: "App executable",
      path: rpath,
      loaderDir: path.dirname(appExecutable),
      valueRecorded: false
    }))
  ].filter((row, index, rows) => rows.findIndex((item) => item.source === row.source && item.path === row.path) === index);
  const rows = [];

  for (const installName of requiredFrameworkInstallNames) {
    const candidates = dependencyCandidates(appPath, installName, rpathRows);
    const candidateRows = [];
    let resolvedCandidate = candidates[candidates.length - 1];

    for (const candidate of candidates) {
      const present = existsSync(candidate.path);
      const frameworkRoot = frameworkRootFor(candidate.path);
      let frameworkSignatureVerified = false;
      let binarySignatureVerified = false;

      if (present) {
        const frameworkSignature = await runCommand("codesign", ["--verify", "--strict", "--verbose=2", frameworkRoot], {
          cwd: root,
          timeoutMs,
          allowFailure: true
        });
        const binarySignature = await runCommand("codesign", ["--verify", "--strict", "--verbose=2", candidate.path], {
          cwd: root,
          timeoutMs,
          allowFailure: true
        });
        frameworkSignatureVerified = frameworkSignature.code === 0;
        binarySignatureVerified = binarySignature.code === 0;
      }

      const signatureVerified = frameworkSignatureVerified && binarySignatureVerified;
      if (present && !existsSync(resolvedCandidate.path)) {
        resolvedCandidate = candidate;
      }
      if (present && signatureVerified) {
        resolvedCandidate = candidate;
      }

      candidateRows.push({
        rpath: candidate.source,
        loadCommandSource: candidate.loadCommandSource,
        path: relativePath(root, candidate.path),
        frameworkRoot: relativePath(root, frameworkRoot),
        fromLoadCommand: candidate.fromLoadCommand,
        present,
        frameworkSignatureVerified,
        binarySignatureVerified,
        signatureVerified,
        valueRecorded: false
      });
    }

    const resolvedPath = resolvedCandidate.path;
    const present = existsSync(resolvedPath);
    const resolvedCandidateRow = candidateRows.find((candidate) => candidate.path === relativePath(root, resolvedPath));
    const signatureVerified = resolvedCandidateRow?.signatureVerified === true;
    const dyldLoadable =
      installNames.includes(installName) &&
      candidateRows.some(
        (candidate) => candidate.fromLoadCommand === true && candidate.present === true && candidate.signatureVerified === true
      );
    const dyldStatus = !installNames.includes(installName)
      ? "not-referenced"
      : dyldLoadable
        ? "ready"
        : candidateRows.some((candidate) => candidate.present)
          ? "signature-blocked"
          : "missing";

    rows.push({
      installName,
      referencedByElectronFramework: installNames.includes(installName),
      present,
      signatureVerified,
      dyldLoadable,
      dyldStatus,
      resolvedPath: relativePath(root, resolvedPath),
      frameworkRoot: relativePath(root, frameworkRootFor(resolvedPath)),
      dyldCandidateCount: candidateRows.length,
      dyldCandidateRows: candidateRows,
      candidatePaths: candidateRows.map((candidate) => candidate.path),
      valueRecorded: false
    });
  }

  return {
    electronFrameworkBinary: relativePath(root, electronFrameworkBinary),
    appExecutable: relativePath(root, appExecutable),
    otoolReady: otool.code === 0,
    otoolLoadCommandsReady: otoolLoadCommands.code === 0,
    appExecutableLoadCommandsReady: appExecutableLoadCommands.code === 0,
    rpathScansReady: otoolLoadCommands.code === 0 && appExecutableLoadCommands.code === 0,
    rpathRows: rpathRows.map(({ source, path: rpath, valueRecorded }) => ({ source, path: rpath, valueRecorded })),
    rpathEntries: rpathRows.map((row) => `${row.source}: ${row.path}`),
    rpathCount: rpathRows.length,
    requiredDependencyRows: rows,
    requiredDependencyCount: rows.length,
    referencedDependencyCount: rows.filter((row) => row.referencedByElectronFramework).length,
    presentDependencyCount: rows.filter((row) => row.present).length,
    signatureVerifiedDependencyCount: rows.filter((row) => row.signatureVerified).length,
    dyldLoadableDependencyCount: rows.filter((row) => row.dyldLoadable).length,
    allRequiredDependenciesReferenced: rows.every((row) => row.referencedByElectronFramework),
    allRequiredDependenciesPresent: rows.every((row) => row.present),
    allRequiredDependenciesCodeSigned: rows.every((row) => row.signatureVerified),
    allRequiredDependenciesDyldLoadable: rows.every((row) => row.dyldLoadable),
    valueRecorded: false
  };
}
