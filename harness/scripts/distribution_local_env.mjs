import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const defaultEnvFileName = ".env.distribution.local";
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+|https:\/\/example\.com.*)$/i;
export const distributionPrivateInputKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED",
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_UPDATE_CHANNEL",
  "ELECTRON_UPDATE_CHANNEL",
  "UPDATE_CHANNEL",
  "GROOVEFORGE_DEVELOPER_ID_IDENTITY",
  "GROOVEFORGE_NOTARY_SUBMIT",
  "APPLE_ID",
  "APPLE_TEAM_ID",
  "APPLE_APP_SPECIFIC_PASSWORD",
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_KEY_PATH",
  "APPLE_NOTARY_PROFILE",
  "NOTARYTOOL_KEYCHAIN_PROFILE"
];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const withoutExport = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const separatorIndex = withoutExport.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }
  const key = withoutExport.slice(0, separatorIndex).trim();
  let value = withoutExport.slice(separatorIndex + 1).trim();
  if (!/^[A-Z0-9_]+$/.test(key)) {
    return null;
  }
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function isPlaceholderValue(value) {
  return placeholderPattern.test(String(value).trim());
}

function displayPath(root, filePath) {
  const relativePath = path.relative(root, filePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(filePath);
}

function configuredFilePaths(root) {
  const paths = [path.join(root, defaultEnvFileName)];
  const customPath = process.env.GROOVEFORGE_DISTRIBUTION_ENV_FILE?.trim();
  if (customPath) {
    paths.push(path.isAbsolute(customPath) ? customPath : path.resolve(root, customPath));
  }
  return [...new Set(paths)];
}

export async function loadDistributionLocalEnv(options = {}) {
  const root = options.root ?? process.cwd();
  const allowedKeys = new Set(options.allowedKeys ?? []);
  const files = configuredFilePaths(root);
  const loadedKeys = [];
  const skippedExistingKeys = [];
  const placeholderKeys = [];
  const unknownKeys = [];
  const malformedLines = [];
  const presentFiles = [];

  for (const filePath of files) {
    if (!existsSync(filePath)) {
      continue;
    }
    presentFiles.push(displayPath(root, filePath));
    const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        if (line.trim() && !line.trim().startsWith("#")) {
          malformedLines.push(`${displayPath(root, filePath)}:${index + 1}`);
        }
        continue;
      }
      const { key, value } = parsed;
      if (allowedKeys.size > 0 && !allowedKeys.has(key)) {
        unknownKeys.push(key);
        continue;
      }
      if (isPlaceholderValue(value)) {
        placeholderKeys.push(key);
        continue;
      }
      if (process.env[key] && process.env[key].trim().length > 0) {
        skippedExistingKeys.push(key);
        continue;
      }
      process.env[key] = value;
      loadedKeys.push(key);
    }
  }

  return {
    enabled: presentFiles.length > 0,
    defaultFileName: defaultEnvFileName,
    configuredFileKey: "GROOVEFORGE_DISTRIBUTION_ENV_FILE",
    filesChecked: files.map((filePath) => displayPath(root, filePath)),
    presentFiles,
    loadedKeys: [...new Set(loadedKeys)],
    skippedExistingKeys: [...new Set(skippedExistingKeys)],
    placeholderKeys: [...new Set(placeholderKeys)],
    unknownKeys: [...new Set(unknownKeys)],
    malformedLines,
    valueRecorded: false
  };
}

export const distributionLocalEnvDefaults = {
  defaultEnvFileName,
  configuredFileKey: "GROOVEFORGE_DISTRIBUTION_ENV_FILE"
};
