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

function dependencyCandidates(appPath, installName) {
  const dependencyPath = installName.replace(/^@rpath\//, "");
  const frameworksDir = path.join(appPath, "Contents", "Frameworks");
  const electronFrameworkLoaderDir = path.join(
    frameworksDir,
    "Electron Framework.framework",
    "Versions",
    "A"
  );

  return [
    path.join(electronFrameworkLoaderDir, "Libraries", dependencyPath),
    path.join(frameworksDir, dependencyPath)
  ];
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
        `| ${escapeCell(row.installName)} | ${readyLabel(row.referencedByElectronFramework)} | ${readyLabel(row.present)} | ${readyLabel(row.signatureVerified)} | ${escapeCell(row.resolvedPath)} |`
    )
    .join("\n");
}

export async function electronFrameworkDependencyReport(appPath, { root, timeoutMs = 120000 } = {}) {
  const electronFrameworkBinary = path.join(
    appPath,
    "Contents",
    "Frameworks",
    "Electron Framework.framework",
    "Versions",
    "A",
    "Electron Framework"
  );
  const otool = await runCommand("otool", ["-L", electronFrameworkBinary], {
    cwd: root,
    timeoutMs,
    allowFailure: true
  });
  const installNames = otool.code === 0 ? parseOtoolInstallNames(otool.stdout) : [];
  const rows = [];

  for (const installName of requiredFrameworkInstallNames) {
    const candidates = dependencyCandidates(appPath, installName);
    const resolvedPath = candidates.find((candidate) => existsSync(candidate)) ?? candidates[candidates.length - 1];
    const present = existsSync(resolvedPath);
    const frameworkRoot = frameworkRootFor(resolvedPath);
    let signatureVerified = false;

    if (present) {
      const signature = await runCommand("codesign", ["--verify", "--strict", "--verbose=2", frameworkRoot], {
        cwd: root,
        timeoutMs,
        allowFailure: true
      });
      signatureVerified = signature.code === 0;
    }

    rows.push({
      installName,
      referencedByElectronFramework: installNames.includes(installName),
      present,
      signatureVerified,
      resolvedPath: relativePath(root, resolvedPath),
      frameworkRoot: relativePath(root, frameworkRoot),
      candidatePaths: candidates.map((candidate) => relativePath(root, candidate)),
      valueRecorded: false
    });
  }

  return {
    electronFrameworkBinary: relativePath(root, electronFrameworkBinary),
    otoolReady: otool.code === 0,
    requiredDependencyRows: rows,
    requiredDependencyCount: rows.length,
    referencedDependencyCount: rows.filter((row) => row.referencedByElectronFramework).length,
    presentDependencyCount: rows.filter((row) => row.present).length,
    signatureVerifiedDependencyCount: rows.filter((row) => row.signatureVerified).length,
    allRequiredDependenciesReferenced: rows.every((row) => row.referencedByElectronFramework),
    allRequiredDependenciesPresent: rows.every((row) => row.present),
    allRequiredDependenciesCodeSigned: rows.every((row) => row.signatureVerified),
    valueRecorded: false
  };
}
